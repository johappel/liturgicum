import { describe, expect, it } from "vitest";
import { INITIAL, reduce, type GestureState } from "../src/gesture/reducer";

describe("gesture reducer", () => {
  it("Glücklichpfad tap: idle → reveal → claim → offer → resonance → idle", () => {
    let s: GestureState = { ...INITIAL, kind: "tap" };
    s = reduce(s, { type: "hover_enter" });
    expect(s.phase).toBe("reveal");
    s = reduce(s, { type: "press" });
    expect(s.phase).toBe("claim");
    s = reduce(s, { type: "release", insideValidZone: true });
    expect(s.phase).toBe("offer");
    s = reduce(s, { type: "resonance_done" });
    expect(s.phase).toBe("idle");
  });

  it("Glücklichpfad drag_release: idle → reveal → claim → carry → offer → resonance", () => {
    let s: GestureState = { ...INITIAL, kind: "drag_release" };
    s = reduce(s, { type: "hover_enter" });
    s = reduce(s, { type: "press" });
    expect(s.phase).toBe("claim");
    s = reduce(s, { type: "move" });
    expect(s.phase).toBe("carry");
    s = reduce(s, { type: "move" });
    expect(s.hasMoved).toBe(true);
    s = reduce(s, { type: "release", insideValidZone: true });
    expect(s.phase).toBe("offer");
  });

  it("Revert bei drag-release außerhalb gültiger Zone", () => {
    let s: GestureState = { ...INITIAL, kind: "drag_release" };
    s = reduce(s, { type: "press" });
    s = reduce(s, { type: "move" });
    s = reduce(s, { type: "release", insideValidZone: false });
    expect(s.phase).toBe("reverted");
  });

  it("Revert bei drag-Anker, wenn nur gedrückt aber nicht gezogen", () => {
    let s: GestureState = { ...INITIAL, kind: "drag_release" };
    s = reduce(s, { type: "press" });
    s = reduce(s, { type: "release", insideValidZone: true });
    expect(s.phase).toBe("reverted");
  });

  it("cancel beendet aus jeder Phase würdevoll mit reverted", () => {
    let s: GestureState = { ...INITIAL, kind: "drag_release" };
    s = reduce(s, { type: "press" });
    s = reduce(s, { type: "move" });
    s = reduce(s, { type: "cancel" });
    expect(s.phase).toBe("reverted");
    expect(s.hasMoved).toBe(false);
  });

  it("hover_leave aus reveal führt zurück nach idle", () => {
    let s: GestureState = { ...INITIAL };
    s = reduce(s, { type: "hover_enter" });
    s = reduce(s, { type: "hover_leave" });
    expect(s.phase).toBe("idle");
  });
});
