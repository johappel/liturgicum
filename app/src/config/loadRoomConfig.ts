import type { RoomConfig } from "./types";

/**
 * Lädt die Raumkonfiguration aus `rooms/<id>/room.config.json` (zur Laufzeit von
 * Vite via publicDir = ../rooms ausgeliefert). Schlägt das Laden fehl, wird der
 * mitgegebene Fallback verwendet, sodass der Raum auch ohne Datei lauffähig bleibt.
 */

const BASE = (import.meta.env.BASE_URL ?? "/").replace(/\/$/, "");

/** Löst einen raum-relativen Asset-Pfad oder eine absolute URL gegen BASE auf. */
export function resolveAsset(roomId: string, pathOrUrl: string): string {
  if (/^https?:\/\//i.test(pathOrUrl) || pathOrUrl.startsWith("data:")) {
    return pathOrUrl;
  }
  const rel = pathOrUrl.replace(/^\//, "");
  return `${BASE}/${roomId}/${rel}`;
}

export async function loadRoomConfig(
  roomId: string,
  fallback: RoomConfig,
): Promise<RoomConfig> {
  try {
    const res = await fetch(`${BASE}/${roomId}/room.config.json`, {
      cache: "no-cache",
    });
    if (!res.ok) return fallback;
    const data = (await res.json()) as RoomConfig;
    if (!data || typeof data !== "object" || data.id !== roomId) return fallback;
    return data;
  } catch {
    return fallback;
  }
}
