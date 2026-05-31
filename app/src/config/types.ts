/**
 * Datengetriebenes Konfigurationsmodell der Resonanz-Räume.
 *
 * Dieses Modell ist die einzige Quelle der Wahrheit für alles, was sich über das
 * Konfigurations-Dashboard einstellen lässt. Zur Laufzeit lädt der Raum-Renderer
 * (SpurenRoom / ConfigRoom) seine Werte aus `rooms/<id>/room.config.json`, das
 * exakt diese Struktur besitzt. Das Dashboard schreibt dieselbe Struktur zurück.
 *
 * Provenienz/Lizenz der Asset-Dateien bleibt getrennt in `rooms/<id>/meta.json`.
 */

/** Normalisierter Punkt (0..1) relativ zu Bildschirmbreite/-höhe. */
export interface NormPointConfig {
  x: number;
  y: number;
}

/** Ein Polygon ist eine Liste normalisierter Punkte. */
export type PolygonConfig = NormPointConfig[];

/**
 * Eine benannte Zone besteht aus einem oder mehreren Polygonen.
 * Einfache Zonen (Wasser, Tor) haben genau ein Polygon; Quell-/Ablagezonen
 * (Kerzenquellen, Steinablagen) können mehrere disjunkte Polygone besitzen.
 */
export interface ZoneConfig {
  polygons: PolygonConfig[];
}

/** Lineare Bodenperspektive zur Größenskalierung entlang des Fluchtstrahls. */
export interface GroundPerspectiveConfigData {
  vanishingPoint: NormPointConfig;
  referencePoint: NormPointConfig;
  minScale: number;
  nearScale: number;
}

/**
 * Eine Audio-Ebene (Ambient-Loop). Mehrere Ebenen können gleichzeitig laufen,
 * z. B. low drone + people noise + church noise.
 */
export interface AudioLayerConfig {
  /** Stabile ID innerhalb des Raums. */
  id: string;
  /** Asset-Schlüssel (relativ zu rooms/<id>/audio/) oder absolute URL. */
  src: string;
  /** Ziellautstärke 0..1. */
  volume: number;
  /** Endlos-Schleife (Ambient = true). */
  loop: boolean;
  /** Crossfade-Dauer beim Start in ms. */
  fadeMs: number;
}

/** Eine konfigurierte Instanz eines Effekt-Loops aus der Effects-Library. */
export interface EffectInstanceConfig {
  /** Stabile Instanz-ID. */
  id: string;
  /** Verweis auf EffectDef.id in der Effects-Library. */
  effect: string;
  /** Anfangsintensität 0..1. */
  intensity: number;
  /** Optionaler normalisierter Ankerpunkt. */
  position?: NormPointConfig;
  /** Zusätzliche, effekt-spezifische Parameter. */
  params?: Record<string, number | string | boolean>;
  enabled: boolean;
}

/** Eine im Raum nutzbare Interaktion aus der Interactions-Library. */
export interface InteractionInstanceConfig {
  /** Stabile Instanz-ID. */
  id: string;
  /** Verweis auf InteractionDef.id in der Interactions-Library. */
  interaction: string;
  /** Name der Zone (Schlüssel in RoomConfig.zones), in der die Interaktion gilt. */
  zone?: string;
  /** Asset-Schlüssel für Quell-/Ziel-Artefakte (effekt-spezifisch). */
  artifacts?: string[];
  /** Sound-Schlüssel/-URLs für diese Interaktion. */
  sounds?: Record<string, string>;
  params?: Record<string, number | string | boolean>;
  enabled: boolean;
}

