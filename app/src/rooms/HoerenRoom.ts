import { Assets, Graphics, Sprite, type Texture } from "pixi.js";
import type { Scene } from "../scene/Scene";
import { useStore } from "../state/store";
import { audioEngine } from "../audio/AudioEngine";
import { HOEREN_ASSETS, SPUREN_ASSETS } from "../assets/manifest";
import { BaseRoom } from "./BaseRoom";

/**
 * Hören = "dunkler Vorgeschmack" am Ende des Prototyps.
 *
 * Tiefes Schwarz mit kaum sichtbarem, leise atmendem Drone-Layer.
 * Keine Interaktion: Raumatmosphäre ist die Botschaft.
 */
export class HoerenRoom extends BaseRoom {
  private bg: Sprite | null = null;
  private bgTexture: Texture | null = null;
  private breathing: Graphics | null = null;
  private ageMs = 0;

  constructor(scene: Scene) {
    super(scene);
  }

  async mount(): Promise<void> {
    if (this.destroyed) return;
    useStore.getState().enterRoom("hoeren");

    this.bgTexture = await Assets.load<Texture>(HOEREN_ASSETS.background);
    if (this.destroyed) return;

    const drawBg = () => {
      this.fitBackgroundCover(this.bg!, this.bgTexture!);
    };
    this.bg = Sprite.from(this.bgTexture);
    this.bg.anchor.set(0.5);
    this.scene.layers.background.addChild(this.bg);
    drawBg();

    this.breathing = new Graphics();
    this.scene.layers.overlay.addChild(this.breathing);

    const drawBreath = (alpha: number) => {
      const W = this.scene.width;
      const H = this.scene.height;
      const g = this.breathing!;
      g.clear();
      g.rect(0, 0, W, H).fill({ color: 0x0c0a14, alpha });
    };
    drawBreath(0);

    this.onResize(() => { drawBg(); drawBreath(this.breathing!.alpha); });

    this.startTick((dt) => {
      this.ageMs += dt;
      // Sehr langsamer Atem: 12 s Periode, kaum sichtbar.
      const a = 0.06 + 0.04 * Math.sin((this.ageMs / 12000) * Math.PI * 2);
      drawBreath(a);
    });

    // Audio bleibt die Drohne aus Spuren — gewünscht: gleiche Klangfarbe,
    // nur das Bild verdunkelt sich (Manifest: kein Textoverlay).
    try {
      audioEngine.crossfadeAmbient(SPUREN_ASSETS.audio.ambient, 3000);
    } catch { /* still */ }
  }

  protected onDestroy(): void {
    try { this.breathing?.destroy(); } catch { /* ignore */ }
    this.breathing = null;
    try { this.bg?.destroy(); } catch { /* ignore */ }
    this.bg = null;
  }
}
