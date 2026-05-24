# Technischer Implementationsplan
## Vorschlag 3: 2D-/Scherenschnitt-/Hybridraum

> Hinweis: Der Dateiname übernimmt bewusst die Schreibweise aus der Anfrage: „Implementarions“. Für ein Repo wäre zusätzlich die korrigierte Variante `Technischer-Implementationsplan.md` sinnvoll.

## 1. Ziel des Prototyps

Der erste technische Prototyp soll nicht alle theologischen, sozialen und liturgischen Dimensionen vollständig umsetzen.

Er soll beweisen, dass die zentrale Erfahrung technisch und ästhetisch tragfähig ist:

> Ein Mensch betritt einen digitalen Raum, erlebt Stille, indirekte Gegenwart anderer, symbolische Handlung und leise Wirksamkeit — ohne Chat, Profil, Avatar oder Gamification.

## 2. Umsetzungsprinzip

Kein vollwertiges Spiel.

Kein komplexer 3D-Raum.

Kein Social Feature Set.

Stattdessen ein browserbasierter 2D-Hybridraum:

- tragende Hintergrundbilder,
- Parallax-Tiefe,
- Scherenschnittobjekte,
- reaktive Klangereignisse,
- subtile Partikel,
- Portale,
- symbolische Artefakte,
- optionale anonyme Echtzeitresonanz.

## 3. Phasen

## Phase 0: Repo und Dokumentationsfundament

Ziele:

- Repository anlegen,
- Grunddokumente einchecken,
- Manifest und Kontrollfragen sichtbar machen,
- technische Regeln festlegen.

Tasks:

- `/docs` anlegen,
- Konzeptdokumente einfügen,
- `AGENTS.md` einfügen,
- Lizenzentscheidung treffen,
- Minimal-README schreiben,
- Coding- und Designprinzipien dokumentieren.

Ergebnis:

- Das Projekt hat einen geistigen und technischen Rahmen, bevor Features entstehen.

## Phase 1: Minimaler Einzelraum

Ziel:

Ein Raum, der nicht wie eine App wirkt, sondern wie ein lebendiger digitaler Ort.

Features:

- Fullscreen-Erfahrung,
- ein Hintergrundbild,
- 3–5 Tiefenlayer,
- langsame Partikel,
- Ambient-Klang,
- Klick erzeugt Klang und Welle,
- keine Menüs,
- kein Dashboard,
- reduzierte UI für Audio / Verlassen.

Technik:

- Vite + React + TypeScript,
- PixiJS oder Canvas,
- Web Audio / Howler,
- Zustand für lokalen State.

Erfahrungsprüfung:

- Wirkt der Raum eingeschaltet und lebendig, auch wenn wenig passiert?
- Ist Stille unterscheidbar von technischem Stillstand?
- Wird man ruhiger oder nur neugierig?

## Phase 2: Portal und Raumwechsel

Ziel:

Räume sollen als Schwellen erfahrbar werden, nicht als Seitenwechsel.

Features:

- Portalobjekt,
- langsames Öffnen,
- Übergangsklang,
- neuer Raumhintergrund,
- Fortsetzung der Klangwelt,
- Rückkehr möglich.

Erste Räume:

1. Vorhof / Übergang
2. Raum der Spuren
3. Raum des Hörens

Erfahrungsprüfung:

- Fühlt sich der Wechsel wie ein Übergang an?
- Ist der Raumwechsel langsam genug?
- Bleibt Orientierung möglich, ohne Menülogik?

## Phase 3: Raum der Spuren

Ziel:

Indirekte Anwesenheit anderer erfahrbar machen — zunächst lokal simuliert.

Features:

- Kerzen / Lichtpunkte,
- Steine / Spuren,
- zufällige ferne Resonanzereignisse,
- Spuren verblassen langsam,
- keine Namen,
- keine Zahlen.

Technik:

- lokale Eventsimulation,
- Artefaktzustände im Store,
- TTL für Spuren,
- visuelle und akustische Resonanz.

Erfahrungsprüfung:

- Entsteht ein Gefühl von „Andere waren hier“?
- Bleibt es anonym und würdevoll?
- Vermeidet es Sammellogik?

## Phase 4: Raum des Hörens

Ziel:

Ein gemeinsamer Impuls wird nicht konsumiert, sondern lauschend erfahren.

Features:

- zeitlich verzögertes Erscheinen eines Impulses,
- Audio- oder Textfragment,
- keine Auswahlgalerie,
- keine Predigtoberfläche,
- danach Stille.

Impulse:

- Gedichtfragment,
- Weisheitstext,
- Psalmfragment,
- Handlungsimpuls,
- Musik / Klang.

