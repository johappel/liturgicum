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
import { GenerateAudioModal } from "./GenerateAudioModal";
import { ZoneEditor } from "./ZoneEditor";

type AudioTarget =
  | { kind: "ambient"; index: number }
  | { kind: "event"; index: number }
  | { kind: "intro" }
  | { kind: "speaker" };

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
  const [audioModal, setAudioModal] = useState<{ mode: "sfx" | "tts"; target: AudioTarget } | null>(null);

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
      } catch (error) {
        setStatus({ kind: "err", msg: String(error) });
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
    } catch (error) {
      setConfig(null);
      setStatus({ kind: "err", msg: String(error) });
    }
  }, []);

  useEffect(() => {
    if (roomId) void loadRoom(roomId);
  }, [roomId, loadRoom]);

  const update = useCallback((next: RoomConfig) => {
    setConfig(next);
    setDirty(true);
  }, []);

  async function refreshAssets(currentRoomId: string): Promise<void> {
    setAssets(await api.getAssets(currentRoomId));
  }

  async function save(): Promise<void> {
    if (!config) return;
    try {
      await api.saveRoomConfig(config.id, config);
      setDirty(false);
      setStatus({ kind: "ok", msg: `Gespeichert Ã¢â€ â€™ rooms/${config.id}/room.config.json` });
    } catch (error) {
      setStatus({ kind: "err", msg: String(error) });
    }
  }

  async function createRoom(): Promise<void> {
    const id = prompt("ID des neuen Raums (a-z, 0-9, _-):")?.trim();
    if (!id) return;
    if (!/^[a-z0-9][a-z0-9_-]*$/i.test(id)) {
      setStatus({ kind: "err", msg: "UngÃƒÂ¼ltige Raum-ID." });
      return;
    }
    const title = prompt("Anzeigename des Raums:")?.trim() || id;
    try {
      await api.createRoom(id, title);
      const list = await api.listRooms();
      setRooms(list);
      setRoomId(id);
      setStatus({ kind: "ok", msg: `Raum angelegt Ã¢â€ â€™ rooms/${id}/room.config.json` });
    } catch (error) {
      setStatus({ kind: "err", msg: String(error) });
    }
  }

  async function uploadAudio(file: File): Promise<void> {
    if (!config) return;
    try {
      const b64 = await fileToBase64(file);
      const res = await api.uploadAsset(config.id, "audio", file.name, b64);
      setStatus({ kind: "ok", msg: `Audio hochgeladen: ${res.path}` });
      await refreshAssets(config.id);
    } catch (error) {
      setStatus({ kind: "err", msg: String(error) });
    }
  }

  async function uploadBackground(file: File): Promise<void> {
    if (!config) return;
    try {
      const b64 = await fileToBase64(file);
      const res = await api.uploadAsset(config.id, ".", file.name, b64);
      setStatus({ kind: "ok", msg: `Hintergrund hochgeladen: ${res.path}` });
      await refreshAssets(config.id);
      update({ ...config, background: file.name });
    } catch (error) {
      setStatus({ kind: "err", msg: String(error) });
    }
  }

  function openAudioModal(mode: "sfx" | "tts", target: AudioTarget): void {
    setAudioModal({ mode, target });
  }

  async function handleAssignedAudio(path: string): Promise<void> {
    if (!config || !audioModal) return;
    const target = audioModal.target;
    let next = config;
    if (target.kind === "ambient") {
      next = {
        ...config,
        ambient: config.ambient.map((entry, index) =>
          index === target.index ? { ...entry, src: path } : entry,
        ),
      };
    } else if (target.kind === "event") {
      next = {
        ...config,
        randomEvents: config.randomEvents.map((entry, index) =>
          index === target.index ? { ...entry, ref: path } : entry,
        ),
      };
    } else if (target.kind === "intro") {
      next = { ...config, intro: { ...config.intro, audio: path } };
    } else {
      next = { ...config, speaker: { ...config.speaker, audio: path } };
    }
    update(next);
    await refreshAssets(config.id);
    setStatus({ kind: "ok", msg: `Audio zugewiesen: ${path}` });
  }

  const initialModalText = (() => {
    if (!config || !audioModal) return "";
    if (audioModal.target.kind === "intro") return config.intro.lines.join("\n");
    if (audioModal.target.kind === "speaker") return config.speaker.text ?? "";
    return "";
  })();

  return (
    <div>
      <div className="toolbar">
        <label className="muted">Raum:</label>
        <select value={roomId} onChange={(event) => setRoomId(event.target.value)}>
          {rooms.map((room) => (
            <option key={room} value={room}>
              {room}
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
        {dirty && <span className="status dirty">Ã¢â€”Â ungespeichert</span>}
        {status.kind === "ok" && <span className="status ok">{status.msg}</span>}
        {status.kind === "err" && <span className="status err">Ã¢Å¡Â  {status.msg}</span>}
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
                <input type="text" value={config.title} onChange={(event) => update({ ...config, title: event.target.value })} />
              </div>
              <div className="field">
                <label>Hintergrund (Datei in rooms/{config.id}/)</label>
                <select value={config.background} onChange={(event) => update({ ...config, background: event.target.value })}>
                  {(assets?.background.length ? assets.background : [config.background]).map((background) => (
                    <option key={background} value={background}>
                      {background}
                    </option>
                  ))}
                </select>
                <input type="file" accept="image/*" onChange={(event) => event.target.files?.[0] && void uploadBackground(event.target.files[0])} />
              </div>
            </div>
          </section>

          <AmbientSection config={config} assets={assets} update={update} onUpload={uploadAudio} onGenerate={(index) => openAudioModal("sfx", { kind: "ambient", index })} />
          <EffectsSection config={config} lib={effectsLib} update={update} />
          <InteractionsSection config={config} lib={interactionsLib} update={update} />

          <section className="panel">
            <h2>Zonen &amp; Perspektive (Klick-/Drop-Zonen, Fluchtperspektive)</h2>
            <ZoneEditor config={config} onChange={update} />
          </section>

          <PresenceSection config={config} lib={silhouettesLib} update={update} />
          <RandomEventsSection config={config} update={update} onGenerate={(index) => openAudioModal("sfx", { kind: "event", index })} />
          <IntroSpeakerSection
            config={config}
            assets={assets}
            update={update}
            onUpload={uploadAudio}
            onGenerateIntro={() => openAudioModal("tts", { kind: "intro" })}
            onGenerateSpeaker={() => openAudioModal("tts", { kind: "speaker" })}
          />

          <section className="panel">
            <h2>Verweildauer &amp; Portal</h2>
            <div className="grid-2">
              <div className="field">
                <label>Minimale Verweildauer (Sekunden)</label>
                <input
                  type="number"
                  value={config.dwellGate.minDwellSeconds}
                  onChange={(event) => update({
                    ...config,
                    dwellGate: { ...config.dwellGate, minDwellSeconds: Number(event.target.value) },
                  })}
                />
              </div>
              <div className="field">
                <label>Hinweistext bei offenem Portal</label>
                <input
                  type="text"
                  value={config.dwellGate.exitHint}
                  onChange={(event) => update({
                    ...config,
                    dwellGate: { ...config.dwellGate, exitHint: event.target.value },
                  })}
                />
              </div>
            </div>
          </section>

          {audioModal && (
            <GenerateAudioModal
              open
              roomId={config.id}
              mode={audioModal.mode}
              title={audioModal.mode === "sfx" ? "Sound generieren" : "TTS generieren"}
              initialText={initialModalText}
              onClose={() => setAudioModal(null)}
              onAssigned={handleAssignedAudio}
            />
          )}
        </>
      )}
    </div>
  );
}

