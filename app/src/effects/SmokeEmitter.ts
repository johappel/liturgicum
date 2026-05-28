import { BaseEffect, softDisc } from "./BaseEffect";

/**
 * SmokeEmitter — sanfter Rauch über einer aktiven Kerze.
 * Phase 2: zwei langsam aufsteigende, weiche Discs.
 * Phase 3: Partikelpool mit Lebensdauer + Drift.
 */
export class SmokeEmitter extends BaseEffect {
  private puffs = [softDisc(0xc9c2b5, 18, 0.15), softDisc(0xc9c2b5, 24, 0.1)];

  protected onMount(): void {
    const x = this.opts.position?.x ?? 0;
    const y = this.opts.position?.y ?? 0;
    for (const p of this.puffs) {
      p.position.set(x, y);
      p.blendMode = "normal";
      this.container.addChild(p);
    }
  }

  protected update(deltaMs: number): void {
    for (let idx = 0; idx < this.puffs.length; idx++) {
      const p = this.puffs[idx];
      p.position.y -= (8 + idx * 4) * (deltaMs / 1000) * this.intensity;
      p.alpha = Math.max(0, p.alpha - 0.0005 * deltaMs);
      if (p.alpha <= 0.01) {
        p.position.set(this.opts.position?.x ?? 0, this.opts.position?.y ?? 0);
        p.alpha = 0.12 * this.intensity;
      }
    }
  }
}