Technik:

- Content-Schema,
- Tages- oder Verdichtungsimpuls,
- Audio/Text-Fallback.

Erfahrungsprüfung:

- Ist der Impuls offen genug?
- Wird er nicht zum Content-Feed?
- Entsteht Raum zum Nachklingen?

## Phase 5: Raum der Klage

Ziel:

Trauer, Wut, Ohnmacht und Erschütterung erhalten einen eigenen Ort.

Features:

- dunklerer Raum,
- Regen / Wasser / Stein,
- schwere Klangresonanz,
- Stein ablegen,
- Kerze entzünden,
- Licht glimmt als Antwort,
- keine schnellen Trostbotschaften.

Technik:

- eigener Raumzustand,
- symbolische Handlungen,
- audiovisuelle Reaktion,
- keine Texteingabe im Hauptraum.

Erfahrungsprüfung:

- Wird Schmerz ernst genommen?
- Vermeidet der Raum Kitsch und Vertröstung?
- Ist Wut möglich, ohne destruktiv zu werden?

## Phase 6: Raum der Antwort

Ziel:

Symbolische Selbstwirksamkeit ohne Gamification.

Features:

- Licht entzünden,
- Wasser berühren,
- Klangkörper anstoßen,
- Spur legen,
- Raum reagiert langsam,
- Handlung bleibt klein, aber spürbar.

Erfahrungsprüfung:

- Erlebe ich: Meine Handlung hat Bedeutung?
- Gibt es keine Punkte, keine Likes, keine sichtbare Bewertung?
- Bleibt die Handlung symbolisch offen?

## Phase 7: Raum der Berufung / leisen Wirksamkeit

Ziel:

Sinnhaftigkeit und Antwortfähigkeit erfahrbar machen.

Atmosphäre:

- Morgendämmerung,
- offener Horizont,
- Wind,
- Weg,
- wachsendes Licht.

Features:

- leiser Impuls,
- keine Challenge,
- keine Aufgabe,
- freiwillige Antwortmöglichkeit,
- Sendungsformel / Alltagsgeste.

Beispiele:

- „Unterbrich heute einmal Gleichgültigkeit.“
- „Lass einen Menschen spüren, dass er nicht übersehen wird.“
- „Trage etwas von dieser Aufmerksamkeit hinaus.“

Erfahrungsprüfung:

- Wird Berufung nicht als Leistungsdruck missverstanden?
- Entsteht ein Gefühl von Vertrauen?
- Führt der Raum zurück in die Welt?

## Phase 8: WebSocket-basierte anonyme Ko-Präsenz

Ziel:

Echte Gleichzeitigkeit, ohne andere sichtbar zu machen.

Diese Phase folgt der Spezifikation in:

- `WebSocket-Resonanzarchitektur.md`

Features:

- WebSocket-Verbindung,
- flüchtige Session-ID nur zur technischen Verbindungsverwaltung,
- symbolische Gesten,
- aggregierte Resonanzereignisse,
- kollektive Lichtveränderung,
- gemeinsame Klangverdichtung,
- kein Nutzerzähler,
- keine Identitäten,
- keine Bewegungsprofile.

Technik:

- Node/Fastify oder Express Backend,
- `ws` oder Socket.IO,
- zunächst In-Memory-Raumzustand,
- später optional Redis für flüchtige Raumwerte,
- Eventtypen statt Userdaten,
- TTL für alle Raumereignisse.

Minimales Protokoll:

```json
{
  "type": "gesture",
  "room": "lament",
  "gesture": "stone_laid",
  "intensity": 0.3
}
```

Serverantwort:

```json
{
  "type": "resonance_event",
  "room": "lament",
  "effect": "distant_water_ring",
  "intensity": 0.3,
  "ttl": 25
}
```

Erfahrungsprüfung:

- Spürt man andere, ohne sie zu sehen?
- Wird Ko-Präsenz nicht zur Statistik?
- Bleibt das Erlebnis ruhig?
- Werden keine personenbezogenen Daten erzeugt?
- Wird Handlung in Atmosphäre übersetzt statt eins zu eins sozial gespiegelt?

## Phase 9: Verdichtungszeiten

Ziel:

Der Ort ist immer da, aber zu bestimmten Zeiten verdichtet.

Features:

- Tagesrhythmus,
- Verdichtungsfenster,
- gemeinsamer Impuls,
- stärkere Resonanz,
- reduzierte Funktionen außerhalb der Verdichtungszeit.

Technik:

- serverseitiger Verdichtungskalender,
- Client reagiert auf Phase,
- Content- und Raumzustände zeitabhängig.

Erfahrungsprüfung:

- Wirkt die Zeit besonders?
- Entsteht Sammlung statt Eventisierung?
- Bleibt der Raum auch außerhalb tragfähig?

## Phase 10: Schwellenraum / Ausgang

Ziel:

Freiwillige Selbstoffenbarung und mögliche Begleitung.

Features:

- Gedanke hinterlassen,
- Wunsch formulieren,
- Bitte senden,
- Kontaktbitte optional,
- private Übermittlung an geschulte Personen,
- öffentlicher Bereich nur moderiert,
- klare Einwilligung.

Technik:

- Formular,
- Datenschutztext,
- Moderationsqueue,
- Rollen für Begleitende,
- Löschfristen,
- Krisenhinweise.

Erfahrungsprüfung:

- Ist Selbstoffenbarung wirklich freiwillig?
- Ist der Bereich klar vom Hauptraum getrennt?
- Gibt es Verantwortung für sensible Inhalte?

## Phase 11: Accessibility und Resilienz

Ziele:

- Raum nicht nur für sehende und hörende Menschen,
- reduzierte Bewegung,
- sichere Nutzung,
- keine Überwältigung.

Tasks:

- Untertitel,
- Transkripte,
- Audiodeskriptionen,
- reduced motion,
- Kontrastmodi,
- Tastaturbedienung,
- Pausierbarkeit,
- Lautstärkeregelung,
- Notausstieg.

## Phase 12: Evaluation

Methoden:

- qualitative Interviews,
- Beobachtung von Nutzungserfahrungen,
- Reflexionsfragen nach Nutzung,
- Tests mit unterschiedlichen Personas,
- Prüfung gegen Manifest und Kontrollfragen.

Keine primären Erfolgsmetriken:

- Verweildauer,
- Klickrate,
- Wiederkehrrate,
- Engagement.

Stattdessen qualitative Fragen:

- Wurde Anwesenheit vertieft?
- Wurde Stille erfahrbar?
- Wurde Ohnmacht gewürdigt?
- Wurde Handlungsmöglichkeit eröffnet?
- Entstand sozialer Druck?
- Blieb der Raum anonym und würdevoll?

## 4. MVP-Scope

Minimal sinnvoller Prototyp:

- Vorhof,
- Raum der Spuren,
- Raum der Klage,
- Raum der Antwort,
- Raum der Berufung,
- einfache Portale,
- Audio,
- Klickresonanzen,
- lokale Spuren,
- keine Anmeldung,
- keine echte Ko-Präsenz.

Erst danach:

- WebSocket-Resonanz,
- Verdichtungszeiten,
- Ausgangsraum mit Begleitung.

## 5. Risiken

### Risiko: Es wird zu spielerisch

Gegenmaßnahme:
- keine Quests,
- keine Punkte,
- keine Items,
- keine Ziele.

### Risiko: Es wird zu statisch

Gegenmaßnahme:
- atmende Animation,
- Klangtiefe,
- Verweildauer-Reaktionen,
- subtile Raumantwort.

### Risiko: Es wird zu beliebig spirituell

Gegenmaßnahme:
- Manifest,
- klare Raumfolge,
- kontrollierte Impulse,
- theologisch-philosophische Redaktion.

### Risiko: Es wird zu sozial

Gegenmaßnahme:
- keine Profile,
- keine Direktkommunikation,
- nur aggregierte Resonanz.

### Risiko: Es wird zu ästhetisch ohne Wirkung

Gegenmaßnahme:
- Klageraum,
- Berufungsraum,
- Sendungsimpulse,
- Evaluation mit Personas.

## 6. Definition of Done

Ein Feature gilt nur dann als fertig, wenn es:

- technisch funktioniert,
- barrierearm nutzbar ist,
- keine Plattformlogik einführt,
- dem Manifest nicht widerspricht,
- durch Kontrollfragen geprüft wurde,
- ästhetisch zur Raumgrammatik passt,
- keine unnötigen personenbezogenen Daten erzeugt.

## 7. Erste konkrete Entwicklungsaufgabe

Baue einen einzelnen Raum:

**„Raum der Spuren“**

Mit:

- Hintergrundbild,
- drei Parallax-Layern,
- Partikeln,
- Ambient-Klang,
- Klick erzeugt Welle und Ton,
- Kerze kann entzündet werden,
- ferne Spuren erscheinen gelegentlich,
- keine Menüs außer Audio / Verlassen.

Ziel:

Prüfen, ob stille indirekte Gegenwart überhaupt erfahrbar wird.
