/**
 * Asset-Manifest: bildet die Datei-Layout-Konvention aus rooms/<raum>/ auf
 * URL-Pfade ab, die Vite (publicDir = ../rooms) zur Laufzeit ausliefert.
 *
 * Alle URLs werden gegen `import.meta.env.BASE_URL` aufgelöst, damit der
 * Build mit beliebigem `LITURGICUM_BASE` funktioniert (lokal `/`, GitHub Pages
 * `/liturgicum/`).
 */

const BASE = import.meta.env.BASE_URL ?? "/";

function url(rel: string): string {
  return BASE.replace(/\/$/, "") + "/" + rel.replace(/^\//, "");
}

export interface RoomAssets {
  background: string;
  anchors: Record<string, string>;
  artifacts: Record<string, string>;
  silhouettes: Record<string, string>;
  /** Optionale Audio-Stems (existieren möglicherweise noch nicht). */
  audio: Record<string, string>;
}

export const SPUREN_ASSETS: RoomAssets = {
  background: url("spuren/background.png"),
  anchors: {
    candle_field: url("spuren/anchors/candle_field.png"),
    stone_bed: url("spuren/anchors/stone_bed.png"),
    water_edge: url("spuren/anchors/water_edge.png"),
  },
  artifacts: {
    candle_unlit: url("spuren/artifacts/candle_unlit.png"),
    candle_1: url("spuren/artifacts/candle_1.png"),
    candle_2: url("spuren/artifacts/candle_2.png"),
    candle_3: url("spuren/artifacts/candle_3.png"),
    candle_4: url("spuren/artifacts/candle_4.png"),
    stone_loose_a: url("spuren/artifacts/stone_loose_a.png"),
    stone_loose_b: url("spuren/artifacts/stone_loose_b.png"),
    stone_loose_c: url("spuren/artifacts/stone_loose_c.png"),
  },
  silhouettes: {
    passing: url("spuren/artifacts/silhouette_passing.png"),
    seated: url("spuren/artifacts/silhouette_seated.png"),
    kneeling: url("spuren/artifacts/silhouette_kneeling.png"),
  },
  audio: {
    ambient: url("spuren/audio/ambient_low_drone.mp3"),
    candle_breath: url("spuren/audio/candle_breath.mp3"),
    hush: url("spuren/audio/hush.mp3"),
    stone_drop: url("spuren/audio/stone_drop.mp3"),
    water_ring: url("spuren/audio/water_ring.mp3"),
  },
};
