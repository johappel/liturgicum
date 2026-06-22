import { promises as fs } from "node:fs";
import { createHash } from "node:crypto";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOMS_DIR = path.resolve(here, "..", "rooms");
const LIBRARY_DIR = path.join(ROOMS_DIR, "_library");
const RECIPES_DIR = path.resolve(here, "..", "tools", "recipes");
const GENERATED_DIR = path.join(LIBRARY_DIR, "_generated");
const GENERATED_INDEX_PATH = path.join(LIBRARY_DIR, "generated.json");

const MOSS_SFX_DIR = process.env.MOSS_SFX_DIR || "F:/code/moss-sfx";
const OPENMOSS_DIR = process.env.OPENMOSS_DIR || "F:/code/openmoss";
const MOSS_SFX_URL = (process.env.MOSS_SFX_URL || "http://127.0.0.1:8765").replace(/\/$/, "");
const OPENMOSS_URL = (process.env.OPENMOSS_URL || "http://127.0.0.1:8080").replace(/\/$/, "");

const SAFE_SEGMENT = /^[a-z0-9][a-z0-9_-]*$/i;
const SAFE_FILENAME = /^[a-z0-9][a-z0-9_.-]*$/i;
const LIBRARY_KINDS = new Set(["effects", "interactions", "silhouettes", "general"]);
const ASSET_KINDS = new Set(["audio", "artifacts", "anchors", "."]);
const GENERATED_KINDS = new Set(["sfx", "tts"]);

type ServiceKey = "sfx" | "tts";
type GeneratedKind = "sfx" | "tts";

interface ServiceInfo {
  key: ServiceKey;
  label: string;
  dir: string;
  url: string;
  startScript: string;
  probePath: string;
}

interface GeneratedEntry {
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

interface GeneratedCatalog {
  version: number;
  items: GeneratedEntry[];
}

const SERVICES: Record<ServiceKey, ServiceInfo> = {
  sfx: {
    key: "sfx",
    label: "moss-sfx",
    dir: MOSS_SFX_DIR,
    url: MOSS_SFX_URL,
    startScript: "run.bat",
    probePath: "/health",
  },
  tts: {
    key: "tts",
    label: "openmoss",
    dir: OPENMOSS_DIR,
    url: OPENMOSS_URL,
    startScript: "start-openmoss.bat",
    probePath: "/",
  },
};

const serviceStartTimes = new Map<ServiceKey, number>();

function isSafeSegment(seg: string): boolean {
  return SAFE_SEGMENT.test(seg) && !seg.includes("..");
}

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  const payload = JSON.stringify(body);
  res.statusCode = status;
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.end(payload);
}

function sendBinary(res: ServerResponse, status: number, contentType: string, body: Buffer): void {
  res.statusCode = status;
  res.setHeader("Content-Type", contentType);
  res.setHeader("Cache-Control", "no-store");
  res.end(body);
}

