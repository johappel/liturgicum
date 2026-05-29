import { Assets, Graphics, Sprite, Texture, type FederatedPointerEvent } from "pixi.js";
import type { Scene } from "../scene/Scene";
import { SPUREN_ANCHORS, denormalize, type NormPoint } from "../scene/layout";
import { SPUREN_ASSETS } from "../assets/manifest";
import { useStore, type LocalTrace } from "../state/store";
import { audioEngine } from "../audio/AudioEngine";
import { FlameEmitter } from "../effects/FlameEmitter";
import { SmokeEmitter } from "../effects/SmokeEmitter";
import { FogLayer } from "../effects/FogLayer";
import { DustEmitter } from "../effects/DustEmitter";
import { WaterRing } from "../effects/WaterRing";
import type { BaseEffect } from "../effects/BaseEffect";
import { SpurenSimulator } from "./SpurenSimulator";
import type { Room } from "./Room";

/** Reife-Schwellen aus docs/Interaktions-Spezifikation.md §11. */
const RIPE_WATER_EDGE_S = 20;
const RIPE_AMBIENT_S = 45;
const RIPE_EXIT_S = 90;

/** Halte-Dauer am unteren Rand für Rückkehr nach Vorhof. */
const BACK_HOLD_MS = 1500;

export interface SpurenRoomCallbacks {
  /** Vorwärts zum Hörraum (Tap im Lichtleuchten oben-rechts ab 90 s). */
  onRequestForward?: () => void;
  /** Zurück nach Vorhof (Halten ~1,5 s am unteren Rand). */
  onRequestBack?: () => void;
}

/**
 * SpurenRoom — Komposition des Erprobungsraums.
 *
 * Bild + Anker + Atmosphäre + 5-Phasen-Gesten + Verweildauer-Reife.
 * Navigation übernimmt der RoomManager über die Callbacks.
 */
export class SpurenRoom implements Room {
  private effects: BaseEffect[] = [];
  private detachTick?: () => void;
  private destroyed = false;
  private gcTimer: number | null = null;
  private resizeHandler: (() => void) | null = null;
  private simulator: SpurenSimulator | null = null;
  private fog: FogLayer | null = null;

  // Reife-Visuals
  private waterEdgeSprite: Sprite | null = null;
  private exitGlow: Graphics | null = null;
  private exitGlowVisible = false;
  private ambientDenser = false;

  // Back-Hold
  private backHoldStartedAt: number | null = null;
  private backHoldFired = false;

  constructor(private scene: Scene, private cb: SpurenRoomCallbacks = {}) {}

