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
import { useStore, type LocalTrace, type PlacedArtifact } from "../state/store";
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
const MIN_CANDLE_DISTANCE_NORM = 0.002;

const STONE_SOURCE_POLY: NormPoint[] = [
  {
    "x": 0.384375,
    "y": 0.7235238987816307
  },
  {
    "x": 0.5703125,
    "y": 0.711340206185567
  },
  {
    "x": 0.578125,
    "y": 0.7966260543580131
  },
  {
    "x": 0.3953125,
    "y": 0.7919400187441424
  }
];
const CANDLE_SOURCE_POLYS: NormPoint[][] = [
  [
    {
      "x": 0.12447916666666667,
      "y": 0.3252108716026242
    },
    {
      "x": 0.18697916666666667,
      "y": 0.3280224929709466
    },
    {
      "x": 0.1875,
      "y": 0.4104967197750703
    },
    {
      "x": 0.18333333333333332,
      "y": 0.47141518275538896
    },
    {
      "x": 0.12760416666666666,
      "y": 0.4751640112464855
    }
  ],
  [
    {
      "x": 0.7255208333333333,
      "y": 0.6316776007497656
    },
    {
      "x": 0.8192708333333333,
      "y": 0.6316776007497656
    },
    {
      "x": 0.8072916666666666,
      "y": 0.7666354264292409
    },
    {
      "x": 0.728125,
      "y": 0.7553889409559512
    }
  ],
  [
    {
      "x": 0.1828125,
      "y": 0.507029053420806
    },
    {
      "x": 0.6432291666666666,
      "y": 0.43673851921274603
    },
    {
      "x": 0.753125,
      "y": 0.3430178069353327
    },
    {
      "x": 0.8026041666666667,
      "y": 0.3345829428303655
    },
    {
      "x": 0.7442708333333333,
      "y": 0.542642924086223
    },
    {
      "x": 0.29322916666666665,
      "y": 0.5726335520149953
    }
  ]
];
const BACK_ACTION_POLY: NormPoint[] = [
  {
    "x": 0.18958333333333333,
    "y": 0.9353327085285849
  },
  {
    "x": 0.3380208333333333,
    "y": 0.8978444236176195
  },
  {
    "x": 1,
    "y": 1
  },
  {
    "x": 0,
    "y": 1
  }
];
const WATER_POLY: NormPoint[] = [
  {
    "x": 0.31197916666666664,
    "y": 0.5979381443298969
  },
  {
    "x": 0.615625,
    "y": 0.5670103092783505
  },
  {
    "x": 0.7958333333333333,
    "y": 0.5829428303655108
  },
  {
    "x": 0.840625,
    "y": 0.6401124648547329
  },
  {
    "x": 0.7625,
    "y": 0.6925960637300843
  },
  {
    "x": 0.69375,
    "y": 0.703842549203374
  },
  {
    "x": 0.5255208333333333,
    "y": 0.6944704779756327
  },
  {
    "x": 0.3802083333333333,
    "y": 0.6682286785379569
  },
  {
    "x": 0.2921875,
    "y": 0.6522961574507966
  },
  {
    "x": 0.21822916666666667,
    "y": 0.6401124648547329
  }
];

const STONE_DROP_ZONES: NormPoint[][] = [
  [
    {
      "x": 0.3848958333333333,
      "y": 0.717900656044986
    },
    {
      "x": 0.4864583333333333,
      "y": 0.7047797563261481
    },
    {
      "x": 0.5953125,
      "y": 0.7216494845360825
    },
    {
      "x": 0.5901041666666667,
      "y": 0.7731958762886598
    },
    {
      "x": 0.503125,
      "y": 0.7703842549203374
    },
    {
      "x": 0.4635416666666667,
      "y": 0.8219306466729147
    },
    {
      "x": 0.3723958333333333,
      "y": 0.767572633552015
    }
  ],
  [
    {
      "x": 0.678125,
      "y": 0.739456419868791
    },
    {
      "x": 0.7161458333333334,
      "y": 0.7225866916588566
    },
    {
      "x": 0.7354166666666667,
      "y": 0.753514526710403
    },
    {
      "x": 0.7854166666666667,
      "y": 0.7666354264292409
    },
    {
      "x": 0.8317708333333333,
      "y": 0.7328959700093721
    },
    {
      "x": 0.8317708333333333,
      "y": 0.7328959700093721
    },
    {
      "x": 0.8463541666666666,
      "y": 0.7282099343955014
    },
    {
      "x": 0.8947916666666667,
      "y": 0.6494845360824743
    },
    {
      "x": 0.9864583333333333,
      "y": 0.7094657919400188
    },
    {
      "x": 0.9177083333333333,
      "y": 0.8734770384254921
    },
    {
      "x": 0.6671875,
      "y": 0.7760074976569822
    }
  ],
  [
    {
      "x": 0.3927083333333333,
      "y": 0.8294283036551078
    },
    {
      "x": 0.471875,
      "y": 0.85941893158388
    },
    {
      "x": 0.5484375,
      "y": 0.845360824742268
    },
    {
      "x": 0.5932291666666667,
      "y": 0.9915651358950328
    },
    {
      "x": 0.32916666666666666,
      "y": 0.9700093720712277
    }
  ]
];

