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
import { useStore, type LocalTrace, type PlacedArtifact, type RoomId } from "../state/store";
import { audioEngine } from "../audio/AudioEngine";
import { FlameEmitter } from "../effects/FlameEmitter";
import { SmokeEmitter } from "../effects/SmokeEmitter";
import { FogLayer } from "../effects/FogLayer";
import { DustEmitter } from "../effects/DustEmitter";
import { LeafEmitter } from "../effects/LeafEmitter";
import { WaterRing } from "../effects/WaterRing";
import type { BaseEffect } from "../effects/BaseEffect";
import { BaseRoom } from "./BaseRoom";
import type { RoomConfig, RandomEventConfig } from "../config/types";
import { resolveAsset } from "../config/loadRoomConfig";
import { clamp, randomRange, smoothstep } from "../common/mathUtils";
import { ArrivalOverlay } from "../ui/ArrivalOverlay";
import { loadAudioDurationMs } from "../audio/audioDuration";
import { PolygonZoneEditor } from "../debug/PolygonZoneEditor";
import {
  createCandleNode,
  createPresenceNode,
  createStoneNode,
  type PresenceKind,
} from "../artifacts/ArtifactFactory";
import {
  createRectPolyAround,
  pointInAnyNormPolygon,
  pointInNormPolygon,
  randomNearbyPointInPoly,
  randomPointInAnyPoly,
  randomPointInPoly,
} from "../geometry/polygonHelpers";

const RIPE_AMBIENT_S = 45;
const RIPE_EXIT_S = 90;
const BACK_HOLD_MS = 1500;
const MIN_CANDLE_DISTANCE_NORM = 0.002;
const ARRIVAL_INTRO_MS = 20000;
const SPOKEN_INTRO_FALLBACK_MS = 120000;
const FEATHER_START_DELAY_MS = 10000;
const FIRST_PRESENCE_MIN_DELAY_MS = 20000;
const FIRST_PRESENCE_MAX_DELAY_MS = 30000;
const MAX_PRESENCE_SPAWNS = 6;
const MAX_FOREIGN_TRACE_ARTIFACTS = 5;
const ARRIVAL_TEXT = [
  "Du bist im Raum der Spuren.",
  "Andere waren hier, ohne sich zu zeigen.",
  "Eine Kerze kann tragen, was noch glimmt.",
  "Ein Stein kann halten, was schwer geworden ist.",
  "Ein Kreis im Wasser erinnert an das Kleine, das längst begonnen hat, weiterzuwirken.",
  "Nimm dir Zeit.",
  "Wenn du bereit bist, darfst du einem Zeichen einen Gedanken anvertrauen.",
];
const EXIT_OPEN_TEXT = "Wenn du weitergehen möchtest, ist der nächste Raum offen.";

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

interface HeldItem {
  kind: "stone" | "candle";
  node: Container;
}

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

export interface ConfigRoomCallbacks {
  onRequestForward?: () => void;
  onRequestBack?: () => void;
}

export class ConfigRoom extends BaseRoom {
  private effects: BaseEffect[] = [];
  private gcTimer: number | null = null;
  private presenceTimer: number | null = null;
  private arrivalTimers: number[] = [];
  private readonly arrivalOverlay = new ArrivalOverlay(
    () => this.scene.app.canvas.parentElement ?? document.body,
  );

  private artifactsRoot: Container | null = null;
  private interactionsRoot: Container | null = null;

