import { Graphics } from "pixi.js";
import type { Scene } from "./Scene";

export interface TransitionOpts {
  /** Dauer in ms; im Reduced-Motion-Modus auf 1500 ms gekappt. */
  durationMs?: number;
  /** "forward" = ins Licht (klare Verdichtung), "back" = loslassen (gedämpft). */
  mood?: "forward" | "back";
  reducedMotion?: boolean;
}

/**
 * Schwarzer Vollbild-Schleier, der über alle Layer ein-/ausfadet.
 * Während des Fade-In wird `swap()` gerufen, dann fadet er wieder aus.
 */
export async function runTransition(
  scene: Scene,
  swap: () => Promise<void> | void,
  opts: TransitionOpts = {},
): Promise<void> {
  const reduced = !!opts.reducedMotion;
  const duration = reduced ? 1500 : (opts.durationMs ?? 5500);
  const half = duration / 2;
  // Bei "back" weicher Grauton statt Schwarz, damit kein Sog entsteht.
  const color = opts.mood === "back" ? 0x0a0a0a : 0x000000;

  const veil = new Graphics();
  const draw = () => {
    veil.clear();
    veil.rect(0, 0, scene.width, scene.height).fill({ color, alpha: 1 });
  };
  draw();
  veil.alpha = 0;
  scene.layers.overlay.addChild(veil);

  const onResize = () => draw();
  window.addEventListener("resize", onResize);

  await fade(scene, veil, 0, 1, half);
  try {
    await swap();
  } finally {
    draw();
  }
  await fade(scene, veil, 1, 0, half);

  window.removeEventListener("resize", onResize);
  veil.destroy();
}

function fade(scene: Scene, g: Graphics, from: number, to: number, durationMs: number): Promise<void> {
  return new Promise((resolve) => {
    let elapsed = 0;
    const detach = scene.onTick((dt) => {
      elapsed += dt;
      const t = Math.min(1, elapsed / durationMs);
      g.alpha = from + (to - from) * easeInOutCubic(t);
      if (t >= 1) {
        detach();
        resolve();
      }
    });
  });
}

function easeInOutCubic(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
