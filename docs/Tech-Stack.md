# Tech-Stack
## Vorschlag für eine browserbasierte 2D-/Scherenschnitt-/Hybridumsetzung

## 1. Grundentscheidung

Der technische Leitansatz ist eine hybride 2D-Erfahrungsarchitektur.

Kein vollwertiges 3D-Spiel.

Keine klassische Social-Media-Webapp.

Keine VR-Pflicht.

Stattdessen:

- browserbasiert,
- installierbar als PWA,
- mobil und desktopfähig,
- stark audio- und atmosphärenzentriert,
- Canvas/WebGL-basiert,
- optional mit Echtzeitresonanz,
- datensparsam,
- anonym,
- modular erweiterbar.

## 2. Frontend

### Kern

Empfohlen:

- **Vite**
- **TypeScript**
- **React**
- **PixiJS** oder **Konva**
- **Framer Motion** für UI-Übergänge, nicht für Raumlogik
- **Zustand** oder kleiner eigener Store
- **Howler.js** oder Web Audio API für Klang
- **PWA Support**

### Alternative

Wenn stärker künstlerisch / generativ:

- p5.js
- plain Canvas 2D
- GLSL Shader mit regl oder Three.js nur für Effekte

### Warum nicht primär Three.js?

Three.js kann für bestimmte Effekte nützlich sein, aber eine vollständige 3D-Welt birgt Risiken:

- kippt leicht in Game-Logik,
- erhöht Komplexität,
- erschwert Reduktion,
- erzeugt Steuerungsfokus,
- kann spirituelle Leere mit technischer Exploration verwechseln.

Three.js kann punktuell für Shader, Tiefe, Partikel oder Nebel genutzt werden.

## 3. Rendering-Architektur

### Szenenmodell

Jeder Raum ist eine Scene.

Eine Scene enthält:

- Hintergrundlayer,
- Parallaxlayer,
- Partikellayer,
- symbolische Objekte,
- Interaktionszonen,
- Audiozonen,
- Portale,
- Zustandsregeln,
- Impulse,
- Resonanzeffekte.

### Beispielstruktur

```ts
type RoomId =
  | "threshold"
  | "traces"
  | "listening"
  | "lament"
  | "response"
  | "density"
  | "calling"
  | "exit"
  | "sending";

type RoomDefinition = {
  id: RoomId;
  title: string;
  assets: RoomAssets;
  audio: AudioDefinition;
  layers: LayerDefinition[];
  interactions: InteractionDefinition[];
  portals: PortalDefinition[];
  temporalRules?: TemporalRule[];
  resonanceRules?: ResonanceRule[];
};
```

## 4. Audio

### Minimaler Stack

- Web Audio API für präzise Steuerung
- Howler.js für einfache Loops und One-Shots
- optional Tone.js für generative Klangschichten

### Audiofunktionen

- Ambient Loops,
- zufällige Klangereignisse,
- räumlich gefühlte Klangquellen,
- Hall,
- Filter,
- Drones,
- Klangantworten auf Klick,
- Klangantworten auf Ko-Präsenz,
- Übergangsklänge zwischen Räumen.

### Wichtige Regeln

- Kein Dauerteppich ohne Atem.
- Klang darf Stille tragen.
- Klick erzeugt nicht sofort „Effekt“, sondern Resonanz.
- Reaktionen dürfen zeitverzögert sein.
- Klang soll Raumtiefe erzeugen, nicht App-Feedback.

## 5. Zustandsmodell

### Lokaler Zustand

- aktueller Raum,
- Verweildauer,
- besuchte Räume,
- lokal hinterlassene Spuren,
- Audioeinstellungen,
- reduzierte Bewegung,
- Session-Phase,
- Übergangszustände.

### Flüchtiger gemeinsamer Zustand

Optional:

- Anzahl aktiver anonymer Sessions als nicht sichtbarer Resonanzwert,
- kollektive Lichtintensität,
- kollektive Klageintensität,
- Anzahl aktiver Kerzen als atmosphärischer Wert,
- Resonanzereignisse ohne Identität.

Keine konkreten Nutzerlisten.

Keine Profile.

Keine Historien einzelner Personen.

## 6. Backend

### Minimalvariante

Für einen rein lokalen Prototyp:

- keine Anmeldung,
- keine Datenbank,
- statische Assets,
- lokaler Zustand im Browser.

### Resonanzvariante

Für anonyme Ko-Präsenz:

- Node.js / Fastify oder Express,
- WebSocket oder Server-Sent Events,
- Redis für flüchtigen Zustand,
- keine persistente Nutzeridentität.

### Persistente Artefakte

Falls nötig:

- PostgreSQL oder SQLite,
- Speicherung nur von Artefakten, nicht von Nutzerprofilen,
- harte Ablaufzeiten,
- Moderationsstatus,
- keine IP-bezogene Auswertung außer technisch notwendiger Sicherheit.

