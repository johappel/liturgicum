import { Howl } from "howler";

/**
 * Audio-Engine als dünner Howler-Wrapper.
 *
 * Verantwortlichkeiten:
 *  - **Ein** aktiver Ambient-Loop pro Raum, mit Crossfade beim Raumwechsel.
 *  - One-Shots pro Geste (FIFO mit Lautstärke-Modulation).
 *  - Globale Lautstärke (Mute/Unmute), persistiert über den Store.
 *  - Respektiert `prefers-reduced-motion` *nicht* — Audio bleibt erhalten,
 *    weil es das primäre Trägermedium für Stille und Resonanz ist.
 *
 * Hinweis: WebAudio benötigt eine User-Geste vor dem ersten Sound.
 * `unlock()` wird beim ersten Pointer-Down aus der Scene heraus aufgerufen.
 */
class AudioEngine {
  private ambient: Howl | null = null;
  private ambientUrl: string | null = null;
  private oneShots = new Map<string, Howl>();
  private masterVolume = 0.65;
  private muted = false;
  private unlocked = false;
  /** Wenn vor der ersten Geste ein Ambient gewünscht wird, hier puffern. */
  private pendingAmbient: { url: string; durationMs: number } | null = null;

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    // Falls vor dem Unlock schon ein Ambient gefordert wurde — jetzt starten.
    if (this.pendingAmbient) {
      const { url, durationMs } = this.pendingAmbient;
      this.pendingAmbient = null;
      void this.crossfadeAmbient(url, durationMs);
    } else if (this.ambient) {
      // Ambient wurde erstellt, play() aber von Autoplay-Policy blockiert.
      // Erneuter Play-Aufruf jetzt im User-Gesten-Kontext.
      if (!this.ambient.playing()) this.ambient.play();
    }
  }

  setVolume(v: number): void {
    this.masterVolume = Math.max(0, Math.min(1, v));
    if (this.ambient) this.ambient.volume(this.effectiveVolume(0.5));
  }

  setMuted(m: boolean): void {
    this.muted = m;
    if (this.ambient) this.ambient.volume(this.effectiveVolume(0.5));
  }

  /** Wechselt den Ambient-Loop mit Crossfade (Default 1500 ms). */
  async crossfadeAmbient(url: string, durationMs = 1500): Promise<void> {
    if (this.ambientUrl === url && this.ambient) return;

    // Vor User-Geste keinen Play-Versuch — Browser-Autoplay-Policy würde
    // ihn stumm verwerfen. Nur Wunsch merken und beim ersten unlock() abspielen.
    if (!this.unlocked) {
      this.pendingAmbient = { url, durationMs };
      return;
    }

    // WICHTIG: synchron starten. html5:true bindet play() an die aktive
    // User-Geste; ein await zwischen Howl-Erzeugung und play() würde den
    // Gesten-Kontext verlassen und die Autoplay-Policy würde stumm verwerfen.
    const target = this.effectiveVolume(0.5);
    const next = new Howl({
      src: [url],
      loop: true,
      html5: true,
      volume: 0,
      autoplay: true,
      onplay: () => next.fade(0, target, durationMs),
      onloaderror: () => {
        // Fail-soft: Datei fehlt -> Ambient zurücksetzen, damit ein erneuter
        // Wunsch nicht in einer toten Howl-Referenz endet.
        if (this.ambient === next) {
          this.ambient = null;
          this.ambientUrl = null;
        }
      },
      onplayerror: () => {
        // Autoplay-Policy hat trotzdem zugeschlagen -> beim nächsten unlock retry.
        this.pendingAmbient = { url, durationMs };
      },
    });

    const previous = this.ambient;
    if (previous) {
      previous.fade(previous.volume(), 0, durationMs);
      window.setTimeout(() => previous.unload(), durationMs + 200);
    }

    this.ambient = next;
    this.ambientUrl = url;
  }

  /** Spielt einen One-Shot ab. `intensity` 0..1 moduliert Lautstärke. */
  playOneShot(url: string, intensity = 0.6): void {
    let h = this.oneShots.get(url);
    if (!h) {
      h = new Howl({
        src: [url],
        loop: false,
        html5: false,
        onloaderror: () => {
          // Datei (noch) nicht vorhanden -> aus Cache nehmen, still scheitern.
          this.oneShots.delete(url);
        },
        onplayerror: () => {
          this.oneShots.delete(url);
        },
      });
      this.oneShots.set(url, h);
    }
    h.volume(this.effectiveVolume(intensity));
    h.play();
  }

  stopAll(): void {
    if (this.ambient) {
      this.ambient.stop();
      this.ambient.unload();
      this.ambient = null;
      this.ambientUrl = null;
    }
    for (const h of this.oneShots.values()) {
      h.stop();
      h.unload();
    }
    this.oneShots.clear();
  }

  private effectiveVolume(weight: number): number {
    if (this.muted) return 0;
    return this.masterVolume * weight;
  }
}

export const audioEngine = new AudioEngine();
