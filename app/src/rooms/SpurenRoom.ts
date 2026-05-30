import { Assets, Container, Graphics, Sprite, Texture, type FederatedPointerEvent } from "pixi.js";
import type { Scene } from "../scene/Scene";
import type { NormPoint } from "../scene/layout";
import {
  drawPerspectiveDebugOverlay,
  exportPerspectiveConfigConst,
  findPerspectiveHandleAtPixel,
  nudgePerspectiveHandle as nudgePerspectiveHandleConfig,
  perspectiveGroundScaleAtPoint,
  setPerspectiveHandlePoint,
  type GroundPerspectiveConfig,
} from "../scene/perspectiveDebug";
import { SPUREN_ASSETS } from "../assets/manifest";
import { useStore, type LocalTrace } from "../state/store";
import { audioEngine } from "../audio/AudioEngine";
import { FlameEmitter } from "../effects/FlameEmitter";
import { SmokeEmitter } from "../effects/SmokeEmitter";
import { FogLayer } from "../effects/FogLayer";
import { DustEmitter } from "../effects/DustEmitter";
import { WaterRing } from "../effects/WaterRing";
import type { BaseEffect } from "../effects/BaseEffect";
import type { Room } from "./Room";

const RIPE_AMBIENT_S = 45;
const RIPE_EXIT_S = 90;
const BACK_HOLD_MS = 1500;

const STONE_SOURCE_POLY: NormPoint[] = [
  // Sichtbare lose Steine im unteren Bilddrittel, vor dem Wasser.
  { x: 0.32, y: 0.68 },
  { x: 0.50, y: 0.66 },
  { x: 0.51, y: 0.86 },
  { x: 0.31, y: 0.88 },
];
const CANDLE_SOURCE_POLYS: NormPoint[][] = [
  // Wandnische links.
  [
    { x: 0.01, y: 0.30 },
    { x: 0.10, y: 0.28 },
    { x: 0.10, y: 0.45 },
    { x: 0.01, y: 0.48 },
  ],
  // Vordergrundschale rechts unten.
  [
    { x: 0.69, y: 0.62 },
    { x: 0.86, y: 0.62 },
    { x: 0.84, y: 0.86 },
    { x: 0.66, y: 0.86 },
  ],
  // Kleine Lichter am Wasserbecken.
  [
    { x: 0.49, y: 0.41 },
    { x: 0.68, y: 0.40 },
    { x: 0.69, y: 0.54 },
    { x: 0.47, y: 0.55 },
  ],
];
const WATER_POLY: NormPoint[] = [
  // Das tatsächlich sichtbare Wasserbecken im Hintergrundbild.
  { x: 0.31197916666666664, y: 0.5979381443298969 },
  { x: 0.615625, y: 0.5670103092783505 },
  { x: 0.7958333333333333, y: 0.5829428303655108 },
  { x: 0.840625, y: 0.6401124648547329 },
  { x: 0.7770833333333333, y: 0.6663542642924086 },
  { x: 0.7036458333333333, y: 0.6925960637300843 },
  { x: 0.5255208333333333, y: 0.6944704779756327 },
  { x: 0.29791666666666666, y: 0.6682286785379569 },
  { x: 0.2546875, y: 0.662605435801312 },
  { x: 0.21822916666666667, y: 0.6401124648547329 },
];
const WAY_DROP_ZONE: NormPoint[] = [
  // Begehbare Zone: Stufen/Ufer/Vordergrund, ohne Wasserfläche.
  { x: 0.05625, y: 0.5501405810684161 },
  { x: 0.3567708333333333, y: 0.5192127460168697 },
  { x: 0.55, y: 0.5182755388940956 },
  { x: 0.6447916666666667, y: 0.5220243673851921 },
  { x: 0.6776041666666667, y: 0.4592314901593252 },
  { x: 0.7432291666666667, y: 0.3908153701968135 },
  { x: 0.7786458333333334, y: 0.3889409559512652 },
  { x: 0.7197916666666667, y: 0.507029053420806 },
  { x: 0.7208333333333333, y: 0.528584817244611 },
  { x: 0.7869791666666667, y: 0.5257731958762887 },
  { x: 0.784375, y: 0.5613870665417057 },
  { x: 0.6166666666666667, y: 0.5641986879100281 },
  { x: 0.3140625, y: 0.5904404873477038 },
  { x: 0.21145833333333333, y: 0.6391752577319587 },
  { x: 0.25416666666666665, y: 0.6682286785379569 },
  { x: 0.4635416666666667, y: 0.6935332708528584 },
  { x: 0.5744791666666667, y: 0.7075913776944704 },
  { x: 0.6083333333333333, y: 0.7085285848172446 },
  { x: 0.5786458333333333, y: 0.7975632614807873 },
  { x: 0.5088541666666667, y: 0.7853795688847235 },
  { x: 0.4609375, y: 0.8153701968134958 },
  { x: 0.48854166666666665, y: 0.8744142455482662 },
  { x: 0.565625, y: 0.8753514526710403 },
  { x: 0.5145833333333333, y: 0.979381443298969 },
  { x: 0.02, y: 0.96 },
  { x: 0.009375, y: 0.7666354264292409 },
  { x: 0.08072916666666667, y: 0.7638238050609185 },
];
const GATE_POLY: NormPoint[] = [
  { x: 0.74, y: 0.09 },
  { x: 0.95, y: 0.12 },
  { x: 0.93, y: 0.45 },
  { x: 0.72, y: 0.41 },
];

