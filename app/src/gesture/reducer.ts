/**
 * 5-Phasen-Gestenzyklus aus docs/Interaktions-Spezifikation.md:
 *   idle → reveal → claim → carry → offer → resonance | reverted → idle
 *
 * Eingaben (events):
 *   - hover_enter / hover_leave   (Pointer-Nähe an einer Hit-Zone)
 *   - press                       (Pointer-Down auf einem Anker/Artefakt)
 *   - move                        (Pointer-Move während press, nur für drag_release)
 *   - release                     (Pointer-Up — innerhalb oder außerhalb gültiger Zone)
 *   - cancel                      (Pointer-Cancel, Esc, oder Notausstieg)
 *   - resonance_done              (Resonanz-Animation abgespielt)
 *
 * Diese Maschine ist absichtlich klein und reine TS — testbar mit Vitest.
 * Sie kennt **keinen** mousemove-Tracking-Zustand für „Verweildauer";
 * Verweildauer wird separat über Timer im Store gehandhabt.
 */

export type GesturePhase =
  | "idle"
  | "reveal"
  | "claim"
  | "carry"
  | "offer"
  | "resonance"
  | "reverted";

export type GestureEvent =
  | { type: "hover_enter" }
  | { type: "hover_leave" }
  | { type: "press" }
  | { type: "move" }
  | { type: "release"; insideValidZone: boolean }
  | { type: "cancel" }
  | { type: "resonance_done" };

export type AnchorKind = "tap" | "press_release" | "drag_release";

export interface GestureState {
  phase: GesturePhase;
  /** Wurde während eines press tatsächlich bewegt? Für drag-Erkennung. */
  hasMoved: boolean;
  /** Welche Gestenform der aktuelle Anker akzeptiert. */
  kind: AnchorKind;
}

export const INITIAL: GestureState = {
  phase: "idle",
  hasMoved: false,
  kind: "tap",
};

export function reduce(state: GestureState, event: GestureEvent): GestureState {
  // Notbremse: cancel beendet jede Phase würdevoll.
  if (event.type === "cancel") {
    return { ...state, phase: "reverted", hasMoved: false };
  }

  switch (state.phase) {
    case "idle":
      if (event.type === "hover_enter") return { ...state, phase: "reveal" };
      if (event.type === "press") return { ...state, phase: "claim", hasMoved: false };
      return state;

    case "reveal":
      if (event.type === "hover_leave") return { ...state, phase: "idle" };
      if (event.type === "press") return { ...state, phase: "claim", hasMoved: false };
      return state;

    case "claim":
      if (event.type === "move" && state.kind === "drag_release") {
        return { ...state, phase: "carry", hasMoved: true };
      }
      if (event.type === "release") {
        // tap und press_release münden direkt in offer/resonance bei gültiger Zone.
        if (state.kind === "drag_release" && !state.hasMoved) {
          // Press ohne Bewegung auf drag-Anker → Geste reverted (kein Stein „getragen").
          return { ...state, phase: "reverted", hasMoved: false };
        }
        if (event.insideValidZone) return { ...state, phase: "offer" };
        return { ...state, phase: "reverted", hasMoved: false };
      }
      return state;

    case "carry":
      if (event.type === "move") return { ...state, hasMoved: true };
      if (event.type === "release") {
        return event.insideValidZone
          ? { ...state, phase: "offer" }
          : { ...state, phase: "reverted", hasMoved: false };
      }
      return state;

    case "offer":
      // Übergang nach Resonance erfolgt automatisch durch die Effekt-Pipeline.
      // Hier akzeptieren wir nur das resonance_done-Signal oder einen direkten Sprung.
      if (event.type === "resonance_done") return { ...state, phase: "idle" };
      // Fallback: nach kurzer Pause selbst nach resonance wechseln (vom Aufrufer angestoßen).
      return { ...state, phase: "resonance" };

    case "resonance":
      if (event.type === "resonance_done") return { ...state, phase: "idle", hasMoved: false };
      return state;

    case "reverted":
      // Reverted ist ein Übergangsphase; nach Animation zurück nach idle.
      if (event.type === "resonance_done") return { ...state, phase: "idle", hasMoved: false };
      if (event.type === "hover_leave") return { ...state, phase: "idle", hasMoved: false };
      return state;
  }
}
