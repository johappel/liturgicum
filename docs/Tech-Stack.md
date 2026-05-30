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
- **PixiJS**
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

### Aktueller Spuren-Prototyp

Audio läuft über `Howler.js` in `app/src/audio/AudioEngine.ts`:

- ein aktiver Ambient-Loop pro Raum mit Crossfade,
- One-Shots für Wasser, Stein, Kerze, Gate-Fallback und Silhouetten-Auflösung,
- globale Master-Lautstärke und Mute über den Store,
- Autoplay-sicherer Unlock beim ersten Pointer-Down.

In `SpurenRoom` wird die One-Shot-Intensität zusätzlich aus der Raumposition berechnet. Der kalibrierte `GROUND_PERSPECTIVE.vanishingPoint` ist akustisch sehr leise; Richtung `referencePoint` steigt die Intensität weich an. Das ist eine einfache Tiefenheuristik, keine vollständige WebAudio-Panner-Simulation.

Der Spuren-Raum besitzt eine einmalige Ankommenssequenz pro Session. Sie nutzt dieselbe Audio-Engine:

- Ambient per `crossfadeAmbient(...)`
- `intro_2.mp3` als vorgeschalteter Raumwahrnehmungs-Impuls
- `spuren.mp3` als gesprochenes Willkommen; die Dauer wird automatisch aus den Audio-Metadaten gelesen
- `chakra.mp3` als Glocke nach dem Willkommen und als Hinweis nach 90 Sekunden

Während dieser Sequenz werden Presence-Spawns und Pointer-Interaktionen erst nach Abschluss freigegeben. Die 90-Sekunden-Reifezeit fuer den Hinweis auf den geoeffneten Folgeraum startet ebenfalls erst nach dieser Freigabe, nicht beim Mount des Raums.

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
- platzierte Artefakte im Raum,
- gesehene Raum-Intros,
- Audioeinstellungen,
- reduzierte Bewegung,
- Session-Phase,
- Übergangszustände.

### Aktueller Store-Stand

Der Prototyp nutzt Zustand in `app/src/state/store.ts`. Für `spuren` existiert zusätzlich `placedArtifacts`:

- `kind`: `candle` oder `stone`
- normierte Position (`x`, `y`)
- `alpha`
- `createdAt`

Diese Daten erlauben, beim erneuten Betreten des Raums die abgelegten Artefakte wieder aufzubauen. Es handelt sich um Session-Persistenz im lokalen App-Zustand, nicht um dauerhafte Speicherung über Browser-Reload oder Server.

Zusätzlich speichert `roomIntrosSeen`, welche liturgischen Raum-Intros in der laufenden Session bereits gezeigt wurden. Dadurch laeuft das Spuren-Intro beim Zurueckkehren nicht erneut.

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
- `Interaktions-Spezifikation.md`

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

### Eventmodell: Geste, Ziel, Anker, Wirkung

Für die Umsetzung sollte zwischen vier Ebenen unterschieden werden:

- `gesture`: Was geschieht semantisch?
- `target`: Worauf wirkt die Geste?
- `anchor`: Wo beginnt die sichtbare Wirkung im Raum?
- `effect`: Wie übersetzt der Client das in Atmosphäre?

Beispiele:

- `gesture`: `stone_laid`, `candle_lit`, `water_touched`, `leaf_scattered`
- `target`: `stone_bed`, `candle_cluster`, `water_pool`, `bowl`, `threshold`
- `anchor`: lokaler Punkt, grobe Zone oder Objektzentrum
- `effect`: Wasserkreis, Lichtimpuls, Nebelöffnung, Klangnachhall, Schattenverdichtung

Wichtig ist die Trennung zwischen lokaler Interaktion und geteilter Resonanz:

- Lokal darf der Client mit exakten Klickpunkten oder Touchpunkten arbeiten.
- Geteilt werden nur symbolische Ereignisse mit Zielobjekt und optional grober Zone.
- Nicht geteilt werden pixelgenaue Cursorpfade, Bewegungsprofile oder dauerhaft verknüpfbare Positionsdaten.

### Flüchtige Scherenschnittfiguren

Scherenschnittfiguren sollten nicht als persistente Figuren oder Avatare modelliert werden.

Sie sind besser als kurzlebige Visualisierung einer Geste oder einer Raumresonanz zu verstehen:

