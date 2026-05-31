import { Container, Graphics } from "pixi.js";
import type { NormPoint } from "../scene/layout";
import { clamp } from "../common/mathUtils";
import {
  insertPointOnNearestEdge,
  nearestVertexIndex,
  subdividePoly,
} from "../geometry/polygonHelpers";

/**
 * Ein editierbarer Zonen-Slot des Polygon-Editors.
 *
 * Einzelzonen liefern aus `polys()` genau ein Polygon; Array-Slots (`array:true`)
 * liefern mehrere und sind über die Zifferntasten 1..N anwählbar.
 */
export interface ZoneSlot {
  /** Kleingeschriebener Hotkey, der diesen Slot aktiviert (z. B. "w"). */
  key: string;
  /** Overlay-Farbe (0xRRGGBB). */
  color: number;
  /** Live-Referenz auf die Polygone dieses Slots. */
  polys(): NormPoint[][];
  /** True, wenn der Slot über 1..N indexierbar ist. */
  array?: boolean;
  /** Stellt (nur für Array-Slots) sicher, dass Index `i` existiert. */
  ensure?(index: number): void;
}

/** Liefert die aktuellen Render-Dimensionen (live). */
export interface EditorDims {
  readonly width: number;
  readonly height: number;
}

interface DragRef {
  slot: number;
  polyIndex: number;
  vertex: number;
}

/**
 * Generischer Polygon-Editor für Debug-Overlays.
 *
 * Kapselt Vertex-Dragging, Hinzufügen/Einfügen/Unterteilen/Löschen von Punkten
 * sowie das Zeichnen mehrerer Zonen-Slots über ein Pixi-`Graphics`-Overlay.
 * Tonfreier, raumunabhängiger Baustein; Räume verdrahten Slots, Maße,
 * Cursor-Position und Export.
 */
export class PolygonZoneEditor {
  private overlay: Graphics | null = null;
  private activeSlot = 0;
  private activeIndex = 0;
  private drag: DragRef | null = null;

  constructor(
    private slots: ZoneSlot[],
    private dims: EditorDims,
    private pointer: () => NormPoint,
    private onExport: () => void,
  ) {}

  /** Hängt das Overlay in die Ziel-Ebene und zeichnet initial. */
  attach(layer: Container): void {
    this.overlay = new Graphics();
    layer.addChild(this.overlay);
    this.draw();
  }

  destroy(): void {
    try { this.overlay?.destroy(); } catch { /* ignore */ }
    this.overlay = null;
  }

  /** Neuzeichnen (z. B. nach Resize). */
  redraw(): void {
    this.draw();
  }

  /** Tastatur-Eingabe; gibt true zurück, wenn die Taste verarbeitet wurde. */
  handleKey(ev: KeyboardEvent): boolean {
    const k = ev.key.toLowerCase();

    const slotByKey = this.slots.findIndex((s) => s.key === k);
    if (slotByKey >= 0) {
      this.activeSlot = slotByKey;
      const slot = this.slots[slotByKey];
      if (slot.array) slot.ensure?.(this.activeIndex);
      this.draw();
      return true;
    }

    if (/^[1-9]$/.test(ev.key)) {
      const arraySlot = this.slots.findIndex((s) => s.array);
      if (arraySlot >= 0) {
        const index = Number(ev.key) - 1;
        if (index < this.slots[arraySlot].polys().length) {
          this.activeSlot = arraySlot;
          this.activeIndex = index;
          this.slots[arraySlot].ensure?.(index);
          this.draw();
          return true;
        }
      }
    }

    if (k === "a") {
      this.activePoly().push({ ...this.pointer() });
      this.draw();
      return true;
    }
    if (k === "n") {
      insertPointOnNearestEdge(this.activePoly(), this.pointer());
      this.draw();
      return true;
    }
    if (k === "m") {
      subdividePoly(this.activePoly());
      this.draw();
      return true;
    }
    if (ev.key === "Backspace" || ev.key === "Delete") {
      const poly = this.activePoly();
      if (poly.length > 3) {
        const idx = nearestVertexIndex(this.pointer(), poly);
        poly.splice(idx, 1);
        this.draw();
      }
      ev.preventDefault();
      return true;
    }
    if (k === "p") {
      this.onExport();
      return true;
    }
    return false;
  }

