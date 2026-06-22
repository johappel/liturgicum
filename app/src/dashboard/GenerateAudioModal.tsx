import { useEffect, useState } from "react";
import { api, type GeneratedEntry, type GeneratedKind, type ServiceKey } from "./api";
import { Modal } from "./Modal";

type Mode = "sfx" | "tts";

function randomSeed(): number {
  return Math.floor(Math.random() * 1_000_000);
}

export function GenerateAudioModal({
  open,
  roomId,
  mode,
  title,
  initialText = "",
  onClose,
  onAssigned,
}: {
  open: boolean;
  roomId: string;
  mode: Mode;
  title: string;
  initialText?: string;
  onClose: () => void;
  onAssigned: (path: string) => Promise<void> | void;
}): JSX.Element | null {
  const [serviceState, setServiceState] = useState<"up" | "down" | "loading">("loading");
  const [serviceDetail, setServiceDetail] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [error, setError] = useState<string>("");
  const [entries, setEntries] = useState<GeneratedEntry[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [sfxMode, setSfxMode] = useState<"raw" | "scene">("scene");
  const [prompt, setPrompt] = useState("");
  const [scene, setScene] = useState(initialText);
  const [seconds, setSeconds] = useState(8);
  const [steps, setSteps] = useState(60);
  const [cfgScale, setCfgScale] = useState(4);
  const [seed, setSeed] = useState(randomSeed());
  const [text, setText] = useState(initialText);
  const [language, setLanguage] = useState("de");
  const [instruction, setInstruction] = useState("");

  const service: ServiceKey = mode;
  const kind: GeneratedKind = mode;
  const activeEntry = entries.find((entry) => entry.id === activeId) ?? null;

  useEffect(() => {
    if (!open) return;
    setError("");
    setActiveId("");
    setSeed(randomSeed());
    if (mode === "tts") setText(initialText);
    if (mode === "sfx") setScene(initialText);
  }, [initialText, mode, open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;

    const load = async (): Promise<void> => {
      try {
        const [services, generated] = await Promise.all([
          api.getServicesStatus(),
          api.listGenerated(kind),
        ]);
        if (cancelled) return;
        setEntries(generated);
        setActiveId((current) => current || generated[0]?.id || "");
        setServiceState(services[service].state);
        setServiceDetail(services[service].detail);
      } catch (nextError) {
        if (!cancelled) setError(String(nextError));
      }
    };

    void load();
    return () => {
      cancelled = true;
    };
  }, [kind, open, service]);

  async function refreshGenerated(): Promise<void> {
    const generated = await api.listGenerated(kind);
    setEntries(generated);
    setActiveId((current) => current || generated[0]?.id || "");
  }

  async function refreshService(): Promise<void> {
    const services = await api.getServicesStatus();
    setServiceState(services[service].state);
    setServiceDetail(services[service].detail);
  }

  async function handleStartService(): Promise<void> {
    try {
      setBusy(true);
      setError("");
      await api.startService(service);
      await refreshService();
    } catch (nextError) {
      setError(String(nextError));
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerate(force: boolean): Promise<void> {
    try {
      setBusy(true);
      setError("");
      const response = mode === "sfx"
        ? await api.generateSfx(roomId, {
            mode: sfxMode,
            prompt,
            scene,
            seconds,
            numInferenceSteps: steps,
            cfgScale,
            seed,
            format: "ogg",
            force,
          })
        : await api.generateTts(roomId, {
            text,
            language,
            instruction,
            seed,
            force,
          });
      await refreshGenerated();
      setActiveId(response.entry.id);
      await refreshService();
      if (force) setSeed(randomSeed());
    } catch (nextError) {
      setError(String(nextError));
      await refreshService().catch(() => undefined);
    } finally {
      setBusy(false);
    }
  }

  async function handleAssign(entry: GeneratedEntry): Promise<void> {
    try {
      setAssigning(true);
      setError("");
      const result = await api.assignGenerated(roomId, entry.id);
      await onAssigned(result.path);
      onClose();
    } catch (nextError) {
      setError(String(nextError));
    } finally {
      setAssigning(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="generator-layout">
        <section className="generator-form">
          <div className={`service-banner is-${serviceState}`}>
            <div>
              <strong>{mode === "sfx" ? "moss-sfx" : "openmoss"}</strong>
              <span>{serviceDetail || "Status wird geladen"}</span>
            </div>
            {serviceState !== "up" && (
              <button type="button" disabled={busy} onClick={() => void handleStartService()}>
                {busy ? "Startet..." : "Dienst starten"}
              </button>
            )}
          </div>

          {mode === "sfx" ? (
            <>
              <div className="field">
                <label>Modus</label>
                <select value={sfxMode} onChange={(event) => setSfxMode(event.target.value as "raw" | "scene")}>
                  <option value="scene">Szene → Sound</option>
                  <option value="raw">Direkter Sound-Prompt</option>
                </select>
              </div>
              <div className="field">
                <label>{sfxMode === "scene" ? "Szene / Anforderung" : "Prompt"}</label>
                <textarea
                  value={sfxMode === "scene" ? scene : prompt}
                  onChange={(event) =>
                    sfxMode === "scene" ? setScene(event.target.value) : setPrompt(event.target.value)
                  }
                />
              </div>
              <div className="grid-2">
                <NumberField label="Dauer (s)" value={seconds} onChange={setSeconds} step={0.5} />
                <NumberField label="Steps" value={steps} onChange={setSteps} step={1} />
                <NumberField label="CFG" value={cfgScale} onChange={setCfgScale} step={0.5} />
                <NumberField label="Seed" value={seed} onChange={setSeed} step={1} />
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <label>Text</label>
                <textarea value={text} onChange={(event) => setText(event.target.value)} />
              </div>
              <div className="grid-2">
                <div className="field">
                  <label>Sprache</label>
                  <input type="text" value={language} onChange={(event) => setLanguage(event.target.value)} />
                </div>
                <NumberField label="Seed" value={seed} onChange={setSeed} step={1} />
              </div>
              <div className="field">
                <label>Stimm-Instruktion</label>
                <textarea value={instruction} onChange={(event) => setInstruction(event.target.value)} />
              </div>
            </>
          )}

          <div className="modal-actions">
            <button className="primary" type="button" disabled={busy || serviceState !== "up"} onClick={() => void handleGenerate(false)}>
              {busy ? "Generiert..." : "Generieren"}
            </button>
            <button type="button" disabled={busy || serviceState !== "up"} onClick={() => void handleGenerate(true)}>
              Retry neuer Take
            </button>
          </div>
          {error && <p className="status err">⚠ {error}</p>}
        </section>

        <section className="generator-results">
          <h3>Vorhandene Takes</h3>
          <div className="generated-list">
            {entries.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={`generated-item ${entry.id === activeId ? "active" : ""}`}
                onClick={() => setActiveId(entry.id)}
              >
                <strong>{entry.title}</strong>
                <span>{new Date(entry.createdAt).toLocaleString("de-DE")}</span>
                <span>{entry.source}</span>
              </button>
            ))}
            {entries.length === 0 && <p className="muted">Noch keine generierten Dateien vorhanden.</p>}
          </div>
          {activeEntry && (
            <div className="preview-panel">
              <audio controls src={api.generatedFileUrl(activeEntry.id)} />
              {activeEntry.translatedPrompt && <p className="muted">Übersetzt: {activeEntry.translatedPrompt}</p>}
              <button className="primary" type="button" disabled={assigning} onClick={() => void handleAssign(activeEntry)}>
                {assigning ? "Weist zu..." : "Für diesen Raum verwenden"}
              </button>
            </div>
          )}
        </section>
      </div>
    </Modal>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step,
}: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step: number;
}): JSX.Element {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="number" value={value} step={step} onChange={(event) => onChange(Number(event.target.value))} />
    </div>
  );
}