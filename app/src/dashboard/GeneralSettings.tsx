import { useEffect, useState } from "react";
import type {
  EffectsLibrary,
  GeneralConfig,
  InteractionsLibrary,
  SilhouettesLibrary,
} from "../config/libraryTypes";
import { api } from "./api";

/** Allgemeine Einstellungen + gemeinsame Bibliotheken (GENERAL SETTINGS). */
export function GeneralSettings(): JSX.Element {
  const [general, setGeneral] = useState<GeneralConfig | null>(null);
  const [effects, setEffects] = useState<EffectsLibrary | null>(null);
  const [interactions, setInteractions] = useState<InteractionsLibrary | null>(null);
  const [silhouettes, setSilhouettes] = useState<SilhouettesLibrary | null>(null);
  const [status, setStatus] = useState<{ kind: "ok" | "err" | "idle"; msg: string }>({
    kind: "idle",
    msg: "",
  });

  useEffect(() => {
    void (async () => {
      try {
        const [g, e, i, s] = await Promise.all([
          api.getGeneral(),
          api.getEffects(),
          api.getInteractions(),
          api.getSilhouettes(),
        ]);
        setGeneral(g);
        setEffects(e);
        setInteractions(i);
        setSilhouettes(s);
      } catch (err) {
        setStatus({ kind: "err", msg: String(err) });
      }
    })();
  }, []);

  async function saveGeneral(): Promise<void> {
    if (!general) return;
    try {
      await api.saveLibrary("general", general);
      setStatus({ kind: "ok", msg: "Allgemeine Einstellungen gespeichert." });
    } catch (e) {
      setStatus({ kind: "err", msg: String(e) });
    }
  }

  return (
    <div>
      <div className="toolbar">
        <strong>Allgemein &amp; Bibliotheken</strong>
        {status.kind === "ok" && <span className="status ok">{status.msg}</span>}
        {status.kind === "err" && <span className="status err">⚠ {status.msg}</span>}
      </div>

      {general && (
        <section className="panel">
          <h2>Übergänge (Dauer / Entfernung)</h2>
          <div className="grid-2">
            <NumField
              label="Standard-Dauer (ms)"
              value={general.transitions.defaultDurationMs}
              onChange={(v) =>
                setGeneral({ ...general, transitions: { ...general.transitions, defaultDurationMs: v } })
              }
            />
            <NumField
              label="Portal-Dauer (ms)"
              value={general.transitions.portalDurationMs}
              onChange={(v) =>
                setGeneral({ ...general, transitions: { ...general.transitions, portalDurationMs: v } })
              }
            />
            <NumField
              label="Minimale Dauer (ms)"
              value={general.transitions.minDurationMs}
              onChange={(v) =>
                setGeneral({ ...general, transitions: { ...general.transitions, minDurationMs: v } })
              }
            />
            <NumField
              label="Maximale Dauer (ms)"
              value={general.transitions.maxDurationMs}
              onChange={(v) =>
                setGeneral({ ...general, transitions: { ...general.transitions, maxDurationMs: v } })
              }
            />
          </div>
          <h3>Silhouetten-Standards</h3>
          <div className="grid-2">
            <NumField
              label="Einblenden (ms)"
              value={general.silhouetteDefaults.fadeInMs}
              onChange={(v) =>
                setGeneral({
                  ...general,
                  silhouetteDefaults: { ...general.silhouetteDefaults, fadeInMs: v },
                })
              }
            />
            <NumField
              label="Halten (ms)"
              value={general.silhouetteDefaults.holdMs}
              onChange={(v) =>
                setGeneral({
                  ...general,
                  silhouetteDefaults: { ...general.silhouetteDefaults, holdMs: v },
                })
              }
            />
            <NumField
              label="Ausblenden (ms)"
              value={general.silhouetteDefaults.fadeOutMs}
              onChange={(v) =>
                setGeneral({
                  ...general,
                  silhouetteDefaults: { ...general.silhouetteDefaults, fadeOutMs: v },
                })
              }
            />
            <div className="field">
              <label>Hush-Sound</label>
              <input
                type="text"
                value={general.silhouetteDefaults.hushSound}
                onChange={(e) =>
                  setGeneral({
                    ...general,
                    silhouetteDefaults: { ...general.silhouetteDefaults, hushSound: e.target.value },
                  })
                }
              />
            </div>
          </div>
          <button className="primary" onClick={() => void saveGeneral()}>
            Allgemein speichern
          </button>
        </section>
      )}

      <section className="panel">
        <h2>Effekt-Bibliothek</h2>
        {(effects?.effects ?? []).map((e) => (
          <div className="item" key={e.id}>
            <div className="item-head">
              <strong>
                {e.label} <span className="muted">({e.id})</span>
              </strong>
              <span className={`badge ${e.source}`}>{e.source}</span>
            </div>
            <p className="muted">{e.description}</p>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2>Interaktions-Bibliothek</h2>
        {(interactions?.interactions ?? []).map((x) => (
          <div className="item" key={x.id}>
            <div className="item-head">
              <strong>
                {x.label} <span className="muted">({x.id})</span>
              </strong>
              <span className={`badge ${x.source}`}>{x.source}</span>
            </div>
            <p className="muted">{x.description}</p>
          </div>
        ))}
      </section>

      <section className="panel">
        <h2>Silhouetten-Bibliothek</h2>
        {(silhouettes?.silhouettes ?? []).map((s) => (
          <div className="item" key={s.id}>
            <strong>
              {s.label} <span className="muted">({s.src})</span>
            </strong>
          </div>
        ))}
      </section>

      <ScaffoldSection />
    </div>
  );
}

/* ---------- KI-Scaffold ---------- */
function ScaffoldSection(): JSX.Element {
  const [type, setType] = useState<"effect" | "interaction">("effect");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<{ spec: string; prompt: string } | null>(null);
  const [error, setError] = useState("");

  async function submit(): Promise<void> {
    setError("");
    setResult(null);
    try {
      const res = await api.scaffold({ type, name: name.trim(), description });
      setResult(res);
    } catch (e) {
      setError(String(e));
    }
  }

  return (
    <section className="panel">
      <h2>KI-gestützt neuen Effekt / neue Interaktion hinzufügen</h2>
      <p className="muted">
        Erzeugt eine Scaffold-Spezifikation und einen Agent-Prompt unter <code>tools/recipes/</code>.
        Der Agent implementiert daraus den Code und registriert ihn in der Bibliothek.
      </p>
      <div className="grid-2">
        <div className="field">
          <label>Typ</label>
          <select value={type} onChange={(e) => setType(e.target.value as "effect" | "interaction")}>
            <option value="effect">Effekt</option>
            <option value="interaction">Interaktion</option>
          </select>
        </div>
        <div className="field">
          <label>Name (a-z, 0-9, _-)</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="rising_lights" />
        </div>
      </div>
      <div className="field">
        <label>Beschreibung</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Aufsteigende Lichtpunkte, die langsam nach oben treiben und verblassen …"
        />
      </div>
      <button className="primary" onClick={() => void submit()} disabled={!name.trim()}>
        Scaffold erzeugen
      </button>
      {error && <p className="status err">⚠ {error}</p>}
      {result && (
        <div className="item">
          <p className="status ok">Erzeugt:</p>
          <p className="muted">
            Spezifikation: <code>{result.spec}</code>
            <br />
            Agent-Prompt: <code>{result.prompt}</code>
          </p>
        </div>
      )}
    </section>
  );
}

function NumField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
}): JSX.Element {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  );
}
