import type { BaseEffect } from "./BaseEffect";
import type { EffectOptions } from "./types";
import { FogLayer } from "./FogLayer";
import { DustEmitter } from "./DustEmitter";
import { LeafEmitter } from "./LeafEmitter";
import { FlameEmitter } from "./FlameEmitter";
import { SmokeEmitter } from "./SmokeEmitter";
import { WaterRing } from "./WaterRing";

/**
 * Zentrale Registratur der prozeduralen Effekt-Bausteine.
 *
 * Bisher wurden Effekte direkt in den Räumen `new`-instanziiert. Damit das
 * Dashboard Effekte datengetrieben auswählen und der ConfigRoom sie anhand der
 * Konfiguration aufbauen kann, mappt diese Registry stabile IDs auf Factories.
 *
 * Neue Effekte (per KI-Scaffold) werden hier nach Implementierung ergänzt.
 */

export type EffectFactory = (opts: EffectOptions) => BaseEffect;

const REGISTRY: Record<string, EffectFactory> = {
  fog: (opts) => new FogLayer(opts),
  dust: (opts) => new DustEmitter(opts),
  leaf: (opts) => new LeafEmitter(opts),
  flame: (opts) => new FlameEmitter(opts),
  smoke: (opts) => new SmokeEmitter(opts),
  water_ring: (opts) => new WaterRing(opts),
};

/** Liefert die Factory für eine Effekt-ID oder undefined, wenn unbekannt. */
export function getEffectFactory(id: string): EffectFactory | undefined {
  return REGISTRY[id];
}

/** Erzeugt eine Effekt-Instanz aus ID + Optionen; undefined bei unbekannter ID. */
export function createEffect(id: string, opts: EffectOptions): BaseEffect | undefined {
  const factory = REGISTRY[id];
  return factory ? factory(opts) : undefined;
}

/** Alle registrierten (implementierten) Effekt-IDs. */
export function registeredEffectIds(): string[] {
  return Object.keys(REGISTRY);
}
