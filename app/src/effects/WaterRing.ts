import { Graphics } from "pixi.js";
import { BaseEffect } from "./BaseEffect";

/** WaterRing — flache perspektivische Wellen auf der Wasserfläche. */
export class WaterRing extends BaseEffect {
  private rings: { g: Graphics; age: number; max: number; rx: number; ry: number; strength: number; rotation: number }[] = [];

  protected onMount(): void {
    const cx = this.opts.position?.x ?? 0;
    const cy = this.opts.position?.y ?? 0;
    this.container.position.set(cx, cy);
    for (let i = 0; i < 3; i++) {
      const g = new Graphics();
      this.container.addChild(g);
      this.rings.push({
        g,
        age: 0,
        max: 5000 + i * 450,
        rx: 26 + i * 18,
        ry: 7 + i * 3.8,
        strength: [1, 0.55, 0.32][i],
        rotation: Math.random() * Math.PI * 2,
      });
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
      const alpha = Math.pow(1 - p, 1.45) * 0.58 * this.intensity * r.strength;
      const rx = r.rx + p * 680 * this.intensity;
      const ry = r.ry + p * 124 * this.intensity;
      r.g.clear();
      drawSmoothArc(r.g, rx, ry, r.rotation, Math.PI * 0.04, Math.PI * 1.96, 0x87a39d, 1.15, alpha * 0.52);
      drawSmoothArc(r.g, rx * 1.015, ry * 1.05, r.rotation, Math.PI * 0.18, Math.PI * 0.82, 0xb7c6b4, 1.25, alpha * 0.34);
      drawSmoothArc(r.g, rx * 0.98, ry * 0.92, r.rotation, Math.PI * 1.08, Math.PI * 1.72, 0x4f6f70, 1, alpha * 0.28);
      drawSmoothArc(r.g, rx * 0.84, ry * 0.72, r.rotation, Math.PI * 0.12, Math.PI * 0.48, 0xc89b5f, 1, alpha * 0.22);
    }
  }
}

function drawSmoothArc(
  g: Graphics,
  rx: number,
  ry: number,
  rotation: number,
  start: number,
  end: number,
  color: number,
  width: number,
  alpha: number,
): void {
  const points: number[] = [];
  const steps = 72;
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const angle = start + (end - start) * t + rotation;
    points.push(Math.cos(angle) * rx, Math.sin(angle) * ry);
  }
  g.poly(points, false).stroke({ color, width, alpha });
}
