import { Graphics } from "pixi.js";
import { BaseEffect } from "./BaseEffect";

/**
 * LeafEmitter — vereinzelte, langsam fallende Federn.
 * Prozedural gezeichnet, damit der Effekt ohne zusätzliche Bildassets funktioniert.
 */
export class LeafEmitter extends BaseEffect {
  private leaves: LeafParticle[] = [];

  protected onMount(): void {
    const count = Math.round(7 + this.intensity * 9);
    for (let i = 0; i < count; i++) this.addLeaf(true);
  }

  protected update(deltaMs: number): void {
    const dt = deltaMs / 1000;
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);
    for (const leaf of this.leaves) {
      leaf.age += deltaMs;
      const sway = Math.sin(leaf.age * leaf.swaySpeed + leaf.phase) * leaf.sway;
      leaf.node.position.x += (leaf.vx + sway) * dt * (0.45 + this.intensity);
      leaf.node.position.y += leaf.vy * dt * (0.55 + this.intensity * 0.65);
      leaf.node.rotation += leaf.spin * dt;
      leaf.node.alpha = leaf.alpha * (0.72 + Math.sin(leaf.age * 0.0014 + leaf.phase) * 0.18);

      if (leaf.node.y > height + 80 || leaf.node.x < -120 || leaf.node.x > width + 120) {
        this.resetLeaf(leaf, false);
      }
    }
  }

  private addLeaf(initial: boolean): void {
    const node = createLeafGraphic();
    const leaf: LeafParticle = {
      node,
      vx: 0,
      vy: 0,
      spin: 0,
      sway: 0,
      swaySpeed: 0,
      phase: 0,
      age: 0,
      alpha: 0.5,
    };
    this.resetLeaf(leaf, initial);
    this.leaves.push(leaf);
    this.container.addChild(node);
  }

  private resetLeaf(leaf: LeafParticle, initial: boolean): void {
    const width = Math.max(window.innerWidth, 1);
    const height = Math.max(window.innerHeight, 1);
    const scale = 0.65 + Math.random() * 1.05;
    leaf.node.position.set(
      -40 + Math.random() * (width + 80),
      initial ? Math.random() * height : -30 - Math.random() * 90,
    );
    leaf.node.scale.set(scale * (Math.random() < 0.5 ? -1 : 1), scale);
    leaf.node.rotation = Math.random() * Math.PI * 2;
    leaf.vx = -10 + Math.random() * 24;
    leaf.vy = 5 + Math.random() * 15;
    leaf.spin = (-0.24 + Math.random() * 0.48) * (0.45 + Math.random() * 0.8);
    leaf.sway = 14 + Math.random() * 34;
    leaf.swaySpeed = 0.0008 + Math.random() * 0.0018;
    leaf.phase = Math.random() * Math.PI * 2;
    leaf.age = Math.random() * 4000;
    leaf.alpha = 0.28 + Math.random() * 0.38;
    leaf.node.alpha = leaf.alpha;
  }
}

interface LeafParticle {
  node: Graphics;
  vx: number;
  vy: number;
  spin: number;
  sway: number;
  swaySpeed: number;
  phase: number;
  age: number;
  alpha: number;
}

function createLeafGraphic(): Graphics {
  const g = new Graphics();
  const color = Math.random() < 0.5 ? 0xd8cfbd : Math.random() < 0.75 ? 0xb7a890 : 0x8d806b;
  const shaft = Math.random() < 0.5 ? 0xeee5d2 : 0xc8baa2;
  const alpha = 0.62 + Math.random() * 0.18;
  g.ellipse(-1.8, -1, 2.7, 14).fill({ color, alpha: alpha * 0.58 });
  g.ellipse(2.1, 1, 2.1, 11).fill({ color, alpha: alpha * 0.44 });
  g.moveTo(0, -14).lineTo(0, 16).stroke({ color: shaft, width: 0.9, alpha: 0.72 });
  for (let i = -10; i <= 8; i += 4) {
    const length = 3.5 + Math.random() * 2.8;
    g.moveTo(0, i).lineTo(-length, i + 2.3).stroke({ color, width: 0.55, alpha: 0.42 });
    g.moveTo(0, i + 1.2).lineTo(length * 0.82, i + 3.1).stroke({ color, width: 0.5, alpha: 0.34 });
  }
  g.moveTo(0, 14).lineTo(0.5, 20).stroke({ color: shaft, width: 0.7, alpha: 0.48 });
  return g;
}