const DEBUG_WATER_COLOR = 0x2f80ed;
const DEBUG_WAY_COLOR = 0xf2994a;
const DEBUG_VANISHING_COLOR = 0xeb5757;
const DEBUG_REFERENCE_COLOR = 0x27ae60;
const GROUND_PERSPECTIVE: GroundPerspectiveConfig = {
  // Manuell kalibrierter Fluchtpunkt (normierte Bildschirmkoordinaten).
  // Entlang dieses Strahls wird die scheinbare Objektgroesse berechnet.
  vanishingPoint: {"x":0.7942708333333334,"y":0.26522961574507964},
  referencePoint: {"x":0.5307291666666667,"y":0.9700093720712277},
  minScale: 0.0025,
  nearScale: 0.89
};
const PRESENCE_BASE_HEIGHT: Record<PresenceKind, number> = {
  walking: 460,
  kneeling: 380,
  seated: 340,
};

interface HeldItem {
  kind: "stone" | "candle";
  node: Container;
}

type PresenceKind = "walking" | "kneeling" | "seated";

interface PresenceActor {
  kind: PresenceKind;
  node: Container;
  ageMs: number;
  fadeInMs: number;
  holdMs: number;
  fadeOutMs: number;
  zone: NormPoint[];
  start: { x: number; y: number };
  end: { x: number; y: number };
  onDone?: () => void;
}

export interface SpurenRoomCallbacks {
  onRequestForward?: () => void;
  onRequestBack?: () => void;
}

export class SpurenRoom implements Room {
  private effects: BaseEffect[] = [];
  private detachTick?: () => void;
  private destroyed = false;
  private gcTimer: number | null = null;
  private resizeHandler: (() => void) | null = null;
  private presenceTimer: number | null = null;

  private ownedContainers: Container[] = [];
  private artifactsRoot: Container | null = null;
  private interactionsRoot: Container | null = null;

  private fog: FogLayer | null = null;
  private stoneTextures: Texture[] = [];
  private candleTexture: Texture | null = null;
  private presenceTextures: Partial<Record<PresenceKind, Texture>> = {};
  private waterPoly: NormPoint[] = WATER_POLY.map((p) => ({ ...p }));
  private wayDropZone: NormPoint[] = WAY_DROP_ZONE.map((p) => ({ ...p }));
  private debugOverlay: Graphics | null = null;
  private perspectiveDebugOverlay: Graphics | null = null;
  private debugMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugZones");
  private perspectiveDebugMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugPerspective");
  private activeZone: "water" | "way" = "water";
  private draggingVertex: { zone: "water" | "way"; index: number } | null = null;
  private activePerspectiveHandle: "vanishing" | "reference" = "vanishing";
  private draggingPerspectiveHandle: "vanishing" | "reference" | null = null;
  private lastPointerNorm: NormPoint = { x: 0.5, y: 0.5 };

  private held: HeldItem | null = null;
  private presences: PresenceActor[] = [];
  private foreignArtifacts: Container[] = [];

  private exitOpen = false;
  private ambientDenser = false;
  private waterUnlocked = true;

  private backHoldStartedAt: number | null = null;
  private backHoldFired = false;
  private keyHandler = (ev: KeyboardEvent) => this.onKey(ev);

  constructor(private scene: Scene, private cb: SpurenRoomCallbacks = {}) {}

