/**
 * Allgemeine, raumunabhängige Mathematik- und String-Helfer.
 *
 * Bewusst frei von Pixi-/DOM-Abhängigkeiten, damit sie überall (inkl. Tests)
 * importiert werden können.
 */

/** Begrenzt `value` auf das Intervall [min, max]. */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/** Smoothstep-Easing (3t² − 2t³) für weiche Tiefen-/Alpha-Verläufe. */
export function smoothstep(value: number): number {
  return value * value * (3 - 2 * value);
}

/** Zufallswert im halboffenen Intervall [min, max). */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Liefert −1 oder +1 zum zufälligen horizontalen Spiegeln von Sprites. */
export function randomHorizontalMirror(): 1 | -1 {
  return Math.random() < 0.5 ? -1 : 1;
}

/** Escaped die fünf HTML-kritischen Zeichen für sicheres Overlay-Markup. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
