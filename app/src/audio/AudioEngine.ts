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

  unlock(): void {
    if (this.unlocked) return;
    this.unlocked = true;
    // Kurzer stiller Buffer-Trick könnte hier rein; Howler tut das intern.
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

    const next = new Howl({ src: [url], loop: true, html5: true, volume: 0 });
    await new Promise<void>((resolve) => {
      next.once("load", () => resolve());
      next.once("loaderror", () => resolve()); // Fail-soft: nichts spielen.
    });
    next.play();
    next.fade(0, this.effectiveVolume(0.5), durationMs);

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
      h = new Howl({ src: [url], loop: false, html5: false });
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
