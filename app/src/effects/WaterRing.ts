import { Graphics } from "pixi.js";
import { BaseEffect } from "./BaseEffect";

/**
 * WaterRing — animierter Wellenkreis an der Wasserkante.
 * Phase 2: konzentrische Ringe, die nach außen wachsen und ausblenden.
 * Phase 3: SDF-Ring oder Displacement-Welle.
 */
export class WaterRing extends BaseEffect {
  private rings: { g: Graphics; age: number; max: number }[] = [];

  protected onMount(): void {
    const cx = this.opts.position?.x ?? 0;
    const cy = this.opts.position?.y ?? 0;
    this.container.position.set(cx, cy);
    for (let i = 0; i < 3; i++) {
      const g = new Graphics();
      g.circle(0, 0, 8).stroke({ color: 0xa9c4d8, width: 1.5, alpha: 0.7 });
      this.container.addChild(g);
      this.rings.push({ g, age: -i * 600, max: 1800 });
    }
  }

  protected update(deltaMs: number): void {
    for (const r of this.rings) {
      r.age += deltaMs;
      if (r.age < 0) continue;
      if (r.age > r.max) {
        r.age = -200;
        continue;
      }
      const p = r.age / r.max;
      r.g.alpha = (1 - p) * 0.8 * this.intensity;
      r.g.scale.set(1 + p * 6 * this.intensity);
    }
  }
}
