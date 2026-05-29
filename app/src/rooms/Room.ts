import type { Container } from "pixi.js";

/**
 * Gemeinsame Raumschnittstelle für Vorhof / Spuren / Hören.
 * `mount` ist async, weil Räume Texturen laden; `destroy` ist idempotent.
 */
export interface Room {
  mount(): Promise<void>;
  destroy(): void;
}

export interface RoomEnv {
  /** Layer-Container, in die der Raum seinen Inhalt hängt. */
  layerForBackground: Container;
}
