# AGENTS.md
## Spezifikation, Regeln und Arbeitsweise für menschliche und KI-gestützte Beiträge

Dieses Dokument beschreibt, wie an diesem Projekt gearbeitet werden soll.

Es richtet sich an:

- Entwicklerinnen und Entwickler,
- Designerinnen und Designer,
- Redakteurinnen und Redakteure,
- theologische / pädagogische Begleitpersonen,
- KI-Agenten und Coding-Assistenten.

## 1. Projektkern

Der digitale Resonanzraum ist kein Social Network, kein Chat, kein Spiel, kein Forum und keine Meditations-App im üblichen Sinn.

Er ist ein anonymer, kontemplativer digitaler Erfahrungsraum für:

- stille Ko-Präsenz,
- Resonanz,
- Klage,
- Hoffnung,
- Sinn,
- leise Selbstwirksamkeit,
- freiwillige Rückkehr in die Welt.

Zentrale Formel:

> Nicht Sichtbarkeit, sondern Mit-Anwesenheit.

## 2. Verbindliche Dokumente

Vor jeder größeren Änderung müssen folgende Dokumente berücksichtigt werden:

- `docs/Konzept.md`
- `docs/Litgurgisches-Manifest.md`
- `docs/Design-Artefakte.md`
- `docs/Tech-Stack.md`
- `docs/Technischer-Implementarions-plan.md`
- `docs/WebSocket-Resonanzarchitektur.md`
- `docs/TESTS/Kontrollfragen.md`

Hinweis: Der Dateiname `Litgurgisches-Manifest.md` übernimmt bewusst die Schreibweise aus der ursprünglichen Aufgabenliste. Optional kann eine korrigierte Kopie `Liturgisches-Manifest.md` angelegt werden.

## 3. Harte Negativregeln

Nicht einbauen:

- Profile,
- Likes,
- Follower,
- Rankings,
- Badges,
- Streaks,
- öffentliche Nutzerzahlen,
- Chat,
- Kommentarspalten,
- Direktnachrichten im Hauptraum,
- Avatare mit Identität,
- Engagementoptimierung,
- Werbung,
- algorithmische Zuspitzung,
- sichtbare Metriken sozialer Anerkennung.

Wenn ein Feature eines dieser Muster benötigt, ist es wahrscheinlich nicht passend.

## 4. Positive Gestaltungsregeln

Baue Elemente, die:

- Anwesenheit vertiefen,
- Stille tragen,
- Resonanz ermöglichen,
- Anonymität schützen,
- Klage würdigen,
- Hoffnung nicht verharmlosen,
- Sinnhaftigkeit erfahrbar machen,
- Selbstwirksamkeit ohne Bewertung ermöglichen,
- Nähe und Distanz freiwillig halten,
- Menschen zurück in die Welt senden.

## 5. UX-Regeln

- Kein klassisches Dashboard.
- Keine überladene Navigation.
- Räume sind Schwellen, keine Menüs.
- Portale öffnen sich langsam.
- Klicks sind Gesten, keine Commands.
- Verweilen ist eine zentrale Interaktionsform.
- Der Raum darf nicht sofort alles zeigen.
- Reduktion ist ein Feature.
- Stille muss lebendig wirken.
- Audio braucht Vorrang vor visueller Überladung.
- UI nur dort, wo notwendig: Audio, Barrierefreiheit, Verlassen, Datenschutz.

## 6. Designregeln

Bevorzugt:

- 2D-Hybridraum,
- Scherenschnitt / Silhouette,
- Parallax-Tiefe,
- symbolische Artefakte,
- atmosphärische Partikel,
- langsame Animation,
- Klangräume,
- Portale,
- reduzierte Typografie.

Vermeiden:

- fotorealistische Avatare,
- Game-HUD,
- Questmarker,
- Sammelobjekte,
- Punkte,
- überdeutliche Missionslogik,
- Effekthascherei,
- Kitsch,
- moralische Plakativität.

## 7. Theologische und philosophische Sensibilität

Der Raum ist transzendenzoffen, aber nicht konfessionell eng.

Er darf an christliche, jüdische, islamische, mystische, humanistische und philosophische Traditionen anschließen, ohne sie beliebig zu vermischen.

Wichtige Begriffe:

- Resonanz,
- Du,
- Berufung,
- Klage,
- Hoffnung,
- Würde,
- Anrufbarkeit,
- Antwortfähigkeit,
- Transzendenz,
- Sendung.

Keine dogmatische Belehrung im Haupterlebnis.

Impulse sollen offen, poetisch, kurz und verantwortungsvoll sein.

