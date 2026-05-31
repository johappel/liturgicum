import { Container, Graphics, Sprite, Texture } from "pixi.js";
import { randomHorizontalMirror, randomRange } from "../common/mathUtils";

/** Art einer fremden Präsenz-Silhouette. */
export type PresenceKind = "walking" | "kneeling" | "seated";

/** Basishöhe (px) der Präsenz-Sprites je Haltung. */
export const PRESENCE_BASE_HEIGHT: Record<PresenceKind, number> = {
  walking: 460,
  kneeling: 380,
  seated: 340,
};

/**
 * Erzeugt einen Stein-Knoten (Schatten + Sprite) mit zufälliger Textur,
 * Spiegelung und Größenvariation. Fällt auf eine getönte Box zurück,
 * wenn keine Texturen geladen sind.
 */
export function createStoneNode(textures: Texture[]): Container {
  const c = new Container();
  const shadow = new Graphics();
  shadow.ellipse(2, 0, 34, 7).fill({ color: 0x050403, alpha: 0.34 });
  const pool = textures.length > 0 ? textures : [Texture.WHITE];
  const tex = pool[Math.floor(Math.random() * pool.length)];
  const stone = new Sprite(tex);
  stone.anchor.set(0.5, 1);
  stone.y = 20;
  if (tex === Texture.WHITE) {
    stone.tint = 0x57524a;
    stone.width = 72;
    stone.height = 46;
    stone.alpha = 0.9;
    const sizeFactor = randomRange(0.72, 1.26);
    stone.scale.x *= randomHorizontalMirror() * sizeFactor;
    stone.scale.y *= sizeFactor;
  } else {
    const target = 92 * randomRange(0.72, 1.26);
    const side = Math.max(tex.width, tex.height) || 1;
    const scale = target / side;
    stone.scale.set(scale * randomHorizontalMirror(), scale);
  }
  c.addChild(shadow, stone);
  return c;
}

/**
 * Erzeugt einen Kerzen-Knoten (Schatten + Sprite/gezeichneter Körper) mit
 * zufälliger Textur und Größenvariation. Zeichnet eine einfache Kerze,
 * wenn keine Texturen geladen sind.
 */
export function createCandleNode(textures: Texture[]): Container {
  const c = new Container();
  const shadow = new Graphics();
  shadow.ellipse(0, 0, 18, 5).fill({ color: 0x050403, alpha: 0.26 });
  const heightFactor = 0.84 + Math.random() * 0.34;
  const widthFactor = 0.82 + Math.random() * 0.34;
  const pool = textures.length > 0 ? textures : [Texture.WHITE];
  const tex = pool[Math.floor(Math.random() * pool.length)];
  if (tex !== Texture.WHITE) {
    const candle = new Sprite(tex);
    candle.anchor.set(0.5, 1);
    const targetHeight = 82 * heightFactor;
    candle.scale.set(targetHeight / Math.max(tex.height, 1));
    candle.scale.x *= widthFactor * randomHorizontalMirror();
    c.addChild(shadow, candle);
    return c;
  }
  const body = new Graphics();
  const bodyWidth = 12 * widthFactor;
  const bodyHeight = 22 * heightFactor;
  body.roundRect(-bodyWidth / 2, -bodyHeight + 6, bodyWidth, bodyHeight, 4).fill({ color: 0xf4e0ba, alpha: 0.94 });
  const wick = new Graphics();
  wick.roundRect(-1, -bodyHeight - 2, 2, 5, 1).fill({ color: 0x2c2418, alpha: 0.9 });
  c.addChild(shadow, body, wick);
  return c;
}

/**
 * Erzeugt eine fremde Präsenz-Silhouette je Haltung. Nutzt die übergebene
 * Textur, andernfalls eine gezeichnete Schemen-Figur.
 */
export function createPresenceNode(kind: PresenceKind, texture: Texture | undefined): Container {
  const c = new Container();
  const shadow = new Graphics();
  shadow.ellipse(0, 0, kind === "walking" ? 34 : 28, 7).fill({ color: 0x000000, alpha: 0.16 });
  if (texture) {
    const sprite = new Sprite(texture);
    sprite.anchor.set(0.5, 1);
    const targetHeight = PRESENCE_BASE_HEIGHT[kind];
    sprite.scale.set(targetHeight / Math.max(texture.height, 1));
    sprite.scale.x *= randomHorizontalMirror();
    sprite.alpha = 0.9;
    c.addChild(shadow, sprite);
    return c;
  }

  const g = new Graphics();
  if (kind === "walking") {
    g.scale.x = randomHorizontalMirror();
    g.ellipse(0, -30, 11, 13).fill({ color: 0xe6e2d8, alpha: 0.36 });
    g.roundRect(-10, -18, 20, 38, 8).fill({ color: 0xe0dbcf, alpha: 0.3 });
    g.roundRect(-13, 14, 8, 28, 5).fill({ color: 0xd8d2c8, alpha: 0.24 });
    g.roundRect(5, 14, 8, 28, 5).fill({ color: 0xd8d2c8, alpha: 0.24 });
  } else if (kind === "kneeling") {
    g.scale.x = randomHorizontalMirror();
    g.ellipse(-8, 13, 18, 10).fill({ color: 0xe0dbcf, alpha: 0.28 });
    g.roundRect(-18, -12, 28, 30, 8).fill({ color: 0xe0dbcf, alpha: 0.28 });
    g.ellipse(8, -20, 9, 10).fill({ color: 0xe6e2d8, alpha: 0.34 });
  } else {
    g.scale.x = randomHorizontalMirror();
    g.ellipse(0, 15, 20, 11).fill({ color: 0xe0dbcf, alpha: 0.26 });
    g.roundRect(-18, -20, 36, 28, 8).fill({ color: 0xe0dbcf, alpha: 0.26 });
    g.ellipse(0, -30, 10, 11).fill({ color: 0xe6e2d8, alpha: 0.34 });
  }

  c.addChild(shadow, g);
  return c;
}
