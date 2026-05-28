import { Assets, Sprite, Texture, Container, type FederatedPointerEvent } from "pixi.js";
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
import { SilhouettePresence } from "../effects/SilhouettePresence";
import type { BaseEffect } from "../effects/BaseEffect";

/**
 * SpurenRoom = Komposition des Erprobungsraums "Spuren".
 *
 * Lädt Hintergrund + Anker + Artefakte, montiert sie in die Scene-Layer,
 * verdrahtet die zwei aktiven Ankerinteraktionen (Kerzenfeld = tap,
 * Steinbett = drag/release) und startet die Atmosphäre (Nebel, Staub,
 * Silhouetten als lokaler Spuren-Simulator).
 *
 * Bewusst kein UI, kein Text, keine sichtbaren Hit-Marker — die Hit-Zonen
 * sind nur über das Bild andeutbar.
 */
export class SpurenRoom {
  private effects: BaseEffect[] = [];
  private detachTick?: () => void;
  private root = new Container();
  private destroyed = false;
  private gcTimer: number | null = null;
  private resizeHandler: (() => void) | null = null;

  constructor(private scene: Scene) {}

  async mount(): Promise<void> {
    if (this.destroyed || !this.scene.isReady) return;
    const store = useStore.getState();
    store.enterRoom("spuren");

    // Audio (still scheitern, wenn Datei fehlt).
    try {
      audioEngine.crossfadeAmbient(SPUREN_ASSETS.audio.ambient, 2500);
    } catch {
      // Phase 1.6 Hand-Off: Pixabay-Audios noch nicht ausgewählt.
    }

    const reduced = store.reducedMotion;

    // Background.
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

    // Anker-Sprites (nicht freigestellt, daher als sichtbare Stationen
    // im Vordergrund über dem Background-Layer; durch Skalierung ~28% der
    // kürzeren Bildseite verankert).
    const anchorSprites: Record<string, Sprite> = {};
    for (const [key, src] of Object.entries(SPUREN_ASSETS.anchors)) {
      const tex = await Assets.load<Texture>(src);
      if (this.destroyed) return;
      const sp = Sprite.from(tex);
      sp.anchor.set(0.5);
      this.scene.layers.anchors.addChild(sp);
      anchorSprites[key] = sp;
    }

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

    // Atmosphäre.
    if (!reduced) {
      const fog = new FogLayer({ intensity: 0.35 });
      fog.mount(this.scene.layers.particles_bg);
      fog.start();
      this.effects.push(fog);

      const dust = new DustEmitter({ intensity: 0.5 });
      dust.mount(this.scene.layers.particles_fg);
      dust.start();
      this.effects.push(dust);
    }

    // Hit-Zonen: Kerzenfeld = tap, Steinbett = drag.
    this.attachCandleField(anchorSprites.candle_field);
    this.attachStoneBed(anchorSprites.stone_bed);

    // Spuren-Simulator: 4–9 fremde Silhouetten beim Eintritt.
    if (!reduced) {
      this.spawnAmbientSilhouettes(4 + Math.floor(Math.random() * 6));
    }

    // Resize neu-fitten.
    const onResize = () => {
      fitBackground();
      fitAnchors();
    };
    this.resizeHandler = onResize;
    window.addEventListener("resize", onResize);

    // Ticker für Effekte + Verweildauer.
    this.detachTick = this.scene.onTick((dt) => {
      for (const e of this.effects) e.tick(dt);
      useStore.getState().tickDwell(dt / 1000);
    });

    // Räume die nicht mehr aktiven Silhouetten/WaterRings auf.
    this.gcTimer = window.setInterval(() => this.gcEffects(), 2000);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.gcTimer != null) {
      window.clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    this.detachTick?.();
    for (const e of this.effects) {
      try { e.destroy(); } catch { /* ignore */ }
    }
    this.effects = [];
    try { this.root.destroy({ children: true }); } catch { /* ignore */ }
  }

  private gcEffects(): void {
    this.effects = this.effects.filter((e) => {
      if ((e as unknown as { mounted: boolean }).mounted === false) return false;
      // BaseEffect setzt running=false nach ttl; entferne ausgelaufene Effekte.
      const stopped = (e as unknown as { running: boolean }).running === false
        && (e as unknown as { ttlMs: number | null }).ttlMs != null;
      if (stopped) {
        e.destroy();
        return false;
      }
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

      const smoke = new SmokeEmitter({
        position: { x: local.x, y: local.y - 20 },
        intensity: 0.4,
        ttlSeconds: 24,
      });
      smoke.mount(this.scene.layers.particles_fg);
      smoke.start();
      this.effects.push(smoke);

      try {
        audioEngine.playOneShot(SPUREN_ASSETS.audio.candle_breath, 0.5);
      } catch { /* still */ }

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

  // ---- Steinbett: tap → Stein erscheint und ist greifbar; drag → Wasserkante = Resonanz ----
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

        // Zielzone = Wasserkante (Radius 18% kürzere Seite).
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
          // Stein bleibt liegen an der Wasserkante.
          stone.x = water.x + (Math.random() - 0.5) * minSide * 0.05;
          stone.y = water.y + (Math.random() - 0.5) * minSide * 0.03;
        } else {
          // Zurück ins Bett (sanft).
          stone.destroy();
        }
      };
      this.scene.app.stage.eventMode = "static";
      this.scene.app.stage.on("pointermove", move);
      this.scene.app.stage.on("pointerup", release);
      this.scene.app.stage.on("pointerupoutside", release);
    });
  }

  private spawnAmbientSilhouettes(n: number): void {
    const keys = Object.keys(SPUREN_ASSETS.silhouettes);
    const W = this.scene.width;
    const H = this.scene.height;
    for (let i = 0; i < n; i++) {
      const key = keys[Math.floor(Math.random() * keys.length)];
      const url = SPUREN_ASSETS.silhouettes[key];
      const x = (0.15 + Math.random() * 0.7) * W;
      const y = (0.35 + Math.random() * 0.45) * H;
      const sil = new SilhouettePresence(
        {
          textureUrl: url,
          fadeInMs: 3000 + Math.random() * 2000,
          holdMs: 6000 + Math.random() * 6000,
          fadeOutMs: 3500 + Math.random() * 2000,
        },
        { position: { x, y }, intensity: 0.85 },
      );
      sil.mount(this.scene.layers.parallax_mid);
      sil.start();
      this.effects.push(sil);
    }
  }
}
