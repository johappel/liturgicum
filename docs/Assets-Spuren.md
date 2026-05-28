# Assets-Schnittliste — Raum Spuren

Diese Datei listet alle Assets, die für den Erprobungsraum *Spuren* (inkl. Ein-/Ausgangs-Übergänge) benötigt werden. Sie ist die Vorgabe für Phase 1 des Session-Plans (`/memories/session/plan.md`).

Drei Quellen sind klar getrennt:

1. **AI-generiert** — `gpt-image-2` via imagerouter (statische Bilder)
2. **Prozedural in PixiJS** — Code, keine Asset-Datei (reaktive Effekte)
3. **Pixabay** — CC0/Pixabay-Content-Lizenz (Audio)

Bezugsdokumente:

- `docs/Raeume.md` § 1.1 (Master-Screen-Komposition), § 8 (Animations-Timing)
- `docs/Design-Artefakte.md` § 11 (Spuren-Raumanker, Positionen)
- `docs/Interaktions-Spezifikation.md` § 11 (Verweildauer), § 12 (A11y)
- `samples/referenz/prompts.md` (V2-Prompt-Regeln, negative Prompts)

## 1. Verzeichnisstruktur

```
rooms/spuren/
  background.png                   # Master-Hintergrund
  parallax/
    far.png                        # Hintergrund-Layer (ggf. nicht nötig, falls in background.png integriert)
    mid.png                        # Mittel-Layer
    near.png                       # Vordergrund-Silhouetten
  anchors/
    candle_field.png               # Kerzenfeld leer
    stone_bed.png                  # Steinbett mit halb eingesunkenen Steinen
    water_edge.png                 # Wasserkante (statische Oberflächentextur)
  artifacts/
    candle_unlit.png               # Einzelne Kerze, unangezündet (Sprite)
    stone_loose.png                # Loser Stein (3 Varianten: stone_loose_a/b/c.png)
    silhouette_passing.png         # Silhouette „passing" für SilhouettePresence
    silhouette_seated.png          # Silhouette „seated"
    silhouette_kneeling.png        # Silhouette „kneeling"
  audio/
    ambient_spuren.ogg             # Loop (~60 s, nahtlos)
    transition_in.ogg              # Vorhof → Spuren (~6 s)
    transition_out.ogg             # Spuren → Hören (~7 s)
    candle_lit.ogg                 # One-Shot
    stone_placed.ogg               # One-Shot (dumpfer Klang)
    water_resonance.ogg            # One-Shot (Tropfen + Nachhall)
    distant_bell.ogg               # Sehr seltener Reife-Marker
  meta.json                        # Maschinenlesbare Asset-Metadaten (Phase 1.1)
rooms/_transitions/
  vorhof_to_spuren.png             # Mood-Frame
  spuren_to_hoeren.png             # Mood-Frame
```

## 2. AI-generierte Assets (`gpt-image-2` via imagerouter)

Jedes Asset wird über `tools/render_via_imagerouter.py` erzeugt (Phase 1.1). Der Prompt baut auf `generate_prompt.py` auf; die V2-Regeln aus `samples/referenz/prompts.md` sind verbindlich (insbesondere die Negativ-Blöcke gegen Studio-Catalog-Anmutung).

### 2.1 Hintergrund