- auftauchen,
- kurz wirksam sein,
- wieder verschwinden,
- als Schatten, Nebelverschiebung, Windzug oder Lichtnachhall in den Raum zurücksinken.

Technisch heißt das:

- Das Kernprotokoll beschreibt Bedeutung und Raumwirkung.
- Die Figur ist eine mögliche Renderform dieser Bedeutung.
- Nicht jede Geste braucht überhaupt eine sichtbare Figur.
- Wo Figuren erscheinen, sollten sie kurzlebig und austauschbar bleiben.

Empfohlene Sichtbarkeitsdauer:

- Auftauchen: 1 bis 2 Sekunden
- Wirksamkeit: 2 bis 6 Sekunden
- Auflösen: 1 bis 3 Sekunden
- Gesamtzeit meist unter 10 Sekunden

### Optionaler Render-Hinweis

Wenn eine Geste clientseitig konsistenter als Scherenschnittfigur übersetzt werden soll, kann zusätzlich ein optionaler Render-Hinweis mitlaufen.

Dieser Hinweis darf nie zum eigentlichen Identitäts- oder Verhaltensmodell werden.

Beispiel:

```json
{
  "type": "gesture",
  "room": "lament",
  "gesture": "stone_laid",
  "target": "stone_bed",
  "zone": "front_left",
  "intensity": 0.58,
  "renderHint": {
    "silhouettePose": "kneeling",
    "movementMode": "dissolving",
    "presenceMode": "brief"
  }
}
```

Der Client darf diesen Hinweis ignorieren, vereinfachen oder atmosphärisch anders übersetzen.

### Kleine Pose-Bibliothek

Für den Anfang reicht eine sehr kleine Anzahl von Posen:

- `passing`
- `standing`
- `seated`
- `kneeling`
- `reaching`

Diese Posen beschreiben keine detaillierte Körpermechanik, sondern nur die qualitative Anmutung einer Erscheinung.

### Kleine Bewegungsbibliothek

Zusätzlich reicht eine sehr kleine Anzahl von Bewegungsmodi:

- `still`
- `swaying`
- `drifting`
- `dissolving`

Damit können fast alle gewünschten Situationen atmosphärisch beschrieben werden, ohne dass echte Avatarlogik entsteht.

### Pose- und Windmatrix

Die Wirkung einer Figur entsteht weniger aus Animationstiefe als aus der Kopplung an Nebel, Wind, Stoff, Licht und Partikel.

| Pose | Typische Geste | Bewegungsmodus | Windverhalten | Raumwirkung |
| --- | --- | --- | --- | --- |
| `passing` | Schwelle überschreiten, vorbeiziehen | `drifting` | leichter Zug in Bewegungsrichtung | Nebel öffnet sich kurz, Stoffe und Zweige reagieren |
| `standing` | stilles Dasein, Kerze betrachten | `still` oder `swaying` | kaum Zug, eher leichtes Flimmern | der Raum verdichtet sich lokal, Licht hält an |
| `seated` | verweilen, hören, sammeln | `still` | Wind wird schwächer und tiefer | Ruhe, Sammlung, längerer Hall |
| `kneeling` | Stein legen, Wasser berühren, klagen | `still` oder `dissolving` | Wind nimmt stark ab oder steht fast still | Konzentration, Schwere, lokale Antwort im Objekt |
| `reaching` | Kerze anzünden, Blatt streuen, Licht senden | `swaying` | kurzer zarter Zug um Handlungsrichtung | Impuls, Lichtantwort, kleine Partikel- oder Klangreaktion |

### Gehen und Stehen

Zwischen Gehen und Stehen gibt es einen Unterschied, aber keinen großen technischen Unterbau.

- `passing` bedeutet: räumliche Verschiebung mit leichter Spur in Wind, Nebel oder Stoff.
- `standing` bedeutet: kurze Anwesenheit ohne Ortswechsel, fast unbewegt, nur mit minimalem Atem oder Flimmern.

Der Unterschied wird daher weniger über komplexe Figurenanimation erzeugt als über die Reaktion des Raums.

### Gemeinsame Interaktionsgrammatik

Für viele symbolische Objekte sollte dieselbe Grundlogik gelten. Der User lernt dadurch nicht für jedes Artefakt eine neue Steuerung, sondern erkennt ein wiederkehrendes Muster:

1. `reveal`: Ein Objekt zeigt, dass es ansprechbar ist.
2. `claim`: Halten nimmt das Objekt oder die Geste an.
3. `carry`: Ziehen verbindet Objekt und Raum.
4. `offer`: Loslassen an einer passenden Zone übergibt die Handlung.
5. `resonance`: Der Raum antwortet.

Diese Logik ist nicht als klassisches Drag-and-Drop-System zu verstehen, sondern als ruhige liturgische Objektgeste.

Das heißt:

- Objekte dürfen auf Klick sanft antworten, ohne wie Buttons zu wirken.
- Halten verdichtet die Geste und macht die Handlung verbindlicher.
- Ziehen trägt das Objekt oder die Wirkung durch den Raum.
- Loslassen außerhalb einer sinnvollen Zone sollte nicht hart scheitern, sondern weich zurückgleiten oder unvollendet bleiben.
- Erst die Raumantwort macht die Handlung vollständig erfahrbar.

### Affordanzen ohne UI-Sprache

Der User darf Interaktionen entdecken, soll aber nicht ratlos bleiben.

Geeignete Affordanzen sind:

- leichtes Anheben,
- Rascheln,
- schwaches Glimmen,
- minimale Objektrotation,
- lokaler Klang,
- feiner Lichtsaum,
- leichte Magnetwirkung einer Zielzone,
- sanfte Reaktion von Nebel, Wasser oder Stoff.

Nicht verwenden:

- sichtbare Drop-Zonen als UI-Rahmen,
- Pfeile,
- blinkende CTAs,
- technische Fehlermeldungen,
- exakte Puzzle-Präzision.

### Objektmatrix

| Objekt | Reveal bei Klick | Claim bei Halten | Carry beim Ziehen | Offer beim Loslassen | Resonanz im Raum |
| --- | --- | --- | --- | --- | --- |
| `candle` | ein stabiler Kerzenkörper reagiert mit schwachem Glimmen oder leichtem Aufrichten | am Kerzenkörper erscheint eine kleine Flamme oder Lichtkante statt eines vollständigen Bildtausches | das Licht wird als ruhige Gabe getragen | erst in einer stillen Lichtzone oder auf einem Kerzentisch wird sie abgestellt | Kerzenschimmer, wärmeres Licht, leiser Klang, mehr Raumwärme |
| `stone` | ein Stein hebt sich leicht hervor, Oberfläche oder Gravurfläche wird spürbar | Gravur oder Verdichtung beginnt, der Stein wird schwerer oder präsenter | der Stein wird langsam zum Boden oder Steinbett geführt | erst auf Bodenniveau oder in einer Klagezone wird er abgelegt | dumpfer Ton, dunkler Wasserkreis, schwererer Raumklang, kleines Antwortlicht |
| `leaf` | Blätter rascheln oder heben sich aus Schale oder Haufen leicht an | einige Blätter lösen sich als aufgenommene Gabe | die Blätter folgen lose und fragil der Geste | über Wasser, Erde oder Schale loslassen streut oder legt sie ab | fallende Blätter, Wasserkreise, zarter Windzug, leiser Nachhall |
| `paper` | ein Blatt oder Papier öffnet sich und wird verfügbar | der Text- oder Klageimpuls wird angenommen | das Papier wird zur Wand, Schwelle oder Fläche geführt | an einer Klagewand oder Schwellenfläche heftet es sich an | Rascheln, Wand reagiert, Schatten verdichten sich, Spur bleibt sichtbar |
| `water` | das Wasser antwortet mit feinem Schimmer oder kleiner Oberflächenstörung | die Berührung sammelt sich und bindet Aufmerksamkeit | die Geste zieht eine Spur über die Oberfläche | beim Loslassen endet die Spur in Wellen oder einer Wasserantwort | konzentrische Kreise, Reflexionsbruch, leiser Ton, tiefer Nachhall |
| `light` | eine Lichtquelle pulst sanft oder hebt sich ab | Licht wird aufgenommen oder innerlich verdichtet | der Lichtimpuls wird an eine andere Stelle getragen | an Horizont, Schwelle, Baum oder Antwortort wird das Licht übergeben | hellere Kanten, wärmere Partikel, sichtbarer Weg, sanfter Wind |