function AmbientSection({
  config,
  assets,
  update,
  onUpload,
  onGenerate,
}: {
  config: RoomConfig;
  assets: AssetListing | null;
  update: (config: RoomConfig) => void;
  onUpload: (file: File) => void;
  onGenerate: (index: number) => void;
}): JSX.Element {
  function patch(index: number, part: Partial<AudioLayerConfig>): void {
    update({
      ...config,
      ambient: config.ambient.map((entry, currentIndex) => (currentIndex === index ? { ...entry, ...part } : entry)),
    });
  }

  function add(): void {
    update({
      ...config,
      ambient: [
        ...config.ambient,
        { id: `ambient_${config.ambient.length + 1}`, src: "", volume: 0.4, loop: true, fadeMs: 4000 },
      ],
    });
  }

  function remove(index: number): void {
    update({ ...config, ambient: config.ambient.filter((_, currentIndex) => currentIndex !== index) });
  }

  const audioOptions = assets?.audio ?? [];
  return (
    <section className="panel">
      <h2>Ambiente-KlÃƒÂ¤nge (low drone, people noise, church noise, Orgel ...)</h2>
      {config.ambient.map((entry, index) => (
        <div className="item" key={entry.id}>
          <div className="item-head">
            <strong>{entry.id}</strong>
            <div className="row">
              <button type="button" onClick={() => onGenerate(index)}>SFX generieren</button>
              <button className="danger" type="button" onClick={() => remove(index)}>Entfernen</button>
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>ID</label>
              <input type="text" value={entry.id} onChange={(event) => patch(index, { id: event.target.value })} />
            </div>
            <div className="field">
              <label>Audio-Datei</label>
              <select value={entry.src} onChange={(event) => patch(index, { src: event.target.value })}>
                <option value="">Ã¢â‚¬â€ wÃƒÂ¤hlen Ã¢â‚¬â€</option>
                {[...new Set([...audioOptions, entry.src].filter(Boolean))].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>LautstÃƒÂ¤rke: {entry.volume.toFixed(2)}</label>
              <input type="range" min={0} max={1} step={0.01} value={entry.volume} onChange={(event) => patch(index, { volume: Number(event.target.value) })} />
            </div>
            <div className="field">
              <label>Fade (ms)</label>
              <input type="number" value={entry.fadeMs} onChange={(event) => patch(index, { fadeMs: Number(event.target.value) })} />
            </div>
          </div>
        </div>
      ))}
      <div className="row">
        <button type="button" onClick={add}>+ Ambient-Ebene</button>
        <label className="muted">Audio hochladen:</label>
        <input type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} />
      </div>
    </section>
  );
}