## 7. Echtzeit-Kommunikation

Für den Anfang wird **WebSocket** als Transport für anonyme Live-Resonanz festgelegt.

Siehe dazu:

- `WebSocket-Resonanzarchitektur.md`

WebSocket wird ausschließlich für flüchtige Ko-Präsenz und symbolische Raumereignisse genutzt.

Nicht für:

- Chat,
- Direktnachrichten,
- sichtbare Online-Listen,
- Profile,
- Avatare,
- soziale Metriken.

Nicht übertragen:

- Nutzername,
- Avatar,
- Chat,
- exakte Bewegungsdaten,
- persönliche Profile,
- genaue Cursorpositionen,
- Bewegungsprofile.

Übertragen werden nur aggregierte oder symbolische Ereignisse:

```json
{
  "type": "gesture",
  "room": "lament",
  "gesture": "stone_laid",
  "intensity": 0.4
}
```

Der Server übersetzt diese Gesten in Resonanzereignisse oder aggregierte Raumzustände:

```json
{
  "type": "room_state",
  "room": "lament",
  "presenceDensity": 0.28,
  "silenceDepth": 0.62,
  "lamentWeight": 0.31,
  "lightWarmth": 0.18
}
```

## 8. Datenschutz und Sicherheit

Grundsatz:

> So wenig personenbezogene Daten wie möglich.

### Keine Anmeldung im Hauptbereich

Der Hauptbereich sollte anonym nutzbar sein.

### Ausgangsraum als Sonderbereich

Nur im Ausgangsraum kann freiwillig etwas eingegeben werden:

- Gedanke,
- Bitte,
- Wunsch,
- Kontaktbitte,
- Hilferuf.

Dieser Bereich braucht:

- klare Einwilligung,
- Moderationskonzept,
- sichere Speicherung,
- Rollen für Begleitende,
- Löschfristen,
- Krisenhinweise,
- keine öffentliche Bloßstellung.

## 9. Moderation

Da der Hauptraum keine freie Kommunikation erlaubt, ist das Missbrauchsrisiko reduziert.

Moderationsbedarf entsteht vor allem bei:

- Textspuren,
- eingesprochenen Worten,
- Bitten,
- Kontaktwünschen,
- Artefakttexten.

Empfohlen:

- Freigabewarteschlange für öffentliche Spuren,
- private Bitten nur an geschulte Personen,
- Meldefunktion im Ausgangsraum,
- automatische Filter nur unterstützend,
- menschliche Prüfung bei sensiblen Inhalten.

## 10. Barrierefreiheit

Notwendig:

- Untertitel / Textalternativen für Audioimpulse,
- reduzierte Bewegung,
- Lautstärkeregler,
- Tastaturnavigation,
- Screenreader-kompatible Ausgangsbereiche,
- keine rein farbcodierte Bedeutung,
- Pausierbarkeit,
- Kontrastoptionen,
- keine flackernden Effekte.

## 11. Deployment

Mögliche Varianten:

### Statischer Prototyp

- GitHub Pages,
- Netlify,
- Vercel,
- Cloudflare Pages.

### Mit Echtzeitbackend

- Fly.io,
- Render,
- Railway,
- Hetzner,
- eigener kleiner VPS,
- Docker.

### Datenhaltung

- Redis für flüchtige Resonanz,
- PostgreSQL für moderierte Ausgangsbeiträge,
- S3-kompatibler Speicher für Audio / Bildartefakte.

## 12. Repository-Struktur

```txt
resonanzraum/
  apps/
    web/
      src/
        rooms/
        components/
        audio/
        state/
        assets/
        content/
        moderation/
  packages/
    room-engine/
    resonance-protocol/
    content-schema/
  docs/
    Konzept.md
    Liturgisches-Manifest.md
    Design-Artefakte.md
    Tech-Stack.md
    Technischer-Implementarions-plan.md
    TESTS/
      Kontrollfragen.md
  AGENTS.md
```

## 13. Lizenzierung

Empfohlen:

- Code: MIT oder AGPL, je nach gewünschter Offenheit.
- Inhalte: CC BY-NC-SA oder CC BY-SA.
- Grafiken und Audio: klare Herkunft, Rechte und KI-Generierungsnachweise.
- Prompt- und Assetdokumentation im Repo.

## 14. Technisches Leitprinzip

Technik ist dienend.

Ein technisches Element ist gut, wenn es:

- Anwesenheit vertieft,
- Stille trägt,
- Resonanz ermöglicht,
- Datenschutz wahrt,
- Missbrauch erschwert,
- nicht in Plattformlogik kippt.

Technik ist problematisch, wenn sie:

- Aufmerksamkeit maximiert,
- Aktivität quantifiziert,
- Identität exponiert,
- Vergleichbarkeit erzeugt,
- das Erlebnis funktionalisiert.
