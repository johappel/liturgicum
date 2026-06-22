import type { RoomConfig } from "../config/types";
import type {
  EffectsLibrary,
  GeneralConfig,
  InteractionsLibrary,
  SilhouettesLibrary,
} from "../config/libraryTypes";

async function jsonOrThrow<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let detail = res.statusText;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) detail = body.error;
    } catch {
      /* ignore */
    }
    throw new Error(`${res.status} ${detail}`);
  }
  return (await res.json()) as T;
}

export interface AssetListing {
  background: string[];
  audio: string[];
  artifacts: string[];
  anchors: string[];
}

export type ServiceKey = "sfx" | "tts";
export type GeneratedKind = "sfx" | "tts";

export interface ServiceStatus {
  service: ServiceKey;
  label: string;
  state: "up" | "down" | "loading";
  detail: string;
  url: string;
  dir: string;
  startedAt: string | null;
}

export interface ServicesStatus {
  sfx: ServiceStatus;
  tts: ServiceStatus;
}

export interface GeneratedEntry {
  id: string;
  kind: GeneratedKind;
  createdAt: string;
  requestHash: string;
  title: string;
  source: "moss-sfx" | "openmoss";
  poolFile: string;
  mimeType: string;
  request: Record<string, unknown>;
  translatedPrompt?: string;
}

export interface GenerateSfxPayload {
  mode: "raw" | "scene";
  prompt?: string;
  scene?: string;
  seconds: number;
  numInferenceSteps: number;
  cfgScale: number;
  seed: number;
  format: "wav" | "ogg";
  force?: boolean;
}

export interface GenerateTtsPayload {
  text: string;
  language: string;
  instruction?: string;
  seed?: number;
  force?: boolean;
}

export const api = {
  async listRooms(): Promise<string[]> {
    const data = await jsonOrThrow<{ rooms: string[] }>(await fetch("/api/rooms"));
    return data.rooms;
  },

  async getServicesStatus(): Promise<ServicesStatus> {
    const data = await jsonOrThrow<{ services: ServicesStatus }>(await fetch("/api/services/status"));
    return data.services;
  },

  async startService(service: ServiceKey): Promise<{ ok: boolean; service: ServiceKey; pid?: number }> {
    return jsonOrThrow<{ ok: boolean; service: ServiceKey; pid?: number }>(
      await fetch("/api/services/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service }),
      }),
    );
  },

  async createRoom(id: string, title: string): Promise<{ id: string }> {
    return jsonOrThrow<{ id: string }>(
      await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, title }),
      }),
    );
  },

  async getRoomConfig(id: string): Promise<RoomConfig> {
    return jsonOrThrow<RoomConfig>(await fetch(`/api/rooms/${encodeURIComponent(id)}/config`));
  },

  async saveRoomConfig(id: string, config: RoomConfig): Promise<void> {
    await jsonOrThrow<{ ok: boolean }>(
      await fetch(`/api/rooms/${encodeURIComponent(id)}/config`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      }),
    );
  },

  async getAssets(id: string): Promise<AssetListing> {
    return jsonOrThrow<AssetListing>(await fetch(`/api/rooms/${encodeURIComponent(id)}/assets`));
  },

  async uploadAsset(
    id: string,
    kind: "audio" | "artifacts" | "anchors" | ".",
    filename: string,
    dataBase64: string,
  ): Promise<{ path: string }> {
    return jsonOrThrow<{ path: string }>(
      await fetch(`/api/rooms/${encodeURIComponent(id)}/assets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, filename, dataBase64 }),
      }),
    );
  },

  async generateSfx(roomId: string, payload: GenerateSfxPayload): Promise<{ ok: boolean; reused: boolean; entry: GeneratedEntry }> {
    return jsonOrThrow<{ ok: boolean; reused: boolean; entry: GeneratedEntry }>(
      await fetch(`/api/rooms/${encodeURIComponent(roomId)}/generate/sfx`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
  },

  async generateTts(roomId: string, payload: GenerateTtsPayload): Promise<{ ok: boolean; reused: boolean; entry: GeneratedEntry }> {
    return jsonOrThrow<{ ok: boolean; reused: boolean; entry: GeneratedEntry }>(
      await fetch(`/api/rooms/${encodeURIComponent(roomId)}/generate/tts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
  },

  async listGenerated(kind?: GeneratedKind): Promise<GeneratedEntry[]> {
    const suffix = kind ? `?kind=${encodeURIComponent(kind)}` : "";
    const data = await jsonOrThrow<{ items: GeneratedEntry[] }>(await fetch(`/api/generated${suffix}`));
    return data.items;
  },

  generatedFileUrl(id: string): string {
    return `/api/generated/${encodeURIComponent(id)}/file`;
  },

  async assignGenerated(roomId: string, generatedId: string): Promise<{ ok: boolean; path: string; entry: GeneratedEntry }> {
    return jsonOrThrow<{ ok: boolean; path: string; entry: GeneratedEntry }>(
      await fetch(`/api/rooms/${encodeURIComponent(roomId)}/generated/${encodeURIComponent(generatedId)}/assign`, {
        method: "POST",
      }),
    );
  },

  async getEffects(): Promise<EffectsLibrary> {
    return jsonOrThrow<EffectsLibrary>(await fetch("/api/library/effects"));
  },
  async getInteractions(): Promise<InteractionsLibrary> {
    return jsonOrThrow<InteractionsLibrary>(await fetch("/api/library/interactions"));
  },
  async getSilhouettes(): Promise<SilhouettesLibrary> {
    return jsonOrThrow<SilhouettesLibrary>(await fetch("/api/library/silhouettes"));
  },
  async getGeneral(): Promise<GeneralConfig> {
    return jsonOrThrow<GeneralConfig>(await fetch("/api/library/general"));
  },

  async saveLibrary(
    kind: "effects" | "interactions" | "silhouettes" | "general",
    data: unknown,
  ): Promise<void> {
    await jsonOrThrow<{ ok: boolean }>(
      await fetch(`/api/library/${kind}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    );
  },

  async scaffold(payload: {
    type: "effect" | "interaction";
    name: string;
    description: string;
    params?: unknown;
  }): Promise<{ spec: string; prompt: string }> {
    return jsonOrThrow<{ spec: string; prompt: string }>(
      await fetch("/api/scaffold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }),
    );
  },
};

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}