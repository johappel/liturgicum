import type { Container } from "pixi.js";
import type { NormPoint } from "./layout";

/** Layer-Reihenfolge des Master-Screens (von hinten nach vorne). */
export type LayerName =
  | "background"
  | "parallax_far"
  | "parallax_mid"
  | "particles_bg"
  | "anchors"
  | "artifacts"
  | "interactions"
  | "particles_fg"
  | "overlay";

export const LAYER_ORDER: LayerName[] = [
  "background",
  "parallax_far",
  "parallax_mid",
  "particles_bg",
  "anchors",
  "artifacts",
  "interactions",
  "particles_fg",
  "overlay",
];

export interface SceneLayers {
  /** Bestehender Pixi-Container je Layer-Name. */
  layers: Record<LayerName, Container>;
}

/** Definition eines Raumankers (immateriell — Hit-Zone + Reaktionen). */
export interface AnchorDef {
  id: string;
  position: NormPoint;
  /** Radius der weichen Hit-Zone in normalisierten Einheiten (0..1, an kürzerer Achse). */
  hitRadius: number;
  /** Welche Geste an diesem Anker erlaubt ist. */
  acceptedGesture: "tap" | "press_release" | "drag_release";
}

/** Artefakt = bewegliches/zustandsbehaftetes Objekt. */
export interface ArtifactDef {
  id: string;
  position: NormPoint;
  spriteKey: string;
  draggable: boolean;
}

export interface RoomDef {
  id: string;
  /** Pfad zum Hintergrundbild relativ zu Vite-Public-Root. */
  backgroundSrc: string;
  anchors: AnchorDef[];
  artifacts: ArtifactDef[];
  /** Zielverweildauer in Sekunden (informativ, nicht angezeigt). */
  targetDwellSeconds: [number, number];
}