  private fog: FogLayer | null = null;
  private stoneTextures: Texture[] = [];
  private candleTextures: Texture[] = [];
  private presenceTextures: Partial<Record<PresenceKind, Texture>> = {};
  private waterPoly: NormPoint[] = WATER_POLY.map((p) => ({ ...p }));
  private wayDropZone: NormPoint[] = WAY_DROP_ZONE.map((p) => ({ ...p }));
  /** Bodenzone, auf der Silhouetten erscheinen (Fallback: Weg-Zone). */
  private presenceFloorZone: NormPoint[] = WAY_DROP_ZONE.map((p) => ({ ...p }));
  private stoneDropZones: NormPoint[][] = STONE_DROP_ZONES.map((poly) => poly.map((p) => ({ ...p })));
  private forwardActionZone: NormPoint[] = GATE_POLY.map((p) => ({ ...p }));
  private backActionZone: NormPoint[] = BACK_ACTION_POLY.map((p) => ({ ...p }));
  private candleSourcePolys: NormPoint[][] = CANDLE_SOURCE_POLYS.map((poly) => poly.map((p) => ({ ...p })));
  private stoneSourcePoly: NormPoint[] = STONE_SOURCE_POLY.map((p) => ({ ...p }));
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
  private zoneEditor: PolygonZoneEditor | null = null;
  private actionEditor: PolygonZoneEditor | null = null;
  private activePerspectiveHandle: "vanishing" | "reference" = "vanishing";
  private draggingPerspectiveHandle: "vanishing" | "reference" | null = null;
  private lastPointerNorm: NormPoint = { x: 0.5, y: 0.5 };

  private held: HeldItem | null = null;
  private presences: PresenceActor[] = [];
  private placedArtifacts: Container[] = [];
  private presenceSpawnCount = 0;
  private foreignTraceArtifactCount = 0;
  private suppressPresenceSpawns = false;

  private exitOpen = false;
  private exitHintShown = false;
  private roomActivityEnabled = false;
  private ambientDenser = false;
  private waterUnlocked = true;

  private backHoldStartedAt: number | null = null;
  private backHoldFired = false;
  private keyHandler = (ev: KeyboardEvent) => this.onKey(ev);

  // --- Datengetriebene, dashboard-konfigurierbare Werte (Fallback = Prototyp-Defaults) ---
  private backgroundSrc = SPUREN_ASSETS.background;
  private ambientSrc = SPUREN_ASSETS.audio.ambient;
  private ambientFadeMs = 2500;
  private effectIntensity: Record<string, number> = { fog: 0.35, dust: 0.45, leaf: 0.42 };
  private effectEnabled: Record<string, boolean> = { fog: true, dust: true, leaf: true };
  // Config-getriebene Asset-Pfade (Fallback = Spuren-Prototyp-Assets)
  private stoneTexturePaths: string[] = [
    SPUREN_ASSETS.artifacts.stone_loose_a,
    SPUREN_ASSETS.artifacts.stone_loose_b,
    SPUREN_ASSETS.artifacts.stone_loose_c,
  ];
  private candleTexturePaths: string[] = [
    SPUREN_ASSETS.artifacts.candle_1,
    SPUREN_ASSETS.artifacts.candle_2,
    SPUREN_ASSETS.artifacts.candle_3,
    SPUREN_ASSETS.artifacts.candle_4,
  ];
  private silhouettePaths: Record<PresenceKind, string> = {
    walking: SPUREN_ASSETS.silhouettes.passing,
    kneeling: SPUREN_ASSETS.silhouettes.kneeling,
    seated: SPUREN_ASSETS.silhouettes.seated,
  };
  private waterRingSound = SPUREN_ASSETS.audio.water_ring;
  private stoneDropSound = SPUREN_ASSETS.audio.stone_drop;
  private candleBreathSound = SPUREN_ASSETS.audio.candle_breath;
  private hushSound = SPUREN_ASSETS.audio.hush;
  private arrivalIntroSound = SPUREN_ASSETS.audio.arrival_intro;
  private spokenIntroSound = SPUREN_ASSETS.audio.spoken_intro;
  private transitionCueSound = SPUREN_ASSETS.audio.chakra;
  private exitOpenCueSound = SPUREN_ASSETS.audio.chakra;
  private waterEnabled = true;
  private stoneEnabled = true;
  private candleEnabled = true;
  private introLines: string[] = ARRIVAL_TEXT;
  private introDurationMs = ARRIVAL_INTRO_MS;
  private exitDwellSeconds = RIPE_EXIT_S;
  private exitHintText = EXIT_OPEN_TEXT;
  private presenceEnabled = true;
  private maxPresenceSpawns = MAX_PRESENCE_SPAWNS;
  private maxForeignTraceArtifacts = MAX_FOREIGN_TRACE_ARTIFACTS;
  private firstPresenceMinMs = FIRST_PRESENCE_MIN_DELAY_MS;
  private firstPresenceMaxMs = FIRST_PRESENCE_MAX_DELAY_MS;
  private configRoomId: RoomId = "spuren";
  private randomEvents: RandomEventConfig[] = [];
  private randomEventTimers: number[] = [];