/** Konfiguration der fremden Präsenzen (Silhouetten). */
export interface PresenceConfig {
  enabled: boolean;
  /** Maximale Anzahl an Spawns pro Sitzung. */
  maxSpawns: number;
  /** Erste Verzögerung (ms) min/max. */
  firstDelayMsMin: number;
  firstDelayMsMax: number;
  /** Verfügbare Silhouetten-Arten und ihre Spawn-Gewichte (0..1, Summe ~1). */
  kinds: PresenceKindConfig[];
  /** Maximale Anzahl fremder hinterlassener Artefakte (Steine/Kerzen). */
  maxForeignTraceArtifacts: number;
  /** Schlüssel/URL des Ausblend-Sounds (hush). */
  hushSound?: string;
}

export interface PresenceKindConfig {
  /** z. B. walking | kneeling | seated. */
  kind: string;
  /** Asset-Schlüssel der Silhouette. */
  silhouette: string;
  weight: number;
  /** Basis-Höhe in Pixeln (vor Perspektivskalierung). */
  baseHeight: number;
}

/** Ein zufälliges Raumereignis (Klang oder Interaktion aus der Bibliothek). */
export interface RandomEventConfig {
  id: string;
  enabled: boolean;
  /** "sound" spielt einen One-Shot, "interaction" löst eine Bibliotheks-Interaktion aus. */
  kind: "sound" | "interaction";
  /** Sound-Schlüssel/URL bzw. Interaction-ID je nach kind. */
  ref: string;
  /** Mittlere Zeit zwischen Ereignissen in ms (mit Jitter). */
  intervalMsMin: number;
  intervalMsMax: number;
}

/** Sprecher-Einführung: gesprochenes mp3 + begleitender Text (Markdown). */
export interface SpeakerConfig {
  enabled: boolean;
  /** Audio-Schlüssel/URL der gesprochenen Einführung. */
  audio?: string;
  /** Markdown-Text oder Asset-Pfad (.md) der Einführung. */
  text?: string;
  /** Fallback-Anzeigedauer (ms), falls Audio-Metadaten fehlen. */
  fallbackMs: number;
}

/** Wahrnehmungs-Intro (kurzer Ankunfts-Sound + Atmosphäre). */
export interface IntroConfig {
  enabled: boolean;
  /** Audio-Schlüssel/URL des Ankunfts-Sounds. */
  audio?: string;
  /** Dauer der Ankunftssequenz in ms. */
  durationMs: number;
  /** Mehrzeiliger Einblend-Text der Ankunft. */
  lines: string[];
}

/** Schaltet das Weiterschreiten frei. */
export interface DwellGateConfig {
  /** Mindest-Verweildauer in Sekunden nach dem Sprecher, bevor das Portal öffnet. */
  minDwellSeconds: number;
  /** Hinweistext, wenn das Portal offen ist. */
  exitHint: string;
}

/** Vollständige, dashboard-editierbare Konfiguration eines Raums. */
export interface RoomConfig {
  /** Schema-Version für Migrationen. */
  version: number;
  /** Raum-ID (muss mit Verzeichnisname übereinstimmen). */
  id: string;
  /** Anzeigename. */
  title: string;
  /** Hintergrund-Asset-Schlüssel oder URL. */
  background: string;
  /** Gleichzeitig laufende Ambient-Ebenen. */
  ambient: AudioLayerConfig[];
  /** Visuelle Effekt-Loops. */
  effects: EffectInstanceConfig[];
  /** Im Raum nutzbare Interaktionen. */
  interactions: InteractionInstanceConfig[];
  /** Benannte Interaktionszonen (Polygone, normalisiert). */
  zones: Record<string, ZoneConfig>;
  /** Bodenperspektive für korrekte Größenskalierung. */
  perspective: GroundPerspectiveConfigData;
  /** Fremde Präsenzen / Silhouetten. */
  presence: PresenceConfig;
  /** Zufällige Raumereignisse. */
  randomEvents: RandomEventConfig[];
  /** Wahrnehmungs-Intro bei Ankunft. */
  intro: IntroConfig;
  /** Sprecher-Einführung. */
  speaker: SpeakerConfig;
  /** Freischalt-Bedingung für das nächste Portal. */
  dwellGate: DwellGateConfig;
}
