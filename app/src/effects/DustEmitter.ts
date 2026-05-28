import { BaseEffect, softDisc } from "./BaseEffect";

/**
 * DustEmitter — feinste goldene Staubpartikel in einer Lichtachse.
 * Phase 2: 24 winzige Discs mit zufälligem Drift.
 * Phase 3: Sprite-Partikelpool mit Wind-Feld.
 */
export class DustEmitter extends BaseEffect {
  private specks: { dx: number; dy: number; g: ReturnType<typeof softDisc> }[] = [];

  protected onMount(): void {
    const cx = this.opts.position?.x ?? 0;
    const cy = this.opts.position?.y ?? 0;
    for (let i = 0; i < 24; i++) {
      const g = softDisc(0xf0deb0, 1.5, 0.55);
      g.blendMode = "add";
      g.position.set(cx + (Math.random() - 0.5) * 240, cy + (Math.random() - 0.5) * 160);
      this.specks.push({ dx: (Math.random() - 0.5) * 6, dy: -2 - Math.random() * 4, g });
      this.container.addChild(g);
    }
  }

  protected update(deltaMs: number): void {
    const dt = deltaMs / 1000;
    for (const s of this.specks) {
      s.g.position.x += s.dx * dt * this.intensity;
      s.g.position.y += s.dy * dt * this.intensity;
      s.g.alpha = 0.4 + Math.sin((this.ageMs + s.dx * 100) / 800) * 0.2;
    }
  }
}
