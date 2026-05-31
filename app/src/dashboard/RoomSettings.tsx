import { useCallback, useEffect, useState } from "react";
import type {
  RoomConfig,
  AudioLayerConfig,
  EffectInstanceConfig,
  InteractionInstanceConfig,
  RandomEventConfig,
  PresenceKindConfig,
} from "../config/types";
import type {
  EffectsLibrary,
  InteractionsLibrary,
  SilhouettesLibrary,
} from "../config/libraryTypes";
import { api, fileToBase64, type AssetListing } from "./api";
import { ZoneEditor } from "./ZoneEditor";

/** Editor für die raum-spezifischen Einstellungen (ROOM SETTINGS). */
export function RoomSettings(): JSX.Element {
  const [rooms, setRooms] = useState<string[]>([]);
  const [roomId, setRoomId] = useState<string>("");
  const [config, setConfig] = useState<RoomConfig | null>(null);
  const [assets, setAssets] = useState<AssetListing | null>(null);
  const [effectsLib, setEffectsLib] = useState<EffectsLibrary | null>(null);
  const [interactionsLib, setInteractionsLib] = useState<InteractionsLibrary | null>(null);
  const [silhouettesLib, setSilhouettesLib] = useState<SilhouettesLibrary | null>(null);
  const [dirty, setDirty] = useState(false);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "idle"; msg: string }>({
    kind: "idle",
    msg: "",
  });

  useEffect(() => {
    void (async () => {
      try {
        const [list, eff, intr, sil] = await Promise.all([
          api.listRooms(),
          api.getEffects(),
          api.getInteractions(),
          api.getSilhouettes(),
        ]);
        setRooms(list);
        setEffectsLib(eff);
        setInteractionsLib(intr);
        setSilhouettesLib(sil);
        if (list.length) setRoomId(list[0]);
      } catch (e) {
        setStatus({ kind: "err", msg: String(e) });
      }
    })();
  }, []);

  const loadRoom = useCallback(async (id: string) => {
    try {
      const [cfg, ass] = await Promise.all([api.getRoomConfig(id), api.getAssets(id)]);
      setConfig(cfg);
      setAssets(ass);
      setDirty(false);
      setStatus({ kind: "idle", msg: "" });
    } catch (e) {
      setConfig(null);
      setStatus({ kind: "err", msg: String(e) });
    }
  }, []);

  useEffect(() => {
    if (roomId) void loadRoom(roomId);
  }, [roomId, loadRoom]);

  const update = useCallback((next: RoomConfig) => {
    setConfig(next);
    setDirty(true);
  }, []);

  async function save(): Promise<void> {
    if (!config) return;
    try {
      await api.saveRoomConfig(config.id, config);
      setDirty(false);
      setStatus({ kind: "ok", msg: "Gespeichert → rooms/" + config.id + "/room.config.json" });
    } catch (e) {
      setStatus({ kind: "err", msg: String(e) });
    }
  }

  async function createRoom(): Promise<void> {
    const id = prompt("ID des neuen Raums (a-z, 0-9, _-):")?.trim();
    if (!id) return;
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id)) {
      setStatus({ kind: "err", msg: "Ungültige Raum-ID." });
      return;
    }
    const title = prompt("Anzeigename des Raums:")?.trim() || id;
    try {
      await api.createRoom(id, title);
      const list = await api.listRooms();
      setRooms(list);
      setRoomId(id);
      setStatus({ kind: "ok", msg: "Raum angelegt → rooms/" + id + "/room.config.json" });
    } catch (e) {
      setStatus({ kind: "err", msg: String(e) });
    }
  }

  async function uploadAudio(file: File): Promise<void> {
    if (!config) return;
    try {
      const b64 = await fileToBase64(file);
      const res = await api.uploadAsset(config.id, "audio", file.name, b64);
      setStatus({ kind: "ok", msg: "Audio hochgeladen: " + res.path });
      setAssets(await api.getAssets(config.id));
    } catch (e) {
      setStatus({ kind: "err", msg: String(e) });
    }
  }

  async function uploadBackground(file: File): Promise<void> {
    if (!config) return;
    try {
      const b64 = await fileToBase64(file);
      const res = await api.uploadAsset(config.id, ".", file.name, b64);
      setStatus({ kind: "ok", msg: "Hintergrund hochgeladen: " + res.path });
      setAssets(await api.getAssets(config.id));
      update({ ...config, background: file.name });
    } catch (e) {
      setStatus({ kind: "err", msg: String(e) });
    }
  }

  return (
    <div>
      <div className="toolbar">
        <label className="muted">Raum:</label>
        <select value={roomId} onChange={(e) => setRoomId(e.target.value)}>
          {rooms.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
        <button className="primary" disabled={!dirty} onClick={() => void save()}>
          Speichern
        </button>
        <button disabled={!roomId} onClick={() => void loadRoom(roomId)}>
          Neu laden
        </button>
        <button onClick={() => void createRoom()}>+ Neuer Raum</button>
        {dirty && <span className="status dirty">● ungespeichert</span>}
        {status.kind === "ok" && <span className="status ok">{status.msg}</span>}
        {status.kind === "err" && <span className="status err">⚠ {status.msg}</span>}
      </div>

      {!config ? (
        <p className="muted">Kein Raum geladen.</p>
      ) : (
        <>
          <section className="panel">
            <h2>Grunddaten &amp; Hintergrund</h2>
            <div className="grid-2">
              <div className="field">
                <label>Titel</label>
                <input
                  type="text"
                  value={config.title}
                  onChange={(e) => update({ ...config, title: e.target.value })}
                />
              </div>
              <div className="field">
                <label>Hintergrund (Datei in rooms/{config.id}/)</label>
                <select
                  value={config.background}
                  onChange={(e) => update({ ...config, background: e.target.value })}
                >
                  {(assets?.background.length ? assets.background : [config.background]).map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && void uploadBackground(e.target.files[0])}
                />
              </div>
            </div>
          </section>

          <AmbientSection config={config} assets={assets} update={update} onUpload={uploadAudio} />
          <EffectsSection config={config} lib={effectsLib} update={update} />
          <InteractionsSection config={config} lib={interactionsLib} update={update} />

          <section className="panel">
            <h2>Zonen &amp; Perspektive (Klick-/Drop-Zonen, Fluchtperspektive)</h2>
            <ZoneEditor config={config} onChange={update} />
          </section>

          <PresenceSection config={config} lib={silhouettesLib} update={update} />
          <RandomEventsSection config={config} update={update} />
          <IntroSpeakerSection config={config} assets={assets} update={update} onUpload={uploadAudio} />

          <section className="panel">
            <h2>Verweildauer &amp; Portal</h2>
            <div className="grid-2">
              <div className="field">
                <label>Minimale Verweildauer (Sekunden)</label>
                <input
                  type="number"
                  value={config.dwellGate.minDwellSeconds}
                  onChange={(e) =>
                    update({
                      ...config,
                      dwellGate: { ...config.dwellGate, minDwellSeconds: Number(e.target.value) },
                    })
                  }
                />
              </div>
              <div className="field">
                <label>Hinweistext bei offenem Portal</label>
                <input
                  type="text"
                  value={config.dwellGate.exitHint}
                  onChange={(e) =>
                    update({
                      ...config,
                      dwellGate: { ...config.dwellGate, exitHint: e.target.value },
                    })
                  }
                />
              </div>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ---------- Ambient ---------- */
function AmbientSection({
  config,
  assets,
  update,
  onUpload,
}: {
  config: RoomConfig;
  assets: AssetListing | null;
  update: (c: RoomConfig) => void;
  onUpload: (f: File) => void;
}): JSX.Element {
  function patch(i: number, p: Partial<AudioLayerConfig>): void {
    const ambient = config.ambient.map((a, idx) => (idx === i ? { ...a, ...p } : a));
    update({ ...config, ambient });
  }
  function add(): void {
    const ambient = [
      ...config.ambient,
      { id: `ambient_${config.ambient.length + 1}`, src: "", volume: 0.4, loop: true, fadeMs: 4000 },
    ];
    update({ ...config, ambient });
  }
  function remove(i: number): void {
    update({ ...config, ambient: config.ambient.filter((_, idx) => idx !== i) });
  }
  const audioOpts = assets?.audio ?? [];
  return (
    <section className="panel">
      <h2>Ambiente-Klänge (low drone, people noise, church noise, Orgel …)</h2>
      {config.ambient.map((a, i) => (
        <div className="item" key={a.id}>
          <div className="item-head">
            <strong>{a.id}</strong>
            <button className="danger" onClick={() => remove(i)}>
              Entfernen
            </button>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>ID</label>
              <input type="text" value={a.id} onChange={(e) => patch(i, { id: e.target.value })} />
            </div>
            <div className="field">
              <label>Audio-Datei</label>
              <select value={a.src} onChange={(e) => patch(i, { src: e.target.value })}>
                <option value="">— wählen —</option>
                {[...new Set([...audioOpts, a.src].filter(Boolean))].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Lautstärke: {a.volume.toFixed(2)}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={a.volume}
                onChange={(e) => patch(i, { volume: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Fade (ms)</label>
              <input
                type="number"
                value={a.fadeMs}
                onChange={(e) => patch(i, { fadeMs: Number(e.target.value) })}
              />
            </div>
          </div>
        </div>
      ))}
      <div className="row">
        <button onClick={add}>+ Ambient-Ebene</button>
        <label className="muted">Audio hochladen:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </div>
    </section>
  );
}

/* ---------- Effekte ---------- */
function EffectsSection({
  config,
  lib,
  update,
}: {
  config: RoomConfig;
  lib: EffectsLibrary | null;
  update: (c: RoomConfig) => void;
}): JSX.Element {
  const defs = lib?.effects ?? [];
  function patch(i: number, p: Partial<EffectInstanceConfig>): void {
    update({ ...config, effects: config.effects.map((e, idx) => (idx === i ? { ...e, ...p } : e)) });
  }
  function add(): void {
    const first = defs[0]?.id ?? "fog";
    update({
      ...config,
      effects: [
        ...config.effects,
        { id: `effect_${config.effects.length + 1}`, effect: first, intensity: 0.4, enabled: true },
      ],
    });
  }
  function remove(i: number): void {
    update({ ...config, effects: config.effects.filter((_, idx) => idx !== i) });
  }
  return (
    <section className="panel">
      <h2>Visuelle Effekt-Loops (Federn, Blätter, Lichter, Nebel, Regen …)</h2>
      {config.effects.map((e, i) => (
        <div className="item" key={e.id}>
          <div className="item-head">
            <div className="checkbox-row">
              <input
                type="checkbox"
                checked={e.enabled}
                onChange={(ev) => patch(i, { enabled: ev.target.checked })}
              />
              <strong>{e.id}</strong>
            </div>
            <button className="danger" onClick={() => remove(i)}>
              Entfernen
            </button>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Effekt-Typ</label>
              <select value={e.effect} onChange={(ev) => patch(i, { effect: ev.target.value })}>
                {[...new Set([...defs.map((d) => d.id), e.effect])].map((id) => (
                  <option key={id} value={id}>
                    {defs.find((d) => d.id === id)?.label ?? id}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Intensität: {e.intensity.toFixed(2)}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={e.intensity}
                onChange={(ev) => patch(i, { intensity: Number(ev.target.value) })}
              />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add}>+ Effekt</button>
    </section>
  );
}

/* ---------- Interaktionen ---------- */
function InteractionsSection({
  config,
  lib,
  update,
}: {
  config: RoomConfig;
  lib: InteractionsLibrary | null;
  update: (c: RoomConfig) => void;
}): JSX.Element {
  const defs = lib?.interactions ?? [];
  const zoneNames = Object.keys(config.zones);

  function nextZoneName(base = "zone"): string {
    let index = 1;
    while (config.zones[`${base}_${index}`]) index += 1;
    return `${base}_${index}`;
  }

  /** Stellt sicher, dass alle übergebenen Zonennamen (leer) existieren. */
  function ensureZones(
    zones: Record<string, RoomConfig["zones"][string]>,
    names: (string | undefined)[],
  ): Record<string, RoomConfig["zones"][string]> {
    const next = { ...zones };
    for (const name of names) {
      if (name && !next[name]) next[name] = { polygons: [[]] };
    }
    return next;
  }

  function patch(i: number, p: Partial<InteractionInstanceConfig>): void {
    update({
      ...config,
      interactions: config.interactions.map((x, idx) => (idx === i ? { ...x, ...p } : x)),
    });
  }
  function add(): void {
    const def = defs[0];
    const zone = def?.defaultZone ?? zoneNames[0] ?? nextZoneName();
    const sourceZone =
      def?.zoneKind === "drag_release" ? def?.defaultSourceZone : undefined;
    update({
      ...config,
      zones: ensureZones(config.zones, [zone, sourceZone]),
      interactions: [
        ...config.interactions,
        {
          id: `interaction_${config.interactions.length + 1}`,
          interaction: def?.id ?? "",
          zone,
          ...(sourceZone ? { sourceZone } : {}),
          enabled: true,
        },
      ],
    });
  }
  /** Wechselt die Interaktion und übernimmt deren kanonische Default-Zonen. */
  function changeInteraction(i: number, id: string): void {
    const def = defs.find((d) => d.id === id);
    const current = config.interactions[i];
    const zone = current.zone || def?.defaultZone;
    const sourceZone =
      def?.zoneKind === "drag_release"
        ? current.sourceZone || def?.defaultSourceZone
        : undefined;
    update({
      ...config,
      zones: ensureZones(config.zones, [zone, sourceZone]),
      interactions: config.interactions.map((x, idx) =>
        idx === i ? { ...x, interaction: id, zone, sourceZone } : x,
      ),
    });
  }
  function addZoneFor(i: number, field: "zone" | "sourceZone"): void {
    const base = field === "sourceZone" ? "source" : "zone";
    const name = prompt("Name der neuen Zone (a-z, 0-9, _):", nextZoneName(base))?.trim();
    if (!name || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) return;
    update({
      ...config,
      zones: ensureZones(config.zones, [name]),
      interactions: config.interactions.map((x, idx) =>
        idx === i ? { ...x, [field]: name } : x,
      ),
    });
  }
  function remove(i: number): void {
    update({ ...config, interactions: config.interactions.filter((_, idx) => idx !== i) });
  }
  return (
    <section className="panel">
      <h2>Interaktive Elemente (Stein ablegen, Kerze, Wasserringe …)</h2>
      {config.interactions.map((x, i) => {
        const def = defs.find((d) => d.id === x.interaction);
        return (
          <div className="item" key={x.id}>
            <div className="item-head">
              <div className="checkbox-row">
                <input
                  type="checkbox"
                  checked={x.enabled}
                  onChange={(ev) => patch(i, { enabled: ev.target.checked })}
                />
                <strong>{x.id}</strong>
                {def && (
                  <span className={`badge ${def.source}`}>{def.source}</span>
                )}
              </div>
              <button className="danger" onClick={() => remove(i)}>
                Entfernen
              </button>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Interaktion</label>
                <select
                  value={x.interaction}
                  onChange={(ev) => changeInteraction(i, ev.target.value)}
                >
                  {[...new Set([...defs.map((d) => d.id), x.interaction].filter(Boolean))].map(
                    (id) => (
                      <option key={id} value={id}>
                        {defs.find((d) => d.id === id)?.label ?? id}
                      </option>
                    ),
                  )}
                </select>
              </div>
              <div className="field">
                <label>{def?.zoneKind === "drag_release" ? "Ablage-Zone (Drop)" : "Zone"}</label>
                <div className="row">
                  <select value={x.zone ?? ""} onChange={(ev) => patch(i, { zone: ev.target.value })}>
                    <option value="">— keine —</option>
                    {zoneNames.map((z) => (
                      <option key={z} value={z}>
                        {z}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => addZoneFor(i, "zone")}>+ Zone</button>
                </div>
                {zoneNames.length === 0 && (
                  <p className="muted">Noch keine Zonen vorhanden. Mit "+ Zone" legst du direkt eine an und weist sie dieser Interaktion zu.</p>
                )}
              </div>
              {def?.zoneKind === "drag_release" && (
                <div className="field">
                  <label>Quell-Zone (Drag) — wo das Objekt aufgenommen wird</label>
                  <div className="row">
                    <select
                      value={x.sourceZone ?? ""}
                      onChange={(ev) => patch(i, { sourceZone: ev.target.value })}
                    >
                      <option value="">— keine —</option>
                      {zoneNames.map((z) => (
                        <option key={z} value={z}>
                          {z}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => addZoneFor(i, "sourceZone")}>+ Zone</button>
                  </div>
                </div>
              )}
            </div>
            {def && <p className="muted">{def.description}</p>}
          </div>
        );
      })}
      <button onClick={add}>+ Interaktion</button>
    </section>
  );
}

/* ---------- Präsenzen ---------- */
function PresenceSection({
  config,
  lib,
  update,
}: {
  config: RoomConfig;
  lib: SilhouettesLibrary | null;
  update: (c: RoomConfig) => void;
}): JSX.Element {
  const sils = lib?.silhouettes ?? [];
  const p = config.presence;
  function patch(part: Partial<typeof p>): void {
    update({ ...config, presence: { ...p, ...part } });
  }
  function patchKind(i: number, kp: Partial<PresenceKindConfig>): void {
    patch({ kinds: p.kinds.map((k, idx) => (idx === i ? { ...k, ...kp } : k)) });
  }
  function addKind(): void {
    patch({
      kinds: [
        ...p.kinds,
        { kind: "walking", silhouette: sils[0]?.src ?? "", weight: 0.3, baseHeight: 400 },
      ],
    });
  }
  function removeKind(i: number): void {
    patch({ kinds: p.kinds.filter((_, idx) => idx !== i) });
  }
  return (
    <section className="panel">
      <h2>Präsenzen / Silhouetten</h2>
      <div className="row">
        <div className="checkbox-row">
          <input
            type="checkbox"
            checked={p.enabled}
            onChange={(e) => patch({ enabled: e.target.checked })}
          />
          <label>aktiv</label>
        </div>
        <div className="field">
          <label>Max. Spawns</label>
          <input
            type="number"
            value={p.maxSpawns}
            onChange={(e) => patch({ maxSpawns: Number(e.target.value) })}
          />
        </div>
        <div className="field">
          <label>Erste Verzögerung min (ms)</label>
          <input
            type="number"
            value={p.firstDelayMsMin}
            onChange={(e) => patch({ firstDelayMsMin: Number(e.target.value) })}
          />
        </div>
        <div className="field">
          <label>max (ms)</label>
          <input
            type="number"
            value={p.firstDelayMsMax}
            onChange={(e) => patch({ firstDelayMsMax: Number(e.target.value) })}
          />
        </div>
        <div className="field">
          <label>Max. fremde Spuren</label>
          <input
            type="number"
            value={p.maxForeignTraceArtifacts}
            onChange={(e) => patch({ maxForeignTraceArtifacts: Number(e.target.value) })}
          />
        </div>
      </div>
      <h3>Arten</h3>
      {p.kinds.map((k, i) => (
        <div className="item" key={i}>
          <div className="grid-2">
            <div className="field">
              <label>Art</label>
              <input type="text" value={k.kind} onChange={(e) => patchKind(i, { kind: e.target.value })} />
            </div>
            <div className="field">
              <label>Silhouette</label>
              <select value={k.silhouette} onChange={(e) => patchKind(i, { silhouette: e.target.value })}>
                {[...new Set([...sils.map((s) => s.src), k.silhouette].filter(Boolean))].map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Gewicht: {k.weight.toFixed(2)}</label>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={k.weight}
                onChange={(e) => patchKind(i, { weight: Number(e.target.value) })}
              />
            </div>
            <div className="field">
              <label>Basishöhe (px)</label>
              <input
                type="number"
                value={k.baseHeight}
                onChange={(e) => patchKind(i, { baseHeight: Number(e.target.value) })}
              />
            </div>
          </div>
          <button className="danger" onClick={() => removeKind(i)}>
            Art entfernen
          </button>
        </div>
      ))}
      <button onClick={addKind}>+ Art</button>
    </section>
  );
}

/* ---------- Random Events ---------- */
function RandomEventsSection({
  config,
  update,
}: {
  config: RoomConfig;
  update: (c: RoomConfig) => void;
}): JSX.Element {
  function patch(i: number, p: Partial<RandomEventConfig>): void {
    update({
      ...config,
      randomEvents: config.randomEvents.map((e, idx) => (idx === i ? { ...e, ...p } : e)),
    });
  }
  function add(): void {
    update({
      ...config,
      randomEvents: [
        ...config.randomEvents,
        {
          id: `event_${config.randomEvents.length + 1}`,
          enabled: true,
          kind: "sound",
          ref: "",
          intervalMsMin: 30000,
          intervalMsMax: 90000,
        },
      ],
    });
  }
  function remove(i: number): void {
    update({ ...config, randomEvents: config.randomEvents.filter((_, idx) => idx !== i) });
  }
  return (
    <section className="panel">
      <h2>Zufallsereignisse</h2>
      {config.randomEvents.length === 0 && <p className="muted">Keine Ereignisse definiert.</p>}
      {config.randomEvents.map((e, i) => (
        <div className="item" key={e.id}>
          <div className="item-head">
            <div className="checkbox-row">
              <input
                type="checkbox"
                checked={e.enabled}
                onChange={(ev) => patch(i, { enabled: ev.target.checked })}
              />
              <strong>{e.id}</strong>
            </div>
            <button className="danger" onClick={() => remove(i)}>
              Entfernen
            </button>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Art</label>
              <select
                value={e.kind}
                onChange={(ev) => patch(i, { kind: ev.target.value as "sound" | "interaction" })}
              >
                <option value="sound">sound</option>
                <option value="interaction">interaction</option>
              </select>
            </div>
            <div className="field">
              <label>Referenz (Sound-Datei oder Interaktions-ID)</label>
              <input type="text" value={e.ref} onChange={(ev) => patch(i, { ref: ev.target.value })} />
            </div>
            <div className="field">
              <label>Intervall min (ms)</label>
              <input
                type="number"
                value={e.intervalMsMin}
                onChange={(ev) => patch(i, { intervalMsMin: Number(ev.target.value) })}
              />
            </div>
            <div className="field">
              <label>Intervall max (ms)</label>
              <input
                type="number"
                value={e.intervalMsMax}
                onChange={(ev) => patch(i, { intervalMsMax: Number(ev.target.value) })}
              />
            </div>
          </div>
        </div>
      ))}
      <button onClick={add}>+ Ereignis</button>
    </section>
  );
}

/* ---------- Intro & Sprecher ---------- */
function IntroSpeakerSection({
  config,
  assets,
  update,
  onUpload,
}: {
  config: RoomConfig;
  assets: AssetListing | null;
  update: (c: RoomConfig) => void;
  onUpload: (f: File) => void;
}): JSX.Element {
  const audioOpts = assets?.audio ?? [];
  return (
    <section className="panel">
      <h2>Intro &amp; Sprecher</h2>
      <h3>Ankunfts-Intro</h3>
      <div className="grid-2">
        <div className="checkbox-row">
          <input
            type="checkbox"
            checked={config.intro.enabled}
            onChange={(e) => update({ ...config, intro: { ...config.intro, enabled: e.target.checked } })}
          />
          <label>aktiv</label>
        </div>
        <div className="field">
          <label>Intro-Sound (mp3)</label>
          <select
            value={config.intro.audio ?? ""}
            onChange={(e) => update({ ...config, intro: { ...config.intro, audio: e.target.value } })}
          >
            <option value="">— keiner —</option>
            {[...new Set([...audioOpts, config.intro.audio].filter(Boolean))].map((s) => (
              <option key={s} value={s as string}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Dauer (ms)</label>
          <input
            type="number"
            value={config.intro.durationMs}
            onChange={(e) =>
              update({ ...config, intro: { ...config.intro, durationMs: Number(e.target.value) } })
            }
          />
        </div>
      </div>
      <div className="field">
        <label>Intro-Text (eine Zeile pro Absatz)</label>
        <textarea
          value={config.intro.lines.join("\n")}
          onChange={(e) =>
            update({ ...config, intro: { ...config.intro, lines: e.target.value.split("\n") } })
          }
        />
      </div>

      <h3>Sprecher</h3>
      <div className="grid-2">
        <div className="checkbox-row">
          <input
            type="checkbox"
            checked={config.speaker.enabled}
            onChange={(e) =>
              update({ ...config, speaker: { ...config.speaker, enabled: e.target.checked } })
            }
          />
          <label>aktiv</label>
        </div>
        <div className="field">
          <label>Sprecher-Audio (mp3)</label>
          <select
            value={config.speaker.audio ?? ""}
            onChange={(e) =>
              update({ ...config, speaker: { ...config.speaker, audio: e.target.value } })
            }
          >
            <option value="">— keiner —</option>
            {[...new Set([...audioOpts, config.speaker.audio].filter(Boolean))].map((s) => (
              <option key={s} value={s as string}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label>Begleittext (.md-Pfad oder Markdown)</label>
          <input
            type="text"
            value={config.speaker.text ?? ""}
            onChange={(e) =>
              update({ ...config, speaker: { ...config.speaker, text: e.target.value } })
            }
          />
        </div>
        <div className="field">
          <label>Fallback-Dauer (ms)</label>
          <input
            type="number"
            value={config.speaker.fallbackMs}
            onChange={(e) =>
              update({ ...config, speaker: { ...config.speaker, fallbackMs: Number(e.target.value) } })
            }
          />
        </div>
      </div>
      <div className="row">
        <label className="muted">Audio hochladen:</label>
        <input
          type="file"
          accept="audio/*"
          onChange={(e) => e.target.files?.[0] && onUpload(e.target.files[0])}
        />
      </div>
    </section>
  );
}
