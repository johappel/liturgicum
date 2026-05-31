import { escapeHtml } from "../common/mathUtils";

/**
 * Generisches Ankunfts-/Hinweis-Overlay (HTML-Ebene über dem Canvas).
 *
 * Zeigt zeilenweise Text mit CSS-Fade (`.room-intro-overlay`, Klassen
 * `is-visible` / `is-hiding` aus styles.css). Raumunabhängig: Töne und Timing
 * bleiben Sache des aufrufenden Raums.
 */
export class ArrivalOverlay {
  private node: HTMLDivElement | null = null;

  /** `host` liefert das Eltern-Element (i. d. R. der Canvas-Container). */
  constructor(private host: () => HTMLElement) {}

  /** Blendet die übergebenen Zeilen ein (HTML-escaped). */
  show(lines: string[]): void {
    const overlay = this.ensure();
    overlay.classList.remove("is-hiding");
    overlay.classList.add("is-visible");
    overlay.innerHTML = lines.map((line) => `<span>${escapeHtml(line)}</span>`).join("");
  }

  /** Blendet aus; `immediate` entfernt sofort statt mit Fade. */
  hide(immediate = false): void {
    const overlay = this.node;
    if (!overlay) return;
    if (immediate) {
      overlay.remove();
      this.node = null;
      return;
    }
    overlay.classList.add("is-hiding");
    overlay.classList.remove("is-visible");
    window.setTimeout(() => {
      if (this.node === overlay && overlay.classList.contains("is-hiding")) {
        overlay.remove();
        this.node = null;
      }
    }, 1400);
  }

  private ensure(): HTMLDivElement {
    if (this.node) return this.node;
    const overlay = document.createElement("div");
    overlay.className = "room-intro-overlay";
    overlay.setAttribute("aria-live", "polite");
    this.host().appendChild(overlay);
    this.node = overlay;
    return overlay;
  }
}