  async mount(): Promise<void> {
    if (this.destroyed || !this.scene.isReady) return;
    useStore.getState().enterRoom("spuren");

    try { audioEngine.crossfadeAmbient(SPUREN_ASSETS.audio.ambient, 2500); } catch { /* still */ }

    const reduced = useStore.getState().reducedMotion;

    const bgRoot = this.adopt(this.scene.layers.background);
    this.artifactsRoot = this.adopt(this.scene.layers.artifacts);
    this.interactionsRoot = this.adopt(this.scene.layers.interactions);

    const bgTex = await Assets.load<Texture>(SPUREN_ASSETS.background);
    this.stoneTextures = await Promise.all([
      Assets.load<Texture>(SPUREN_ASSETS.artifacts.stone_loose_a),
      Assets.load<Texture>(SPUREN_ASSETS.artifacts.stone_loose_b),
      Assets.load<Texture>(SPUREN_ASSETS.artifacts.stone_loose_c),
    ]);
    const [candleTexture, passingTexture, kneelingTexture, seatedTexture] = await Promise.all([
      Assets.load<Texture>(SPUREN_ASSETS.artifacts.candle_unlit),
      Assets.load<Texture>(SPUREN_ASSETS.silhouettes.passing),
      Assets.load<Texture>(SPUREN_ASSETS.silhouettes.kneeling),
      Assets.load<Texture>(SPUREN_ASSETS.silhouettes.seated),
    ]);
    this.candleTexture = candleTexture;
    this.presenceTextures = {
      walking: passingTexture,
      kneeling: kneelingTexture,
      seated: seatedTexture,
    };
    if (this.destroyed) return;
    const bg = Sprite.from(bgTex);
    bg.anchor.set(0.5);
    bgRoot.addChild(bg);

    const fitBackground = () => {
      const W = this.scene.width;
      const H = this.scene.height;
      bg.x = W / 2;
      bg.y = H / 2;
      const scale = Math.max(W / bgTex.width, H / bgTex.height);
      bg.scale.set(scale);
      this.drawDebugZones();
      this.drawPerspectiveDebug();
    };
    fitBackground();

    if (this.debugMode) {
      this.debugOverlay = new Graphics();
      this.scene.layers.overlay.addChild(this.debugOverlay);
      this.drawDebugZones();
      console.info("[debugZones] Controls: W=water, D=way, A=add vertex at cursor, N=insert on nearest edge, M=subdivide polygon, Del=remove nearest vertex, P=print+copy");
    }
    if (this.perspectiveDebugMode) {
      this.perspectiveDebugOverlay = new Graphics();
      this.scene.layers.overlay.addChild(this.perspectiveDebugOverlay);
      this.drawPerspectiveDebug();
      console.info("[debugPerspective] Controls: V=vanishing, R=reference, drag marker, Arrow keys=nudge, O=print+copy");
    }
    if (this.debugMode || this.perspectiveDebugMode) {
      window.addEventListener("keydown", this.keyHandler);
    }

    if (!reduced) {
      this.fog = new FogLayer({ intensity: 0.35 });
      this.fog.mount(this.scene.layers.particles_bg);
      this.fog.start();
      this.effects.push(this.fog);

      const dust = new DustEmitter({ intensity: 0.45 });
      dust.mount(this.scene.layers.particles_fg);
      dust.start();
      this.effects.push(dust);
    }

    window.setTimeout(() => {
      if (!this.destroyed) this.spawnRandomPresence();
    }, 1800);
    window.setTimeout(() => {
      if (!this.destroyed) this.spawnRandomPresence();
    }, 9000);
    this.scheduleNextPresence();

    const stage = this.scene.app.stage;
    stage.eventMode = "static";
    stage.on("pointerdown", this.onStageDown);
    stage.on("pointermove", this.onStageMove);
    stage.on("pointerup", this.onStageUp);
    stage.on("pointerupoutside", this.onStageUp);

    this.resizeHandler = fitBackground;
    window.addEventListener("resize", fitBackground);

    this.detachTick = this.scene.onTick((dt) => {
      for (const e of this.effects) e.tick(dt);
      const s = useStore.getState();
      s.tickDwell(dt / 1000);
      this.updateRipeness(s.dwellSeconds);
      this.tickPresences(dt);
      this.checkBackHold();
    });

    this.gcTimer = window.setInterval(() => this.gcEffects(), 2000);
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;

    if (this.gcTimer != null) {
      window.clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
    if (this.presenceTimer != null) {
      window.clearTimeout(this.presenceTimer);
      this.presenceTimer = null;
    }
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    window.removeEventListener("keydown", this.keyHandler);

    this.detachTick?.();

    try {
      const stage = this.scene.app.stage;
      stage.off("pointerdown", this.onStageDown);
      stage.off("pointermove", this.onStageMove);
      stage.off("pointerup", this.onStageUp);
      stage.off("pointerupoutside", this.onStageUp);
    } catch { /* ignore */ }

    this.held?.node.destroy({ children: true });
    this.held = null;

    for (const p of this.presences) {
      try { p.node.destroy({ children: true }); } catch { /* ignore */ }
    }
    this.presences = [];
    for (const node of this.foreignArtifacts) {
      try { node.destroy({ children: true }); } catch { /* ignore */ }
    }
    this.foreignArtifacts = [];

    for (const e of this.effects) {
      try { e.destroy(); } catch { /* ignore */ }
    }
    this.effects = [];

    try { this.debugOverlay?.destroy(); } catch { /* ignore */ }
    this.debugOverlay = null;
    try { this.perspectiveDebugOverlay?.destroy(); } catch { /* ignore */ }
    this.perspectiveDebugOverlay = null;

    for (const c of this.ownedContainers) {
      try { c.destroy({ children: true }); } catch { /* ignore */ }
    }
    this.ownedContainers = [];
    this.artifactsRoot = null;
    this.interactionsRoot = null;
  }

  private adopt(parent: Container): Container {
    const c = new Container();
    parent.addChild(c);
    this.ownedContainers.push(c);
    return c;
  }

  private onStageDown = (ev: FederatedPointerEvent) => {
    const x = ev.global.x;
    const y = ev.global.y;
    this.lastPointerNorm = { x: x / this.scene.width, y: y / this.scene.height };

    if (this.debugMode) {
      const hit = this.findDebugVertex(x, y, 14);
      if (hit) {
        this.draggingVertex = hit;
        return;
      }
    }
    if (this.perspectiveDebugMode) {
      const handle = findPerspectiveHandleAtPixel(
        GROUND_PERSPECTIVE,
        this.scene.width,
        this.scene.height,
        x,
        y,
        18,
      );
      if (handle) {
        this.draggingPerspectiveHandle = handle;
        this.activePerspectiveHandle = handle;
        this.drawPerspectiveDebug();
        return;
      }
    }

    if (this.scene.height > 0 && y / this.scene.height >= 0.85) {
      this.backHoldStartedAt = performance.now();
      this.backHoldFired = false;
    }

    if (this.exitOpen && this.isInPoly(x, y, GATE_POLY)) {
      this.playGateCue(0.45);
      this.cb.onRequestForward?.();
      return;
    }

    if (this.held) return;

    if (this.isInAnyPoly(x, y, CANDLE_SOURCE_POLYS)) {
      this.pickUpCandle(x, y);
      return;
    }
    if (this.isInPoly(x, y, STONE_SOURCE_POLY)) {
      this.pickUpStone(x, y);
      return;
    }
    if (this.waterUnlocked && this.isInPoly(x, y, this.waterPoly)) {
      this.spawnWaterRipple(x, y, 0.45);
      try { audioEngine.playOneShot(SPUREN_ASSETS.audio.water_ring, 0.5); } catch { /* still */ }
    }
  };

  private onStageMove = (ev: FederatedPointerEvent) => {
    const x = ev.global.x;
    const y = ev.global.y;
    this.lastPointerNorm = { x: x / this.scene.width, y: y / this.scene.height };

    if (this.draggingVertex) {
      const nx = clamp(x / this.scene.width, 0, 1);
      const ny = clamp(y / this.scene.height, 0, 1);
      const poly = this.draggingVertex.zone === "water" ? this.waterPoly : this.wayDropZone;
      poly[this.draggingVertex.index] = { x: nx, y: ny };
      this.drawDebugZones();
      return;
    }
    if (this.draggingPerspectiveHandle) {
      const nx = clamp(x / this.scene.width, 0, 1);
      const ny = clamp(y / this.scene.height, 0, 1);
      setPerspectiveHandlePoint(GROUND_PERSPECTIVE, this.draggingPerspectiveHandle, { x: nx, y: ny });
      this.drawPerspectiveDebug();
      return;
    }

    if (this.backHoldStartedAt != null && this.scene.height > 0 && y / this.scene.height < 0.82) {
      this.backHoldStartedAt = null;
    }

    if (!this.held) return;
    this.held.node.x = x;
    this.held.node.y = y;
    if (this.held.kind === "stone") this.held.node.scale.set(this.stoneScaleForPoint(x, y));
    else this.held.node.scale.set(this.candleScaleForPoint(x, y));
  };

  private onStageUp = (ev: FederatedPointerEvent) => {
    if (this.draggingVertex) {
      this.draggingVertex = null;
      return;
    }
    if (this.draggingPerspectiveHandle) {
      this.draggingPerspectiveHandle = null;
      return;
    }
    this.backHoldStartedAt = null;
    if (!this.held) return;

    const x = ev.global.x;
    const y = ev.global.y;
    if (this.held.kind === "stone") {
      if (this.waterUnlocked && this.isInPoly(x, y, this.waterPoly)) {
        this.spawnWaterRipple(x, y, 0.8);
        this.playStoneWaterCue();
        this.addTrace("stone", x / this.scene.width, y / this.scene.height, 180);
        this.held.node.destroy({ children: true });
      } else {
        if (this.isInPoly(x, y, this.wayDropZone)) {
          this.placeGroundStone(this.held.node, x, y, 0.95, true, false);
        } else {
          this.held.node.destroy({ children: true });
        }
      }
    } else {
      if (this.isInPoly(x, y, this.wayDropZone) && !this.isInPoly(x, y, this.waterPoly)) {
        this.placeGroundCandle(this.held.node, x, y, 1);
        this.attachCandleFlame(this.held.node.x, this.held.node.y, 0.62, 180, this.candleFlameOffsetForPoint(this.held.node.x, this.held.node.y));
        this.addTrace("candle", this.held.node.x / this.scene.width, this.held.node.y / this.scene.height, 180);
        try { audioEngine.playOneShot(SPUREN_ASSETS.audio.candle_breath, 0.5); } catch { /* still */ }
      } else {
        this.held.node.destroy({ children: true });
      }
    }

    this.held = null;
  };

  private pickUpStone(x: number, y: number): void {
    const node = this.createStoneNode();
    node.x = x;
    node.y = y;
    node.alpha = 0.95;
    node.scale.set(this.stoneScaleForPoint(x, y));
    (this.artifactsRoot ?? this.scene.layers.artifacts).addChild(node);
    this.held = { kind: "stone", node };
  }

  private pickUpCandle(x: number, y: number): void {
    const node = this.createCandleNode();
    node.x = x;
    node.y = y;
    node.alpha = 0.95;
    node.scale.set(this.candleScaleForPoint(x, y));
    (this.artifactsRoot ?? this.scene.layers.artifacts).addChild(node);
    this.held = { kind: "candle", node };
  }

  private createStoneNode(): Container {
    const c = new Container();
    const shadow = new Graphics();
    shadow.ellipse(2, 0, 34, 7).fill({ color: 0x050403, alpha: 0.34 });
    const textures = this.stoneTextures.length > 0
      ? this.stoneTextures
      : [Texture.WHITE];
    const tex = textures[Math.floor(Math.random() * textures.length)];
    const stone = new Sprite(tex);
    stone.anchor.set(0.5, 1);
    stone.y = 20;
    if (tex === Texture.WHITE) {
      stone.tint = 0x57524a;
      stone.width = 72;
      stone.height = 46;
      stone.alpha = 0.9;
    } else {
      const target = 92;
      const side = Math.max(tex.width, tex.height) || 1;
      stone.scale.set(target / side);
    }
    c.addChild(shadow, stone);
    return c;
  }

  private createCandleNode(): Container {
    const c = new Container();
    const shadow = new Graphics();
    shadow.ellipse(0, 0, 18, 5).fill({ color: 0x050403, alpha: 0.26 });
    if (this.candleTexture) {
      const candle = new Sprite(this.candleTexture);
      candle.anchor.set(0.5, 1);
      const targetHeight = 82;
      candle.scale.set(targetHeight / Math.max(this.candleTexture.height, 1));
      c.addChild(shadow, candle);
      return c;
    }
    const body = new Graphics();
    body.roundRect(-6, -16, 12, 22, 4).fill({ color: 0xf4e0ba, alpha: 0.94 });
    const wick = new Graphics();
    wick.roundRect(-1, -20, 2, 5, 1).fill({ color: 0x2c2418, alpha: 0.9 });
    c.addChild(shadow, body, wick);
    return c;
  }

  private placeGroundStone(
    node: Container,
    x: number,
    y: number,
    alpha: number,
    withSound: boolean,
    foreign: boolean,
  ): void {
    const base = { x: x / this.scene.width, y: y / this.scene.height };
    const point = this.isInPoly(x, y, this.wayDropZone)
      ? base
      : randomNearbyPointInPoly(this.wayDropZone, base, 0.03, this.waterPoly);
    node.x = point.x * this.scene.width;
    node.y = point.y * this.scene.height;
    node.alpha = alpha;
    node.scale.set(this.stoneScaleForPoint(node.x, node.y) * (foreign ? 0.75 : 1));
    if (withSound) {
      try { audioEngine.playOneShot(SPUREN_ASSETS.audio.stone_drop, 0.5); } catch { /* still */ }
    }
    this.addTrace("stone", node.x / this.scene.width, node.y / this.scene.height, 240);
    if (foreign) this.pushForeignArtifact(node);
  }

  private placeGroundCandle(node: Container, x: number, y: number, alpha: number): void {
    const base = { x: x / this.scene.width, y: y / this.scene.height };
    const point = this.isInPoly(x, y, this.wayDropZone)
      ? base
      : randomNearbyPointInPoly(this.wayDropZone, base, 0.03, this.waterPoly);
    node.x = point.x * this.scene.width;
    node.y = point.y * this.scene.height;
    node.alpha = alpha;
    node.scale.set(this.candleScaleForPoint(node.x, node.y));
  }

  private stoneScaleForPoint(x: number, y: number): number {
    return perspectiveGroundScaleAtPoint(x, y, this.scene.width, this.scene.height, GROUND_PERSPECTIVE);
  }

  private candleScaleForPoint(x: number, y: number): number {
    return perspectiveGroundScaleAtPoint(x, y, this.scene.width, this.scene.height, GROUND_PERSPECTIVE) * 0.95;
  }

  private presenceScaleForPoint(x: number, y: number): number {
    return perspectiveGroundScaleAtPoint(x, y, this.scene.width, this.scene.height, GROUND_PERSPECTIVE);
  }

  private candleFlameOffsetForPoint(x: number, y: number): number {
    return Math.max(8, this.candleScaleForPoint(x, y) * 74);
  }

  private attachCandleFlame(x: number, y: number, intensity: number, ttlSeconds: number, offsetY = 18): void {
    const flame = new FlameEmitter({
      position: { x, y: y - offsetY },
      intensity,
      ttlSeconds,
    });
    flame.mount(this.scene.layers.interactions);
    flame.start();
    this.effects.push(flame);

    if (!useStore.getState().reducedMotion) {
      const smoke = new SmokeEmitter({
        position: { x, y: y - offsetY - 6 },
        intensity: 0.35,
        ttlSeconds,
      });
      smoke.mount(this.scene.layers.particles_fg);
      smoke.start();
      this.effects.push(smoke);
    }
  }

  private spawnWaterRipple(x: number, y: number, intensity: number): void {
    const ring = new WaterRing({
      position: { x, y },
      intensity,
      ttlSeconds: 3,
    });
    ring.mount(this.interactionsRoot ?? this.scene.layers.interactions);
    ring.start();
    this.effects.push(ring);
  }

  private updateRipeness(dwell: number): void {
    if (!this.ambientDenser && dwell >= RIPE_AMBIENT_S) {
      this.ambientDenser = true;
      this.fog?.setIntensity(0.58);
    }

    if (!this.exitOpen && dwell >= RIPE_EXIT_S) {
      this.exitOpen = true;
    }
  }

  private onKey(ev: KeyboardEvent): void {
    if (!this.debugMode && !this.perspectiveDebugMode) return;
    if (this.perspectiveDebugMode) {
      if (ev.key.toLowerCase() === "v") {
        this.activePerspectiveHandle = "vanishing";
        this.drawPerspectiveDebug();
        return;
      }
      if (ev.key.toLowerCase() === "r") {
        this.activePerspectiveHandle = "reference";
        this.drawPerspectiveDebug();
        return;
      }
      if (ev.key.toLowerCase() === "o") {
        this.exportPerspectiveDebug();
        return;
      }
      const step = ev.shiftKey ? 0.01 : 0.002;
      if (ev.key === "ArrowLeft") {
        this.nudgePerspectiveHandle(-step, 0);
        ev.preventDefault();
        return;
      }
      if (ev.key === "ArrowRight") {
        this.nudgePerspectiveHandle(step, 0);
        ev.preventDefault();
        return;
      }
      if (ev.key === "ArrowUp") {
        this.nudgePerspectiveHandle(0, -step);
        ev.preventDefault();
        return;
      }
      if (ev.key === "ArrowDown") {
        this.nudgePerspectiveHandle(0, step);
        ev.preventDefault();
        return;
      }
    }
    if (!this.debugMode) return;
    if (ev.key.toLowerCase() === "w") {
      this.activeZone = "water";
      this.drawDebugZones();
      return;
    }
    if (ev.key.toLowerCase() === "d") {
      this.activeZone = "way";
      this.drawDebugZones();
      return;
    }
    if (ev.key.toLowerCase() === "a") {
      const poly = this.activeZone === "water" ? this.waterPoly : this.wayDropZone;
      poly.push({ ...this.lastPointerNorm });
      this.drawDebugZones();
      return;
    }
    if (ev.key.toLowerCase() === "n") {
      const poly = this.activeZone === "water" ? this.waterPoly : this.wayDropZone;
      insertPointOnNearestEdge(poly, this.lastPointerNorm);
      this.drawDebugZones();
      return;
    }
    if (ev.key.toLowerCase() === "m") {
      const poly = this.activeZone === "water" ? this.waterPoly : this.wayDropZone;
      subdividePoly(poly);
      this.drawDebugZones();
      return;
    }
    if (ev.key === "Backspace" || ev.key === "Delete") {
      const poly = this.activeZone === "water" ? this.waterPoly : this.wayDropZone;
      if (poly.length <= 3) return;
      const idx = nearestVertexIndex(this.lastPointerNorm, poly);
      poly.splice(idx, 1);
      this.drawDebugZones();
      ev.preventDefault();
      return;
    }
    if (ev.key.toLowerCase() === "p") {
      this.exportDebugPolys();
    }
  }

  private findDebugVertex(x: number, y: number, thresholdPx: number): { zone: "water" | "way"; index: number } | null {
    const water = this.findVertexInPoly(this.waterPoly, x, y, thresholdPx);
    if (water != null) return { zone: "water", index: water };
    const way = this.findVertexInPoly(this.wayDropZone, x, y, thresholdPx);
    if (way != null) return { zone: "way", index: way };
    return null;
  }

  private findVertexInPoly(poly: NormPoint[], x: number, y: number, thresholdPx: number): number | null {
    for (let i = 0; i < poly.length; i++) {
      const px = poly[i].x * this.scene.width;
      const py = poly[i].y * this.scene.height;
      if (Math.hypot(px - x, py - y) <= thresholdPx) return i;
    }
    return null;
  }

  private drawDebugZones(): void {
    if (!this.debugMode || !this.debugOverlay) return;
    const g = this.debugOverlay;
    g.clear();
    drawPolyOverlay(g, this.toPixels(this.waterPoly), DEBUG_WATER_COLOR, this.activeZone === "water");
    drawPolyOverlay(g, this.toPixels(this.wayDropZone), DEBUG_WAY_COLOR, this.activeZone === "way");
  }

  private drawPerspectiveDebug(): void {
    if (!this.perspectiveDebugMode || !this.perspectiveDebugOverlay) return;
    drawPerspectiveDebugOverlay(
      this.perspectiveDebugOverlay,
      this.scene.width,
      this.scene.height,
      GROUND_PERSPECTIVE,
      this.activePerspectiveHandle,
      {
        line: 0xffffff,
        vanishing: DEBUG_VANISHING_COLOR,
        reference: DEBUG_REFERENCE_COLOR,
      },
    );
  }

  private nudgePerspectiveHandle(dx: number, dy: number): void {
    nudgePerspectiveHandleConfig(GROUND_PERSPECTIVE, this.activePerspectiveHandle, dx, dy);
    this.drawPerspectiveDebug();
  }

  private exportPerspectiveDebug(): void {
    const text = exportPerspectiveConfigConst(GROUND_PERSPECTIVE, "GROUND_PERSPECTIVE");
    console.log(text);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => undefined);
    }
  }

  private exportDebugPolys(): void {
    const text = [
      "const WATER_POLY: NormPoint[] = " + JSON.stringify(this.waterPoly, null, 2) + ";",
      "const WAY_DROP_ZONE: NormPoint[] = " + JSON.stringify(this.wayDropZone, null, 2) + ";",
    ].join("\n\n");
    console.log(text);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => undefined);
    }
  }

  private playGateCue(intensity: number): void {
    // Fallback-Kette: je nach lokal vorhandenen Dateien kann `stone_drop`
    // fehlen. So hat die Tor-Öffnung dennoch eine akustische Quittung.
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.stone_drop, intensity);
      return;
    } catch { /* noop */ }
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.water_ring, intensity);
      return;
    } catch { /* noop */ }
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.candle_breath, intensity);
    } catch { /* noop */ }
  }

  private playStoneWaterCue(): void {
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.stone_drop, 0.55);
    } catch { /* noop */ }
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.water_ring, 0.45);
    } catch { /* noop */ }
  }

  private scheduleNextPresence(): void {
    if (this.destroyed) return;
    const delayMs = 12000 + Math.random() * 18000;
    this.presenceTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      this.spawnRandomPresence();
      this.scheduleNextPresence();
    }, delayMs);
  }

  private spawnRandomPresence(): void {
    const r = Math.random();
    if (r < 0.38) this.spawnForeignPresence("walking");
    else if (r < 0.68) this.spawnForeignPresence("kneeling");
    else this.spawnForeignPresence("seated");
  }

  private spawnForeignPresence(kind: PresenceKind): void {
    const W = this.scene.width;
    const H = this.scene.height;
    const zone = this.wayDropZone;
    const base = randomPointInPoly(zone);
    const start = { x: base.x * W, y: base.y * H };
    const walkTarget = kind === "walking"
      ? randomNearbyPointInPoly(zone, base, 0.035, this.waterPoly)
      : base;
    const end = { x: walkTarget.x * W, y: walkTarget.y * H };

    const node = this.createPresenceNode(kind);
    node.x = start.x;
    node.y = start.y;
    node.alpha = 0;
    node.scale.set(this.presenceScaleForPoint(start.x, start.y));
    this.scene.layers.parallax_mid.addChild(node);

    const actor: PresenceActor = {
      kind,
      node,
      ageMs: 0,
      fadeInMs: kind === "walking" ? 400 : 450,
      holdMs: kind === "walking" ? 50 + Math.random() * 600 : 1500 + Math.random() * 800,
      fadeOutMs: kind === "walking" ? 950 : 550,
      zone,
      start,
      end,
    };

    this.presences.push(actor);
    this.leavePresenceTrace(kind, zone, start.x, start.y);
  }

  private leavePresenceTrace(kind: PresenceKind, zone: NormPoint[], x: number, y: number): void {
    const base = { x: x / this.scene.width, y: y / this.scene.height };
    const tracePoint = randomNearbyPointInPoly(zone, base, 0.04, this.waterPoly);
    const tx = tracePoint.x * this.scene.width;
    const ty = tracePoint.y * this.scene.height;

    if (kind === "kneeling") {
      this.leaveForeignStone(tx, ty);
      return;
    }
    if (kind === "seated") {
      const dryPoint = this.randomDryTracePointNear(base);
      this.leaveForeignCandle(dryPoint.x * this.scene.width, dryPoint.y * this.scene.height);
      return;
    }
    if (Math.random() < 0.55) {
      this.leaveForeignStone(tx, ty);
    } else {
      const dryPoint = this.randomDryTracePointNear(base);
      this.leaveForeignCandle(dryPoint.x * this.scene.width, dryPoint.y * this.scene.height);
    }
  }

  private randomDryTracePointNear(base: NormPoint): NormPoint {
    return randomNearbyPointInPoly(this.wayDropZone, base, 0.03, this.waterPoly);
  }

  private createPresenceNode(kind: PresenceKind): Container {
    const c = new Container();
    const shadow = new Graphics();
    shadow.ellipse(0, 0, kind === "walking" ? 34 : 28, 7).fill({ color: 0x000000, alpha: 0.16 });
    const texture = this.presenceTextures[kind];
    if (texture) {
      const sprite = new Sprite(texture);
      sprite.anchor.set(0.5, 1);
      const targetHeight = PRESENCE_BASE_HEIGHT[kind];
      sprite.scale.set(targetHeight / Math.max(texture.height, 1));
      sprite.alpha = 0.9;
      c.addChild(shadow, sprite);
      return c;
    }

    const g = new Graphics();
    if (kind === "walking") {
      g.ellipse(0, -30, 11, 13).fill({ color: 0xe6e2d8, alpha: 0.36 });
      g.roundRect(-10, -18, 20, 38, 8).fill({ color: 0xe0dbcf, alpha: 0.3 });
      g.roundRect(-13, 14, 8, 28, 5).fill({ color: 0xd8d2c8, alpha: 0.24 });
      g.roundRect(5, 14, 8, 28, 5).fill({ color: 0xd8d2c8, alpha: 0.24 });
    } else if (kind === "kneeling") {
      g.ellipse(-8, 13, 18, 10).fill({ color: 0xe0dbcf, alpha: 0.28 });
      g.roundRect(-18, -12, 28, 30, 8).fill({ color: 0xe0dbcf, alpha: 0.28 });
      g.ellipse(8, -20, 9, 10).fill({ color: 0xe6e2d8, alpha: 0.34 });
    } else {
      g.ellipse(0, 15, 20, 11).fill({ color: 0xe0dbcf, alpha: 0.26 });
      g.roundRect(-18, -20, 36, 28, 8).fill({ color: 0xe0dbcf, alpha: 0.26 });
      g.ellipse(0, -30, 10, 11).fill({ color: 0xe6e2d8, alpha: 0.34 });
    }

    c.addChild(shadow, g);
    return c;
  }

  private tickPresences(dt: number): void {
    this.presences = this.presences.filter((p) => {
      p.ageMs += dt;
      const total = p.fadeInMs + p.holdMs + p.fadeOutMs;
      const t = Math.min(1, p.ageMs / total);

      if (p.kind === "walking") {
        p.node.x = p.start.x + (p.end.x - p.start.x) * t;
        p.node.y = p.start.y + (p.end.y - p.start.y) * t;
        p.node.scale.set(this.presenceScaleForPoint(p.node.x, p.node.y));
      }

      if (p.ageMs < p.fadeInMs) {
        p.node.alpha = 0.42 * (p.ageMs / p.fadeInMs);
      } else if (p.ageMs < p.fadeInMs + p.holdMs) {
        p.node.alpha = 0.42;
      } else {
        const outT = (p.ageMs - p.fadeInMs - p.holdMs) / p.fadeOutMs;
        p.node.alpha = 0.42 * (1 - outT);
      }

      if (p.ageMs >= total) {
        try { p.node.destroy({ children: true }); } catch { /* ignore */ }
        return false;
      }
      return true;
    });
  }

  private leaveForeignStone(x: number, y: number): void {
    const stone = this.createStoneNode();
    (this.artifactsRoot ?? this.scene.layers.artifacts).addChild(stone);
    this.placeGroundStone(stone, x, y, 0.72, true, true);
  }

  private leaveForeignCandle(x: number, y: number): void {
    const candle = this.createCandleNode();
    (this.artifactsRoot ?? this.scene.layers.artifacts).addChild(candle);
    this.placeGroundCandle(candle, x, y, 0.82);
    candle.scale.set(candle.scale.x * 0.88, candle.scale.y * 0.88);
    this.attachCandleFlame(candle.x, candle.y, 0.42, 220, this.candleFlameOffsetForPoint(candle.x, candle.y) * 0.88);
    try { audioEngine.playOneShot(SPUREN_ASSETS.audio.candle_breath, 0.5); } catch { /* still */ }
    this.addTrace("candle", candle.x / this.scene.width, candle.y / this.scene.height, 220);
    this.pushForeignArtifact(candle);
  }

  private pushForeignArtifact(node: Container): void {
    this.foreignArtifacts.push(node);
    while (this.foreignArtifacts.length > 5) {
      const old = this.foreignArtifacts.shift();
      try { old?.destroy({ children: true }); } catch { /* ignore */ }
    }
  }

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
      if (stopped) {
        e.destroy();
        return false;
      }
      return true;
    });
  }

  private addTrace(kind: LocalTrace["kind"], x: number, y: number, ttlSeconds: number): void {
    useStore.getState().addTrace({
      id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind,
      x,
      y,
      ttlSeconds,
      createdAt: Date.now(),
    });
  }

  private isInPoly(x: number, y: number, poly: NormPoint[]): boolean {
    if (this.scene.width <= 0 || this.scene.height <= 0) return false;
    const nx = x / this.scene.width;
    const ny = y / this.scene.height;
    return pointInNormPolygon(nx, ny, poly);
  }

  private isInAnyPoly(x: number, y: number, polys: NormPoint[][]): boolean {
    for (const poly of polys) {
      if (this.isInPoly(x, y, poly)) return true;
    }
    return false;
  }

  private toPixels(poly: NormPoint[]): number[] {
    const out: number[] = [];
    for (const p of poly) out.push(p.x * this.scene.width, p.y * this.scene.height);
    return out;
  }

}

