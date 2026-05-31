/**
 * Kanonische Standard-Zonen, die in (fast) jedem Raum gebraucht werden.
 *
 * Diese Namen sind die einzige Quelle der Wahrheit für die wiederkehrenden
 * Klick-/Bodenbereiche. Das Dashboard legt sie für neue Räume vor, der
 * Laufzeit-Renderer (ConfigRoom) liest sie unter exakt diesen Namen aus.
 */

export interface StandardZoneSpec {
  /** Zonenname (Schlüssel in RoomConfig.zones). */
  name: string;
  /** Anzeigename im Dashboard. */
  label: string;
  /** Wozu die Zone dient. */
  hint: string;
}

/** Immer sinnvolle Grund-Zonen: Navigation, Boden, Wasser. */
export const STANDARD_ROOM_ZONES: StandardZoneSpec[] = [
  {
    name: "backAction",
    label: "Zurück (Portal)",
    hint: "Klickbereich, der zurück in den vorigen Raum führt.",
  },
  {
    name: "forwardGate",
    label: "Weiter (Portal)",
    hint: "Klickbereich, der in den nächsten Raum portet.",
  },
  {
    name: "presenceFloor",
    label: "Boden (Silhouetten)",
    hint: "Bodenfläche, auf der Silhouetten erscheinen (wandeln, knien, sitzen).",
  },
  {
    name: "water",
    label: "Wasser",
    hint: "Wasserfläche – u. a. Quelle für Wasserringe.",
  },
];

export const STANDARD_ROOM_ZONE_NAMES = STANDARD_ROOM_ZONES.map((z) => z.name);

/** Leere Default-Zonen (ein leeres Polygon je Zone) für einen neuen Raum. */
export function makeStandardZones(): Record<string, { polygons: { x: number; y: number }[][] }> {
  const zones: Record<string, { polygons: { x: number; y: number }[][] }> = {};
  for (const z of STANDARD_ROOM_ZONES) zones[z.name] = { polygons: [[]] };
  return zones;
}