function EffectsSection({ config, lib, update }: { config: RoomConfig; lib: EffectsLibrary | null; update: (config: RoomConfig) => void }): JSX.Element {
  const defs = lib?.effects ?? [];
  function patch(index: number, part: Partial<EffectInstanceConfig>): void {
    update({ ...config, effects: config.effects.map((entry, currentIndex) => (currentIndex === index ? { ...entry, ...part } : entry)) });
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
  function remove(index: number): void {
    update({ ...config, effects: config.effects.filter((_, currentIndex) => currentIndex !== index) });
  }
  return (
    <section className="panel">
      <h2>Visuelle Effekt-Loops (Federn, BlÃƒÂ¤tter, Lichter, Nebel, Regen ...)</h2>
      {config.effects.map((entry, index) => (
        <div className="item" key={entry.id}>
          <div className="item-head">
            <div className="checkbox-row">
              <input type="checkbox" checked={entry.enabled} onChange={(event) => patch(index, { enabled: event.target.checked })} />
              <strong>{entry.id}</strong>
            </div>
            <button className="danger" type="button" onClick={() => remove(index)}>Entfernen</button>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Effekt-Typ</label>
              <select value={entry.effect} onChange={(event) => patch(index, { effect: event.target.value })}>
                {[...new Set([...defs.map((def) => def.id), entry.effect])].map((id) => (
                  <option key={id} value={id}>
                    {defs.find((def) => def.id === id)?.label ?? id}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>IntensitÃƒÂ¤t: {entry.intensity.toFixed(2)}</label>
              <input type="range" min={0} max={1} step={0.01} value={entry.intensity} onChange={(event) => patch(index, { intensity: Number(event.target.value) })} />
            </div>
          </div>
        </div>
      ))}
      <button type="button" onClick={add}>+ Effekt</button>
    </section>
  );
}

function InteractionsSection({ config, lib, update }: { config: RoomConfig; lib: InteractionsLibrary | null; update: (config: RoomConfig) => void }): JSX.Element {
  const defs = lib?.interactions ?? [];
  const zoneNames = Object.keys(config.zones);

  function nextZoneName(base = "zone"): string {
    let index = 1;
    while (config.zones[`${base}_${index}`]) index += 1;
    return `${base}_${index}`;
  }

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

  function patch(index: number, part: Partial<InteractionInstanceConfig>): void {
    update({
      ...config,
      interactions: config.interactions.map((entry, currentIndex) => (currentIndex === index ? { ...entry, ...part } : entry)),
    });
  }

  function add(): void {
    const def = defs[0];
    const zone = def?.defaultZone ?? zoneNames[0] ?? nextZoneName();
    const sourceZone = def?.zoneKind === "drag_release" ? def?.defaultSourceZone : undefined;
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

  function changeInteraction(index: number, id: string): void {
    const def = defs.find((entry) => entry.id === id);
    const current = config.interactions[index];
    const zone = current.zone || def?.defaultZone;
    const sourceZone = def?.zoneKind === "drag_release" ? current.sourceZone || def?.defaultSourceZone : undefined;
    update({
      ...config,
      zones: ensureZones(config.zones, [zone, sourceZone]),
      interactions: config.interactions.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, interaction: id, zone, sourceZone } : entry,
      ),
    });
  }

  function addZoneFor(index: number, field: "zone" | "sourceZone"): void {
    const base = field === "sourceZone" ? "source" : "zone";
    const name = prompt("Name der neuen Zone (a-z, 0-9, _):", nextZoneName(base))?.trim();
    if (!name || !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(name)) return;
    update({
      ...config,
      zones: ensureZones(config.zones, [name]),
      interactions: config.interactions.map((entry, currentIndex) =>
        currentIndex === index ? { ...entry, [field]: name } : entry,
      ),
    });
  }

  function remove(index: number): void {
    update({ ...config, interactions: config.interactions.filter((_, currentIndex) => currentIndex !== index) });
  }

  return (
    <section className="panel">
      <h2>Interaktive Elemente (Stein ablegen, Kerze, Wasserringe ...)</h2>
      {config.interactions.map((entry, index) => {
        const def = defs.find((item) => item.id === entry.interaction);
        return (
          <div className="item" key={entry.id}>
            <div className="item-head">
              <div className="checkbox-row">
                <input type="checkbox" checked={entry.enabled} onChange={(event) => patch(index, { enabled: event.target.checked })} />
                <strong>{entry.id}</strong>
                {def && <span className={`badge ${def.source}`}>{def.source}</span>}
              </div>
              <button className="danger" type="button" onClick={() => remove(index)}>Entfernen</button>
            </div>
            <div className="grid-2">
              <div className="field">
                <label>Interaktion</label>
                <select value={entry.interaction} onChange={(event) => changeInteraction(index, event.target.value)}>
                  {[...new Set([...defs.map((def) => def.id), entry.interaction].filter(Boolean))].map((id) => (
                    <option key={id} value={id}>
                      {defs.find((def) => def.id === id)?.label ?? id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label>{def?.zoneKind === "drag_release" ? "Ablage-Zone (Drop)" : "Zone"}</label>
                <div className="row">
                  <select value={entry.zone ?? ""} onChange={(event) => patch(index, { zone: event.target.value })}>
                    <option value="">Ã¢â‚¬â€ keine Ã¢â‚¬â€</option>
                    {zoneNames.map((zone) => (
                      <option key={zone} value={zone}>
                        {zone}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={() => addZoneFor(index, "zone")}>+ Zone</button>
                </div>
                {zoneNames.length === 0 && (
                  <p className="muted">Noch keine Zonen vorhanden. Mit + Zone legst du direkt eine an und weist sie dieser Interaktion zu.</p>
                )}
              </div>
              {def?.zoneKind === "drag_release" && (
                <div className="field">
                  <label>Quell-Zone (Drag)</label>
                  <div className="row">
                    <select value={entry.sourceZone ?? ""} onChange={(event) => patch(index, { sourceZone: event.target.value })}>
                      <option value="">Ã¢â‚¬â€ keine Ã¢â‚¬â€</option>
                      {zoneNames.map((zone) => (
                        <option key={zone} value={zone}>
                          {zone}
                        </option>
                      ))}
                    </select>
                    <button type="button" onClick={() => addZoneFor(index, "sourceZone")}>+ Zone</button>
                  </div>
                </div>
              )}
            </div>
            {def && <p className="muted">{def.description}</p>}
          </div>
        );
      })}
      <button type="button" onClick={add}>+ Interaktion</button>
    </section>
  );
}

function PresenceSection({ config, lib, update }: { config: RoomConfig; lib: SilhouettesLibrary | null; update: (config: RoomConfig) => void }): JSX.Element {
  const silhouettes = lib?.silhouettes ?? [];
  const presence = config.presence;

  function patch(part: Partial<typeof presence>): void {
    update({ ...config, presence: { ...presence, ...part } });
  }

  function patchKind(index: number, part: Partial<PresenceKindConfig>): void {
    patch({ kinds: presence.kinds.map((kind, currentIndex) => (currentIndex === index ? { ...kind, ...part } : kind)) });
  }

  function addKind(): void {
    patch({
      kinds: [
        ...presence.kinds,
        { kind: "walking", silhouette: silhouettes[0]?.src ?? "", weight: 0.3, baseHeight: 400 },
      ],
    });
  }

  function removeKind(index: number): void {
    patch({ kinds: presence.kinds.filter((_, currentIndex) => currentIndex !== index) });
  }

  return (
    <section className="panel">
      <h2>PrÃƒÂ¤senzen / Silhouetten</h2>
      <div className="row">
        <div className="checkbox-row">
          <input type="checkbox" checked={presence.enabled} onChange={(event) => patch({ enabled: event.target.checked })} />
          <label>aktiv</label>
        </div>
        <NumberInput label="Max. Spawns" value={presence.maxSpawns} onChange={(value) => patch({ maxSpawns: value })} />
        <NumberInput label="Erste VerzÃƒÂ¶gerung min (ms)" value={presence.firstDelayMsMin} onChange={(value) => patch({ firstDelayMsMin: value })} />
        <NumberInput label="max (ms)" value={presence.firstDelayMsMax} onChange={(value) => patch({ firstDelayMsMax: value })} />
        <NumberInput label="Max. fremde Spuren" value={presence.maxForeignTraceArtifacts} onChange={(value) => patch({ maxForeignTraceArtifacts: value })} />
      </div>
      <h3>Arten</h3>
      {presence.kinds.map((kind, index) => (
        <div className="item" key={`${kind.kind}-${index}`}>
          <div className="grid-2">
            <div className="field">
              <label>Art</label>
              <input type="text" value={kind.kind} onChange={(event) => patchKind(index, { kind: event.target.value })} />
            </div>
            <div className="field">
              <label>Silhouette</label>
              <select value={kind.silhouette} onChange={(event) => patchKind(index, { silhouette: event.target.value })}>
                {[...new Set([...silhouettes.map((entry) => entry.src), kind.silhouette].filter(Boolean))].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Gewicht: {kind.weight.toFixed(2)}</label>
              <input type="range" min={0} max={1} step={0.01} value={kind.weight} onChange={(event) => patchKind(index, { weight: Number(event.target.value) })} />
            </div>
            <NumberInput label="BasishÃƒÂ¶he (px)" value={kind.baseHeight} onChange={(value) => patchKind(index, { baseHeight: value })} />
          </div>
          <button className="danger" type="button" onClick={() => removeKind(index)}>Art entfernen</button>
        </div>
      ))}
      <button type="button" onClick={addKind}>+ Art</button>
    </section>
  );
}

function RandomEventsSection({
  config,
  update,
  onGenerate,
}: {
  config: RoomConfig;
  update: (config: RoomConfig) => void;
  onGenerate: (index: number) => void;
}): JSX.Element {
  function patch(index: number, part: Partial<RandomEventConfig>): void {
    update({
      ...config,
      randomEvents: config.randomEvents.map((entry, currentIndex) => (currentIndex === index ? { ...entry, ...part } : entry)),
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

  function remove(index: number): void {
    update({ ...config, randomEvents: config.randomEvents.filter((_, currentIndex) => currentIndex !== index) });
  }

  return (
    <section className="panel">
      <h2>Zufallsereignisse</h2>
      {config.randomEvents.length === 0 && <p className="muted">Keine Ereignisse definiert.</p>}
      {config.randomEvents.map((entry, index) => (
        <div className="item" key={entry.id}>
          <div className="item-head">
            <div className="checkbox-row">
              <input type="checkbox" checked={entry.enabled} onChange={(event) => patch(index, { enabled: event.target.checked })} />
              <strong>{entry.id}</strong>
            </div>
            <div className="row">
              {entry.kind === "sound" && <button type="button" onClick={() => onGenerate(index)}>SFX generieren</button>}
              <button className="danger" type="button" onClick={() => remove(index)}>Entfernen</button>
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>Art</label>
              <select value={entry.kind} onChange={(event) => patch(index, { kind: event.target.value as "sound" | "interaction" })}>
                <option value="sound">sound</option>
                <option value="interaction">interaction</option>
              </select>
            </div>
            <div className="field">
              <label>Referenz (Sound-Datei oder Interaktions-ID)</label>
              <input type="text" value={entry.ref} onChange={(event) => patch(index, { ref: event.target.value })} />
            </div>
            <NumberInput label="Intervall min (ms)" value={entry.intervalMsMin} onChange={(value) => patch(index, { intervalMsMin: value })} />
            <NumberInput label="Intervall max (ms)" value={entry.intervalMsMax} onChange={(value) => patch(index, { intervalMsMax: value })} />
          </div>
        </div>
      ))}
      <button type="button" onClick={add}>+ Ereignis</button>
    </section>
  );
}

function IntroSpeakerSection({
  config,
  assets,
  update,
  onUpload,
  onGenerateIntro,
  onGenerateSpeaker,
}: {
  config: RoomConfig;
  assets: AssetListing | null;
  update: (config: RoomConfig) => void;
  onUpload: (file: File) => void;
  onGenerateIntro: () => void;
  onGenerateSpeaker: () => void;
}): JSX.Element {
  const audioOptions = assets?.audio ?? [];
  return (
    <section className="panel">
      <h2>Intro &amp; Sprecher</h2>
      <h3>Ankunfts-Intro</h3>
      <div className="grid-2">
        <div className="checkbox-row">
          <input type="checkbox" checked={config.intro.enabled} onChange={(event) => update({ ...config, intro: { ...config.intro, enabled: event.target.checked } })} />
          <label>aktiv</label>
        </div>
        <div className="field">
          <label>Intro-Sound</label>
          <div className="row">
            <select value={config.intro.audio ?? ""} onChange={(event) => update({ ...config, intro: { ...config.intro, audio: event.target.value } })}>
              <option value="">Ã¢â‚¬â€ keiner Ã¢â‚¬â€</option>
              {[...new Set([...audioOptions, config.intro.audio].filter(Boolean))].map((value) => (
                <option key={value} value={value as string}>
                  {value}
                </option>
              ))}
            </select>
            <button type="button" onClick={onGenerateIntro}>TTS generieren</button>
          </div>
        </div>
        <NumberInput label="Dauer (ms)" value={config.intro.durationMs} onChange={(value) => update({ ...config, intro: { ...config.intro, durationMs: value } })} />
      </div>
      <div className="field">
        <label>Intro-Text (eine Zeile pro Absatz)</label>
        <textarea value={config.intro.lines.join("\n")} onChange={(event) => update({ ...config, intro: { ...config.intro, lines: event.target.value.split("\n") } })} />
      </div>

      <h3>Sprecher</h3>
      <div className="grid-2">
        <div className="checkbox-row">
          <input type="checkbox" checked={config.speaker.enabled} onChange={(event) => update({ ...config, speaker: { ...config.speaker, enabled: event.target.checked } })} />
          <label>aktiv</label>
        </div>
        <div className="field">
          <label>Sprecher-Audio</label>
          <div className="row">
            <select value={config.speaker.audio ?? ""} onChange={(event) => update({ ...config, speaker: { ...config.speaker, audio: event.target.value } })}>
              <option value="">Ã¢â‚¬â€ keiner Ã¢â‚¬â€</option>
              {[...new Set([...audioOptions, config.speaker.audio].filter(Boolean))].map((value) => (
                <option key={value} value={value as string}>
                  {value}
                </option>
              ))}
            </select>
            <button type="button" onClick={onGenerateSpeaker}>TTS generieren</button>
          </div>
        </div>
        <div className="field">
          <label>Begleittext (.md-Pfad oder Markdown)</label>
          <input type="text" value={config.speaker.text ?? ""} onChange={(event) => update({ ...config, speaker: { ...config.speaker, text: event.target.value } })} />
        </div>
        <NumberInput label="Fallback-Dauer (ms)" value={config.speaker.fallbackMs} onChange={(value) => update({ ...config, speaker: { ...config.speaker, fallbackMs: value } })} />
      </div>
      <div className="row">
        <label className="muted">Audio hochladen:</label>
        <input type="file" accept="audio/*" onChange={(event) => event.target.files?.[0] && onUpload(event.target.files[0])} />
      </div>
    </section>
  );
}

function NumberInput({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }): JSX.Element {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="number" value={value} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}