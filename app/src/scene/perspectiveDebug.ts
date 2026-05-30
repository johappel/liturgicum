import type { Graphics } from "pixi.js";
import type { NormPoint } from "./layout";

export type PerspectiveHandle = "vanishing" | "reference";

export interface GroundPerspectiveConfig {
  vanishingPoint: NormPoint;
  referencePoint: NormPoint;
  minScale: number;
  nearScale: number;
}

export interface PerspectiveDebugColors {
  line: number;
  vanishing: number;
  reference: number;
}

export function perspectiveGroundScaleAtPoint(
  x: number,
  y: number,
  sceneWidth: number,
  sceneHeight: number,
  perspective: GroundPerspectiveConfig,
): number {
  const nx = x / Math.max(sceneWidth, 1);
  const ny = y / Math.max(sceneHeight, 1);

  const vx = perspective.vanishingPoint.x;
  const vy = perspective.vanishingPoint.y;
  const rx = perspective.referencePoint.x - vx;
  const ry = perspective.referencePoint.y - vy;
  const px = nx - vx;
  const py = ny - vy;

  const denom = rx * rx + ry * ry || 1e-9;
  const depth = clamp((px * rx + py * ry) / denom, 0, 1.1);
  return perspective.minScale + depth * (perspective.nearScale - perspective.minScale);
}

export function findPerspectiveHandleAtPixel(
  perspective: GroundPerspectiveConfig,
  sceneWidth: number,
  sceneHeight: number,
  x: number,
  y: number,
  thresholdPx: number,
): PerspectiveHandle | null {
  const vx = perspective.vanishingPoint.x * sceneWidth;
  const vy = perspective.vanishingPoint.y * sceneHeight;
  if (Math.hypot(vx - x, vy - y) <= thresholdPx) return "vanishing";

  const rx = perspective.referencePoint.x * sceneWidth;
  const ry = perspective.referencePoint.y * sceneHeight;
  if (Math.hypot(rx - x, ry - y) <= thresholdPx) return "reference";
  return null;
}

export function setPerspectiveHandlePoint(
  perspective: GroundPerspectiveConfig,
  handle: PerspectiveHandle,
  point: NormPoint,
): void {
  const next = {
    x: clamp(point.x, 0, 1),
    y: clamp(point.y, 0, 1),
  };
  if (handle === "vanishing") perspective.vanishingPoint = next;
  else perspective.referencePoint = next;
}

export function nudgePerspectiveHandle(
  perspective: GroundPerspectiveConfig,
  handle: PerspectiveHandle,
  dx: number,
  dy: number,
): void {
  const source = handle === "vanishing" ? perspective.vanishingPoint : perspective.referencePoint;
  setPerspectiveHandlePoint(perspective, handle, {
    x: source.x + dx,
    y: source.y + dy,
  });
}

export function drawPerspectiveDebugOverlay(
  g: Graphics,
  sceneWidth: number,
  sceneHeight: number,
  perspective: GroundPerspectiveConfig,
  activeHandle: PerspectiveHandle,
  colors: PerspectiveDebugColors,
): void {
  g.clear();

  const vx = perspective.vanishingPoint.x * sceneWidth;
  const vy = perspective.vanishingPoint.y * sceneHeight;
  const rx = perspective.referencePoint.x * sceneWidth;
  const ry = perspective.referencePoint.y * sceneHeight;

  g.moveTo(vx, vy).lineTo(rx, ry).stroke({ color: colors.line, alpha: 0.55, width: 2 });
  g.circle(vx, vy, activeHandle === "vanishing" ? 11 : 8)
    .fill({ color: colors.vanishing, alpha: 0.95 });
  g.circle(rx, ry, activeHandle === "reference" ? 11 : 8)
    .fill({ color: colors.reference, alpha: 0.95 });
}

export function exportPerspectiveConfigConst(
  perspective: GroundPerspectiveConfig,
  constName = "GROUND_PERSPECTIVE",
): string {
  return [
    `const ${constName} = {`,
    `  vanishingPoint: ${JSON.stringify(perspective.vanishingPoint)},`,
    `  referencePoint: ${JSON.stringify(perspective.referencePoint)},`,
    `  minScale: ${perspective.minScale},`,
    `  nearScale: ${perspective.nearScale},`,
    "};",
  ].join("\n");
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
