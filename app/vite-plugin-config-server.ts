import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { Connect, Plugin, ViteDevServer } from "vite";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Lokaler Dev-Server für das Konfigurations-Dashboard.
 *
 * Stellt eine schmale REST-API unter `/api/...` bereit, die Raumkonfigurationen,
 * Bibliotheken und Assets unter `rooms/` liest und schreibt. Bewusst nur in der
 * Entwicklung aktiv (`apply: "serve"`) — keine Authentifizierung, kein Build.
 *
 * Alle Pfadsegmente werden streng saniert, um Directory-Traversal zu verhindern.
 */

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOMS_DIR = path.resolve(here, "..", "rooms");
const LIBRARY_DIR = path.join(ROOMS_DIR, "_library");
const RECIPES_DIR = path.resolve(here, "..", "tools", "recipes");

const SAFE_SEGMENT = /^[a-z0-9][a-z0-9_-]*$/i;
const SAFE_FILENAME = /^[a-z0-9][a-z0-9_.-]*$/i;
const LIBRARY_KINDS = new Set(["effects", "interactions", "silhouettes", "general"]);
const ASSET_KINDS = new Set(["audio", "artifacts", "anchors", "."]);

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

async function readBody(req: IncomingMessage, limitBytes = 25 * 1024 * 1024): Promise<string> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => {
      size += c.length;
      if (size > limitBytes) {
        reject(new Error("payload too large"));
        req.destroy();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf-8")));
    req.on("error", reject);
  });
}

async function pathExists(p: string): Promise<boolean> {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

/** Findet die erste vorhandene Hintergrunddatei eines Raums (oder Default). */
async function detectBackground(roomId: string): Promise<string> {
  const dir = path.join(ROOMS_DIR, roomId);
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  const bg = entries.find(
    (e) => e.isFile() && /^background.*\.(png|jpe?g|webp)$/i.test(e.name),
  );
  return bg?.name ?? "background.png";
}

/**
 * Erzeugt eine vollständige, leere Default-Konfiguration für einen Raum.
 * Dient als Vorlage, wenn noch keine `room.config.json` existiert (neuer oder
 * unvollständiger Raum), sodass das Dashboard sofort editieren und speichern kann.
 */
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
    // Kanonische Standard-Zonen (leer), die in fast jedem Raum gebraucht werden.
    // Spiegelt app/src/config/standardZones.ts wider.
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

/** Listet Raum-IDs (Verzeichnisse mit room.config.json oder background.png). */
async function listRooms(): Promise<string[]> {
  const entries = await fs.readdir(ROOMS_DIR, { withFileTypes: true });
  const rooms: string[] = [];
  for (const e of entries) {
    if (!e.isDirectory() || e.name.startsWith("_")) continue;
    const dir = path.join(ROOMS_DIR, e.name);
    if (
      (await pathExists(path.join(dir, "room.config.json"))) ||
      (await pathExists(path.join(dir, "background.png")))
    ) {
      rooms.push(e.name);
    }
  }
  return rooms.sort();
}

/** Listet Asset-Dateien eines Raums nach Kategorie. */
async function listAssets(roomId: string): Promise<Record<string, string[]>> {
  const out: Record<string, string[]> = { background: [], audio: [], artifacts: [], anchors: [] };
  const dir = path.join(ROOMS_DIR, roomId);
  for (const ext of [".png", ".jpg", ".jpeg", ".webp"]) void ext;
  const topLevel = await fs.readdir(dir, { withFileTypes: true }).catch(() => []);
  for (const e of topLevel) {
    if (e.isFile() && /^background.*\.(png|jpe?g|webp)$/i.test(e.name)) out.background.push(e.name);
  }
  for (const sub of ["audio", "artifacts", "anchors"]) {
    const subDir = path.join(dir, sub);
    const files = await fs.readdir(subDir).catch(() => [] as string[]);
    out[sub] = files.filter((f) => !f.startsWith("."));
  }
  return out;
}

/** Aktualisiert rooms/<id>/meta.json mit einem Provenienz-Eintrag. */
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
  handle: (req: IncomingMessage, res: ServerResponse, m: RegExpMatchArray) => Promise<void>;
}

