const DEFAULT_AUDIO_METADATA_TIMEOUT_MS = 15000;

/**
 * Lädt die Dauer einer Audiodatei (ms) über deren Metadaten.
 *
 * Liefert `fallbackMs`, wenn `Audio` nicht verfügbar ist, ein Fehler auftritt
 * oder die Metadaten nicht innerhalb von `timeoutMs` eintreffen. Raumunabhängig.
 */
export function loadAudioDurationMs(
  url: string,
  fallbackMs: number,
  timeoutMs: number = DEFAULT_AUDIO_METADATA_TIMEOUT_MS,
): Promise<number> {
  if (typeof Audio === "undefined") return Promise.resolve(fallbackMs);
  return new Promise((resolve) => {
    const audio = new Audio();
    let settled = false;
    const finish = (durationMs: number) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeout);
      audio.removeAttribute("src");
      audio.load();
      resolve(durationMs);
    };
    const finishFromMetadata = () => {
      const durationMs = Number.isFinite(audio.duration) && audio.duration > 0
        ? Math.ceil(audio.duration * 1000)
        : fallbackMs;
      finish(durationMs);
    };
    const timeout = window.setTimeout(() => finish(fallbackMs), timeoutMs);
    audio.preload = "metadata";
    audio.addEventListener("loadedmetadata", finishFromMetadata, { once: true });
    audio.addEventListener("durationchange", finishFromMetadata, { once: true });
    audio.addEventListener("canplaythrough", finishFromMetadata, { once: true });
    audio.addEventListener("error", () => finish(fallbackMs), { once: true });
    audio.src = url;
    audio.load();
  });
}