function pointInNormPolygon(x: number, y: number, poly: NormPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersects = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

function randomPointInPoly(poly: NormPoint[]): NormPoint {
  const xs = poly.map((p) => p.x);
  const ys = poly.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (let i = 0; i < 40; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (pointInNormPolygon(x, y, poly)) return { x, y };
  }

  const sx = poly.reduce((sum, p) => sum + p.x, 0) / poly.length;
  const sy = poly.reduce((sum, p) => sum + p.y, 0) / poly.length;
  return { x: sx, y: sy };
}

function randomNearbyPointInPoly(
  poly: NormPoint[],
  base: NormPoint,
  maxOffset: number,
  blockedPoly?: NormPoint[],
): NormPoint {
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxOffset;
    const x = base.x + Math.cos(angle) * dist;
    const y = base.y + Math.sin(angle) * dist * 0.6;
    if (pointInNormPolygon(x, y, poly) && !(blockedPoly && pointInNormPolygon(x, y, blockedPoly))) {
      return { x, y };
    }
  }
  return base;
}

function drawPolyOverlay(
  g: Graphics,
  points: number[],
  color: number,
  active: boolean,
): void {
  g.poly(points, true).fill({ color, alpha: active ? 0.18 : 0.12 });
  g.poly(points, true).stroke({ color, width: active ? 3 : 2, alpha: 0.9 });
  for (let i = 0; i < points.length; i += 2) {
    g.circle(points[i], points[i + 1], active ? 7 : 5).fill({ color, alpha: 0.95 });
  }
}

