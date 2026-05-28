import { Graphics } from "pixi.js";
import { BaseEffect } from "./BaseEffect";

/**
 * FogLayer — atmosphärische Nebelschicht über der gesamten Bühne.
 * Phase 2: zwei sehr weiche, langsam driftende Rechtecke mit additivem Alpha.
 * Phase 3: Noise-Textur + Displacement-Filter, leicht Pointer-reaktiv.
 */
export class FogLayer extends BaseEffect {
  private rectA = new Graphics();
  private rectB = new Graphics();
  private t = 0;

  protected onMount(): void {
    for (const r of [this.rectA, this.rectB]) {
      r.rect(-2000, -1000, 4000, 2000).fill({ color: 0x2a2620, alpha: 0.06 });
      this.container.addChild(r);
    }
  }

  protected update(deltaMs: number): void {
    this.t += deltaMs / 1000;
    const i = this.intensity;
    this.rectA.position.x = Math.sin(this.t * 0.15) * 30 * i;
    this.rectA.position.y = Math.cos(this.t * 0.12) * 15 * i;
    this.rectB.position.x = Math.sin(this.t * 0.09 + 1.7) * 25 * i;
    this.rectB.position.y = Math.cos(this.t * 0.07 + 0.4) * 12 * i;
    this.rectA.alpha = 0.5 + 0.3 * i;
    this.rectB.alpha = 0.4 + 0.3 * i;
  }
}
