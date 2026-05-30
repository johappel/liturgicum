import { Container, Graphics } from "pixi.js";
import { BaseEffect, softDisc } from "./BaseEffect";
import type { EffectOptions } from "./types";

interface FlameEmitterOptions extends EffectOptions {
  /** Pixel-Skalierung passend zur sichtbaren Kerzengroesse. */
  scale?: number;
}

/**
 * FlameEmitter — kleine Kerzenflamme + Glut.
 *
 * Phase 2: minimaler Glimmkern (additiver Disc mit Atem-Oszillation).
 * Phase 3: Noise-modulierte Partikel mit additivem Blend, gekoppelt an Verweildauer.
 */
export class FlameEmitter extends BaseEffect {
  private flame = new Container();
  private halo = softDisc(0xff9b3d, 30, 0.3);
  private outer = new Graphics();
  private core = new Graphics();
  private blueBase = softDisc(0x8db7ff, 5, 0.35);
  private t = 0;
  private readonly baseScale: number;
  private readonly flutter = 0.85 + Math.random() * 0.35;

  constructor(protected override opts: FlameEmitterOptions = {}) {
    super(opts);
    this.baseScale = opts.scale ?? 1;
  }

  protected onMount(): void {
    this.halo.position.set(this.opts.position?.x ?? 0, this.opts.position?.y ?? 0);
    this.flame.position.copyFrom(this.halo.position);
    this.halo.blendMode = "add";
    this.outer.blendMode = "add";
    this.core.blendMode = "add";
    this.blueBase.blendMode = "add";
    this.outer
      .ellipse(0, -9, 8, 18)
      .fill({ color: 0xff7a24, alpha: 0.78 });
    this.core
      .ellipse(0, -7, 4.5, 12)
      .fill({ color: 0xfff1b8, alpha: 0.95 });
    this.blueBase.position.set(0, 3);
    this.flame.addChild(this.outer, this.core, this.blueBase);
    this.container.addChild(this.halo, this.flame);
  }

  protected update(deltaMs: number): void {
    this.t += deltaMs / 1000;
    const breath = 0.86
      + Math.sin(this.t * 4.2 * this.flutter) * 0.08
      + Math.sin(this.t * 11.7 + this.flutter) * 0.04
      + Math.sin(this.t * 19.3) * 0.018;
    const i = this.intensity * breath;
    this.core.alpha = 0.9 * i;
    this.outer.alpha = 0.72 * i;
    this.blueBase.alpha = 0.22 * i;
    this.halo.alpha = 0.38 * i;

    const lean = Math.sin(this.t * 6.5 + this.flutter) * 1.7;
    const width = this.baseScale * (0.82 + Math.sin(this.t * 13.4) * 0.08 + i * 0.08);
    const height = this.baseScale * (0.98 + Math.sin(this.t * 5.1) * 0.12 + i * 0.18);
    this.flame.x = (this.opts.position?.x ?? 0) + lean * this.baseScale;
    this.flame.y = this.opts.position?.y ?? 0;
    this.flame.scale.set(width, height);
    this.flame.rotation = lean * 0.018;
    this.halo.scale.set(this.baseScale * (0.72 + i * 0.42), this.baseScale * (0.92 + i * 0.48));
  }
}
