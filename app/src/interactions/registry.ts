/**
 * Deskriptor-Registratur der im Spuren-Prototyp implementierten Interaktionen.
 *
 * Die eigentliche Interaktionslogik lebt (noch) in ConfigRoom. Diese Registry
 * macht die implementierten Interaktionen für ConfigRoom/Dashboard adressierbar
 * und markiert, welche Bibliothekseinträge bereits lauffähig sind.
 */

export interface InteractionDescriptor {
  id: string;
  label: string;
  zoneKind: "tap" | "press_release" | "drag_release";
  /** True, wenn die Interaktion bereits implementiert ist. */
  implemented: boolean;
}

const REGISTRY: Record<string, InteractionDescriptor> = {
  water_rings: { id: "water_rings", label: "Wasserringe erzeugen", zoneKind: "tap", implemented: true },
  place_stone: { id: "place_stone", label: "Stein ablegen", zoneKind: "drag_release", implemented: true },
  light_candle: { id: "light_candle", label: "Kerze anzünden", zoneKind: "drag_release", implemented: true },
};

export function getInteractionDescriptor(id: string): InteractionDescriptor | undefined {
  return REGISTRY[id];
}

export function isInteractionImplemented(id: string): boolean {
  return REGISTRY[id]?.implemented ?? false;
}

export function registeredInteractionIds(): string[] {
  return Object.keys(REGISTRY);
}
