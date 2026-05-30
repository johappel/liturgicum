import { Assets, Container, Graphics, Sprite, type Texture } from "pixi.js";
import type { Scene } from "./Scene";

export interface TransitionOpts {
  /** Dauer in ms; im Reduced-Motion-Modus auf 1500 ms gekappt. */
  durationMs?: number;
  /** "forward" = ins Licht (klare Verdichtung), "back" = loslassen (gedämpft). */
  mood?: "forward" | "back";
  portal?: {
    targetBackground: string;
    origin: { x: number; y: number };
  };
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
  if (opts.portal && !reduced) {
    await runPortalTransition(scene, swap, opts.portal, duration);
    return;
  }
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

async function runPortalTransition(
  scene: Scene,
  swap: () => Promise<void> | void,
  portal: NonNullable<TransitionOpts["portal"]>,
  durationMs: number,
): Promise<void> {
  const texture = await Assets.load<Texture>(portal.targetBackground);
  const root = new Container();
  const next = Sprite.from(texture);
  const mask = new Graphics();
  const shade = new Graphics();
  const fogBack = new Graphics();
  const fogFront = new Graphics();

  root.addChild(next, shade, fogBack, fogFront, mask);
  next.mask = mask;
  scene.layers.overlay.addChild(root);

  let progress = 0;
  const fit = () => {
    const W = scene.width;
    const H = scene.height;
    next.anchor.set(0.5);
    next.x = W / 2;
    next.y = H / 2;
    next.scale.set(Math.max(W / texture.width, H / texture.height));
    drawPortal(scene, mask, shade, fogBack, fogFront, portal.origin, progress, 0);
  };
  fit();
  window.addEventListener("resize", fit);

  await animate(scene, durationMs * 0.82, (t) => {
    progress = easeInOutCubic(t);
    const reveal = smoothstep(clamp((t - 0.28) / 0.72, 0, 1));
    next.alpha = 0.06 + reveal * 0.84;
    drawPortal(scene, mask, shade, fogBack, fogFront, portal.origin, progress, t);
  });

  try {
    await swap();
  } finally {
    progress = 1;
    drawPortal(scene, mask, shade, fogBack, fogFront, portal.origin, progress, 1);
  }

  await animate(scene, durationMs * 0.38, (t) => {
    root.alpha = 1 - easeInOutCubic(t);
  });

  window.removeEventListener("resize", fit);
  root.destroy({ children: true });
}

function drawPortal(
  scene: Scene,
  mask: Graphics,
  shade: Graphics,
  fogBack: Graphics,
  fogFront: Graphics,
  origin: { x: number; y: number },
  progress: number,
  time: number,
): void {
  const W = scene.width;
  const H = scene.height;
  const cx = origin.x * W;
  const cy = origin.y * H;
  const maxRadius = Math.hypot(Math.max(cx, W - cx), Math.max(cy, H - cy)) * 1.18;
  const fogBloom = smoothstep(clamp(progress / 0.52, 0, 1));
  const reveal = smoothstep(clamp((progress - 0.22) / 0.78, 0, 1));
  const r = 28 + maxRadius * (0.18 * fogBloom + 0.82 * reveal);
  const rx = r * (0.82 + reveal * 0.38);
  const ry = r * (1.24 - reveal * 0.24);
  const breathing = Math.sin(time * Math.PI * 2.8) * 0.04;

  shade.clear();
  shade.rect(0, 0, W, H).fill({ color: 0x030303, alpha: 0.03 + fogBloom * 0.2 });

  mask.clear();
  mask.ellipse(cx, cy, rx * (0.52 + reveal * 0.48), ry * (0.52 + reveal * 0.48)).fill({ color: 0xffffff, alpha: 1 });

  fogBack.clear();
  drawFogCloud(fogBack, cx, cy, rx, ry, fogBloom, reveal, breathing, 0);

  fogFront.clear();
  drawFogCloud(fogFront, cx, cy, rx * 1.18, ry * 1.12, fogBloom, reveal, -breathing, 1);
}

function drawFogCloud(
  g: Graphics,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  fogBloom: number,
  reveal: number,
  breathing: number,
  layer: number,
): void {
  const alphaBase = (0.11 + layer * 0.045) * fogBloom * (1 - reveal * 0.48);
  const color = layer === 0 ? 0xcfc7b4 : 0xe4dece;
  const count = layer === 0 ? 9 : 12;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + layer * 0.7 + breathing * 4;
    const radiusNoise = 0.62 + ((i * 37) % 11) / 30;
    const ox = Math.cos(a) * rx * (0.22 + 0.33 * radiusNoise) + Math.sin(a * 1.7) * rx * breathing;
    const oy = Math.sin(a) * ry * (0.16 + 0.28 * radiusNoise) + Math.cos(a * 1.3) * ry * breathing;
    const sx = rx * (0.2 + ((i * 19) % 9) / 48) * (layer === 0 ? 1.15 : 0.9);
    const sy = ry * (0.12 + ((i * 23) % 7) / 52) * (layer === 0 ? 0.9 : 1.05);
    g.ellipse(cx + ox, cy + oy, sx, sy).fill({ color, alpha: alphaBase * (0.56 + (i % 4) * 0.12) });
  }
  g.ellipse(cx, cy, rx * (0.72 + layer * 0.08), ry * (0.54 + layer * 0.05)).fill({
    color,
    alpha: alphaBase * 0.42,
  });
}

function animate(scene: Scene, durationMs: number, step: (t: number) => void): Promise<void> {
  return new Promise((resolve) => {
    let elapsed = 0;
    const detach = scene.onTick((dt) => {
      elapsed += dt;
      const t = Math.min(1, elapsed / durationMs);
      step(t);
      if (t >= 1) {
        detach();
        resolve();
      }
    });
  });
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

function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
