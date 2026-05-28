import { Container, Graphics } from "pixi.js";
import type { EffectOptions, ProceduralEffect } from "./types";

/**
 * Basisklasse für alle prozeduralen Effekt-Module.
 *
 * Hält Container, Intensität, TTL-Logik und einen einfachen
 * `update(deltaMs)`-Hook bereit, den die Konkretisierung füllt.
 *
 * Phase 2 = API-Skelett (Test- und Importierbarkeit sichern).
 * Phase 3 = volle visuelle Implementierung (Shader, Noise, Partikel).
 */
export abstract class BaseEffect implements ProceduralEffect {
  protected container = new Container();
  protected intensity: number;
  protected ageMs = 0;
  protected ttlMs: number | null;
  protected running = false;
  protected mounted = false;

  constructor(protected opts: EffectOptions = {}) {
    this.intensity = opts.intensity ?? 0.5;
    this.ttlMs = opts.ttlSeconds != null ? opts.ttlSeconds * 1000 : null;
    this.container.label = this.constructor.name;
  }

  mount(parent: Container): void {
    if (this.mounted) return;
    parent.addChild(this.container);
    this.mounted = true;
    this.onMount();
  }

  start(): void {
    this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  setIntensity(value: number): void {
    this.intensity = Math.max(0, Math.min(1, value));
  }

  destroy(): void {
    this.stop();
    this.container.destroy({ children: true });
    this.mounted = false;
  }

  /** Vom Scene-Ticker aufzurufen. */
  tick(deltaMs: number): void {
    if (!this.running) return;
    this.ageMs += deltaMs;
    this.update(deltaMs);
    if (this.ttlMs != null && this.ageMs >= this.ttlMs) {
      this.stop();
    }
  }

  protected abstract onMount(): void;
  protected abstract update(deltaMs: number): void;
}

/** Liefert einen weichen, farbgleichen Disc-Graphics-Stempel für Partikel-Skelette. */
export function softDisc(color: number, radius: number, alpha = 1): Graphics {
  const g = new Graphics();
  g.circle(0, 0, radius).fill({ color, alpha });
  return g;
}
