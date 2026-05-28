import { BaseEffect, softDisc } from "./BaseEffect";

/**
 * FlameEmitter — kleine Kerzenflamme + Glut.
 *
 * Phase 2: minimaler Glimmkern (additiver Disc mit Atem-Oszillation).
 * Phase 3: Noise-modulierte Partikel mit additivem Blend, gekoppelt an Verweildauer.
 */
export class FlameEmitter extends BaseEffect {
  private core = softDisc(0xffcf91, 14, 0.85);
  private halo = softDisc(0xff9b3d, 28, 0.35);
  private t = 0;

  protected onMount(): void {
    this.halo.position.set(this.opts.position?.x ?? 0, this.opts.position?.y ?? 0);
    this.core.position.copyFrom(this.halo.position);
    this.halo.blendMode = "add";
    this.core.blendMode = "add";
    this.container.addChild(this.halo, this.core);
  }

  protected update(deltaMs: number): void {
    this.t += deltaMs / 1000;
    const breath = 0.85 + Math.sin(this.t * 4.2) * 0.07 + Math.sin(this.t * 11) * 0.03;
    const i = this.intensity * breath;
    this.core.alpha = 0.9 * i;
    this.halo.alpha = 0.45 * i;
    this.core.scale.set(0.9 + i * 0.2);
    this.halo.scale.set(0.85 + i * 0.35);
  }
}
