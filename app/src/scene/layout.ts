/**
 * Master-Screen-Raster gemäß docs/Design-Artefakte.md §11.1 und docs/Raeume.md §1.1:
 *   - Entry: unten-links (hinter dem Betrachter, atmosphärische Öffnung)
 *   - Bühne: mittig-oben-links bis Bildmitte
 *   - Exit:  oben-rechts (ins Licht, schimmernd)
 *
 * Alle Koordinaten sind *normalisiert* (0..1) auf den aktuellen Render-Bereich.
 * Konkrete Pixelkoordinaten werden zur Laufzeit aus der Stage-Größe abgeleitet.
 */
export interface NormPoint {
  /** 0..1 von links nach rechts */
  x: number;
  /** 0..1 von oben nach unten */
  y: number;
}

export const ENTRY_ZONE: NormPoint = { x: 0.18, y: 0.86 };
export const EXIT_ZONE: NormPoint = { x: 0.82, y: 0.18 };
export const STAGE_CENTER: NormPoint = { x: 0.42, y: 0.46 };

/** Spuren-Anker-Positionen (docs/Design-Artefakte.md §11.1). */
export const SPUREN_ANCHORS: Record<string, NormPoint> = {
  entry_threshold: { x: 0.16, y: 0.84 },
  candle_field:    { x: 0.36, y: 0.58 },
  stone_bed:       { x: 0.52, y: 0.72 },
  water_edge:      { x: 0.62, y: 0.50 },
  exit_glow:       { x: 0.82, y: 0.18 },
};

export function denormalize(p: NormPoint, w: number, h: number) {
  return { x: p.x * w, y: p.y * h };
}