const WAY_DROP_ZONE: NormPoint[] = [
  {
    "x": 0.06145833333333333,
    "y": 0.5567010309278351
  },
  {
    "x": 0.10260416666666666,
    "y": 0.528584817244611
  },
  {
    "x": 0.3453125,
    "y": 0.5117150890346767
  },
  {
    "x": 0.5041666666666667,
    "y": 0.507029053420806
  },
  {
    "x": 0.5536458333333333,
    "y": 0.5060918462980318
  },
  {
    "x": 0.6333333333333333,
    "y": 0.48266166822867856
  },
  {
    "x": 0.6651041666666667,
    "y": 0.44048734770384257
  },
  {
    "x": 0.7208333333333333,
    "y": 0.3880037488284911
  },
  {
    "x": 0.790625,
    "y": 0.3898781630740394
  },
  {
    "x": 0.8729166666666667,
    "y": 0.38425492033739456
  },
  {
    "x": 0.8958333333333334,
    "y": 0.49953139643861294
  },
  {
    "x": 0.9088541666666666,
    "y": 0.5782567947516402
  },
  {
    "x": 0.9010416666666666,
    "y": 0.6457357075913777
  },
  {
    "x": 0.9932291666666667,
    "y": 0.7075913776944704
  },
  {
    "x": 0.9338541666666667,
    "y": 0.795688847235239
  },
  {
    "x": 0.9239583333333333,
    "y": 0.8791002811621368
  },
  {
    "x": 0.6635416666666667,
    "y": 0.7825679475164011
  },
  {
    "x": 0.6791666666666667,
    "y": 0.7347703842549204
  },
  {
    "x": 0.7166666666666667,
    "y": 0.7197750702905342
  },
  {
    "x": 0.73125,
    "y": 0.7516401124648547
  },
  {
    "x": 0.7802083333333333,
    "y": 0.7647610121836926
  },
  {
    "x": 0.8255208333333334,
    "y": 0.7310215557638238
  },
  {
    "x": 0.7916666666666666,
    "y": 0.6738519212746017
  },
  {
    "x": 0.8494791666666667,
    "y": 0.6504217432052484
  },
  {
    "x": 0.7989583333333333,
    "y": 0.5782567947516402
  },
  {
    "x": 0.6166666666666667,
    "y": 0.5641986879100281
  },
  {
    "x": 0.3140625,
    "y": 0.5904404873477038
  },
  {
    "x": 0.21145833333333333,
    "y": 0.6391752577319587
  },
  {
    "x": 0.25416666666666665,
    "y": 0.6682286785379569
  },
  {
    "x": 0.3572916666666667,
    "y": 0.7000937207122774
  },
  {
    "x": 0.4635416666666667,
    "y": 0.6935332708528584
  },
  {
    "x": 0.5744791666666667,
    "y": 0.7075913776944704
  },
  {
    "x": 0.6625,
    "y": 0.7047797563261481
  },
  {
    "x": 0.65625,
    "y": 0.788191190253046
  },
  {
    "x": 0.5088541666666667,
    "y": 0.7853795688847235
  },
  {
    "x": 0.4609375,
    "y": 0.8153701968134958
  },
  {
    "x": 0.5505208333333333,
    "y": 0.8528584817244611
  },
  {
    "x": 0.5880208333333333,
    "y": 0.9287722586691659
  },
  {
    "x": 0.9369791666666667,
    "y": 0.9840674789128397
  },
  {
    "x": 0.31927083333333334,
    "y": 0.9803186504217432
  },
  {
    "x": 0.3828125,
    "y": 0.8791002811621368
  },
  {
    "x": 0.24114583333333334,
    "y": 0.851921274601687
  },
  {
    "x": 0.008333333333333333,
    "y": 0.8509840674789129
  },
  {
    "x": 0.009375,
    "y": 0.7666354264292409
  },
  {
    "x": 0.06302083333333333,
    "y": 0.7450796626054358
  },
  {
    "x": 0.05416666666666667,
    "y": 0.6401124648547329
  }
];
const GATE_POLY: NormPoint[] = [
  {
    "x": 0.74,
    "y": 0.09
  },
  {
    "x": 0.8510416666666667,
    "y": 0.09840674789128398
  },
  {
    "x": 0.8078125,
    "y": 0.32146204311152765
  },
  {
    "x": 0.7697916666666667,
    "y": 0.3345829428303655
  }
];