  async mount(): Promise<void> {
    if (this.destroyed || !this.scene.isReady) return;
    const store = useStore.getState();
    store.enterRoom("spuren");

    try { audioEngine.crossfadeAmbient(SPUREN_ASSETS.audio.ambient, 2500); } catch { /* still */ }

    const reduced = store.reducedMotion;

    // Background
    const bgTex = await Assets.load<Texture>(SPUREN_ASSETS.background);
    if (this.destroyed) return;
    const bg = Sprite.from(bgTex);
    bg.anchor.set(0.5);
    this.scene.layers.background.addChild(bg);
    const fitBackground = () => {
      const W = this.scene.width;
      const H = this.scene.height;
      bg.x = W / 2;
      bg.y = H / 2;
      const scale = Math.max(W / bgTex.width, H / bgTex.height);
      bg.scale.set(scale);
    };
    fitBackground();

    // Anker
    const anchorSprites: Record<string, Sprite> = {};
    for (const [key, src] of Object.entries(SPUREN_ASSETS.anchors)) {
      const tex = await Assets.load<Texture>(src);
      if (this.destroyed) return;
      const sp = Sprite.from(tex);
      sp.anchor.set(0.5);
      this.scene.layers.anchors.addChild(sp);
      anchorSprites[key] = sp;
    }
    this.waterEdgeSprite = anchorSprites.water_edge ?? null;
    if (this.waterEdgeSprite) this.waterEdgeSprite.alpha = 0.4;

    const fitAnchors = () => {
      const W = this.scene.width;
      const H = this.scene.height;
      const minSide = Math.min(W, H);
      for (const [key, sp] of Object.entries(anchorSprites)) {
        const pos = SPUREN_ANCHORS[key];
        if (!pos) continue;
        const p = denormalize(pos, W, H);
        sp.x = p.x;
        sp.y = p.y;
        const target = minSide * 0.34;
        const baseSide = Math.max(sp.texture.width, sp.texture.height);
        sp.scale.set(target / baseSide);
      }
    };
    fitAnchors();

    // Atmosphäre
    if (!reduced) {
      this.fog = new FogLayer({ intensity: 0.35 });
      this.fog.mount(this.scene.layers.particles_bg);
      this.fog.start();
      this.effects.push(this.fog);

      const dust = new DustEmitter({ intensity: 0.5 });
      dust.mount(this.scene.layers.particles_fg);
      dust.start();
      this.effects.push(dust);
    }

    // Interaktionen
    this.attachCandleField(anchorSprites.candle_field);
    this.attachStoneBed(anchorSprites.stone_bed);

    // Lokaler Spuren-Simulator
    this.simulator = new SpurenSimulator(this.scene, {
      onEffect: (e) => this.effects.push(e),
      reducedMotion: reduced,
    });
    this.simulator.start();

    // Exit-Glow (Lichthof oben-rechts, unsichtbar bis 90 s)
    this.exitGlow = new Graphics();
    this.scene.layers.overlay.addChild(this.exitGlow);
    this.drawExitGlow(0);

    // Stage-Listener für Back-Hold
    const stage = this.scene.app.stage;
    stage.eventMode = "static";
    stage.on("pointerdown", this.onStageDown);
    stage.on("pointerup", this.onStageUp);
    stage.on("pointerupoutside", this.onStageUp);
    stage.on("pointermove", this.onStageMove);

    // Resize
    const onResize = () => {
      fitBackground();
      fitAnchors();
      this.drawExitGlow(this.exitGlowVisible ? 1 : 0);
    };
    this.resizeHandler = onResize;
    window.addEventListener("resize", onResize);

    // Ticker
    this.detachTick = this.scene.onTick((dt) => {
      for (const e of this.effects) e.tick(dt);
      const s = useStore.getState();
      s.tickDwell(dt / 1000);
      this.updateRipeness(s.dwellSeconds);
      this.checkBackHold();
    });

    this.gcTimer = window.setInterval(() => this.gcEffects(), 2000);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.gcTimer != null) { window.clearInterval(this.gcTimer); this.gcTimer = null; }
    if (this.resizeHandler) { window.removeEventListener("resize", this.resizeHandler); this.resizeHandler = null; }
    this.detachTick?.();
    try {
      const stage = this.scene.app.stage;
      stage.off("pointerdown", this.onStageDown);
      stage.off("pointerup", this.onStageUp);
      stage.off("pointerupoutside", this.onStageUp);
      stage.off("pointermove", this.onStageMove);
    } catch { /* ignore */ }
    this.simulator?.destroy();
    this.simulator = null;
    for (const e of this.effects) { try { e.destroy(); } catch { /* ignore */ } }
    this.effects = [];
    try { this.exitGlow?.destroy(); } catch { /* ignore */ }
    this.exitGlow = null;
    this.waterEdgeSprite = null;
  }

  // ---- 3.6 Verweildauer-Reife ----
  private updateRipeness(dwell: number): void {
    if (this.waterEdgeSprite && dwell >= RIPE_WATER_EDGE_S) {
      this.waterEdgeSprite.alpha = Math.min(1, 0.4 + ((dwell - RIPE_WATER_EDGE_S) / 4) * 0.6);
    }
    if (!this.ambientDenser && dwell >= RIPE_AMBIENT_S) {
      this.ambientDenser = true;
      this.fog?.setIntensity(0.55);
    }
    if (!this.exitGlowVisible && dwell >= RIPE_EXIT_S) {
      this.exitGlowVisible = true;
      this.drawExitGlow(1);
    }
  }

  private drawExitGlow(alpha: number): void {
    if (!this.exitGlow) return;
    const W = this.scene.width;
    const H = this.scene.height;
    const p = denormalize(SPUREN_ANCHORS.exit_glow, W, H);
    const r = Math.min(W, H) * 0.18;
    this.exitGlow.clear();
    for (let i = 6; i >= 1; i--) {
      const ringR = r * (i / 6);
      const a = alpha * 0.06 * i;
      this.exitGlow.circle(p.x, p.y, ringR).fill({ color: 0xfff2c8, alpha: a });
    }
    this.exitGlow.eventMode = alpha > 0 ? "static" : "none";
    this.exitGlow.cursor = alpha > 0 ? "pointer" : "default";
    this.exitGlow.removeAllListeners("pointertap");
    if (alpha > 0) {
      this.exitGlow.on("pointertap", () => this.cb.onRequestForward?.());
    }
  }

  // ---- 3.8 Back-Hold ----
  private onStageDown = (ev: FederatedPointerEvent) => {
    if (this.scene.height > 0 && ev.global.y / this.scene.height >= 0.85) {
      this.backHoldStartedAt = performance.now();
      this.backHoldFired = false;
    }
  };
  private onStageMove = (ev: FederatedPointerEvent) => {
    if (this.backHoldStartedAt == null) return;
    if (ev.global.y / this.scene.height < 0.82) this.backHoldStartedAt = null;
  };
  private onStageUp = () => {
    this.backHoldStartedAt = null;
  };
  private checkBackHold(): void {
    if (this.backHoldStartedAt == null || this.backHoldFired) return;
    if (performance.now() - this.backHoldStartedAt >= BACK_HOLD_MS) {
      this.backHoldFired = true;
      this.backHoldStartedAt = null;
      this.cb.onRequestBack?.();
    }
  }

  private gcEffects(): void {
    this.effects = this.effects.filter((e) => {
      if ((e as unknown as { mounted: boolean }).mounted === false) return false;
      const stopped = (e as unknown as { running: boolean }).running === false
        && (e as unknown as { ttlMs: number | null }).ttlMs != null;
      if (stopped) { e.destroy(); return false; }
      return true;
    });
  }

  // ---- Kerzenfeld: tap → Flamme + Rauch + Trace ----
  private attachCandleField(sprite: Sprite): void {
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.on("pointertap", (ev: FederatedPointerEvent) => {
      const W = this.scene.width;
      const H = this.scene.height;
      const local = ev.global;
      const norm: NormPoint = { x: local.x / W, y: local.y / H };

      const flame = new FlameEmitter({
        position: { x: local.x, y: local.y - 10 },
        intensity: 0.7,
        ttlSeconds: 24,
      });
      flame.mount(this.scene.layers.interactions);
      flame.start();
      this.effects.push(flame);

      if (!useStore.getState().reducedMotion) {
        const smoke = new SmokeEmitter({
          position: { x: local.x, y: local.y - 20 },
          intensity: 0.4,
          ttlSeconds: 24,
        });
        smoke.mount(this.scene.layers.particles_fg);
        smoke.start();
        this.effects.push(smoke);
      }

      try { audioEngine.playOneShot(SPUREN_ASSETS.audio.candle_breath, 0.5); } catch { /* still */ }

      const trace: LocalTrace = {
        id: `candle-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        kind: "candle",
        x: norm.x,
        y: norm.y,
        ttlSeconds: 90,
        createdAt: Date.now(),
      };
      useStore.getState().addTrace(trace);
    });
  }

  // ---- Steinbett: drag → Wasserkante = Resonanz ----
  private attachStoneBed(sprite: Sprite): void {
    sprite.eventMode = "static";
    sprite.cursor = "pointer";
    sprite.on("pointerdown", async (ev: FederatedPointerEvent) => {
      const variants = ["stone_loose_a", "stone_loose_b", "stone_loose_c"] as const;
      const pick = variants[Math.floor(Math.random() * variants.length)];
      const tex = await Assets.load<Texture>(SPUREN_ASSETS.artifacts[pick]);
      if (this.destroyed) return;

      const stone = Sprite.from(tex);
      stone.anchor.set(0.5);
      const minSide = Math.min(this.scene.width, this.scene.height);
      const target = minSide * 0.09;
      stone.scale.set(target / Math.max(tex.width, tex.height));
      stone.x = ev.global.x;
      stone.y = ev.global.y;
      stone.eventMode = "static";
      stone.cursor = "grabbing";
      this.scene.layers.artifacts.addChild(stone);

      let dragging = true;
      const move = (e: FederatedPointerEvent) => {
        if (!dragging) return;
        stone.x = e.global.x;
        stone.y = e.global.y;
      };
      const release = () => {
        if (!dragging) return;
        dragging = false;
        this.scene.app.stage.off("pointermove", move);
        this.scene.app.stage.off("pointerup", release);
        this.scene.app.stage.off("pointerupoutside", release);

        const water = denormalize(SPUREN_ANCHORS.water_edge, this.scene.width, this.scene.height);
        const dist = Math.hypot(stone.x - water.x, stone.y - water.y);
        const ok = dist < minSide * 0.18;
        if (ok) {
          const ring = new WaterRing({
            position: { x: water.x, y: water.y },
            intensity: 0.8,
            ttlSeconds: 4,
          });
          ring.mount(this.scene.layers.interactions);
          ring.start();
          this.effects.push(ring);
          try { audioEngine.playOneShot(SPUREN_ASSETS.audio.water_ring, 0.6); } catch { /* still */ }

          useStore.getState().addTrace({
            id: `stone-${Date.now()}`,
            kind: "stone",
            x: water.x / this.scene.width,
            y: water.y / this.scene.height,
            ttlSeconds: 180,
            createdAt: Date.now(),
          });
          stone.x = water.x + (Math.random() - 0.5) * minSide * 0.05;
          stone.y = water.y + (Math.random() - 0.5) * minSide * 0.03;
        } else {
          stone.destroy();
        }
      };
      this.scene.app.stage.eventMode = "static";
      this.scene.app.stage.on("pointermove", move);
      this.scene.app.stage.on("pointerup", release);
      this.scene.app.stage.on("pointerupoutside", release);
    });
  }
}