async function readBody(req: IncomingMessage, limitBytes = 25 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => {
      size += chunk.length;
      if (size > limitBytes) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

async function pathExists(filePath: string): Promise<boolean> {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

function normalizeKind(value: string | null): GeneratedKind | null {
  return value === "sfx" || value === "tts" ? value : null;
}

function sanitizeStem(value: string, fallback: string): string {
  const stem = value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return stem || fallback;
}

function trimLabel(value: string, max = 72): string {
  const clean = value.replace(/\s+/g, " ").trim();
  return clean.length <= max ? clean : clean.slice(0, max - 1).trimEnd() + "...";
}

function buildRequestHash(kind: GeneratedKind, payload: unknown): string {
  return createHash("sha256")
    .update(kind)
    .update("\n")
    .update(JSON.stringify(payload))
    .digest("hex");
}

function extensionFromContentType(contentType: string | null, fallback: string): string {
  if (!contentType) return fallback;
  if (contentType.includes("audio/ogg")) return ".ogg";
  if (contentType.includes("audio/mpeg")) return ".mp3";
  if (contentType.includes("audio/wav") || contentType.includes("audio/x-wav")) return ".wav";
  return fallback;
}

function contentTypeFromExtension(ext: string): string {
  switch (ext.toLowerCase()) {
    case ".ogg":
      return "audio/ogg";
    case ".mp3":
      return "audio/mpeg";
    default:
      return "audio/wav";
  }
}

function nextGeneratedId(kind: GeneratedKind): string {
  return `${kind}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getQuery(req: IncomingMessage): URLSearchParams {
  return new URL(req.url ?? "/", "http://127.0.0.1").searchParams;
}

async function ensureGeneratedStorage(): Promise<void> {
  await fs.mkdir(LIBRARY_DIR, { recursive: true });
  await fs.mkdir(GENERATED_DIR, { recursive: true });
}

async function readGeneratedCatalog(): Promise<GeneratedCatalog> {
  await ensureGeneratedStorage();
  if (!(await pathExists(GENERATED_INDEX_PATH))) {
    return { version: 1, items: [] };
  }
  try {
    const parsed = JSON.parse(await fs.readFile(GENERATED_INDEX_PATH, "utf-8")) as GeneratedCatalog;
    return {
      version: 1,
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return { version: 1, items: [] };
  }
}

async function writeGeneratedCatalog(catalog: GeneratedCatalog): Promise<void> {
  await ensureGeneratedStorage();
  await fs.writeFile(GENERATED_INDEX_PATH, JSON.stringify(catalog, null, 2) + "\n", "utf-8");
}

async function findGeneratedEntry(id: string): Promise<GeneratedEntry | null> {
  const catalog = await readGeneratedCatalog();
  return catalog.items.find((item) => item.id === id) ?? null;
}

async function uniqueFilename(dir: string, stem: string, ext: string): Promise<string> {
  let index = 0;
  while (true) {
    const suffix = index === 0 ? "" : `-${index + 1}`;
    const filename = `${stem}${suffix}${ext}`;
    if (!(await pathExists(path.join(dir, filename)))) return filename;
    index += 1;
  }
}

async function storeGeneratedEntry(input: {
  kind: GeneratedKind;
  source: "moss-sfx" | "openmoss";
  title: string;
  requestHash: string;
  request: Record<string, unknown>;
  buffer: Buffer;
  mimeType: string;
  translatedPrompt?: string;
}): Promise<GeneratedEntry> {
  await ensureGeneratedStorage();
  const id = nextGeneratedId(input.kind);
  const ext = extensionFromContentType(input.mimeType, input.kind === "sfx" ? ".ogg" : ".wav");
  const stem = sanitizeStem(input.title, id);
  const poolFile = await uniqueFilename(GENERATED_DIR, `${id}-${stem}`, ext);
  await fs.writeFile(path.join(GENERATED_DIR, poolFile), input.buffer);

  const entry: GeneratedEntry = {
    id,
    kind: input.kind,
    createdAt: new Date().toISOString(),
    requestHash: input.requestHash,
    title: input.title,
    source: input.source,
    poolFile,
    mimeType: input.mimeType || contentTypeFromExtension(ext),
    request: input.request,
    translatedPrompt: input.translatedPrompt,
  };

  const catalog = await readGeneratedCatalog();
  catalog.items.unshift(entry);
  await writeGeneratedCatalog(catalog);
  return entry;
}

async function assignGeneratedToRoom(roomId: string, entry: GeneratedEntry): Promise<string> {
  const roomAudioDir = path.join(ROOMS_DIR, roomId, "audio");
  const ext = path.extname(entry.poolFile) || extensionFromContentType(entry.mimeType, ".wav");
  const stem = sanitizeStem(entry.title, entry.id);
  const filename = await uniqueFilename(roomAudioDir, stem, ext);
  await fs.mkdir(roomAudioDir, { recursive: true });
  await fs.copyFile(path.join(GENERATED_DIR, entry.poolFile), path.join(roomAudioDir, filename));
  await updateMeta(roomId, `audio/${filename}`, `dashboard-generated:${entry.id}`);
  return `audio/${filename}`;
}

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 2000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

async function proxyBinary(url: string, payload: unknown, timeoutMs = 240000): Promise<{ buffer: Buffer; response: Response }> {
  const response = await fetchWithTimeout(
    url,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
    timeoutMs,
  );
  if (!response.ok) {
    const detail = await response.text().catch(() => response.statusText);
    throw new Error(`${response.status} ${detail || response.statusText}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return { buffer, response };
}

async function fetchServiceStatus(service: ServiceKey): Promise<Record<string, unknown>> {
  const info = SERVICES[service];
  let state: "up" | "down" | "loading" = "down";
  let detail = "nicht erreichbar";
  try {
    const res = await fetchWithTimeout(`${info.url}${info.probePath}`, { method: "GET" });
    if (res.ok) {
      state = "up";
      detail = "bereit";
    } else {
      detail = `${res.status} ${res.statusText}`;
    }
  } catch (error) {
    detail = error instanceof Error ? error.message : String(error);
  }
  const startedAt = serviceStartTimes.get(service);
  if (state === "down" && startedAt && Date.now() - startedAt < 120000) {
    state = "loading";
    detail = "Startsignal gesendet, warte auf Dienst";
  }
  return {
    service,
    label: info.label,
    state,
    detail,
    url: info.url,
    dir: info.dir,
    startedAt: startedAt ? new Date(startedAt).toISOString() : null,
  };
}

async function startService(service: ServiceKey): Promise<{ ok: true; service: ServiceKey; pid: number | undefined }> {
  const info = SERVICES[service];
  const scriptPath = path.join(info.dir, info.startScript);
  if (!(await pathExists(scriptPath))) {
    throw new Error(`Startskript fehlt: ${scriptPath}`);
  }
  const child = spawn("cmd.exe", ["/c", info.startScript], {
    cwd: info.dir,
    detached: true,
    stdio: "ignore",
    windowsHide: true,
  });
  child.unref();
  serviceStartTimes.set(service, Date.now());
  return { ok: true, service, pid: child.pid };
}

async function detectBackground(roomId: string): Promise<string> {
  const dir = path.join(ROOMS_DIR, roomId);
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const bg = entries.find((entry) => entry.isFile() && /^background.*\.(png|jpe?g|webp)$/i.test(entry.name));
  return bg?.name ?? "background.png";
}

function defaultRoomConfig(id: string, title: string, background: string): unknown {
  return {
    $schema: "../_schema/room.config.schema.json",
    version: 1,
    id,
    title: title || id,
    background,
    ambient: [],
    effects: [],
    interactions: [],
    zones: {
      backAction: { polygons: [[]] },
      forwardGate: { polygons: [[]] },
      presenceFloor: { polygons: [[]] },
      water: { polygons: [[]] },
    },
    perspective: {
      vanishingPoint: { x: 0.5, y: 0.4 },
      referencePoint: { x: 0.5, y: 0.92 },
      minScale: 0.05,
      nearScale: 0.9,
    },
    presence: {
      enabled: false,
      maxSpawns: 0,
      firstDelayMsMin: 20000,
      firstDelayMsMax: 30000,
      kinds: [],
      maxForeignTraceArtifacts: 0,
    },
    randomEvents: [],
    intro: { enabled: false, durationMs: 12000, lines: [] },
    speaker: { enabled: false, fallbackMs: 120000 },
    dwellGate: { minDwellSeconds: 45, exitHint: "" },
  };
}

async function listRooms(): Promise<string[]> {
  const entries = await fs.readdir(ROOMS_DIR, { withFileTypes: true });
  const rooms: string[] = [];
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const dir = path.join(ROOMS_DIR, entry.name);
    if (
      (await pathExists(path.join(dir, "room.config.json"))) ||
      (await pathExists(path.join(dir, "background.png")))
    ) {
      rooms.push(entry.name);
    }
  }
  return rooms.sort();
}

async function listAssets(roomId: string): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = { background: [], audio: [], artifacts: [], anchors: [] };
  const dir = path.join(ROOMS_DIR, roomId);
  const topLevel = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const entry of topLevel) {
    if (entry.isFile() && /^background.*\.(png|jpe?g|webp)$/i.test(entry.name)) out.background.push(entry.name);
  }
  for (const sub of ["audio", "artifacts", "anchors"]) {
    const subDir = path.join(dir, sub);
    const files = await fs.readdir(subDir).catch(() => [] as string[]);
    out[sub] = files.filter((file) => !file.startsWith("."));
  }
  return out;
}