const DEBUG_WATER_COLOR = 0x2f80ed;
const DEBUG_WAY_COLOR = 0xf2994a;
const DEBUG_STONE_COLOR = 0x9b8a6a;
const DEBUG_ACTION_FORWARD_COLOR = 0xbb6bd9;
const DEBUG_ACTION_BACK_COLOR = 0xeb5757;
const DEBUG_ACTION_CANDLE_COLOR = 0xf2c94c;
const DEBUG_ACTION_STONE_COLOR = 0x828282;
const DEBUG_VANISHING_COLOR = 0xeb5757;
const DEBUG_REFERENCE_COLOR = 0x27ae60;
const GROUND_PERSPECTIVE: GroundPerspectiveConfig = {
  // Manuell kalibrierter Fluchtpunkt (normierte Bildschirmkoordinaten => ?debugPerspective=1).
  // Entlang dieses Strahls wird die scheinbare Objektgroesse berechnet.
  vanishingPoint: {"x":0.7276041666666667,"y":0.4075595126522962},
  referencePoint: {"x":0.6520833333333333,"y":0.9325210871602624},
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

type DebugZoneKind = "water" | "way" | "stone";
type ActionZoneKind = "forward" | "back" | "candle" | "stoneSource";

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
  private candleTextures: Texture[] = [];
  private presenceTextures: Partial<Record<PresenceKind, Texture>> = {};
  private waterPoly: NormPoint[] = WATER_POLY.map((p) => ({ ...p }));
  private wayDropZone: NormPoint[] = WAY_DROP_ZONE.map((p) => ({ ...p }));
  private stoneDropZones: NormPoint[][] = STONE_DROP_ZONES.map((poly) => poly.map((p) => ({ ...p })));
  private forwardActionZone: NormPoint[] = GATE_POLY.map((p) => ({ ...p }));
  private backActionZone: NormPoint[] = BACK_ACTION_POLY.map((p) => ({ ...p }));
  private candleSourcePolys: NormPoint[][] = CANDLE_SOURCE_POLYS.map((poly) => poly.map((p) => ({ ...p })));
  private stoneSourcePoly: NormPoint[] = STONE_SOURCE_POLY.map((p) => ({ ...p }));
  private debugOverlay: Graphics | null = null;
  private actionDebugOverlay: Graphics | null = null;
  private perspectiveDebugOverlay: Graphics | null = null;
  private debugMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugZones");
  private actionDebugMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugActionZones");
  private perspectiveDebugMode =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("debugPerspective");
  private activeZone: DebugZoneKind = "water";
  private activeStoneZoneIndex = 0;
  private draggingVertex: { zone: DebugZoneKind; zoneIndex?: number; index: number } | null = null;
  private activeActionZone: ActionZoneKind = "forward";
  private activeCandleSourceIndex = 0;
  private draggingActionVertex: { zone: ActionZoneKind; zoneIndex?: number; index: number } | null = null;
  private activePerspectiveHandle: "vanishing" | "reference" = "vanishing";
  private draggingPerspectiveHandle: "vanishing" | "reference" | null = null;
  private lastPointerNorm: NormPoint = { x: 0.5, y: 0.5 };

  private held: HeldItem | null = null;
  private presences: PresenceActor[] = [];
  private placedArtifacts: Container[] = [];

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
    this.candleTextures = await Promise.all([
      Assets.load<Texture>(SPUREN_ASSETS.artifacts.candle_1),
      Assets.load<Texture>(SPUREN_ASSETS.artifacts.candle_2),
      Assets.load<Texture>(SPUREN_ASSETS.artifacts.candle_3),
      Assets.load<Texture>(SPUREN_ASSETS.artifacts.candle_4),
    ]);
    const [passingTexture, kneelingTexture, seatedTexture] = await Promise.all([
      Assets.load<Texture>(SPUREN_ASSETS.silhouettes.passing),
      Assets.load<Texture>(SPUREN_ASSETS.silhouettes.kneeling),
      Assets.load<Texture>(SPUREN_ASSETS.silhouettes.seated),
    ]);
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
      this.drawActionDebugZones();
      this.drawPerspectiveDebug();
    };
    fitBackground();

    if (this.debugMode) {
      this.debugOverlay = new Graphics();
      this.scene.layers.overlay.addChild(this.debugOverlay);
      this.drawDebugZones();
      console.info("[debugZones] Controls: W=water, D=way, S/1-3=stone drop zone, A=add vertex at cursor, N=insert on nearest edge, M=subdivide polygon, Del=remove nearest vertex, P=print+copy");
    }
    if (this.actionDebugMode) {
      this.actionDebugOverlay = new Graphics();
      this.scene.layers.overlay.addChild(this.actionDebugOverlay);
      this.drawActionDebugZones();
      console.info("[debugActionZones] Controls: F=forward, B=back, C/1-3=candle source, T=stone source, A=add vertex, N=insert on nearest edge, M=subdivide polygon, Del=remove nearest vertex, P=print+copy");
    }
    if (this.perspectiveDebugMode) {
      this.perspectiveDebugOverlay = new Graphics();
      this.scene.layers.overlay.addChild(this.perspectiveDebugOverlay);
      this.drawPerspectiveDebug();
      console.info("[debugPerspective] Controls: V=vanishing, R=reference, drag marker, Arrow keys=nudge, O=print+copy");
    }
    if (this.debugMode || this.actionDebugMode || this.perspectiveDebugMode) {
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

    this.restorePlacedArtifacts();

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
    for (const node of this.placedArtifacts) {
      try { node.destroy({ children: true }); } catch { /* ignore */ }
    }
    this.placedArtifacts = [];

    for (const e of this.effects) {
      try { e.destroy(); } catch { /* ignore */ }
    }
    this.effects = [];

    try { this.debugOverlay?.destroy(); } catch { /* ignore */ }
    this.debugOverlay = null;
    try { this.actionDebugOverlay?.destroy(); } catch { /* ignore */ }
    this.actionDebugOverlay = null;
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
    if (this.actionDebugMode) {
      const hit = this.findActionDebugVertex(x, y, 14);
      if (hit) {
        this.draggingActionVertex = hit;
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

    if (this.isInPoly(x, y, this.backActionZone)) {
      this.cb.onRequestBack?.();
      return;
    }

    if (this.isInPoly(x, y, this.forwardActionZone)) {
      this.playGateCue(0.45, x, y);
      this.cb.onRequestForward?.();
      return;
    }

    if (this.held) return;

    if (this.isInAnyPoly(x, y, this.candleSourcePolys)) {
      this.pickUpCandle(x, y);
      return;
    }
    if (this.isInPoly(x, y, this.stoneSourcePoly)) {
      this.pickUpStone(x, y);
      return;
    }
    if (this.waterUnlocked && this.isInPoly(x, y, this.waterPoly)) {
      this.spawnWaterRipple(x, y, 0.62);
      try { audioEngine.playOneShot(SPUREN_ASSETS.audio.water_ring, this.effectVolumeAtPoint(0.5, x, y)); } catch { /* still */ }
    }
  };

  private onStageMove = (ev: FederatedPointerEvent) => {
    const x = ev.global.x;
    const y = ev.global.y;
    this.lastPointerNorm = { x: x / this.scene.width, y: y / this.scene.height };

    if (this.draggingVertex) {
      const nx = clamp(x / this.scene.width, 0, 1);
      const ny = clamp(y / this.scene.height, 0, 1);
      const poly = this.debugPolyForDrag(this.draggingVertex);
      poly[this.draggingVertex.index] = { x: nx, y: ny };
      this.drawDebugZones();
      return;
    }
    if (this.draggingActionVertex) {
      const nx = clamp(x / this.scene.width, 0, 1);
      const ny = clamp(y / this.scene.height, 0, 1);
      const poly = this.actionDebugPolyForDrag(this.draggingActionVertex);
      poly[this.draggingActionVertex.index] = { x: nx, y: ny };
      this.drawActionDebugZones();
      return;
    }
    if (this.draggingPerspectiveHandle) {
      const nx = clamp(x / this.scene.width, 0, 1);
      const ny = clamp(y / this.scene.height, 0, 1);
      setPerspectiveHandlePoint(GROUND_PERSPECTIVE, this.draggingPerspectiveHandle, { x: nx, y: ny });
      this.drawPerspectiveDebug();
      return;
    }

    if (this.backHoldStartedAt != null && !this.isInPoly(x, y, this.backActionZone)) {
      this.backHoldStartedAt = null;
    }

    if (!this.held) return;
    this.held.node.x = x;
    this.held.node.y = y;
    if (this.held.kind === "stone") {
      this.held.node.scale.set(this.stoneScaleForPoint(x, y));
      this.held.node.alpha = this.isValidStoneDropAt(x, y) ? 0.95 : 0.38;
    } else {
      this.held.node.scale.set(this.candleScaleForPoint(x, y));
      this.held.node.alpha = this.isValidCandleDropAt(x, y) ? 0.95 : 0.38;
    }
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
    if (this.draggingActionVertex) {
      this.draggingActionVertex = null;
      return;
    }
    this.backHoldStartedAt = null;
    if (!this.held) return;

    const x = ev.global.x;
    const y = ev.global.y;
    if (this.held.kind === "stone") {
      if (this.waterUnlocked && this.isInPoly(x, y, this.waterPoly)) {
        this.spawnWaterRipple(x, y, 0.95);
        this.playStoneWaterCue(x, y);
        this.addTrace("stone", x / this.scene.width, y / this.scene.height, 180);
        this.held.node.destroy({ children: true });
      } else {
        if (this.isValidStoneDropAt(x, y)) {
          this.placeGroundStone(this.held.node, x, y, 0.95, true, false, true);
        } else {
          this.held.node.destroy({ children: true });
        }
      }
    } else {
      if (this.isValidCandleDropAt(x, y)) {
        const placed = this.placeGroundCandle(this.held.node, x, y, 1, false, true);
        if (placed) {
          const flameScale = this.candleScaleForPoint(this.held.node.x, this.held.node.y);
          this.attachCandleFlame(this.held.node.x, this.held.node.y, 0.62, null, this.candleFlameOffsetForPoint(this.held.node.x, this.held.node.y), flameScale);
          this.addTrace("candle", this.held.node.x / this.scene.width, this.held.node.y / this.scene.height, null);
          try { audioEngine.playOneShot(SPUREN_ASSETS.audio.candle_breath, this.effectVolumeAtPoint(0.5, this.held.node.x, this.held.node.y)); } catch { /* still */ }
        }
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
      const sizeFactor = randomRange(0.72, 1.26);
      stone.scale.x *= randomHorizontalMirror() * sizeFactor;
      stone.scale.y *= sizeFactor;
    } else {
      const target = 92 * randomRange(0.72, 1.26);
      const side = Math.max(tex.width, tex.height) || 1;
      const scale = target / side;
      stone.scale.set(scale * randomHorizontalMirror(), scale);
    }
    c.addChild(shadow, stone);
    return c;
  }

  private createCandleNode(): Container {
    const c = new Container();
    const shadow = new Graphics();
    shadow.ellipse(0, 0, 18, 5).fill({ color: 0x050403, alpha: 0.26 });
    const heightFactor = 0.84 + Math.random() * 0.34;
    const widthFactor = 0.82 + Math.random() * 0.34;
    const textures = this.candleTextures.length > 0
      ? this.candleTextures
      : [Texture.WHITE];
    const tex = textures[Math.floor(Math.random() * textures.length)];
    if (tex !== Texture.WHITE) {
      const candle = new Sprite(tex);
      candle.anchor.set(0.5, 1);
      const targetHeight = 82 * heightFactor;
      candle.scale.set(targetHeight / Math.max(tex.height, 1));
      candle.scale.x *= widthFactor * randomHorizontalMirror();
      c.addChild(shadow, candle);
      return c;
    }
    const body = new Graphics();
    const bodyWidth = 12 * widthFactor;
    const bodyHeight = 22 * heightFactor;
    body.roundRect(-bodyWidth / 2, -bodyHeight + 6, bodyWidth, bodyHeight, 4).fill({ color: 0xf4e0ba, alpha: 0.94 });
    const wick = new Graphics();
    wick.roundRect(-1, -bodyHeight - 2, 2, 5, 1).fill({ color: 0x2c2418, alpha: 0.9 });
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
    persist: boolean,
  ): void {
    const base = { x: x / this.scene.width, y: y / this.scene.height };
    const point = foreign ? this.resolveStonePlacementPoint(base, 0.045) : base;
    if (!point || !this.isValidStonePoint(point)) {
      node.destroy({ children: true });
      return;
    }
    node.x = point.x * this.scene.width;
    node.y = point.y * this.scene.height;
    node.alpha = alpha;
    node.scale.set(this.stoneScaleForPoint(node.x, node.y) * (foreign ? 0.75 : 1));
    if (withSound) {
      try { audioEngine.playOneShot(SPUREN_ASSETS.audio.stone_drop, this.effectVolumeAtPoint(0.5, node.x, node.y)); } catch { /* still */ }
    }
    this.addTrace("stone", node.x / this.scene.width, node.y / this.scene.height, 240);
    this.rememberPlacedArtifact(node);
    if (persist) this.persistPlacedArtifact("stone", node.x, node.y, alpha);
  }

  private placeGroundCandle(node: Container, x: number, y: number, alpha: number, allowFallback = false, persist = false): boolean {
    const base = { x: x / this.scene.width, y: y / this.scene.height };
    const point = allowFallback ? this.resolveCandlePlacementPoint(base, 0.04) : base;
    if (!point || !this.isValidCandlePoint(point)) {
      node.destroy({ children: true });
      return false;
    }
    node.x = point.x * this.scene.width;
    node.y = point.y * this.scene.height;
    node.alpha = alpha;
    node.scale.set(this.candleScaleForPoint(node.x, node.y));
    this.rememberPlacedArtifact(node);
    if (persist) this.persistPlacedArtifact("candle", node.x, node.y, alpha);
    return true;
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

  private effectVolumeAtPoint(baseIntensity: number, x: number, y: number): number {
    const vanishing = GROUND_PERSPECTIVE.vanishingPoint;
    const reference = GROUND_PERSPECTIVE.referencePoint;
    const nx = this.scene.width > 0 ? x / this.scene.width : reference.x;
    const ny = this.scene.height > 0 ? y / this.scene.height : reference.y;
    const distance = Math.hypot(nx - vanishing.x, ny - vanishing.y);
    const referenceDistance = Math.max(0.001, Math.hypot(reference.x - vanishing.x, reference.y - vanishing.y));
    const depth = smoothstep(clamp(distance / referenceDistance, 0, 1));
    return baseIntensity * (0.08 + depth * 0.92);
  }

  private candleFlameOffsetForPoint(x: number, y: number): number {
    return Math.max(8, this.candleScaleForPoint(x, y) * 74);
  }

  private isValidStoneDropAt(x: number, y: number): boolean {
    return this.scene.width > 0
      && this.scene.height > 0
      && this.isValidStonePoint({ x: x / this.scene.width, y: y / this.scene.height });
  }

  private isValidCandleDropAt(x: number, y: number): boolean {
    return this.scene.width > 0
      && this.scene.height > 0
      && this.isValidCandlePoint({ x: x / this.scene.width, y: y / this.scene.height });
  }

  private attachCandleFlame(x: number, y: number, intensity: number, ttlSeconds: number | null, offsetY = 18, flameScale = 1): void {
    const flame = new FlameEmitter({
      position: { x, y: y - offsetY },
      intensity,
      ttlSeconds,
      scale: flameScale,
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
      ttlSeconds: 6,
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
    if (!this.debugMode && !this.actionDebugMode && !this.perspectiveDebugMode) return;
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
    if (this.actionDebugMode) {
      if (ev.key.toLowerCase() === "f") {
        this.activeActionZone = "forward";
        this.drawActionDebugZones();
        return;
      }
      if (ev.key.toLowerCase() === "b") {
        this.activeActionZone = "back";
        this.drawActionDebugZones();
        return;
      }
      if (ev.key.toLowerCase() === "c") {
        this.activeActionZone = "candle";
        this.ensureCandleSourcePoly(this.activeCandleSourceIndex);
        this.drawActionDebugZones();
        return;
      }
      if (ev.key.toLowerCase() === "t") {
        this.activeActionZone = "stoneSource";
        this.drawActionDebugZones();
        return;
      }
      if (/^[1-3]$/.test(ev.key)) {
        this.activeActionZone = "candle";
        this.activeCandleSourceIndex = Number(ev.key) - 1;
        this.ensureCandleSourcePoly(this.activeCandleSourceIndex);
        this.drawActionDebugZones();
        return;
      }
      if (ev.key.toLowerCase() === "a") {
        const poly = this.activeActionDebugPoly();
        poly.push({ ...this.lastPointerNorm });
        this.drawActionDebugZones();
        return;
      }
      if (ev.key.toLowerCase() === "n") {
        const poly = this.activeActionDebugPoly();
        insertPointOnNearestEdge(poly, this.lastPointerNorm);
        this.drawActionDebugZones();
        return;
      }
      if (ev.key.toLowerCase() === "m") {
        const poly = this.activeActionDebugPoly();
        subdividePoly(poly);
        this.drawActionDebugZones();
        return;
      }
      if (ev.key === "Backspace" || ev.key === "Delete") {
        const poly = this.activeActionDebugPoly();
        if (poly.length <= 3) return;
        const idx = nearestVertexIndex(this.lastPointerNorm, poly);
        poly.splice(idx, 1);
        this.drawActionDebugZones();
        ev.preventDefault();
        return;
      }
      if (ev.key.toLowerCase() === "p") {
        this.exportActionDebugPolys();
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
    if (ev.key.toLowerCase() === "s") {
      this.activeZone = "stone";
      this.ensureStoneDropZone(this.activeStoneZoneIndex);
      this.drawDebugZones();
      return;
    }
    if (/^[1-3]$/.test(ev.key)) {
      this.activeZone = "stone";
      this.activeStoneZoneIndex = Number(ev.key) - 1;
      this.ensureStoneDropZone(this.activeStoneZoneIndex);
      this.drawDebugZones();
      return;
    }
    if (ev.key.toLowerCase() === "a") {
      const poly = this.activeDebugPoly();
      poly.push({ ...this.lastPointerNorm });
      this.drawDebugZones();
      return;
    }
    if (ev.key.toLowerCase() === "n") {
      const poly = this.activeDebugPoly();
      insertPointOnNearestEdge(poly, this.lastPointerNorm);
      this.drawDebugZones();
      return;
    }
    if (ev.key.toLowerCase() === "m") {
      const poly = this.activeDebugPoly();
      subdividePoly(poly);
      this.drawDebugZones();
      return;
    }
    if (ev.key === "Backspace" || ev.key === "Delete") {
      const poly = this.activeDebugPoly();
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

  private activeDebugPoly(): NormPoint[] {
    if (this.activeZone === "water") return this.waterPoly;
    if (this.activeZone === "way") return this.wayDropZone;
    this.ensureStoneDropZone(this.activeStoneZoneIndex);
    return this.stoneDropZones[this.activeStoneZoneIndex];
  }

  private debugPolyForDrag(hit: { zone: DebugZoneKind; zoneIndex?: number }): NormPoint[] {
    if (hit.zone === "water") return this.waterPoly;
    if (hit.zone === "way") return this.wayDropZone;
    this.ensureStoneDropZone(hit.zoneIndex ?? 0);
    return this.stoneDropZones[hit.zoneIndex ?? 0];
  }

  private ensureStoneDropZone(index: number): void {
    while (this.stoneDropZones.length <= index) {
      const center = this.lastPointerNorm;
      const halfWidth = 0.045;
      const halfHeight = 0.035;
      this.stoneDropZones.push([
        { x: clamp(center.x - halfWidth, 0, 1), y: clamp(center.y - halfHeight, 0, 1) },
        { x: clamp(center.x + halfWidth, 0, 1), y: clamp(center.y - halfHeight, 0, 1) },
        { x: clamp(center.x + halfWidth, 0, 1), y: clamp(center.y + halfHeight, 0, 1) },
        { x: clamp(center.x - halfWidth, 0, 1), y: clamp(center.y + halfHeight, 0, 1) },
      ]);
    }
  }

  private findDebugVertex(x: number, y: number, thresholdPx: number): { zone: DebugZoneKind; zoneIndex?: number; index: number } | null {
    const active = this.findVertexInPoly(this.activeDebugPoly(), x, y, thresholdPx);
    if (active != null) {
      return this.activeZone === "stone"
        ? { zone: "stone", zoneIndex: this.activeStoneZoneIndex, index: active }
        : { zone: this.activeZone, index: active };
    }
    const water = this.findVertexInPoly(this.waterPoly, x, y, thresholdPx);
    if (water != null) return { zone: "water", index: water };
    const way = this.findVertexInPoly(this.wayDropZone, x, y, thresholdPx);
    if (way != null) return { zone: "way", index: way };
    for (let zoneIndex = 0; zoneIndex < this.stoneDropZones.length; zoneIndex++) {
      const stone = this.findVertexInPoly(this.stoneDropZones[zoneIndex], x, y, thresholdPx);
      if (stone != null) return { zone: "stone", zoneIndex, index: stone };
    }
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

  private activeActionDebugPoly(): NormPoint[] {
    if (this.activeActionZone === "forward") return this.forwardActionZone;
    if (this.activeActionZone === "back") return this.backActionZone;
    if (this.activeActionZone === "stoneSource") return this.stoneSourcePoly;
    this.ensureCandleSourcePoly(this.activeCandleSourceIndex);
    return this.candleSourcePolys[this.activeCandleSourceIndex];
  }

  private actionDebugPolyForDrag(hit: { zone: ActionZoneKind; zoneIndex?: number }): NormPoint[] {
    if (hit.zone === "forward") return this.forwardActionZone;
    if (hit.zone === "back") return this.backActionZone;
    if (hit.zone === "stoneSource") return this.stoneSourcePoly;
    this.ensureCandleSourcePoly(hit.zoneIndex ?? 0);
    return this.candleSourcePolys[hit.zoneIndex ?? 0];
  }

  private ensureCandleSourcePoly(index: number): void {
    while (this.candleSourcePolys.length <= index) {
      this.candleSourcePolys.push(createRectPolyAround(this.lastPointerNorm, 0.05, 0.06));
    }
  }

  private findActionDebugVertex(x: number, y: number, thresholdPx: number): { zone: ActionZoneKind; zoneIndex?: number; index: number } | null {
    const active = this.findVertexInPoly(this.activeActionDebugPoly(), x, y, thresholdPx);
    if (active != null) {
      return this.activeActionZone === "candle"
        ? { zone: "candle", zoneIndex: this.activeCandleSourceIndex, index: active }
        : { zone: this.activeActionZone, index: active };
    }
    const forward = this.findVertexInPoly(this.forwardActionZone, x, y, thresholdPx);
    if (forward != null) return { zone: "forward", index: forward };
    const back = this.findVertexInPoly(this.backActionZone, x, y, thresholdPx);
    if (back != null) return { zone: "back", index: back };
    const stoneSource = this.findVertexInPoly(this.stoneSourcePoly, x, y, thresholdPx);
    if (stoneSource != null) return { zone: "stoneSource", index: stoneSource };
    for (let zoneIndex = 0; zoneIndex < this.candleSourcePolys.length; zoneIndex++) {
      const candle = this.findVertexInPoly(this.candleSourcePolys[zoneIndex], x, y, thresholdPx);
      if (candle != null) return { zone: "candle", zoneIndex, index: candle };
    }
    return null;
  }

  private drawDebugZones(): void {
    if (!this.debugMode || !this.debugOverlay) return;
    const g = this.debugOverlay;
    g.clear();
    drawPolyOverlay(g, this.toPixels(this.waterPoly), DEBUG_WATER_COLOR, this.activeZone === "water");
    drawPolyOverlay(g, this.toPixels(this.wayDropZone), DEBUG_WAY_COLOR, this.activeZone === "way");
    for (let i = 0; i < this.stoneDropZones.length; i++) {
      drawPolyOverlay(
        g,
        this.toPixels(this.stoneDropZones[i]),
        DEBUG_STONE_COLOR,
        this.activeZone === "stone" && this.activeStoneZoneIndex === i,
      );
    }
  }

  private drawActionDebugZones(): void {
    if (!this.actionDebugMode || !this.actionDebugOverlay) return;
    const g = this.actionDebugOverlay;
    g.clear();
    drawPolyOverlay(g, this.toPixels(this.forwardActionZone), DEBUG_ACTION_FORWARD_COLOR, this.activeActionZone === "forward");
    drawPolyOverlay(g, this.toPixels(this.backActionZone), DEBUG_ACTION_BACK_COLOR, this.activeActionZone === "back");
    drawPolyOverlay(g, this.toPixels(this.stoneSourcePoly), DEBUG_ACTION_STONE_COLOR, this.activeActionZone === "stoneSource");
    for (let i = 0; i < this.candleSourcePolys.length; i++) {
      drawPolyOverlay(
        g,
        this.toPixels(this.candleSourcePolys[i]),
        DEBUG_ACTION_CANDLE_COLOR,
        this.activeActionZone === "candle" && this.activeCandleSourceIndex === i,
      );
    }
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
      "const STONE_DROP_ZONES: NormPoint[][] = " + JSON.stringify(this.stoneDropZones, null, 2) + ";",
      "const WAY_DROP_ZONE: NormPoint[] = " + JSON.stringify(this.wayDropZone, null, 2) + ";",
    ].join("\n\n");
    console.log(text);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => undefined);
    }
  }

  private exportActionDebugPolys(): void {
    const text = [
      "const GATE_POLY: NormPoint[] = " + JSON.stringify(this.forwardActionZone, null, 2) + ";",
      "const BACK_ACTION_POLY: NormPoint[] = " + JSON.stringify(this.backActionZone, null, 2) + ";",
      "const STONE_SOURCE_POLY: NormPoint[] = " + JSON.stringify(this.stoneSourcePoly, null, 2) + ";",
      "const CANDLE_SOURCE_POLYS: NormPoint[][] = " + JSON.stringify(this.candleSourcePolys, null, 2) + ";",
    ].join("\n\n");
    console.log(text);
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => undefined);
    }
  }

  private playGateCue(intensity: number, x: number, y: number): void {
    const localIntensity = this.effectVolumeAtPoint(intensity, x, y);
    // Fallback-Kette: je nach lokal vorhandenen Dateien kann `stone_drop`
    // fehlen. So hat die Tor-Öffnung dennoch eine akustische Quittung.
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.stone_drop, localIntensity);
      return;
    } catch { /* noop */ }
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.water_ring, localIntensity);
      return;
    } catch { /* noop */ }
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.candle_breath, localIntensity);
    } catch { /* noop */ }
  }

  private playStoneWaterCue(x: number, y: number): void {
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.stone_drop, this.effectVolumeAtPoint(0.55, x, y));
    } catch { /* noop */ }
    try {
      audioEngine.playOneShot(SPUREN_ASSETS.audio.water_ring, this.effectVolumeAtPoint(0.45, x, y));
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
      sprite.scale.x *= randomHorizontalMirror();
      sprite.alpha = 0.9;
      c.addChild(shadow, sprite);
      return c;
    }

    const g = new Graphics();
    if (kind === "walking") {
      g.scale.x = randomHorizontalMirror();
      g.ellipse(0, -30, 11, 13).fill({ color: 0xe6e2d8, alpha: 0.36 });
      g.roundRect(-10, -18, 20, 38, 8).fill({ color: 0xe0dbcf, alpha: 0.3 });
      g.roundRect(-13, 14, 8, 28, 5).fill({ color: 0xd8d2c8, alpha: 0.24 });
      g.roundRect(5, 14, 8, 28, 5).fill({ color: 0xd8d2c8, alpha: 0.24 });
    } else if (kind === "kneeling") {
      g.scale.x = randomHorizontalMirror();
      g.ellipse(-8, 13, 18, 10).fill({ color: 0xe0dbcf, alpha: 0.28 });
      g.roundRect(-18, -12, 28, 30, 8).fill({ color: 0xe0dbcf, alpha: 0.28 });
      g.ellipse(8, -20, 9, 10).fill({ color: 0xe6e2d8, alpha: 0.34 });
    } else {
      g.scale.x = randomHorizontalMirror();
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
        try { audioEngine.playOneShot(SPUREN_ASSETS.audio.hush, this.effectVolumeAtPoint(0.42, p.node.x, p.node.y)); } catch { /* still */ }
        try { p.node.destroy({ children: true }); } catch { /* ignore */ }
        return false;
      }
      return true;
    });
  }

  private leaveForeignStone(x: number, y: number): void {
    const stone = this.createStoneNode();
    (this.artifactsRoot ?? this.scene.layers.artifacts).addChild(stone);
    this.placeGroundStone(stone, x, y, 0.72, true, true, true);
  }

  private leaveForeignCandle(x: number, y: number): void {
    const candle = this.createCandleNode();
    (this.artifactsRoot ?? this.scene.layers.artifacts).addChild(candle);
    if (!this.placeGroundCandle(candle, x, y, 0.82, true, true)) return;
    candle.scale.set(candle.scale.x * 0.88, candle.scale.y * 0.88);
    this.attachCandleFlame(
      candle.x,
      candle.y,
      0.42,
      null,
      this.candleFlameOffsetForPoint(candle.x, candle.y) * 0.88,
      this.candleScaleForPoint(candle.x, candle.y) * 0.88,
    );
    try { audioEngine.playOneShot(SPUREN_ASSETS.audio.candle_breath, this.effectVolumeAtPoint(0.5, candle.x, candle.y)); } catch { /* still */ }
    this.addTrace("candle", candle.x / this.scene.width, candle.y / this.scene.height, null);
  }

  private restorePlacedArtifacts(): void {
    const artifacts = useStore.getState().placedArtifacts;
    for (const artifact of artifacts) {
      this.restorePlacedArtifact(artifact);
    }
  }

  private restorePlacedArtifact(artifact: PlacedArtifact): void {
    const x = artifact.x * this.scene.width;
    const y = artifact.y * this.scene.height;
    const node = artifact.kind === "stone" ? this.createStoneNode() : this.createCandleNode();
    (this.artifactsRoot ?? this.scene.layers.artifacts).addChild(node);
    node.x = x;
    node.y = y;
    node.alpha = artifact.alpha;
    node.scale.set(artifact.kind === "stone" ? this.stoneScaleForPoint(x, y) : this.candleScaleForPoint(x, y));
    this.rememberPlacedArtifact(node);
    if (artifact.kind === "candle") {
      const flameScale = this.candleScaleForPoint(x, y);
      this.attachCandleFlame(x, y, 0.62, null, this.candleFlameOffsetForPoint(x, y), flameScale);
    }
  }

  private persistPlacedArtifact(kind: PlacedArtifact["kind"], x: number, y: number, alpha: number): void {
    useStore.getState().addPlacedArtifact({
      id: `${kind}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      kind,
      x: x / this.scene.width,
      y: y / this.scene.height,
      alpha,
      createdAt: Date.now(),
    });
  }

  private rememberPlacedArtifact(node: Container): void {
    this.placedArtifacts = this.placedArtifacts.filter((artifact) => !(artifact as unknown as { destroyed?: boolean }).destroyed);
    if (!this.placedArtifacts.includes(node)) this.placedArtifacts.push(node);
  }

  private resolveStonePlacementPoint(preferred: NormPoint, searchRadius: number): NormPoint | null {
    if (this.isValidStonePoint(preferred)) return preferred;

    for (const zone of this.stoneDropZones) {
      for (let i = 0; i < 16; i++) {
        const point = randomNearbyPointInPoly(zone, preferred, searchRadius, this.waterPoly);
        if (this.isValidStonePoint(point)) return point;
      }
    }

    for (let i = 0; i < 48; i++) {
      const point = randomPointInAnyPoly(this.stoneDropZones);
      if (this.isValidStonePoint(point)) return point;
    }

    return null;
  }

  private resolveCandlePlacementPoint(preferred: NormPoint, searchRadius: number): NormPoint | null {
    if (this.isValidCandlePoint(preferred)) return preferred;

    for (let i = 0; i < 24; i++) {
      const point = randomNearbyPointInPoly(this.wayDropZone, preferred, searchRadius, this.waterPoly);
      if (this.isValidCandlePoint(point)) return point;
    }

    for (let i = 0; i < 48; i++) {
      const point = randomPointInPoly(this.wayDropZone);
      if (this.isValidCandlePoint(point)) return point;
    }

    return null;
  }

  private isValidStonePoint(point: NormPoint): boolean {
    return pointInAnyNormPolygon(point.x, point.y, this.stoneDropZones)
      && !pointInNormPolygon(point.x, point.y, this.waterPoly);
  }

  private isValidCandlePoint(point: NormPoint): boolean {
    return pointInNormPolygon(point.x, point.y, this.wayDropZone)
      && !pointInNormPolygon(point.x, point.y, this.waterPoly)
      && !pointInAnyNormPolygon(point.x, point.y, this.stoneDropZones)
      && this.hasCandleSpacing(point);
  }

  private hasCandleSpacing(point: NormPoint): boolean {
    if (pointInNormPolygon(point.x, point.y, this.waterPoly)) return false;
    for (const artifact of this.placedArtifacts) {
      if ((artifact as unknown as { destroyed?: boolean }).destroyed) continue;
      const ax = artifact.x / this.scene.width;
      const ay = artifact.y / this.scene.height;
      const distance = Math.hypot(ax - point.x, (ay - point.y) * 0.75);
      if (distance < MIN_CANDLE_DISTANCE_NORM) return false;
    }
    return true;
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

  private addTrace(kind: LocalTrace["kind"], x: number, y: number, ttlSeconds: number | null): void {
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

function pointInAnyNormPolygon(x: number, y: number, polys: NormPoint[][]): boolean {
  for (const poly of polys) {
    if (pointInNormPolygon(x, y, poly)) return true;
  }
  return false;
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

function randomPointInAnyPoly(polys: NormPoint[][]): NormPoint {
  if (polys.length === 0) return { x: 0.5, y: 0.5 };
  const poly = polys[Math.floor(Math.random() * polys.length)];
  return randomPointInPoly(poly);
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

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function createRectPolyAround(center: NormPoint, halfWidth: number, halfHeight: number): NormPoint[] {
  return [
    { x: clamp(center.x - halfWidth, 0, 1), y: clamp(center.y - halfHeight, 0, 1) },
    { x: clamp(center.x + halfWidth, 0, 1), y: clamp(center.y - halfHeight, 0, 1) },
    { x: clamp(center.x + halfWidth, 0, 1), y: clamp(center.y + halfHeight, 0, 1) },
    { x: clamp(center.x - halfWidth, 0, 1), y: clamp(center.y + halfHeight, 0, 1) },
  ];
}

function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function randomHorizontalMirror(): 1 | -1 {
  return Math.random() < 0.5 ? -1 : 1;
}
