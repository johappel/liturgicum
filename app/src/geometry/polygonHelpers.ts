import type { NormPoint } from "../scene/layout";
import { clamp } from "../common/mathUtils";

/**
 * Geometrie-Helfer für normierte Polygone (Koordinaten 0..1).
 *
 * Genutzt von Räumen (Treffer-/Platzierungs-Tests) und dem Polygon-Debug-Editor.
 * Frei von Pixi-/DOM-Abhängigkeiten.
 */

/** Point-in-Polygon-Test (Ray-Casting) für normierte Koordinaten. */
export function pointInNormPolygon(x: number, y: number, poly: NormPoint[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i].x;
    const yi = poly[i].y;
    const xj = poly[j].x;
    const yj = poly[j].y;
    const intersects = ((yi > y) !== (yj > y))
      && (x < ((xj - xi) * (y - yi)) / ((yj - yi) || 1e-9) + xi);
    if (intersects) inside = !inside;
  }
  return inside;
}

/** True, wenn (x, y) in mindestens einem der Polygone liegt. */
export function pointInAnyNormPolygon(x: number, y: number, polys: NormPoint[][]): boolean {
  for (const poly of polys) {
    if (pointInNormPolygon(x, y, poly)) return true;
  }
  return false;
}

/** Zufälliger Punkt innerhalb des Polygons (Rejection-Sampling, Schwerpunkt-Fallback). */
export function randomPointInPoly(poly: NormPoint[]): NormPoint {
  const xs = poly.map((p) => p.x);
  const ys = poly.map((p) => p.y);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  for (let i = 0; i < 40; i++) {
    const x = minX + Math.random() * (maxX - minX);
    const y = minY + Math.random() * (maxY - minY);
    if (pointInNormPolygon(x, y, poly)) return { x, y };
  }

  const sx = poly.reduce((sum, p) => sum + p.x, 0) / poly.length;
  const sy = poly.reduce((sum, p) => sum + p.y, 0) / poly.length;
  return { x: sx, y: sy };
}

/** Zufälliger Punkt in einem zufällig gewählten der übergebenen Polygone. */
export function randomPointInAnyPoly(polys: NormPoint[][]): NormPoint {
  if (polys.length === 0) return { x: 0.5, y: 0.5 };
  const poly = polys[Math.floor(Math.random() * polys.length)];
  return randomPointInPoly(poly);
}

/**
 * Punkt in der Nähe von `base` innerhalb des Polygons, optional unter Aussparung
 * eines blockierten Bereichs (z. B. Wasser). Fällt auf `base` zurück.
 */
export function randomNearbyPointInPoly(
  poly: NormPoint[],
  base: NormPoint,
  maxOffset: number,
  blockedPoly?: NormPoint[],
): NormPoint {
  for (let i = 0; i < 30; i++) {
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.random() * maxOffset;
    const x = base.x + Math.cos(angle) * dist;
    const y = base.y + Math.sin(angle) * dist * 0.6;
    if (pointInNormPolygon(x, y, poly) && !(blockedPoly && pointInNormPolygon(x, y, blockedPoly))) {
      return { x, y };
    }
  }
  return base;
}

/** Index des zu `p` nächstgelegenen Vertex. */
export function nearestVertexIndex(p: NormPoint, poly: NormPoint[]): number {
  let idx = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < poly.length; i++) {
    const d = Math.hypot(poly[i].x - p.x, poly[i].y - p.y);
    if (d < bestDist) {
      bestDist = d;
      idx = i;
    }
  }
  return idx;
}

/** Fügt `p` auf der nächstgelegenen Polygon-Kante ein (Debug-Editor). */
export function insertPointOnNearestEdge(poly: NormPoint[], p: NormPoint): void {
  if (poly.length < 2) {
    poly.push({ ...p });
    return;
  }
  let bestEdgeStart = 0;
  let bestDist = Number.POSITIVE_INFINITY;
  for (let i = 0; i < poly.length; i++) {
    const j = (i + 1) % poly.length;
    const d = distancePointToSegment(p, poly[i], poly[j]);
    if (d < bestDist) {
      bestDist = d;
      bestEdgeStart = i;
    }
  }
  poly.splice(bestEdgeStart + 1, 0, { ...p });
}

/** Verdoppelt die Vertex-Zahl durch Kanten-Mittelpunkte (Midpoint-Subdivision). */
export function subdividePoly(poly: NormPoint[]): void {
  if (poly.length < 3) return;
  const out: NormPoint[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    out.push(a);
    out.push({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });
  }
  poly.length = 0;
  poly.push(...out);
}

/** Kürzester Abstand von Punkt `p` zum Segment a→b. */
export function distancePointToSegment(p: NormPoint, a: NormPoint, b: NormPoint): number {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const apx = p.x - a.x;
  const apy = p.y - a.y;
  const ab2 = abx * abx + aby * aby;
  if (ab2 === 0) return Math.hypot(apx, apy);
  const t = clamp((apx * abx + apy * aby) / ab2, 0, 1);
  const qx = a.x + abx * t;
  const qy = a.y + aby * t;
  return Math.hypot(p.x - qx, p.y - qy);
}

/** Achsenparalleles Rechteck-Polygon um `center`, auf [0,1] geklemmt. */
export function createRectPolyAround(center: NormPoint, halfWidth: number, halfHeight: number): NormPoint[] {
  return [
    { x: clamp(center.x - halfWidth, 0, 1), y: clamp(center.y - halfHeight, 0, 1) },
    { x: clamp(center.x + halfWidth, 0, 1), y: clamp(center.y - halfHeight, 0, 1) },
    { x: clamp(center.x + halfWidth, 0, 1), y: clamp(center.y + halfHeight, 0, 1) },
    { x: clamp(center.x - halfWidth, 0, 1), y: clamp(center.y + halfHeight, 0, 1) },
  ];
}