| Datei | Größe | Quality | Format | Bemerkung |
|-------|-------|---------|--------|-----------|
| `rooms/spuren/background.png` | 1792×1024 (16:9, „auto" wenn größer) | `auto` (high) | png | Hauptbühne; Anker-Positionen aus Design-Artefakte.md § 11.1 müssen kompositorisch verankert sein |

**Prompt-Skelett** (final aus `generate_prompt.py spuren`): Master-Screen-Komposition (low angle, Bühne mittig-oben-links, Eingang unten-links angedeutet, Ausgang oben-rechts in Dunst belassen), Kerzenfeld + Steinbett + Wasserkante als bereits sichtbare Bühnenstationen, keine UI, keine Menschen, atmosphärisch, würdevoll, viel Leerraum.

### 2.2 Parallax-Layer (optional)

Nur erzeugen, wenn die Layer-Trennung visuell überzeugend ist und der Bühnenkomposition keinen Schaden zufügt. Andernfalls bleibt der Hintergrund einlagig und Parallax wird durch Pointer-Drift auf einem einzigen Bild simuliert.

| Datei | Bemerkung |
|-------|-----------|
| `rooms/spuren/parallax/far.png` | ferne Architektur / Horizont, Alpha über Hintergrund |
| `rooms/spuren/parallax/mid.png` | mittlere Säulen / Wandtiefe |
| `rooms/spuren/parallax/near.png` | vordere Silhouetten (Steinkante, Stoff, Zweig) |

### 2.3 Anker-Sprites

Alle mit transparentem Alpha, freigestellt; Licht- und Materialcharakter exakt aus dem Hintergrund übernehmen.

| Datei | Bemerkung |
|-------|-----------|
| `rooms/spuren/anchors/candle_field.png` | Flache Steinplatte mit 3–5 leeren Kerzenpositionen, daneben kleine Tonschalen |
| `rooms/spuren/anchors/stone_bed.png` | Bodenfläche mit 4–6 halb eingesunkenen Steinen |
| `rooms/spuren/anchors/water_edge.png` | Ruhige Wasseroberfläche als Textur-Patch (wird im Code mit leichtem Displacement animiert) |

### 2.4 Artefakte

| Datei | Bemerkung |
|-------|-----------|
| `rooms/spuren/artifacts/candle_unlit.png` | Einzelne Kerze, unangezündet, freigestellt; die Flamme entsteht prozedural (siehe § 3) |
| `rooms/spuren/artifacts/stone_loose_a.png` | Loser Stein, Variante A |
| `rooms/spuren/artifacts/stone_loose_b.png` | Loser Stein, Variante B |
| `rooms/spuren/artifacts/stone_loose_c.png` | Loser Stein, Variante C |
| `rooms/spuren/artifacts/silhouette_passing.png` | Schemenhafte Figur, leichter Schritt, hohes Alpha-Fade an Kanten |
| `rooms/spuren/artifacts/silhouette_seated.png` | Schemenhafte Figur, sitzend |
| `rooms/spuren/artifacts/silhouette_kneeling.png` | Schemenhafte Figur, kniend |

Silhouetten sind absichtlich identitätslos: keine Gesichter, keine Konturen-Härte, leichter Alpha-Verlauf zu Rändern. Werden zur Laufzeit über `SilhouettePresence`-Modul ein-/ausgeblendet.

### 2.5 Übergangs-Schlüsselbilder

| Datei | Bemerkung |
|-------|-----------|
| `rooms/_transitions/vorhof_to_spuren.png` | Mood-Frame für die Mitte des Übergangs (Phase „Schleier"): Nebel öffnet sich, erste warme Lichtpunkte schimmern durch |
| `rooms/_transitions/spuren_to_hoeren.png` | Mood-Frame: Lichtpunkte sammeln sich nach hinten, Klang verdichtet sich, Wasser tritt zurück |

Diese Bilder werden im Code als Zwischen-Crossfade-Slide eingesetzt (nicht als Sequenz, nur als Stützframe).

## 3. Prozedurale Effekte (PixiJS, kein Asset)

Aus dem Session-Plan Phase 2.6. Diese Module leben im `app/`-Code und werden in Phase 3 instanziert. Eingangsparameter und Lifetimes folgen `docs/Raeume.md` § 8.4.

| Modul | Im Raum Spuren verwendet für |
|-------|------------------------------|
| `FlameEmitter` | Aktive Kerzenflammen am Kerzenfeld; bei Fremd-Spuren mit niedriger Intensität |
| `SmokeEmitter` | Sehr sanfter Rauch über aktiven Kerzen (gedimmt) |
| `FogLayer` | Atmosphärischer Nebel über der Bühne, leichte Pointer-Reaktion |
| `DustEmitter` | Staub in der Lichtachse über dem Kerzenfeld |
| `WaterRing` | Wellenkreise an der Wasserkante (Stein-Resonanz, Pointer-Reveal) |
| `SilhouettePresence` | Fremd-Spuren-Silhouetten (Fade in/out über TTL) |
| `LeafEmitter` | *nicht* in Spuren (für spätere Räume) |
| Lichtkreis Kerze (radialer Gradient) | Resonance-Antwort bei `candle_lit` |

## 4. Pixabay-Audio

Alle Stems CC0 oder unter Pixabay-Content-Lizenz. Pro Datei in Phase 1.5 protokollieren:

- Quell-URL,
- Lizenz-Bezeichnung,
- Download-Datum,
- Bearbeitungsschritte (Schnitt, Loop-Punkt, Lautstärke-Normalisierung).

| Datei | Charakter | Länge | Bemerkung |
|-------|-----------|-------|-----------|
| `ambient_spuren.ogg` | tiefer warmer Drone + sehr feines Holz-/Steinrauschen | ~60 s, nahtloser Loop | −18 LUFS Ziel |
| `transition_in.ogg` | Klangverdichtung Nebel → erste warme Töne | 6 s | endet auf demselben Grundton wie `ambient_spuren` |
| `transition_out.ogg` | Sammlung nach hinten, dunklerer Drone | 7 s | überleitet zum Hören-Drone |
| `candle_lit.ogg` | leises Aufflammen + sanfter Aufschwellton | 1.2 s | One-Shot, leichtes Lowpass |
| `stone_placed.ogg` | dumpfer Stein-Aufschlag + langer Subbass-Nachhall | 2.5 s | nicht zu laut, würdevoll |
| `water_resonance.ogg` | tiefer Tropfen + 4 s Hall-Tail | 4 s | Tail leise enden lassen |
| `distant_bell.ogg` | sehr ferne Glocke, einmalig | 3 s | wird nur als 90 s+30 s Reife-Marker getriggert |

## 5. Asset-Metadaten (`meta.json`)

`tools/render_via_imagerouter.py` schreibt für jedes erzeugte Bild einen Eintrag in `rooms/spuren/meta.json`:

```json
{
  "background.png": {
    "source": "imagerouter:openai/gpt-image-2",
    "prompt_id": "spuren_v3",
    "prompt_sha256": "…",
    "rendered_at": "2026-05-29T…Z",
    "size": "1792x1024",
    "quality": "auto",
    "license": "OpenAI-Output-Terms via imagerouter (eigene Nutzungsrechte)"
  }
}
```

Für Pixabay-Sounds wird der Eintrag manuell ergänzt mit `source: "pixabay:<URL>"` und `license: "Pixabay-Content-Lizenz"`.

## 6. Lizenz-Erklärung

- **AI-Bilder:** Nutzungsrechte über OpenAI-Output-Terms, vermittelt durch imagerouter. Das ist **nicht** CC0. Im Repo-README wird das als „eigene Nutzungsrechte" ausgewiesen, keine Weiterlizenzierung an Dritte ohne erneute Prüfung.
- **Pixabay-Audio:** Pixabay-Content-Lizenz erlaubt freie Nutzung (auch kommerziell, ohne Namensnennung). Wiederverkauf als reine Audiosammlung wäre ausgeschlossen — für uns unkritisch.
- **API-Key-Hygiene:** `IMAGEROUTER_API_KEY` nur aus Env-Variable; `.env` in `.gitignore`; Key niemals in Commits, Logs oder `meta.json`.

## 7. Manifest-Check

- *Vermeidet Plattformlogik?* Keine Userdaten in Assets; keine Tracking-Pixel; keine externen CDN-Calls zur Laufzeit (alle Assets gehostet auf GitHub Pages).
- *Würde gewahrt?* Silhouetten identitätslos; keine echten Personen-Fotos.
- *Anti-Kitsch?* Audio-Auswahl meidet Wellness-/Spa-Charakter (kein Panflöten-Loop, keine New-Age-Pads); Drones bleiben dunkel-warm statt süßlich.
- *Lizenz transparent?* Quelle, Lizenz und Datum pro Asset in `meta.json`.
