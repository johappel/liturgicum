import { Graphics } from "pixi.js";
import type { Scene } from "../scene/Scene";
import { useStore } from "../state/store";
import { audioEngine } from "../audio/AudioEngine";
import { SPUREN_ASSETS } from "../assets/manifest";
import type { Room } from "./Room";

/**
 * Hören = "dunkler Vorgeschmack" am Ende des Prototyps.
 *
 * Tiefes Schwarz mit kaum sichtbarem, leise atmendem Drone-Layer.
 * Keine Interaktion: Raumatmosphäre ist die Botschaft.
 */
export class HoerenRoom implements Room {
  private bg: Graphics | null = null;
  private breathing: Graphics | null = null;
  private detachTick?: () => void;
  private resizeHandler: (() => void) | null = null;
  private destroyed = false;
  private ageMs = 0;

  constructor(private scene: Scene) {}

  async mount(): Promise<void> {
    if (this.destroyed) return;
    useStore.getState().enterRoom("hoeren");

    const drawBg = () => {
      const g = this.bg!;
      g.clear();
      g.rect(0, 0, this.scene.width, this.scene.height).fill({ color: 0x020203, alpha: 1 });
    };
    this.bg = new Graphics();
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

    this.resizeHandler = () => { drawBg(); drawBreath(this.breathing!.alpha); };
    window.addEventListener("resize", this.resizeHandler);

    this.detachTick = this.scene.onTick((dt) => {
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

  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.detachTick?.();
    if (this.resizeHandler) {
      window.removeEventListener("resize", this.resizeHandler);
      this.resizeHandler = null;
    }
    try { this.breathing?.destroy(); } catch { /* ignore */ }
    this.breathing = null;
    try { this.bg?.destroy(); } catch { /* ignore */ }
    this.bg = null;
  }
}