  constructor(scene: Scene, private cb: ConfigRoomCallbacks = {}, config?: RoomConfig) {
    super(scene);
    if (config) this.applyConfig(config);
  }

  /** Übernimmt die dashboard-editierbaren Werte aus der Raumkonfiguration. */
  private applyConfig(config: RoomConfig): void {
    this.configRoomId = (config.id as RoomId) || this.configRoomId;
    this.randomEvents = Array.isArray(config.randomEvents) ? config.randomEvents : [];
    const z = config.zones ?? {};
    const poly0 = (name: string): NormPoint[] | undefined =>
      z[name]?.polygons?.[0]?.map((p) => ({ x: p.x, y: p.y }));
    const polys = (name: string): NormPoint[][] | undefined =>
      z[name]?.polygons?.map((poly) => poly.map((p) => ({ x: p.x, y: p.y })));
    this.waterPoly = poly0("water") ?? this.waterPoly;
    this.wayDropZone = poly0("way") ?? this.wayDropZone;
    // Eigene Bodenzone für Silhouetten, sonst die Weg-Zone (nur gültige Polygone).
    const floor = poly0("presenceFloor");
    this.presenceFloorZone = floor && floor.length >= 3 ? floor : this.wayDropZone;
    this.stoneDropZones = polys("stoneDrops") ?? this.stoneDropZones;
    this.forwardActionZone = poly0("forwardGate") ?? this.forwardActionZone;
    this.backActionZone = poly0("backAction") ?? this.backActionZone;
    this.candleSourcePolys = polys("candleSources") ?? this.candleSourcePolys;
    this.stoneSourcePoly = poly0("stoneSource") ?? this.stoneSourcePoly;

    if (config.perspective) {
      const p = config.perspective;
      GROUND_PERSPECTIVE.vanishingPoint.x = p.vanishingPoint.x;
      GROUND_PERSPECTIVE.vanishingPoint.y = p.vanishingPoint.y;
      GROUND_PERSPECTIVE.referencePoint.x = p.referencePoint.x;
      GROUND_PERSPECTIVE.referencePoint.y = p.referencePoint.y;
      GROUND_PERSPECTIVE.minScale = p.minScale;
      GROUND_PERSPECTIVE.nearScale = p.nearScale;
    }

    if (config.background) this.backgroundSrc = resolveAsset(config.id, config.background);
    const ambient = config.ambient?.[0];
    if (ambient) {
      this.ambientSrc = resolveAsset(config.id, ambient.src);
      this.ambientFadeMs = ambient.fadeMs;
    }
    this.applyInteractionAssets(config);
    this.applyPresenceAssets(config);
    this.applyCueAssets(config);
    for (const fx of config.effects ?? []) {
      this.effectEnabled[fx.effect] = fx.enabled;
      this.effectIntensity[fx.effect] = fx.intensity;
    }
    if (config.intro) {
      if (config.intro.lines?.length) this.introLines = config.intro.lines;
      if (config.intro.durationMs) this.introDurationMs = config.intro.durationMs;
    }
    if (config.dwellGate) {
      if (typeof config.dwellGate.minDwellSeconds === "number") this.exitDwellSeconds = config.dwellGate.minDwellSeconds;
      if (config.dwellGate.exitHint) this.exitHintText = config.dwellGate.exitHint;
    }
    if (config.presence) {
      this.presenceEnabled = config.presence.enabled !== false;
      if (typeof config.presence.maxSpawns === "number") this.maxPresenceSpawns = config.presence.maxSpawns;
      if (typeof config.presence.maxForeignTraceArtifacts === "number") this.maxForeignTraceArtifacts = config.presence.maxForeignTraceArtifacts;
      if (typeof config.presence.firstDelayMsMin === "number") this.firstPresenceMinMs = config.presence.firstDelayMsMin;
      if (typeof config.presence.firstDelayMsMax === "number") this.firstPresenceMaxMs = config.presence.firstDelayMsMax;
    }
  }

