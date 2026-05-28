import type { Container } from "pixi.js";

/**
 * Gemeinsames Interface aller prozeduralen Effekt-Bausteine.
 *
 * Jeder Baustein ist ein reines TS-Modul mit klarer API:
 *   - `mount(parent)` hängt die internen Pixi-Container in einen Layer ein
 *   - `start()` / `stop()` schalten das Update
 *   - `setIntensity(0..1)` modulieret die visuelle Stärke (Partikelrate, Alpha)
 *   - `destroy()` räumt alle Ressourcen auf
 *
 * Die volle Implementierung der einzelnen Effekte (Shader, Partikelphysik)
 * erfolgt in Phase 3 zusammen mit den finalen Asset-Atlanten.
 * Diese Phase-2-Skelette stellen die API sicher und sind testbar.
 */
export interface ProceduralEffect {
  mount(parent: Container): void;
  start(): void;
  stop(): void;
  setIntensity(value: number): void;
  destroy(): void;
}

export interface EffectOptions {
  /** Normalisierter Ankerpunkt (0..1) im Stage-Raum. */
  position?: { x: number; y: number };
  /** Anfangsintensität 0..1. */
  intensity?: number;
  /** Lebensdauer in Sekunden; null = endlos. */
  ttlSeconds?: number | null;
  /** Wenn true, respektiert der Effekt prefers-reduced-motion mit gedrosselter Rate. */
  respectReducedMotion?: boolean;
}