## 8. Datenschutzregeln

Grundsatz:

> Keine personenbezogenen Daten, wenn sie nicht zwingend nötig sind.

Hauptraum:

- keine Anmeldung,
- keine Profile,
- keine Identität,
- keine dauerhafte Nutzerverfolgung.

Echtzeitresonanz:

- nur aggregierte oder symbolische Ereignisse,
- keine Namen,
- keine exakten Bewegungsprofile,
- keine Nutzerlisten.

Ausgangsraum:

- freiwillige Eingabe,
- klare Einwilligung,
- klare Löschfristen,
- Moderation,
- Rollen für Begleitende,
- sensible Daten schützen,
- keine öffentliche Veröffentlichung ohne Prüfung.

## 9. Barrierefreiheitsregeln

Jedes Feature muss prüfen:

- Tastaturnutzung,
- reduzierte Bewegung,
- Audioalternativen,
- Untertitel / Transkripte,
- ausreichende Kontraste,
- Screenreader-Kompatibilität für Formulare,
- Pausierbarkeit,
- Lautstärkeregelung,
- kein Flackern,
- kein Zwang zu Kopfhörern, aber Empfehlung möglich.

## 10. Technische Regeln

Empfohlener Stack:

- Vite,
- React,
- TypeScript,
- PixiJS oder Canvas,
- Web Audio / Howler,
- Zustand,
- PWA,
- Node/Fastify oder Express für den WebSocket-Prototyp,
- WebSocket als erster Transport für anonyme Live-Resonanz,
- optional Redis für flüchtige Resonanz,
- keine Nostr-Live-Ko-Präsenz im MVP.

Codeprinzipien:

- kleine Module,
- Räume als deklarative Szenendefinitionen,
- klare Trennung von Rendering, Audio, Content, Zustand und Netzwerk,
- kein unnötiges Tracking,
- Featureflags für experimentelle Funktionen,
- Tests für Raumregeln und Datenschutzannahmen.

Für Räume mit polygonalen Hit-, Drop- oder Sperrzonen gilt zusätzlich:

- Debug-Zonen müssen per explizitem Schalter oder Query-Parameter aktivierbar sein.
- Zonen werden farblich getrennt visualisiert, damit Wasser, Weg und Sperrflächen sofort unterscheidbar sind.
- Wenn eine Zone visuell nicht zuverlässig aus dem Bild abgeleitet werden kann, ist manuelle Polygon-Kalibrierung das führende Werkzeug.
- Der Raum muss einen Exportweg für die aktuellen Polygonpunkte bereitstellen, damit Korrekturen wieder in den Plan und in den Code zurückfließen können.
- Objektlogik für Steine, Kerzen und ähnliche Gesten darf nur die dafür vorgesehenen Zonen akzeptieren; unsichere Außenbereiche müssen weich abgewiesen oder zurückgeführt werden.

## 11. Content-Regeln

Impulse:

- kurz,
- offen,
- nicht belehrend,
- nicht moralisierend,
- nicht manipulativ,
- nicht übergriffig,
- interreligiös sensibel,
- poetisch,
- mit Nachklang.

Klageinhalte:

- Leid nicht ästhetisieren,
- keine Katastrophenbilder als Schockmaterial,
- keine politische Instrumentalisierung im Hauptraum,
- Ohnmacht würdigen,
- Handlungsfähigkeit klein und realistisch öffnen.

## 12. Testpflicht

Jedes neue Feature muss gegen `docs/TESTS/Kontrollfragen.md` geprüft werden.

Für räumliche Interaktionsfeatures gehört zur Prüfung zusätzlich:

- Sind alle relevanten Zonen sichtbar oder per Debug-Overlay prüfbar?
- Stimmen Export und manuelle Korrektur der Polygonpunkte mit der aktuellen Implementierung überein?
- Sind harte Fehlzustände vermieden, wenn eine Geste außerhalb der vorgesehenen Zone endet?

Eine kurze Feature-Prüfung soll dokumentieren:

```md
## Feature-Prüfung: <Name>

### Zweck
...

### Welche Erfahrung soll vertieft werden?
...

### Manifest-Bezug
...

### Risiken
...

### Kontrollfragen
- Präsenz:
- Stille:
- Resonanz:
- Würde:
- Klage/Hoffnung:
- Sinn/Selbstwirksamkeit:
- Anti-Plattform:
- Datenschutz:
- Barrierefreiheit:

### Entscheidung
Grün / Gelb / Rot
```

## 13. Definition of Done

Ein Feature ist fertig, wenn:

- es funktioniert,
- es reduziert genug ist,
- es barrierearm ist,
- es Datenschutz respektiert,
- es keine Plattformlogik einführt,
- es die Kontrollfragen besteht,
- es ästhetisch zur Raumgrammatik passt,
- es dokumentiert ist.

## 14. Arbeitsweise für KI-Agenten

KI-Agenten sollen:

- zuerst die Dokumente lesen,
- keine Features hinzufügen, die den Negativregeln widersprechen,
- bei Unsicherheit lieber reduzieren als erweitern,
- keine Social Features erfinden,
- keine Chat- oder Profilfunktionen über WebSocket einbauen,
- keine Nostr-Live-Ko-Präsenz ohne neue Architekturentscheidung einführen,
- keine Gamification vorschlagen,
- keine Tracking- oder Analyticslogik einbauen,
- keine personenbezogene Speicherung ohne ausdrückliche Begründung,
- immer Manifest und Kontrollfragen berücksichtigen,
- Vorschläge in ruhiger, präziser Sprache machen.

KI-Agenten dürfen:

- Raumdefinitionen entwerfen,
- Komponenten implementieren,
- Audio-/Visual-Konzept vorschlagen,
- Tests schreiben,
- Content-Schemata definieren,
- Barrierefreiheit prüfen,
- Dokumentation ergänzen.

## 15. Erste Agentenaufgabe

Wenn ein Coding-Agent startet, soll er nicht sofort eine große App bauen.

Erste Aufgabe:

> Implementiere einen einzelnen „Raum der Spuren“ als minimalen Erfahrungsprototyp.

Mit:

- Fullscreen-Canvas,
- Hintergrundbild-Platzhalter,
- drei Parallax-Layern,
- Partikeln,
- Ambient-Audio-Platzhalter,
- Klickwelle und Klang,
- Kerzenartefakt,
- langsam verblassenden Spuren,
- Audio- und Exit-Kontrolle,
- keine Anmeldung,
- keine Profile,
- keine Metriken.

Danach:

- gegen Kontrollfragen prüfen,
- Erfahrungen dokumentieren,
- erst dann erweitern.


# Liturgicum Memory Addendum

Diese Sektion beschreibt, wie Coding-Agenten das Projekt Liturgicum verstehen sollen.

## Projektlogik

Liturgicum ist kein gewöhnliches UI-Projekt. Es verbindet:

1. liturgische Dramaturgie,
2. digitale Resonanzräume,
3. audiovisuelle Interaktionen,
4. konfigurierbare Raumdaten,
5. technische Laufzeitlogik.

Codeänderungen müssen deshalb immer zugleich technisch, gestalterisch und liturgisch geprüft werden.

## Zentrale Wissensquellen

Agenten sollen zuerst diese Dateien lesen:

1. `docs/AGENTS.md`
2. `docs/Konzept.md`
3. `docs/Liturgisches-Manifest.md`
4. `docs/Raeume.md`
5. `docs/Interaktions-Spezifikation.md`
6. `docs/Raumuebergaenge.md`
7. `docs/Tech-Stack.md`
8. `docs/WebSocket-Resonanzarchitektur.md`

Danach erst sollten konkrete Code-Dateien geändert werden.

## Zentrale Codebereiche

### Raumlogik

- `app/src/rooms/RoomManager.ts`
- `app/src/rooms/BaseRoom.ts`
- `app/src/rooms/ConfigRoom.ts`
- `app/src/rooms/HoerenRoom.ts`

### Szenen und Übergänge

- `app/src/scene/Scene.ts`
- `app/src/scene/Transition.ts`
- `app/src/scene/perspectiveDebug.ts`

### Audio

- `app/src/audio/AudioEngine.ts`

### Konfiguration und Typen

- `app/src/config/types.ts`
- `app/src/config/libraryTypes.ts`
- `app/public/_schema/room.config.schema.json`
- `app/public/_library/*.json`
- `app/public/*/room.config.json`

### Dashboard und Editor

- `app/src/dashboard/RoomSettings.tsx`
- `app/src/dashboard/ZoneEditor.tsx`
- `app/src/dashboard/GeneralSettings.tsx`
- `app/src/dashboard/api.ts`

### Effekte und Artefakte

- `app/src/effects/`
- `app/src/artifacts/ArtifactFactory.ts`
- `app/src/gesture/reducer.ts`
- `app/src/state/store.ts`

## Liturgische Raumzuordnung

Die Räume sind nicht nur Screens, sondern Stationen einer liturgischen Bewegung.