  /**
   * Übernimmt Sound-, Artefakt- und Freischalt-Werte der konfigurierten
   * Interaktionen (Wasser/Stein/Kerze). Fehlt eine Interaktion in der Config,
   * bleiben die Prototyp-Defaults erhalten.
   */
  private applyInteractionAssets(config: RoomConfig): void {
    const byType = (type: string) =>
      (config.interactions ?? []).find((i) => i.interaction === type);

    const water = byType("water_rings");
    if (water) {
      this.waterEnabled = water.enabled !== false;
      if (water.sounds?.ring) this.waterRingSound = resolveAsset(config.id, water.sounds.ring);
    }

    const stone = byType("place_stone");
    if (stone) {
      this.stoneEnabled = stone.enabled !== false;
      if (stone.sounds?.drop) this.stoneDropSound = resolveAsset(config.id, stone.sounds.drop);
      const paths = (stone.artifacts ?? []).map((a) => resolveAsset(config.id, a));
      if (paths.length) this.stoneTexturePaths = paths;
    }

    const candle = byType("light_candle");
    if (candle) {
      this.candleEnabled = candle.enabled !== false;
      if (candle.sounds?.breath) this.candleBreathSound = resolveAsset(config.id, candle.sounds.breath);
      // "unlit" ist der getragene Quell-Zustand und wird aus der zufälligen
      // Platzierungsauswahl ausgenommen, damit nur entzündete Kerzen erscheinen.
      const paths = (candle.artifacts ?? [])
        .filter((a) => !/unlit/i.test(a))
        .map((a) => resolveAsset(config.id, a));
      if (paths.length) this.candleTexturePaths = paths;
    }
  }

  /** Übernimmt Silhouetten-Pfade und den hush-Klang aus der Presence-Config. */
  private applyPresenceAssets(config: RoomConfig): void {
    const presence = config.presence;
    if (!presence) return;
    if (presence.hushSound) this.hushSound = resolveAsset(config.id, presence.hushSound);
    for (const kind of presence.kinds ?? []) {
      if (!kind?.silhouette) continue;
      if (kind.kind === "walking" || kind.kind === "kneeling" || kind.kind === "seated") {
        this.silhouettePaths[kind.kind] = resolveAsset(config.id, kind.silhouette);
      }
    }
  }

  /** Übernimmt Intro-/Sprecher-Audio und die optionalen Übergangs-Cues. */
  private applyCueAssets(config: RoomConfig): void {
    if (config.intro?.audio) this.arrivalIntroSound = resolveAsset(config.id, config.intro.audio);
    if (config.speaker?.audio) this.spokenIntroSound = resolveAsset(config.id, config.speaker.audio);
    if (config.cues?.transition) this.transitionCueSound = resolveAsset(config.id, config.cues.transition);
    if (config.cues?.exitOpen) this.exitOpenCueSound = resolveAsset(config.id, config.cues.exitOpen);
  }