### Übertragbare Regeln

Damit die Grammatik auch für neue, noch nicht erdachte Objekte tragfähig bleibt, sollten folgende Regeln gelten:

- Klick weckt, aber vollendet noch nichts.
- Halten macht die Handlung ernsthafter und verkörperter.
- Ziehen ist keine Transportmechanik, sondern eine räumliche Geste.
- Loslassen vollendet nur dort, wo Raum und Objekt sinnvoll zusammenpassen.
- Außerhalb einer passenden Zone fällt das Objekt nicht technisch herunter, sondern findet weich in einen Zwischenzustand zurück.

### Beispielhafte Anwendung

Die Logik lässt sich direkt auf mehrere Objekte anwenden:

- Kerze: Tisch mit ruhigen Kerzenkörpern, Halten blendet Flamme und Lichtsaum ein, Loslassen in Lichtzone vollendet.

Für die Kerze ist wichtig:

- möglichst ein einziger Kerzenkörper als Asset,
- Flamme als Hybrid-Asset oder kleine Animation,
- Lichtwirkung als Laufzeitlogik statt als zweites statisches Vollbild.
- Stein: Auswahl aus Steinen, Halten graviert oder verdichtet, Loslassen am Boden vollendet.
- Blatt: Schale auf Podest, Blätter heben sich an, Ziehen über Wasser, Loslassen streut sie.
- Papier: Klick öffnet Blatt, Ziehen zur Klagewand, Loslassen heftet es an.

Die eigentliche Bedeutung entsteht dabei nicht primär aus der Objektbewegung, sondern aus der anschließenden Raumantwort.

### Lokales Interaktionsmodell

Für die unmittelbare Darstellung im eigenen Client darf eine Interaktion präzise beschrieben werden:

```json
{
  "type": "local_interaction",
  "room": "response",
  "gesture": "water_touched",
  "target": "water_pool",
  "point": { "x": 412, "y": 286 },
  "intensity": 0.4
}
```

Diese Daten steuern nur die lokale Szene, zum Beispiel:

- Ursprung eines Wasserkreises,
- exakte Stelle einer Lichtwelle,
- lokale Nebelverschiebung,
- Startpunkt eines Klangimpulses.

### Geteiltes Resonanzmodell

Für WebSocket-Ereignisse sollte das Modell symbolisch bleiben:

```json
{
  "type": "gesture",
  "room": "response",
  "gesture": "water_touched",
  "target": "water_pool",
  "zone": "center",
  "intensity": 0.4
}
```

Andere Clients müssen daraus nicht exakt dieselbe Geometrie nachbauen, sondern nur eine passende Resonanz ableiten, etwa:

- eine ferne Wasserwelle,
- ein wärmeres Licht,
- ein leiser Klang,
- ein dichterer Nebel,
- eine subtile Schattenbewegung.

### Objektvarianten am Beispiel Stein

Ein Stein ist semantisch dieselbe Geste, kann aber visuell variiert werden. Sinnvoll ist daher eine kleine, kontrollierte Variantenlogik statt freier Texteingaben.

Empfohlene Steinfelder:

- `size`: `small`, `medium`, `large`
- `shape`: `round`, `flat`, `irregular`
- `tone`: `ash`, `slate`, `earth`, `chalk`
- `surface`: `smooth`, `rough`, `weathered`
- `marking`: `none`, `etched_line`, `weathered_sign`, `warm_glow`

Beispiel:

```json
{
  "type": "gesture",
  "room": "lament",
  "gesture": "stone_laid",
  "target": "stone_bed",
  "zone": "front_left",
  "intensity": 0.58,
  "variant": {
    "size": "large",
    "shape": "flat",
    "tone": "slate",
    "surface": "weathered",
    "marking": "etched_line"
  }
}
```

Diese Varianten dürfen symbolische Differenz erzeugen, aber keine Identität transportieren.

Nicht vorsehen:

- Klarnamen auf Steinen,
- freie Namensgravuren im Hauptraum,
- personenbezogene Widmungen,
- dauerhaft verfolgbaren Besitz eines Artefakts.

Wenn textliche oder persönliche Zuschreibungen überhaupt vorkommen, dann nur im gesonderten Ausgangsbereich mit Moderation und Einwilligung.

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
    Interaktions-Spezifikation.md
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