function nearestVertexIndex(p: NormPoint, poly: NormPoint[]): number {
  let idx = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < poly.length; i++) {
    const d = Math.hypot(poly[i].x - p.x, poly[i].y - p.y);
    if (d < bestDist) {
      bestDist = d;
      idx = i;
    }
  }
  return idx;
}

function insertPointOnNearestEdge(poly: NormPoint[], p: NormPoint): void {
  if (poly.length < 2) {
    poly.push({ ...p });
    return;
  }
  let bestEdgeStart = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    const d = distancePointToSegment(p, poly[i], poly[j]);
    if (d < bestDist) {
      bestDist = d;
      bestEdgeStart = i;
    }
  }
  poly.splice(bestEdgeStart + 1, 0, { ...p });
}

function subdividePoly(poly: NormPoint[]): void {
  if (poly.length < 3) return;
  const out: NormPoint[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    out.push(a);
    out.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  poly.length = 0;
  poly.push(...out);
}

function distancePointToSegment(p: NormPoint, a: NormPoint, b: NormPoint): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const ab2 = abx * abx + aby * aby;
  if (ab2 === 0) return Math.hypot(apx, apy);
  const t = clamp((apx * abx + apy * aby) / ab2, 0, 1);
  const qx = a.x + abx * t;
  const qy = a.y + aby * t;
  return Math.hypot(p.x - qx, p.y - qy);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
