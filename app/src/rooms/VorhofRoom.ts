import { Graphics } from "pixi.js";
import type { Scene } from "../scene/Scene";
import { FogLayer } from "../effects/FogLayer";
import { useStore } from "../state/store";
import { audioEngine } from "../audio/AudioEngine";
import { SPUREN_ASSETS } from "../assets/manifest";
import { BaseRoom } from "./BaseRoom";

/**
 * Vorhof = leerer Raum vor Spuren.
 *
 * Hintergrund ist ein tiefes, fast schwarzes Feld mit minimalem Nebel.
 * Keine Anker, keine Anweisung — der erste Pointer-Down löst den Übergang
 * nach Spuren aus (orchestriert vom RoomManager).
 */
export class VorhofRoom extends BaseRoom {
  private bg: Graphics | null = null;
  private fog: FogLayer | null = null;

  constructor(scene: Scene) {
    super(scene);
  }

  async mount(): Promise<void> {
    if (this.destroyed) return;
    useStore.getState().enterRoom("vorhof");

    const draw = () => {
      const g = this.bg!;
      g.clear();
      g.rect(0, 0, this.scene.width, this.scene.height).fill({ color: 0x05070a, alpha: 1 });
    };
    this.bg = new Graphics();
    this.scene.layers.background.addChild(this.bg);
    draw();
    this.onResize(draw);

    if (!useStore.getState().reducedMotion) {
      this.fog = new FogLayer({ intensity: 0.2 });
      this.fog.mount(this.scene.layers.particles_bg);
      this.fog.start();
      this.startTick((dt) => this.fog?.tick(dt));
    }

    try {
      audioEngine.crossfadeAmbient(SPUREN_ASSETS.audio.ambient, 4000);
    } catch { /* still */ }
  }

  protected onDestroy(): void {
    try { this.fog?.destroy(); } catch { /* ignore */ }
    this.fog = null;
    try { this.bg?.destroy(); } catch { /* ignore */ }
    this.bg = null;
  }
}