const routes: Route[] = [
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
    pattern: /^\/api\/rooms\/([^/]+)\/config$/,
    handle: async (_req, res, m) => {
      const id = decodeURIComponent(m[1]);
      if (!isSafeSegment(id)) return sendJson(res, 400, { error: "invalid id" });
      const p = path.join(ROOMS_DIR, id, "room.config.json");
      if (!(await pathExists(p))) {
        // Unvollständiger Raum: Default-Vorlage zurückgeben (noch nicht persistiert).
        const cfg = defaultRoomConfig(id, id, await detectBackground(id));
        return sendJson(res, 200, cfg);
      }
      sendJson(res, 200, JSON.parse(await fs.readFile(p, "utf-8")));
    },
  },
  {
    method: "PUT",
    pattern: /^\/api\/rooms\/([^/]+)\/config$/,
    handle: async (req, res, m) => {
      const id = decodeURIComponent(m[1]);
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
      await fs.writeFile(
        path.join(dir, "room.config.json"),
        JSON.stringify(parsed, null, 2) + "\n",
        "utf-8",
      );
      sendJson(res, 200, { ok: true });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/rooms\/([^/]+)\/assets$/,
    handle: async (_req, res, m) => {
      const id = decodeURIComponent(m[1]);
      if (!isSafeSegment(id)) return sendJson(res, 400, { error: "invalid id" });
      sendJson(res, 200, await listAssets(id));
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/rooms\/([^/]+)\/assets$/,
    handle: async (req, res, m) => {
      const id = decodeURIComponent(m[1]);
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
      const buf = Buffer.from(payload.dataBase64.replace(/^data:[^,]+,/, ""), "base64");
      await fs.writeFile(path.join(targetDir, filename), buf);
      const relKey = kind === "." ? filename : `${kind}/${filename}`;
      await updateMeta(id, relKey, "dashboard-upload");
      sendJson(res, 200, { ok: true, path: relKey });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/library\/([^/]+)$/,
    handle: async (_req, res, m) => {
      const kind = decodeURIComponent(m[1]);
      if (!LIBRARY_KINDS.has(kind)) return sendJson(res, 400, { error: "invalid kind" });
      const p = path.join(LIBRARY_DIR, `${kind}.json`);
      if (!(await pathExists(p))) return sendJson(res, 404, { error: "not found" });
      sendJson(res, 200, JSON.parse(await fs.readFile(p, "utf-8")));
    },
  },
  {
    method: "PUT",
    pattern: /^\/api\/library\/([^/]+)$/,
    handle: async (req, res, m) => {
      const kind = decodeURIComponent(m[1]);
      if (!LIBRARY_KINDS.has(kind)) return sendJson(res, 400, { error: "invalid kind" });
      const body = await readBody(req);
      try {
        JSON.parse(body);
      } catch {
        return sendJson(res, 400, { error: "invalid JSON" });
      }
      await fs.mkdir(LIBRARY_DIR, { recursive: true });
      await fs.writeFile(
        path.join(LIBRARY_DIR, `${kind}.json`),
        JSON.stringify(JSON.parse(body), null, 2) + "\n",
        "utf-8",
      );
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
      const specPath = path.join(RECIPES_DIR, `${name}.spec.json`);
      const promptPath = path.join(RECIPES_DIR, `${name}.agent-prompt.md`);
      await fs.writeFile(specPath, JSON.stringify(spec, null, 2) + "\n", "utf-8");
      await fs.writeFile(promptPath, buildAgentPrompt(type, name, payload.description ?? ""), "utf-8");
      sendJson(res, 200, { ok: true, spec: `tools/recipes/${name}.spec.json`, prompt: `tools/recipes/${name}.agent-prompt.md` });
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
      `Implementiere eine neue Benutzer-Interaktion \`${name}\` für die Resonanz-Räume.`,
      "",
      "## Vertrag / Kontext",
      "- Gesten-State-Machine: `app/src/gesture/reducer.ts` (idle → reveal → claim → carry → offer → resonance).",
      "- Audio: `audioEngine.playOneShot(url, intensity)` aus `app/src/audio/AudioEngine.ts`.",
      "- Effekte: `app/src/effects/registry.ts` (`createEffect(id, opts)`).",
      "- Zonen sind normalisierte Polygone (`NormPoint[]`) aus der Raumkonfiguration.",
      "",
      "## Schritte",
      "1. Interaktionslogik implementieren (Aufnahme/Tragen/Ablegen bzw. Tap), analog zu den Handlern in `app/src/rooms/ConfigRoom.ts`.",
      "2. Eintrag in `app/src/interactions/registry.ts` ergänzen (`implemented: true`).",
      "3. Bibliothekseintrag in `rooms/_library/interactions.json` auf `source: \"builtin\"` setzen und `implementation` füllen.",
      "4. Mit `npm run build` und `npm run test` verifizieren.",
    ].join("\n") + "\n";
  }
  return [
    `# Scaffold-Auftrag: Effekt \`${name}\``,
    "",
    "## Beschreibung",
    description || "(keine Beschreibung angegeben)",
    "",
    "## Aufgabe",
    `Implementiere einen neuen prozeduralen Effekt \`${name}\` für die Resonanz-Räume.`,
    "",
    "## Vertrag / Kontext",
    "- Basisklasse: `app/src/effects/BaseEffect.ts` (implementiert `ProceduralEffect`).",
    "- Hooks: `onMount()` und `update(deltaMs)` überschreiben; `setIntensity(0..1)` modulieren.",
    "- Konstruktor nimmt `EffectOptions` (`position?`, `intensity?`, `ttlSeconds?`, `respectReducedMotion?`).",
    "- Registrierung: Factory in `app/src/effects/registry.ts` (`new <Klasse>(opts)`).",
    "",
    "## Schritte",
    `1. Neue Datei \`app/src/effects/${capitalize(name)}.ts\` mit Klasse \`${capitalize(name)} extends BaseEffect\`.`,
    "2. Export in `app/src/effects/index.ts` ergänzen.",
    `3. Factory in \`app/src/effects/registry.ts\` registrieren (Schlüssel \`${name}\`).`,
    "4. Bibliothekseintrag in `rooms/_library/effects.json` auf `source: \"builtin\"` setzen und `implementation` füllen.",
    "5. Mit `npm run build` verifizieren.",
  ].join("\n") + "\n";
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).replace(/[-_](\w)/g, (_, c) => c.toUpperCase());
}

export function configServerPlugin(): Plugin {
  const middleware: Connect.NextHandleFunction = (req, res, next) => {
    const url = (req.url ?? "").split("?")[0];
    if (!url.startsWith("/api/")) return next();
    const method = (req.method ?? "GET").toUpperCase();
    const route = routes.find((r) => r.method === method && r.pattern.test(url));
    if (!route) return next();
    const match = url.match(route.pattern);
    if (!match) return next();
    route
      .handle(req, res as ServerResponse, match)
      .catch((err: unknown) => {
        sendJson(res as ServerResponse, 500, { error: String(err instanceof Error ? err.message : err) });
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