  async mount(): Promise<void> {
    if (this.destroyed || !this.scene.isReady) return;
    this.suppressPresenceSpawns = useStore.getState().visited.has(this.configRoomId)
      && useStore.getState().roomIntrosSeen.has(this.configRoomId);
    useStore.getState().enterRoom(this.configRoomId);

    try { audioEngine.crossfadeAmbient(this.ambientSrc, this.ambientFadeMs); } catch { /* still */ }

    const reduced = useStore.getState().reducedMotion;

    const bgRoot = this.adopt(this.scene.layers.background);
    this.artifactsRoot = this.adopt(this.scene.layers.artifacts);
    this.interactionsRoot = this.adopt(this.scene.layers.interactions);

    const bgTex = await Assets.load<Texture>(this.backgroundSrc);
    this.stoneTextures = await Promise.all(
      this.stoneTexturePaths.map((p) => Assets.load<Texture>(p)),
    );
    this.candleTextures = await Promise.all(
      this.candleTexturePaths.map((p) => Assets.load<Texture>(p)),
    );
    const [passingTexture, kneelingTexture, seatedTexture] = await Promise.all([
      Assets.load<Texture>(this.silhouettePaths.walking),
      Assets.load<Texture>(this.silhouettePaths.kneeling),
      Assets.load<Texture>(this.silhouettePaths.seated),
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
      this.zoneEditor?.redraw();
      this.actionEditor?.redraw();
      this.drawPerspectiveDebug();
    };
    fitBackground();

    if (this.debugMode) {
      this.zoneEditor = new PolygonZoneEditor(
        [
          { key: "w", color: DEBUG_WATER_COLOR, polys: () => [this.waterPoly] },
          { key: "d", color: DEBUG_WAY_COLOR, polys: () => [this.wayDropZone] },
          {
            key: "s",
            color: DEBUG_STONE_COLOR,
            array: true,
            polys: () => this.stoneDropZones,
            ensure: (i) => this.ensureStoneDropZone(i),
          },
        ],
        this.scene,
        () => this.lastPointerNorm,
        () => this.exportDebugPolys(),
      );
      this.zoneEditor.attach(this.scene.layers.overlay);
      console.info("[debugZones] Controls: W=water, D=way, S/1-3=stone drop zone, A=add vertex at cursor, N=insert on nearest edge, M=subdivide polygon, Del=remove nearest vertex, P=print+copy");
    }
    if (this.actionDebugMode) {
      this.actionEditor = new PolygonZoneEditor(
        [
          { key: "f", color: DEBUG_ACTION_FORWARD_COLOR, polys: () => [this.forwardActionZone] },
          { key: "b", color: DEBUG_ACTION_BACK_COLOR, polys: () => [this.backActionZone] },
          { key: "t", color: DEBUG_ACTION_STONE_COLOR, polys: () => [this.stoneSourcePoly] },
          {
            key: "c",
            color: DEBUG_ACTION_CANDLE_COLOR,
            array: true,
            polys: () => this.candleSourcePolys,
            ensure: (i) => this.ensureCandleSourcePoly(i),
          },
        ],
        this.scene,
        () => this.lastPointerNorm,
        () => this.exportActionDebugPolys(),
      );
      this.actionEditor.attach(this.scene.layers.overlay);
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
      if (this.effectEnabled.fog !== false) {
        this.fog = new FogLayer({ intensity: this.effectIntensity.fog ?? 0.35 });
        this.fog.mount(this.scene.layers.particles_bg);
        this.fog.start();
        this.effects.push(this.fog);
      }

      if (this.effectEnabled.dust !== false) {
        const dust = new DustEmitter({ intensity: this.effectIntensity.dust ?? 0.45 });
        dust.mount(this.scene.layers.particles_fg);
        dust.start();
        this.effects.push(dust);
      }

      if (this.effectEnabled.leaf !== false) {
        this.arrivalTimers.push(window.setTimeout(() => {
          if (this.destroyed) return;
          const leaves = new LeafEmitter({ intensity: this.effectIntensity.leaf ?? 0.42 });
          leaves.mount(this.scene.layers.parallax_mid);
          leaves.start();
          this.effects.push(leaves);
        }, FEATHER_START_DELAY_MS));
      }
    }

    this.restorePlacedArtifacts();

    this.onResize(fitBackground);

    this.startTick((dt) => {
      for (const e of this.effects) e.tick(dt);
      if (this.roomActivityEnabled) {
        const s = useStore.getState();
        s.tickDwell(dt / 1000);
        this.updateRipeness(useStore.getState().dwellSeconds);
        this.tickPresences(dt);
        this.checkBackHold();
      }
    });

    this.gcTimer = window.setInterval(() => this.gcEffects(), 2000);

    if (this.shouldRunArrivalSequence()) {
      this.startArrivalSequence();
    } else {
      this.enableRoomActivity();
    }
  }

  protected onDestroy(): void {
    if (this.gcTimer != null) {
      window.clearInterval(this.gcTimer);
      this.gcTimer = null;
    }
    if (this.presenceTimer != null) {
      window.clearTimeout(this.presenceTimer);
      this.presenceTimer = null;
    }
    for (const timer of this.randomEventTimers) window.clearTimeout(timer);
    this.randomEventTimers = [];
    for (const timer of this.arrivalTimers) window.clearTimeout(timer);
    this.arrivalTimers = [];
    this.arrivalOverlay.hide(true);
    window.removeEventListener("keydown", this.keyHandler);

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

    try { this.zoneEditor?.destroy(); } catch { /* ignore */ }
    this.zoneEditor = null;
    try { this.actionEditor?.destroy(); } catch { /* ignore */ }
    this.actionEditor = null;
    try { this.perspectiveDebugOverlay?.destroy(); } catch { /* ignore */ }
    this.perspectiveDebugOverlay = null;

    this.artifactsRoot = null;
    this.interactionsRoot = null;
  }

  private onStageDown = (ev: FederatedPointerEvent) => {
    const x = ev.global.x;
    const y = ev.global.y;
    this.lastPointerNorm = { x: x / this.scene.width, y: y / this.scene.height };

    if (this.zoneEditor?.handlePointerDown(x, y)) return;
    if (this.actionEditor?.handlePointerDown(x, y)) return;
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

    if (this.candleEnabled && this.isInAnyPoly(x, y, this.candleSourcePolys)) {
      this.pickUpCandle(x, y);
      return;
    }
    if (this.stoneEnabled && this.isInPoly(x, y, this.stoneSourcePoly)) {
      this.pickUpStone(x, y);
      return;
    }
    if (this.waterEnabled && this.waterUnlocked && this.isInPoly(x, y, this.waterPoly)) {
      this.spawnWaterRipple(x, y, 0.62);
      try { audioEngine.playOneShot(this.waterRingSound, this.effectVolumeAtPoint(0.5, x, y)); } catch { /* still */ }
    }
  };

  private onStageMove = (ev: FederatedPointerEvent) => {
    const x = ev.global.x;
    const y = ev.global.y;
    this.lastPointerNorm = { x: x / this.scene.width, y: y / this.scene.height };

    if (this.zoneEditor?.handlePointerMove(x, y)) return;
    if (this.actionEditor?.handlePointerMove(x, y)) return;
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
    if (this.zoneEditor?.handlePointerUp()) return;
    if (this.actionEditor?.handlePointerUp()) return;
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
          try { audioEngine.playOneShot(this.candleBreathSound, this.effectVolumeAtPoint(0.5, this.held.node.x, this.held.node.y)); } catch { /* still */ }
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
    return createStoneNode(this.stoneTextures);
  }

  private createCandleNode(): Container {
    return createCandleNode(this.candleTextures);
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
      try { audioEngine.playOneShot(this.stoneDropSound, this.effectVolumeAtPoint(0.5, node.x, node.y)); } catch { /* still */ }
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

    if (!this.exitOpen && dwell >= this.exitDwellSeconds) {
      this.exitOpen = true;
      this.showExitOpenHint();
    }
  }

  private shouldRunArrivalSequence(): boolean {
    if (this.debugMode || this.actionDebugMode || this.perspectiveDebugMode) return false;
    return !useStore.getState().roomIntrosSeen.has(this.configRoomId);
  }

  private startArrivalSequence(): void {
    useStore.getState().markRoomIntroSeen(this.configRoomId);
    try { audioEngine.playOneShot(this.arrivalIntroSound, 0.68); } catch { /* still */ }
    const spokenIntroDuration = loadAudioDurationMs(this.spokenIntroSound, SPOKEN_INTRO_FALLBACK_MS);

    this.arrivalTimers.push(window.setTimeout(() => {
      if (this.destroyed) return;
      this.arrivalOverlay.show(this.introLines);
      try { audioEngine.playOneShot(this.spokenIntroSound, 0.82); } catch { /* still */ }

      void spokenIntroDuration.then((durationMs) => {
        if (this.destroyed) return;
        this.arrivalTimers.push(window.setTimeout(() => {
          if (this.destroyed) return;
          try { audioEngine.playOneShot(this.transitionCueSound, 0.48); } catch { /* still */ }
          this.arrivalOverlay.hide();
          this.enableRoomActivity();
        }, durationMs));
      });
    }, this.introDurationMs));
  }

  private enableRoomActivity(): void {
    if (this.destroyed) return;
    if (this.roomActivityEnabled) return;
    this.roomActivityEnabled = true;
    if (this.suppressPresenceSpawns || !this.presenceEnabled) {
      this.enableStageInteractions();
      return;
    }
    const firstPresenceDelay = randomRange(this.firstPresenceMinMs, this.firstPresenceMaxMs);
    this.arrivalTimers.push(window.setTimeout(() => {
      if (!this.destroyed) this.spawnRandomPresence();
    }, firstPresenceDelay));
    this.arrivalTimers.push(window.setTimeout(() => {
      if (!this.destroyed) this.spawnRandomPresence();
      this.scheduleNextPresence();
    }, firstPresenceDelay + randomRange(7000, 12000)));

    this.startRandomEvents();
    this.enableStageInteractions();
  }

  /**
   * Plant alle aktivierten Zufallsereignisse des Raums. Jedes Ereignis wird
   * unabhängig mit einem zufälligen Intervall (min..max) wiederholt eingeplant.
   */
  private startRandomEvents(): void {
    if (this.suppressPresenceSpawns) return; // bei Wiederbesuch ruhiger Raum
    for (const event of this.randomEvents) {
      if (event?.enabled === false) continue;
      this.scheduleRandomEvent(event);
    }
  }

  private scheduleRandomEvent(event: RandomEventConfig): void {
    const min = Math.max(0, event.intervalMsMin ?? 0);
    const max = Math.max(min, event.intervalMsMax ?? min);
    const delay = randomRange(min, max);
    const timer = window.setTimeout(() => {
      if (this.destroyed) return;
      this.fireRandomEvent(event);
      this.scheduleRandomEvent(event);
    }, delay);
    this.randomEventTimers.push(timer);
  }

  private fireRandomEvent(event: RandomEventConfig): void {
    if (!event.ref) return;
    if (event.kind === "sound") {
      try {
        audioEngine.playOneShot(resolveAsset(this.configRoomId, event.ref), 0.55);
      } catch { /* still */ }
    }
    // kind === "interaction": generische Auslösung ist noch nicht verdrahtet.
  }

  private enableStageInteractions(): void {
    const stage = this.scene.app.stage;
    stage.eventMode = "static";
    stage.off("pointerdown", this.onStageDown);
    stage.off("pointermove", this.onStageMove);
    stage.off("pointerup", this.onStageUp);
    stage.off("pointerupoutside", this.onStageUp);
    stage.on("pointerdown", this.onStageDown);
    stage.on("pointermove", this.onStageMove);
    stage.on("pointerup", this.onStageUp);
    stage.on("pointerupoutside", this.onStageUp);
  }

  private showExitOpenHint(): void {
    if (this.exitHintShown || this.destroyed) return;
    this.exitHintShown = true;
    try { audioEngine.playOneShot(this.exitOpenCueSound, 0.42); } catch { /* still */ }
    this.arrivalOverlay.show([this.exitHintText]);
    this.arrivalTimers.push(window.setTimeout(() => this.arrivalOverlay.hide(), 5200));
  }

  private onKey(ev: KeyboardEvent): void {
    if (!this.debugMode && !this.actionDebugMode && !this.perspectiveDebugMode) return;
    if (this.perspectiveDebugMode && this.handlePerspectiveKey(ev)) return;
    if (this.actionEditor?.handleKey(ev)) return;
    if (this.zoneEditor?.handleKey(ev)) return;
  }

  private handlePerspectiveKey(ev: KeyboardEvent): boolean {
    const k = ev.key.toLowerCase();
    if (k === "v") {
      this.activePerspectiveHandle = "vanishing";
      this.drawPerspectiveDebug();
      return true;
    }
    if (k === "r") {
      this.activePerspectiveHandle = "reference";
      this.drawPerspectiveDebug();
      return true;
    }
    if (k === "o") {
      this.exportPerspectiveDebug();
      return true;
    }
    const step = ev.shiftKey ? 0.01 : 0.002;
    if (ev.key === "ArrowLeft") {
      this.nudgePerspectiveHandle(-step, 0);
      ev.preventDefault();
      return true;
    }
    if (ev.key === "ArrowRight") {
      this.nudgePerspectiveHandle(step, 0);
      ev.preventDefault();
      return true;
    }
    if (ev.key === "ArrowUp") {
      this.nudgePerspectiveHandle(0, -step);
      ev.preventDefault();
      return true;
    }
    if (ev.key === "ArrowDown") {
      this.nudgePerspectiveHandle(0, step);
      ev.preventDefault();
      return true;
    }
    return false;
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

  private ensureCandleSourcePoly(index: number): void {
    while (this.candleSourcePolys.length <= index) {
      this.candleSourcePolys.push(createRectPolyAround(this.lastPointerNorm, 0.05, 0.06));
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
    if (this.destroyed || this.suppressPresenceSpawns || this.presenceSpawnCount >= this.maxPresenceSpawns) return;
    const dwell = useStore.getState().dwellSeconds;
    const delayMs = randomRange(22000, 36000)
      + this.presenceSpawnCount * 14000
      + dwell * 450;
    this.presenceTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      this.spawnRandomPresence();
      this.scheduleNextPresence();
    }, delayMs);
  }

  private spawnRandomPresence(): void {
    if (this.suppressPresenceSpawns || this.presenceSpawnCount >= this.maxPresenceSpawns) return;
    this.presenceSpawnCount += 1;
    const r = Math.random();
    if (r < 0.38) this.spawnForeignPresence("walking");
    else if (r < 0.68) this.spawnForeignPresence("kneeling");
    else this.spawnForeignPresence("seated");
  }

  private spawnForeignPresence(kind: PresenceKind): void {
    const W = this.scene.width;
    const H = this.scene.height;
    const zone = this.presenceFloorZone;
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
    if (!this.shouldLeaveForeignTraceArtifact()) return;
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
    return createPresenceNode(kind, this.presenceTextures[kind]);
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
        try { audioEngine.playOneShot(this.hushSound, this.effectVolumeAtPoint(0.42, p.node.x, p.node.y)); } catch { /* still */ }
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
    this.foreignTraceArtifactCount += 1;
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
    this.foreignTraceArtifactCount += 1;
  }

  private shouldLeaveForeignTraceArtifact(): boolean {
    if (this.foreignTraceArtifactCount >= this.maxForeignTraceArtifacts) return false;
    const dwell = useStore.getState().dwellSeconds;
    const chance = clamp(0.72 - this.foreignTraceArtifactCount * 0.12 - dwell / 900, 0.16, 0.72);
    return Math.random() < chance;
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

}