  /** Greift einen Vertex unter dem Cursor; gibt true bei Treffer zurück. */
  handlePointerDown(x: number, y: number): boolean {
    const hit = this.findVertex(x, y, 14);
    if (hit) {
      this.drag = hit;
      return true;
    }
    return false;
  }

  /** Zieht den gegriffenen Vertex; gibt true zurück, wenn gerade gezogen wird. */
  handlePointerMove(x: number, y: number): boolean {
    if (!this.drag) return false;
    const nx = clamp(x / this.dims.width, 0, 1);
    const ny = clamp(y / this.dims.height, 0, 1);
    const polys = this.slots[this.drag.slot].polys();
    polys[this.drag.polyIndex][this.drag.vertex] = { x: nx, y: ny };
    this.draw();
    return true;
  }

  /** Beendet das Dragging; gibt true zurück, wenn ein Vertex losgelassen wurde. */
  handlePointerUp(): boolean {
    if (!this.drag) return false;
    this.drag = null;
    return true;
  }

  private activePoly(): NormPoint[] {
    const slot = this.slots[this.activeSlot];
    if (slot.array) {
      slot.ensure?.(this.activeIndex);
      return slot.polys()[this.activeIndex];
    }
    return slot.polys()[0];
  }

  private findVertex(x: number, y: number, thresholdPx: number): DragRef | null {
    const activeSlot = this.slots[this.activeSlot];
    const activePolyIndex = activeSlot.array ? this.activeIndex : 0;
    const activeHit = this.findInPoly(this.activePoly(), x, y, thresholdPx);
    if (activeHit != null) {
      return { slot: this.activeSlot, polyIndex: activePolyIndex, vertex: activeHit };
    }
    for (let s = 0; s < this.slots.length; s++) {
      const polys = this.slots[s].polys();
      for (let pi = 0; pi < polys.length; pi++) {
        const v = this.findInPoly(polys[pi], x, y, thresholdPx);
        if (v != null) return { slot: s, polyIndex: pi, vertex: v };
      }
    }
    return null;
  }

  private findInPoly(poly: NormPoint[], x: number, y: number, thresholdPx: number): number | null {
    for (let i = 0; i < poly.length; i++) {
      const px = poly[i].x * this.dims.width;
      const py = poly[i].y * this.dims.height;
      if (Math.hypot(px - x, py - y) <= thresholdPx) return i;
    }
    return null;
  }

  private draw(): void {
    const g = this.overlay;
    if (!g) return;
    g.clear();
    for (let s = 0; s < this.slots.length; s++) {
      const slot = this.slots[s];
      const polys = slot.polys();
      for (let pi = 0; pi < polys.length; pi++) {
        const active = s === this.activeSlot && (slot.array ? pi === this.activeIndex : true);
        drawPolyOverlay(g, this.toPixels(polys[pi]), slot.color, active);
      }
    }
  }

  private toPixels(poly: NormPoint[]): number[] {
    const out: number[] = [];
    for (const p of poly) out.push(p.x * this.dims.width, p.y * this.dims.height);
    return out;
  }
}

/** Zeichnet ein gefülltes Polygon mit Umriss und Vertex-Markern. */
export function drawPolyOverlay(
  g: Graphics,
  points: number[],
  color: number,
  active: boolean,
): void {
  g.poly(points, true).fill({ color, alpha: active ? 0.18 : 0.12 });
  g.poly(points, true).stroke({ color, width: active ? 3 : 2, alpha: 0.9 });
  for (let i = 0; i < points.length; i += 2) {
    g.circle(points[i], points[i + 1], active ? 7 : 5).fill({ color, alpha: 0.95 });
  }
}
