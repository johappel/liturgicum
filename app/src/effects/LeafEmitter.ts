import { BaseEffect, softDisc } from "./BaseEffect";

/**
 * LeafEmitter — vereinzelte Blätter (nur in späteren Räumen verwendet).
 * Phase 2: ein paar driftende dunkle Discs als Stellvertreter.
 * Phase 3: Sprite-Partikel aus PNG + sinusförmiges Wind-Feld.
 */
export class LeafEmitter extends BaseEffect {
  private leaves: { vx: number; vy: number; spin: number; g: ReturnType<typeof softDisc> }[] = [];

  protected onMount(): void {
    for (let i = 0; i < 6; i++) {
      const g = softDisc(0x4a3a28, 4, 0.7);
      g.position.set(Math.random() * 800, Math.random() * 400);
      this.leaves.push({
        vx: 20 + Math.random() * 30,
        vy: 8 + Math.random() * 14,
        spin: (Math.random() - 0.5) * 0.5,
        g,
      });
      this.container.addChild(g);
    }
  }

  protected update(deltaMs: number): void {
    const dt = deltaMs / 1000;
    for (const l of this.leaves) {
      l.g.position.x += l.vx * dt * this.intensity;
      l.g.position.y += l.vy * dt * this.intensity;
      l.g.rotation += l.spin * dt;
    }
  }
}