- `vorhof` → Ankommen, Schwelle, Übergang
- `spuren` → Ausdruck, Hinterlassen, Klage, Erinnerung
- `hoeren` → Ausrichtung, Sammlung, Resonanz, Wahrnehmung
- `antwort` → Reaktion, innere Antwort, Symbolisierung
- `verdichtung` → Sammlung, Vertiefung, Konzentration
- `sendung` / `berufung` → leise Wirksamkeit, Rückkehr in die Welt
- `schwelle` → Ausgang, Nachklang, Übergang

Bei Änderungen an Raumlogik oder Raumgestaltung ist zu prüfen, ob diese Bewegung erhalten bleibt.

## Architektur-Mentalmodell

```text
Raumkonzept / Manifest
        ↓
docs/Raeume.md + Interaktions-Spezifikation.md
        ↓
room.config.json + _library/*.json + schema
        ↓
RoomManager / ConfigRoom / BaseRoom
        ↓
Scene / Effects / Artifacts / AudioEngine
        ↓
Dashboard / Editor / Store
```

## Arbeitsregeln für Agenten

1. Niemals `node_modules`, `dist`, `.git`, Source Maps oder Build-Artefakte analysieren oder verändern.
2. Vor Änderungen an Raumlogik immer `docs/Raeume.md` und `docs/Liturgisches-Manifest.md` prüfen.
3. Vor Änderungen an Interaktionen immer `docs/Interaktions-Spezifikation.md` prüfen.
4. Vor Änderungen an Übergängen immer `docs/Raumuebergaenge.md` und `app/src/scene/Transition.ts` prüfen.
5. Vor Änderungen an Audio immer `AudioEngine.ts`, Raumkonfiguration und Audio-Assets prüfen.
6. Bei Änderungen an `room.config.json` auch Schema und TypeScript-Typen prüfen.
7. Bei größeren Änderungen zuerst einen Impact-Plan erstellen.
8. `ConfigRoom.ts` ist groß und vermutlich refactoringbedürftig. Änderungen dort besonders vorsichtig durchführen.
9. Dashboard-Änderungen müssen mit Config-Schema und Runtime-Ladevorgang kompatibel bleiben.
10. Konzeptuelle Begriffe nicht ohne Abgleich mit dem Manifest umbenennen.

## Gute Analysefragen für Codebase-Memory

- Welche Dateien importieren `RoomManager.ts`?
- Welche Klassen erben von `BaseRoom`?
- Welche Funktionen greifen auf den globalen Store zu?
- Welche Dateien lesen oder schreiben `room.config.json`?
- Welche Komponenten verändern Audio- oder Effekt-Konfigurationen?
- Welche Dateien hängen an Raumübergängen?
- Welche Funktionen in `ConfigRoom.ts` können extrahiert werden?
- Welche Konfigurationstypen sind mehrfach oder widersprüchlich definiert?
- Welche Abhängigkeiten entstehen zwischen Dashboard und Runtime?
- Welche Dateien sind betroffen, wenn ein neuer Raumtyp eingeführt wird?

## Refactoring-Prioritäten

### Priorität 1: ConfigRoom entlasten

`ConfigRoom.ts` sollte perspektivisch in kleinere Verantwortlichkeiten aufgeteilt werden:

- Config-Laden
- Layer-/Asset-Aufbau
- Interaktionszonen
- Audio-Anbindung
- Effekt-Instanziierung
- Raum-spezifische Overrides

### Priorität 2: Raumkonfiguration stabilisieren

Schema, TypeScript-Typen und Dashboard-Formulare sollten dieselbe Struktur abbilden.

Zu prüfen:

- `room.config.schema.json`
- `types.ts`
- `libraryTypes.ts`
- `RoomSettings.tsx`
- `ZoneEditor.tsx`

### Priorität 3: Dokumentation und Code verbinden

Für jeden Raum sollte klar sein:

- konzeptionelle Rolle,
- verwendete Assets,
- Interaktionen,
- Audio,
- Übergänge,
- technische Konfigurationsdatei.

## Definition of Done für Memory-Einrichtung

Eine Einrichtung gilt als gelungen, wenn ein Coding-Agent ohne manuelles Dateisuchen beantworten kann:

1. Wie wird ein neuer Raum angelegt?
2. Welche Dateien sind dafür anzupassen?
3. Welche Raumkonfigurationen existieren?
4. Welche Typen und Schemas validieren diese Konfigurationen?
5. Welche Komponenten hängen an Audio, Effekten und Übergängen?
6. Welche Dokumente enthalten die liturgischen Vorgaben?
7. Welche Folgen hätte eine Änderung an `ConfigRoom.ts`?