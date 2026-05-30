import { create } from "zustand";

/** Ein lokal abgelegtes Spur-Element (Kerze, Stein, Silhouette). */
export interface LocalTrace {
  id: string;
  kind: "candle" | "stone" | "silhouette";
  /** Normalisierte Position (0..1). */
  x: number;
  y: number;
  /** Restlebensdauer in Sekunden; null = ohne Verfall. */
  ttlSeconds: number | null;
  /** Schöpfungs-Zeitstempel in ms. */
  createdAt: number;
}

export interface PlacedArtifact {
  id: string;
  kind: "candle" | "stone";
  x: number;
  y: number;
  alpha: number;
  createdAt: number;
}

export type RoomId = "vorhof" | "spuren" | "hoeren";

interface State {
  /** Aktueller Raum. */
  room: RoomId;
  /** Räume, die schon besucht wurden (für eventuelle Reife). */
  visited: Set<RoomId>;
  /** Räume, deren liturgisches Intro in dieser Session bereits lief. */
  roomIntrosSeen: Set<RoomId>;
  /** Sekunden seit Betreten des aktuellen Raums (vom Scene-Tick erhöht). */
  dwellSeconds: number;
  /** Lokale Spuren des aktuellen Raums. */
  traces: LocalTrace[];
  /** Dauerhaft gesetzte Artefakte im Spuren-Raum. */
  placedArtifacts: PlacedArtifact[];
  /** Audio-Master-Volume 0..1. */
  volume: number;
  /** Globaler Mute. */
  muted: boolean;
  /** Pause friert Partikel + Audio (siehe Interaktions-Spezifikation §12.8). */
  paused: boolean;
  /** OS-`prefers-reduced-motion` zur Laufzeit. */
  reducedMotion: boolean;
}

interface Actions {
  enterRoom: (room: RoomId) => void;
  markRoomIntroSeen: (room: RoomId) => void;
  tickDwell: (deltaSeconds: number) => void;
  addTrace: (t: LocalTrace) => void;
  removeTrace: (id: string) => void;
  addPlacedArtifact: (artifact: PlacedArtifact) => void;
  clearPlacedArtifacts: () => void;
  setVolume: (v: number) => void;
  setMuted: (m: boolean) => void;
  setPaused: (p: boolean) => void;
  setReducedMotion: (r: boolean) => void;
  /** Notausstieg: zurück nach Vorhof. */
  exitRoom: () => void;
}

export const useStore = create<State & Actions>((set) => ({
  room: "vorhof",
  visited: new Set(["vorhof"]),
  roomIntrosSeen: new Set(),
  dwellSeconds: 0,
  traces: [],
  placedArtifacts: [],
  volume: 0.65,
  muted: false,
  paused: false,
  reducedMotion:
    typeof window !== "undefined" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches,

  enterRoom: (room) =>
    set((s) => {
      const visited = new Set(s.visited);
      visited.add(room);
      return { room, visited, dwellSeconds: 0 };
    }),

  markRoomIntroSeen: (room) =>
    set((s) => {
      const roomIntrosSeen = new Set(s.roomIntrosSeen);
      roomIntrosSeen.add(room);
      return { roomIntrosSeen };
    }),

  tickDwell: (delta) =>
    set((s) => (s.paused ? s : { dwellSeconds: s.dwellSeconds + delta })),

  addTrace: (t) => set((s) => ({ traces: [...s.traces, t] })),

  removeTrace: (id) => set((s) => ({ traces: s.traces.filter((x) => x.id !== id) })),

  addPlacedArtifact: (artifact) => set((s) => ({ placedArtifacts: [...s.placedArtifacts, artifact] })),
  clearPlacedArtifacts: () => set({ placedArtifacts: [] }),

  setVolume: (v) => set({ volume: Math.max(0, Math.min(1, v)) }),
  setMuted: (m) => set({ muted: m }),
  setPaused: (p) => set({ paused: p }),
  setReducedMotion: (r) => set({ reducedMotion: r }),

  exitRoom: () =>
    set((s) => {
      const visited = new Set(s.visited);
      visited.add("vorhof");
      return { room: "vorhof", visited, dwellSeconds: 0 };
    }),
}));
