import type { Scene } from "../scene/Scene";
import { SPUREN_ASSETS } from "../assets/manifest";
import { SilhouettePresence } from "../effects/SilhouettePresence";
import { FlameEmitter } from "../effects/FlameEmitter";
import type { BaseEffect } from "../effects/BaseEffect";

/**
 * Lokaler Spuren-Simulator für Raum "Spuren" (Phase 3.5).
 *
 * Beim Eintritt 4–9 Fremd-Silhouetten + 0–2 niedrigintensive Flammen.
 * Danach periodisch alle 30–90 s eine neue Spur (Silhouette ODER kalte Glut).
 *
 * Bewusst keine Avatare, keine Zahlen, keine Quellen-Information.
 */
export class SpurenSimulator {
  private destroyed = false;
  private nextSpawnTimer: number | null = null;
  private effects: BaseEffect[] = [];

  constructor(
    private scene: Scene,
    private opts: {
      onEffect: (e: BaseEffect) => void;
      reducedMotion: boolean;
    },
  ) {}

  start(): void {
    if (this.destroyed) return;
    const initial = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < initial; i++) this.spawnSilhouette();

    // 0–2 kalte, bereits brennende "Erinnerungs"-Flammen (sehr niedrige Intensität).
    const flames = Math.floor(Math.random() * 3);
    for (let i = 0; i < flames; i++) this.spawnEmberFlame();

    if (!this.opts.reducedMotion) this.scheduleNext();
  }

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    if (this.nextSpawnTimer != null) {
      window.clearTimeout(this.nextSpawnTimer);
      this.nextSpawnTimer = null;
    }
  }

  private scheduleNext(): void {
    if (this.destroyed) return;
    const delayMs = 30000 + Math.random() * 60000;
    this.nextSpawnTimer = window.setTimeout(() => {
      if (this.destroyed) return;
      if (Math.random() < 0.7) this.spawnSilhouette();
      else this.spawnEmberFlame();
      this.scheduleNext();
    }, delayMs);
  }

  private spawnSilhouette(): void {
    const keys = Object.keys(SPUREN_ASSETS.silhouettes);
    const key = keys[Math.floor(Math.random() * keys.length)];
    const url = SPUREN_ASSETS.silhouettes[key];
    const x = (0.15 + Math.random() * 0.7) * this.scene.width;
    const y = (0.35 + Math.random() * 0.45) * this.scene.height;
    const sil = new SilhouettePresence(
      {
        textureUrl: url,
        fadeInMs: 3000 + Math.random() * 2000,
        holdMs: 6000 + Math.random() * 6000,
        fadeOutMs: 3500 + Math.random() * 2000,
      },
      { position: { x, y }, intensity: 0.85 },
    );
    sil.mount(this.scene.layers.parallax_mid);
    sil.start();
    this.effects.push(sil);
    this.opts.onEffect(sil);
  }

  private spawnEmberFlame(): void {
    const x = (0.2 + Math.random() * 0.6) * this.scene.width;
    const y = (0.45 + Math.random() * 0.35) * this.scene.height;
    const flame = new FlameEmitter({
      position: { x, y },
      intensity: 0.25,
      ttlSeconds: 60 + Math.random() * 60,
    });
    flame.mount(this.scene.layers.interactions);
    flame.start();
    this.effects.push(flame);
    this.opts.onEffect(flame);
  }
}
