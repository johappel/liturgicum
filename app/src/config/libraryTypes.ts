/**
 * Typen für die gemeinsam genutzten Bibliotheken und General-Settings.
 * Diese leben in `rooms/_library/*.json` und werden vom Dashboard gepflegt.
 */

/** Beschreibender Eintrag eines Effekts in der Effects-Library. */
export interface EffectDefMeta {
  /** Stabile ID, referenziert von EffectInstanceConfig.effect. */
  id: string;
  /** Anzeigename. */
  label: string;
  /** Menschliche Beschreibung (für Dashboard + KI-Scaffold). */
  description: string;
  /** Name der TS-Implementierungsklasse in app/src/effects/. */
  implementation: string;
  /** Editierbare Parameter (Name → Beschreibung/Default/Bereich). */
  params: EffectParamSpec[];
  /** Quelle: "builtin" (vorhanden) | "scaffold" (per KI angelegt). */
  source: "builtin" | "scaffold";
}

export interface EffectParamSpec {
  name: string;
  type: "number" | "boolean" | "string";
  label: string;
  default: number | boolean | string;
  min?: number;
  max?: number;
  step?: number;
}

/** Beschreibender Eintrag einer Interaktion in der Interactions-Library. */
export interface InteractionDefMeta {
  id: string;
  label: string;
  description: string;
  /** Name der TS-Implementierung/des Handlers. */
  implementation: string;
  /** Gestenart: tap | press_release | drag_release. */
  zoneKind: "tap" | "press_release" | "drag_release";
  /** Benötigte Asset-Schlüssel (z. B. Artefakt-Sprites). */
  requiredArtifacts: string[];
  /** Benötigte Sound-Schlüssel. */
  requiredSounds: string[];
  source: "builtin" | "scaffold";
}

/** Eintrag der Silhouetten-Bibliothek. */
export interface SilhouetteDefMeta {
  id: string;
  label: string;
  /** Asset-Schlüssel/URL des PNG. */
  src: string;
  /** Standard-Basishöhe in Pixeln. */
  baseHeight: number;
  /** Standard-Effekteinstellungen. */
  fadeInMs: number;
  holdMs: number;
  fadeOutMs: number;
}

/** General-Settings: globale Defaults & Bibliotheken. */
export interface GeneralConfig {
  version: number;
  /** Übergangs-Defaults (Dauer, Entfernung, Min/Max). */
  transitions: {
    defaultDurationMs: number;
    minDurationMs: number;
    maxDurationMs: number;
    portalDurationMs: number;
  };
  /** Standard-Effekteinstellungen für Silhouetten. */
  silhouetteDefaults: {
    fadeInMs: number;
    holdMs: number;
    fadeOutMs: number;
    hushSound: string;
  };
}

export interface EffectsLibrary {
  version: number;
  effects: EffectDefMeta[];
}

export interface InteractionsLibrary {
  version: number;
  interactions: InteractionDefMeta[];
}

export interface SilhouettesLibrary {
  version: number;
  silhouettes: SilhouetteDefMeta[];
}
