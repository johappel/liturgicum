import { Graphics } from "pixi.js";
import { BaseEffect } from "./BaseEffect";

/** WaterRing — flache perspektivische Wellen auf der Wasserfläche. */
export class WaterRing extends BaseEffect {
  private rings: { g: Graphics; age: number; max: number; rx: number; ry: number }[] = [];

  protected onMount(): void {
    const cx = this.opts.position?.x ?? 0;
    const cy = this.opts.position?.y ?? 0;
    this.container.position.set(cx, cy);
    for (let i = 0; i < 3; i++) {
      const g = new Graphics();
      g.ellipse(0, 0, 12, 3.5).stroke({ color: 0xb8c7c2, width: 1, alpha: 0.42 });
      this.container.addChild(g);
      this.rings.push({ g, age: -i * 320, max: 1700, rx: 12, ry: 3.5 });
    }
  }

  protected update(deltaMs: number): void {
    for (const r of this.rings) {
      r.age += deltaMs;
      if (r.age < 0) continue;
      if (r.age > r.max) {
        r.g.alpha = 0;
        continue;
      }
      const p = r.age / r.max;
      const alpha = Math.pow(1 - p, 1.7) * 0.5 * this.intensity;
      r.g.clear();
      r.g.ellipse(0, 0, r.rx + p * 70 * this.intensity, r.ry + p * 12 * this.intensity)
        .stroke({ color: 0xb8c7c2, width: 1, alpha });
    }
  }
}