async function updateMeta(roomId: string, relKey: string, source: string): Promise<void> {
  const metaPath = path.join(ROOMS_DIR, roomId, "meta.json");
  let meta: Record<string, unknown> = {};
  if (await pathExists(metaPath)) {
    try {
      meta = JSON.parse(await fs.readFile(metaPath, "utf-8")) as Record<string, unknown>;
    } catch {
      meta = {};
    }
  }
  meta[relKey] = {
    source,
    uploaded_at: new Date().toISOString(),
    via: "dashboard",
  };
  await fs.writeFile(metaPath, JSON.stringify(meta, null, 2) + "\n", "utf-8");
}

interface Route {
  method: string;
  pattern: RegExp;
  handle: (req: IncomingMessage, res: ServerResponse, match: RegExpMatchArray) => Promise<void>;
}

const routes: Route[] = [
  {
    method: "GET",
    pattern: /^\/api\/services\/status$/,
    handle: async (_req, res) => {
      const [sfx, tts] = await Promise.all([fetchServiceStatus("sfx"), fetchServiceStatus("tts")]);
      sendJson(res, 200, { services: { sfx, tts } });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/services\/start$/,
    handle: async (req, res) => {
      const body = await readBody(req, 64 * 1024);
      let payload: { service?: string };
      try {
        payload = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      const service = payload.service === "sfx" || payload.service === "tts" ? payload.service : null;
      if (!service) return sendJson(res, 400, { error: "invalid service" });
      try {
        sendJson(res, 200, await startService(service));
      } catch (error) {
        sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
      }
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/rooms$/,
    handle: async (_req, res) => {
      sendJson(res, 200, { rooms: await listRooms() });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/rooms$/,
    handle: async (req, res) => {
      const body = await readBody(req);
      let payload: { id?: string; title?: string };
      try {
        payload = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      const id = (payload.id ?? "").trim();
      if (!isSafeSegment(id)) {
        return sendJson(res, 400, { error: "invalid id (use a-z, 0-9, _-)" });
      }
      const dir = path.join(ROOMS_DIR, id);
      const cfgPath = path.join(dir, "room.config.json");
      if (await pathExists(cfgPath)) {
        return sendJson(res, 409, { error: "room already exists" });
      }
      await fs.mkdir(path.join(dir, "audio"), { recursive: true });
      await fs.mkdir(path.join(dir, "artifacts"), { recursive: true });
      const cfg = defaultRoomConfig(id, payload.title ?? id, await detectBackground(id));
      await fs.writeFile(cfgPath, JSON.stringify(cfg, null, 2) + "\n", "utf-8");
      sendJson(res, 200, { ok: true, id, config: cfg });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/rooms\/([^/]+)\/generate\/sfx$/,
    handle: async (_req, res) => {
      sendJson(res, 405, { error: "use POST" });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/rooms\/([^/]+)\/generate\/sfx$/,
    handle: async (req, res, match) => {
      const roomId = decodeURIComponent(match[1]);
      if (!isSafeSegment(roomId)) return sendJson(res, 400, { error: "invalid id" });
      const body = await readBody(req, 512 * 1024);
      let payload: {
        mode?: string;
        prompt?: string;
        scene?: string;
        seconds?: number;
        numInferenceSteps?: number;
        cfgScale?: number;
        seed?: number;
        format?: string;
        force?: boolean;
      };
      try {
        payload = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      const mode = payload.mode === "scene" ? "scene" : "raw";
      const prompt = (payload.prompt ?? "").trim();
      const scene = (payload.scene ?? "").trim();
      if (mode === "raw" && !prompt) return sendJson(res, 400, { error: "missing prompt" });
      if (mode === "scene" && !scene) return sendJson(res, 400, { error: "missing scene" });

      const request = {
        mode,
        prompt: mode === "raw" ? prompt : undefined,
        scene: mode === "scene" ? scene : undefined,
        seconds: Math.max(0.5, Math.min(30, Number(payload.seconds ?? 8))),
        numInferenceSteps: Math.max(10, Math.min(200, Math.round(Number(payload.numInferenceSteps ?? 60)))),
        cfgScale: Math.max(1, Math.min(10, Number(payload.cfgScale ?? 4))),
        seed: Math.round(Number(payload.seed ?? 0)),
        format: payload.format === "wav" ? "wav" : "ogg",
      };
      const requestHash = buildRequestHash("sfx", request);
      const catalog = await readGeneratedCatalog();
      const existing = !payload.force
        ? catalog.items.find((item) => item.kind === "sfx" && item.requestHash === requestHash)
        : null;
      if (existing) return sendJson(res, 200, { ok: true, reused: true, entry: existing });

      try {
        const endpoint = request.mode === "scene" ? "/generate/scene" : "/generate";
        const upstreamBody = request.mode === "scene"
          ? {
              scene: request.scene,
              seconds: request.seconds,
              num_inference_steps: request.numInferenceSteps,
              cfg_scale: request.cfgScale,
              seed: request.seed,
            }
          : {
              prompt: request.prompt,
              seconds: request.seconds,
              num_inference_steps: request.numInferenceSteps,
              cfg_scale: request.cfgScale,
              seed: request.seed,
            };
        const { buffer, response } = await proxyBinary(
          `${MOSS_SFX_URL}${endpoint}?format=${request.format}`,
          upstreamBody,
        );
        const entry = await storeGeneratedEntry({
          kind: "sfx",
          source: "moss-sfx",
          title: trimLabel(request.mode === "scene" ? String(request.scene) : String(request.prompt), 72),
          requestHash,
          request: request as unknown as Record<string, unknown>,
          buffer,
          mimeType: response.headers.get("content-type") || contentTypeFromExtension(`.${request.format}`),
          translatedPrompt: response.headers.get("x-translated-prompt") ?? undefined,
        });
        sendJson(res, 200, { ok: true, reused: false, entry });
      } catch (error) {
        sendJson(res, 502, { error: error instanceof Error ? error.message : String(error) });
      }
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/rooms\/([^/]+)\/generate\/tts$/,
    handle: async (req, res, match) => {
      const roomId = decodeURIComponent(match[1]);
      if (!isSafeSegment(roomId)) return sendJson(res, 400, { error: "invalid id" });
      const body = await readBody(req, 512 * 1024);
      let payload: {
        text?: string;
        language?: string;
        instruction?: string;
        seed?: number;
        force?: boolean;
      };
      try {
        payload = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      const text = (payload.text ?? "").trim();
      if (!text) return sendJson(res, 400, { error: "missing text" });
      const request = {
        text,
        language: (payload.language ?? "de").trim() || "de",
        instruction: (payload.instruction ?? "").trim(),
        seed: Number.isFinite(payload.seed) ? Math.round(Number(payload.seed)) : undefined,
      };
      const requestHash = buildRequestHash("tts", request);
      const catalog = await readGeneratedCatalog();
      const existing = !payload.force
        ? catalog.items.find((item) => item.kind === "tts" && item.requestHash === requestHash)
        : null;
      if (existing) return sendJson(res, 200, { ok: true, reused: true, entry: existing });

      try {
        const upstreamBody = {
          text: request.text,
          language: request.language,
          ...(request.instruction ? { instruction: request.instruction } : {}),
          ...(request.seed !== undefined ? { sampling: { seed: request.seed } } : {}),
        };
        const { buffer, response } = await proxyBinary(`${OPENMOSS_URL}/tts`, upstreamBody);
        const entry = await storeGeneratedEntry({
          kind: "tts",
          source: "openmoss",
          title: trimLabel(request.text, 72),
          requestHash,
          request: request as unknown as Record<string, unknown>,
          buffer,
          mimeType: response.headers.get("content-type") || "audio/wav",
        });
        sendJson(res, 200, { ok: true, reused: false, entry });
      } catch (error) {
        sendJson(res, 502, { error: error instanceof Error ? error.message : String(error) });
      }
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/generated$/,
    handle: async (req, res) => {
      const kind = normalizeKind(getQuery(req).get("kind"));
      const rawKind = getQuery(req).get("kind");
      if (rawKind && !kind) return sendJson(res, 400, { error: "invalid kind" });
      const catalog = await readGeneratedCatalog();
      const items = kind ? catalog.items.filter((item) => item.kind === kind) : catalog.items;
      sendJson(res, 200, { items });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/generated\/([^/]+)\/file$/,
    handle: async (_req, res, match) => {
      const id = decodeURIComponent(match[1]);
      if (!isSafeSegment(id)) return sendJson(res, 400, { error: "invalid id" });
      const entry = await findGeneratedEntry(id);
      if (!entry) return sendJson(res, 404, { error: "not found" });
      const filePath = path.join(GENERATED_DIR, entry.poolFile);
      if (!(await pathExists(filePath))) return sendJson(res, 404, { error: "file missing" });
      sendBinary(res, 200, entry.mimeType || contentTypeFromExtension(path.extname(entry.poolFile)), await fs.readFile(filePath));
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/rooms\/([^/]+)\/generated\/([^/]+)\/assign$/,
    handle: async (_req, res, match) => {
      const roomId = decodeURIComponent(match[1]);
      const generatedId = decodeURIComponent(match[2]);
      if (!isSafeSegment(roomId) || !isSafeSegment(generatedId)) {
        return sendJson(res, 400, { error: "invalid id" });
      }
      const entry = await findGeneratedEntry(generatedId);
      if (!entry) return sendJson(res, 404, { error: "not found" });
      try {
        const assignedPath = await assignGeneratedToRoom(roomId, entry);
        sendJson(res, 200, { ok: true, path: assignedPath, entry });
      } catch (error) {
        sendJson(res, 500, { error: error instanceof Error ? error.message : String(error) });
      }
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/rooms\/([^/]+)\/config$/,
    handle: async (_req, res, match) => {
      const id = decodeURIComponent(match[1]);
      if (!isSafeSegment(id)) return sendJson(res, 400, { error: "invalid id" });
      const filePath = path.join(ROOMS_DIR, id, "room.config.json");
      if (!(await pathExists(filePath))) {
        const cfg = defaultRoomConfig(id, id, await detectBackground(id));
        return sendJson(res, 200, cfg);
      }
      sendJson(res, 200, JSON.parse(await fs.readFile(filePath, "utf-8")));
    },
  },
  {
    method: "PUT",
    pattern: /^\/api\/rooms\/([^/]+)\/config$/,
    handle: async (req, res, match) => {
      const id = decodeURIComponent(match[1]);
      if (!isSafeSegment(id)) return sendJson(res, 400, { error: "invalid id" });
      const body = await readBody(req);
      let parsed: { id?: string };
      try {
        parsed = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      if (parsed.id && parsed.id !== id) {
        return sendJson(res, 400, { error: "id mismatch" });
      }
      const dir = path.join(ROOMS_DIR, id);
      await fs.mkdir(dir, { recursive: true });
      await fs.writeFile(path.join(dir, "room.config.json"), JSON.stringify(parsed, null, 2) + "\n", "utf-8");
      sendJson(res, 200, { ok: true });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/rooms\/([^/]+)\/assets$/,
    handle: async (_req, res, match) => {
      const id = decodeURIComponent(match[1]);
      if (!isSafeSegment(id)) return sendJson(res, 400, { error: "invalid id" });
      sendJson(res, 200, await listAssets(id));
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/rooms\/([^/]+)\/assets$/,
    handle: async (req, res, match) => {
      const id = decodeURIComponent(match[1]);
      if (!isSafeSegment(id)) return sendJson(res, 400, { error: "invalid id" });
      const body = await readBody(req);
      let payload: { kind?: string; filename?: string; dataBase64?: string };
      try {
        payload = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      const kind = payload.kind ?? ".";
      const filename = payload.filename ?? "";
      if (!ASSET_KINDS.has(kind)) return sendJson(res, 400, { error: "invalid kind" });
      if (!SAFE_FILENAME.test(filename) || filename.includes("..")) {
        return sendJson(res, 400, { error: "invalid filename" });
      }
      if (!payload.dataBase64) return sendJson(res, 400, { error: "missing data" });
      const targetDir = kind === "." ? path.join(ROOMS_DIR, id) : path.join(ROOMS_DIR, id, kind);
      await fs.mkdir(targetDir, { recursive: true });
      const buffer = Buffer.from(payload.dataBase64.replace(/^data:[^,]+,/, ""), "base64");
      await fs.writeFile(path.join(targetDir, filename), buffer);
      const relKey = kind === "." ? filename : `${kind}/${filename}`;
      await updateMeta(id, relKey, "dashboard-upload");
      sendJson(res, 200, { ok: true, path: relKey });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/library\/([^/]+)$/,
    handle: async (_req, res, match) => {
      const kind = decodeURIComponent(match[1]);
      if (!LIBRARY_KINDS.has(kind)) return sendJson(res, 400, { error: "invalid kind" });
      const filePath = path.join(LIBRARY_DIR, `${kind}.json`);
      if (!(await pathExists(filePath))) return sendJson(res, 404, { error: "not found" });
      sendJson(res, 200, JSON.parse(await fs.readFile(filePath, "utf-8")));
    },
  },
  {
    method: "PUT",
    pattern: /^\/api\/library\/([^/]+)$/,
    handle: async (req, res, match) => {
      const kind = decodeURIComponent(match[1]);
      if (!LIBRARY_KINDS.has(kind)) return sendJson(res, 400, { error: "invalid kind" });
      const body = await readBody(req);
      try {
        JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      await fs.mkdir(LIBRARY_DIR, { recursive: true });
      await fs.writeFile(path.join(LIBRARY_DIR, `${kind}.json`), JSON.stringify(JSON.parse(body), null, 2) + "\n", "utf-8");
      sendJson(res, 200, { ok: true });
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/scaffold$/,
    handle: async (req, res) => {
      const body = await readBody(req);
      let payload: { type?: string; name?: string; description?: string; params?: unknown };
      try {
        payload = JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      const type = payload.type === "interaction" ? "interaction" : "effect";
      const name = (payload.name ?? "").trim();
      if (!SAFE_SEGMENT.test(name)) {
        return sendJson(res, 400, { error: "invalid name (use a-z, 0-9, _-)" });
      }
      await fs.mkdir(RECIPES_DIR, { recursive: true });
      const spec = {
        type,
        name,
        description: payload.description ?? "",
        params: payload.params ?? [],
        createdAt: new Date().toISOString(),
        status: "draft",
      };
      await fs.writeFile(path.join(RECIPES_DIR, `${name}.spec.json`), JSON.stringify(spec, null, 2) + "\n", "utf-8");
      await fs.writeFile(path.join(RECIPES_DIR, `${name}.agent-prompt.md`), buildAgentPrompt(type, name, payload.description ?? ""), "utf-8");
      sendJson(res, 200, {
        ok: true,
        spec: `tools/recipes/${name}.spec.json`,
        prompt: `tools/recipes/${name}.agent-prompt.md`,
      });
    },
  },
];

function buildAgentPrompt(type: string, name: string, description: string): string {
  if (type === "interaction") {
    return [
      `# Scaffold-Auftrag: Interaktion \`${name}\``,
      "",
      "## Beschreibung",
      description || "(keine Beschreibung angegeben)",
      "",
      "## Aufgabe",
      `Implementiere eine neue Benutzer-Interaktion \`${name}\` fuer die Resonanz-Raeume.`,
      "",
      "## Vertrag / Kontext",
      "- Gesten-State-Machine: app/src/gesture/reducer.ts (idle -> reveal -> claim -> carry -> offer -> resonance).",
      "- Audio: audioEngine.playOneShot(url, intensity) aus app/src/audio/AudioEngine.ts.",
      "- Effekte: app/src/effects/registry.ts (createEffect(id, opts)).",
      "- Zonen sind normalisierte Polygone (NormPoint[]) aus der Raumkonfiguration.",
      "",
      "## Schritte",
      "1. Interaktionslogik implementieren, analog zu den Handlern in app/src/rooms/ConfigRoom.ts.",
      "2. Eintrag in app/src/interactions/registry.ts ergaenzen (implemented: true).",
      "3. Bibliothekseintrag in rooms/_library/interactions.json auf source: builtin setzen und implementation fuellen.",
      "4. Mit npm run build und npm run test verifizieren.",
    ].join("\n") + "\n";
  }

  return [
    `# Scaffold-Auftrag: Effekt \`${name}\``,
    "",
    "## Beschreibung",
    description || "(keine Beschreibung angegeben)",
    "",
    "## Aufgabe",
    `Implementiere einen neuen prozeduralen Effekt \`${name}\` fuer die Resonanz-Raeume.`,
    "",
    "## Vertrag / Kontext",
    "- Basisklasse: app/src/effects/BaseEffect.ts (implementiert ProceduralEffect).",
    "- Hooks: onMount() und update(deltaMs) ueberschreiben; setIntensity(0..1) modulieren.",
    "- Konstruktor nimmt EffectOptions (position?, intensity?, ttlSeconds?, respectReducedMotion?).",
    "- Registrierung: Factory in app/src/effects/registry.ts (new Klasse(opts)).",
    "",
    "## Schritte",
    `1. Neue Datei app/src/effects/${capitalize(name)}.ts mit Klasse ${capitalize(name)} extends BaseEffect.`,
    "2. Export in app/src/effects/index.ts ergaenzen.",
    `3. Factory in app/src/effects/registry.ts registrieren (Schluessel ${name}).`,
    "4. Bibliothekseintrag in rooms/_library/effects.json auf source: builtin setzen und implementation fuellen.",
    "5. Mit npm run build verifizieren.",
  ].join("\n") + "\n";
}

function capitalize(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1).replace(/[-_](\w)/g, (_match, char: string) => char.toUpperCase());
}

export function configServerPlugin(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = (req.url ?? "").split("?")[0];
    if (!url.startsWith("/api/")) return next();
    const method = (req.method ?? "GET").toUpperCase();
    const route = routes.find((entry) => entry.method === method && entry.pattern.test(url));
    if (!route) return next();
    const match = url.match(route.pattern);
    if (!match) return next();
    route.handle(req, res as ServerResponse, match).catch((error: unknown) => {
      sendJson(res as ServerResponse, 500, { error: String(error instanceof Error ? error.message : error) });
    });
  };

  return {
    name: "liturgicum-config-server",
    apply: "serve",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(middleware);
    },
  };
}