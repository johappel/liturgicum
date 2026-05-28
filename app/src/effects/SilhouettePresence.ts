import { Assets, Sprite, Texture } from "pixi.js";
import { BaseEffect } from "./BaseEffect";

/**
 * SilhouettePresence — schemenhafte Silhouette einer fremden Spur.
 * Phase 2: PNG-Sprite mit Alpha-Fade ein → halten → aus, leichter Drift.
 * Phase 3: zusätzlich subtile Atmung und Pointer-Aware-Distanz.
 *
 * Wenn `textureUrl` nicht geladen werden kann (Asset noch nicht gerendert),
 * fadet der Effekt still weg — Manifest-konform statt Fehler-Layout.
 */
export interface SilhouetteOptions {
  textureUrl: string;
  fadeInMs?: number;
  holdMs?: number;
  fadeOutMs?: number;
}

export class SilhouettePresence extends BaseEffect {
  private sprite: Sprite | null = null;
  private fadeInMs: number;
  private holdMs: number;
  private fadeOutMs: number;
  private driftX = 0;
  private driftY = 0;

  constructor(
    private silhouetteOpts: SilhouetteOptions,
    base: { intensity?: number; position?: { x: number; y: number } } = {},
  ) {
    super({ ...base, ttlSeconds: undefined });
    this.fadeInMs = silhouetteOpts.fadeInMs ?? 3500;
    this.holdMs = silhouetteOpts.holdMs ?? 9000;
    this.fadeOutMs = silhouetteOpts.fadeOutMs ?? 4500;
    this.ttlMs = this.fadeInMs + this.holdMs + this.fadeOutMs;
  }

  protected onMount(): void {
    Assets.load<Texture>(this.silhouetteOpts.textureUrl).then(
      (tex) => {
        const s = new Sprite(tex);
        s.anchor.set(0.5, 1.0);
        s.position.set(this.opts.position?.x ?? 0, this.opts.position?.y ?? 0);
        s.alpha = 0;
        s.scale.set(0.85);
        this.container.addChild(s);
        this.sprite = s;
      },
      () => {
        // Texture nicht ladbar — Effekt bleibt still.
        this.stop();
      },
    );
  }

  protected update(_deltaMs: number): void {
    if (!this.sprite) return;
    const t = this.ageMs;
    let alpha = 0;
    if (t < this.fadeInMs) alpha = (t / this.fadeInMs) * 0.65;
    else if (t < this.fadeInMs + this.holdMs) alpha = 0.65;
    else {
      const out = (t - this.fadeInMs - this.holdMs) / this.fadeOutMs;
      alpha = (1 - out) * 0.65;
    }
    this.sprite.alpha = Math.max(0, alpha) * this.intensity;

    this.driftX += (Math.sin(t / 2200) - this.driftX) * 0.01;
    this.driftY += (Math.cos(t / 2700) - this.driftY) * 0.01;
    this.sprite.position.x = (this.opts.position?.x ?? 0) + this.driftX * 6;
    this.sprite.position.y = (this.opts.position?.y ?? 0) + this.driftY * 3;
  }
}
