# WebSocket-Resonanzarchitektur
## Flüchtige Ko-Präsenz ohne Profile, Chat oder Plattformlogik

## 1. Entscheidung

Für den Anfang wird die gleichzeitige Anwesenheit anderer Besucherinnen und Besucher über einen eigenen WebSocket-Kanal umgesetzt.

Nostr wird nicht als erster Transport für Live-Ko-Präsenz verwendet.

Begründung:

- Der Raum braucht flüchtige, anonyme, nicht-profilförmige Signale.
- Andere Menschen sollen nicht als Accounts, Keys oder Identitäten erscheinen.
- Der Hauptraum soll keine öffentliche Persistenz erzeugen.
- Moderation und Datenschutz bleiben einfacher kontrollierbar.
- Die technische Hürde für den MVP bleibt niedrig.
- Die Erfahrung soll Atmosphäre erzeugen, nicht Kommunikation.

Leitsatz:

> Andere Menschen fließen nicht als Userdaten ein, sondern als anonyme Raumereignisse.

## 2. Was WebSocket im Resonanzraum leisten soll

WebSocket dient nicht für Chat, Direktnachrichten oder sichtbare Anwesenheitslisten.

WebSocket dient ausschließlich dazu, flüchtige Resonanzereignisse zwischen gleichzeitig Anwesenden zu übertragen.

Beispiele:

- Eine Kerze wurde entzündet.
- Ein Stein wurde im Raum der Klage abgelegt.
- Jemand verweilt im Raum des Hörens.
- Eine Antwortgeste wurde ausgeführt.
- Im Raum der Berufung wurde ein Lichtimpuls ausgelöst.
- Die Verdichtungszeit beginnt oder endet.

Diese Ereignisse werden im Client nicht als soziale Daten angezeigt, sondern in Atmosphäre übersetzt:

- Licht wird wärmer,
- Wind verändert sich,
- ein Klang schwingt nach,
- Wasser bildet eine Welle,
- Nebel öffnet sich,
- ein ferner Lichtpunkt erscheint,
- der Raum wirkt dichter.

## 3. Grundarchitektur

```txt
Browser Client
  ↓
WebSocket-Verbindung
  ↓
Resonance Gateway
  ↓
Ephemeral Room State
  ↓
Broadcast an alle Clients im selben Raum
```

Optional später:

```txt
Resonance Gateway
  ↓
Redis / In-Memory Store
  ↓
TTL-basierte Raumzustände
```

Der Server verwaltet keine dauerhafte Identität der Besucher im Hauptraum.

## 4. Zentrale Prinzipien

### Anonymität

Der Server erzeugt höchstens eine flüchtige Session-ID.

Diese Session-ID:

- ist nicht sichtbar,
- wird nicht als Profil verwendet,
- wird nicht langfristig gespeichert,
- dient nur technischer Verbindungsverwaltung,
- verfällt nach Sitzungsende.

### Flüchtigkeit

Live-Resonanzereignisse haben eine kurze Lebensdauer.

Beispiele:

- Welle: 10 Sekunden
- Lichtimpuls: 30 Sekunden
- Kerzenschimmer: 10 Minuten
- Verdichtungswert: laufend berechnet
- Klagegewicht: 30 Minuten aggregiert

### Aggregation

Wo möglich, werden einzelne Ereignisse in Raumwerte übersetzt.

Nicht:

> Drei Personen haben geklickt.

Sondern:

> Der Raum wirkt etwas dichter.

### Keine sichtbaren Metriken

Nicht anzeigen:

- Anzahl der Nutzer,
- Anzahl der Klicks,
- Ranking von Gesten,
- Namen,
- Orte einzelner Personen,
- Bewegungsdaten anderer.

## 5. Eventtypen

### Client → Server

Der Client sendet symbolische Gesten.

Beispiel:

```json
{
  "type": "gesture",
  "room": "lament",
  "gesture": "stone_laid",
  "intensity": 0.42,
  "clientTime": 1760000000000
}
```

Weitere mögliche Gesten:

```json
{
  "type": "gesture",
  "room": "traces",
  "gesture": "candle_lit",
  "intensity": 0.7
}
```

```json
{
  "type": "presence",
  "room": "listening",
  "state": "dwelling"
}
```

```json
{
  "type": "gesture",
  "room": "calling",
  "gesture": "send_light",
  "intensity": 0.3
}
```

### Server → Client

Der Server sendet keine Userdaten, sondern Resonanzereignisse oder Raumzustände.

Einzelnes Resonanzereignis:

```json
{
  "type": "resonance_event",
  "room": "lament",
  "effect": "distant_bell",
  "intensity": 0.35,
  "ttl": 20
}
```

Aggregierter Raumzustand:

```json
{
  "type": "room_state",
  "room": "traces",
  "presenceDensity": 0.28,
  "lightWarmth": 0.46,
  "silenceDepth": 0.62,
  "lamentWeight": 0.08
}
```

Verdichtungsphase:

```json
{
  "type": "phase",
  "phase": "gathering",
  "startsAt": "2026-05-23T20:00:00+02:00",
  "endsAt": "2026-05-23T20:20:00+02:00"
}
```

## 6. Raumzustände

Mögliche aggregierte Raumwerte:

### `presenceDensity`

Wie stark die anonyme Ko-Präsenz atmosphärisch spürbar sein soll.

Nicht direkt sichtbar.

Wirkung:

- dichterer Klang,
- mehr Lichtpunkte,
- langsamere Partikel,
- wärmere Resonanz.

### `silenceDepth`

Wie ruhig und gesammelt ein Raum wirkt.

Wirkung:

- weniger zufällige Ereignisse,
- tieferer Hall,
- ruhigere Bewegung,
- längere Pausen.

### `lamentWeight`

Wie stark Klagehandlungen den Raum prägen.

Wirkung:

- schwererer Klang,
- dunkleres Wasser,
- tiefer Glockenton,
- langsamer Regen,
- kleine Lichtantworten.

### `lightWarmth`

Wie stark Antwort- und Hoffnungsgesten den Raum erwärmen.

Wirkung:

- wärmeres Licht,
- sanftere Partikel,
- sichtbarere Wege,
- hellere Kanten.

### `callingResonance`

Wie stark der Berufungsraum von Antwortfähigkeit geprägt ist.

Wirkung:

- offener Horizont,
- zarter Wind,
- leise Stimmenfragmente,
- Morgendämmerung.

## 7. Keine Übertragung von Bewegungsprofilen

Der Client soll nicht permanent Mausposition, Kameraposition oder Bewegungsdaten senden.

Erlaubt:

- Raum betreten,
- Raum verlassen,
- Verweilen als Zustand in längeren Intervallen,
- symbolische Geste,
- Portalwechsel.

Nicht erlaubt:

- jede Mausbewegung,
- genaue Cursorposition anderer,
- exakte Pfade,
- Heatmaps,
- dauerhaftes Tracking.

## 8. Rate Limits und Missbrauchsschutz

Auch anonyme Systeme brauchen Schutz.

Empfohlen:

- maximale Gesten pro Zeitfenster,
- serverseitige Plausibilitätsprüfung,
- Cooldowns für bestimmte Gesten,
- keine Fehlermeldungen, die spielerisch ausnutzbar sind,
- Verbindungsbegrenzung pro IP nur technisch und kurzzeitig,
- keine öffentliche Sanktionierung.

Beispiel:

```txt
candle_lit: max 3 pro 10 Minuten pro Session
stone_laid: max 2 pro 10 Minuten pro Session
presence dwelling: alle 60 Sekunden
```

## 9. Datenschutz

Im Hauptraum nicht speichern:

- Namen,
- E-Mail-Adressen,
- Profile,
- IP-Historien,
- genaue Bewegungen,
- persönliche Texte,
- Audioaufnahmen,
- Kontaktwünsche.

Temporär technisch möglich:

- flüchtige Session-ID,
- aktueller Raum,
- letzte Geste,
- Verbindungsstatus,
- Rate-Limit-Zähler.

Speicherdauer:

- so kurz wie möglich,
- ideal: nur im Arbeitsspeicher,
- bei Redis: TTL verpflichtend.

## 10. Ausgangsraum ist getrennt

Der WebSocket-Hauptraum darf nicht mit dem freiwilligen Ausgangsraum verwechselt werden.

Der Ausgangsraum kann enthalten:

- Bitte,
- Wunsch,
- Gedanke,
- Kontaktbitte,
- Hilferuf.

Dafür braucht es eigene Regeln:

- explizite Einwilligung,
- Formular statt WebSocket-Geste,
- Moderation,
- Löschfristen,
- klare Zuständigkeit,
- Krisenhinweise.

Live-Resonanz und persönliche Bitte sind strikt getrennte Systeme.

## 11. Beispiel: Raum der Klage

Eine Person legt einen Stein ab.

Ablauf:

1. Client spielt lokal eine Stein-Geste.
2. Client sendet WebSocket-Event:

```json
{
  "type": "gesture",
  "room": "lament",
  "gesture": "stone_laid",
  "intensity": 0.5
}
```

3. Server prüft Rate Limit.
4. Server erhöht temporär `lamentWeight`.
5. Server sendet an andere Clients:

```json
{
  "type": "resonance_event",
  "room": "lament",
  "effect": "distant_water_ring",
  "intensity": 0.5,
  "ttl": 25
}
```

6. Andere Clients zeigen keine Person, sondern:
   - eine ferne Wasserwelle,
   - einen tiefen Klang,
   - ein schwaches Licht im Regen.

Erfahrung:

> Jemand anderes klagt.
> Ich sehe ihn nicht.
> Aber der Raum trägt es mit.

## 12. Beispiel: Raum der Spuren

Eine Person entzündet eine Kerze.

Ablauf:

1. Kerze erscheint lokal.
2. WebSocket-Geste wird gesendet.
3. Andere Clients erhalten ein Resonanzereignis.
4. Dort erscheint vielleicht nicht dieselbe Kerze, sondern:
   - ein ferner Lichtpunkt,
   - ein wärmerer Klang,
   - ein schwacher Schimmer an einer Wand.

Wichtig:

Nicht jede Handlung muss eins zu eins gespiegelt werden.

Besser:

> Handlung wird in Atmosphäre übersetzt.

## 13. Beispiel: Verweilen

Eine Person bleibt lange im Raum des Hörens.

Nicht jeder Augenblick wird übertragen.

Stattdessen:

```json
{
  "type": "presence",
  "room": "listening",
  "state": "dwelling"
}
```

Intervall: höchstens alle 60 Sekunden.

Wirkung:

- `silenceDepth` steigt leicht,
- Klang wird ruhiger,
- Impuls erscheint langsamer,
- der Raum wirkt gesammelt.

Erfahrung:

> Andere verweilen.
> Der Raum wird stiller.

## 14. Technische Minimalimplementierung

### Server

- Node.js
- Fastify oder Express
- ws oder Socket.IO
- optional Redis

Für den MVP genügt:

- `ws`
- In-Memory-Raumzustand
- TTL per Timer
- keine Datenbank.

### Client

- WebSocket-Service
- Event-Bus im Frontend
- Room Store
- Audio Engine
- Visual Effect Mapper

Beispielmodule:

```txt
src/
  resonance/
    socket.ts
    protocol.ts
    roomState.ts
    effects.ts
  rooms/
    lament/
    traces/
    listening/
```

## 15. Protokollskizze

```ts
type ClientGestureEvent = {
  type: "gesture";
  room: RoomId;
  gesture: GestureId;
  intensity?: number;
  clientTime?: number;
};

type ClientPresenceEvent = {
  type: "presence";
  room: RoomId;
  state: "entered" | "left" | "dwelling";
};

type ServerResonanceEvent = {
  type: "resonance_event";
  room: RoomId;
  effect: EffectId;
  intensity: number;
  ttl: number;
};

type ServerRoomStateEvent = {
  type: "room_state";
  room: RoomId;
  presenceDensity: number;
  silenceDepth: number;
  lamentWeight: number;
  lightWarmth: number;
  callingResonance?: number;
};
```

## 16. Prüfregel

Ein WebSocket-Event ist nur erlaubt, wenn es mindestens eine dieser Erfahrungen unterstützt:

- stille Ko-Präsenz,
- Resonanz,
- Klage,
- Antwort,
- Verdichtung,
- leise Wirksamkeit,
- Sendung.

Ein WebSocket-Event ist nicht erlaubt, wenn es primär eines davon ermöglicht:

- Chat,
- Profilbildung,
- Ranking,
- Tracking,
- soziale Vergleichbarkeit,
- Engagementmessung,
- Gamification.

## 17. MVP-Umfang

Für den ersten Prototyp reichen drei Eventarten:

1. `presence.entered`
2. `presence.dwelling`
3. `gesture.candle_lit` oder `gesture.stone_laid`

Und zwei Serverantworten:

1. `resonance_event`
2. `room_state`

Mehr nicht.

## 18. Spätere Erweiterungen

Möglich später:

- Redis für mehrere Serverinstanzen,
- Verdichtungszeit-Kalender,
- moderierte Artefakte,
- private Begleitendenkonsole im Ausgangsraum,
- optionale Nostr-Exportbrücke für kuratierte, nicht-sensitive Impulse,
- Audio-Synchronisation für gemeinsame Verdichtungszeiten.

Nicht später einschleichen lassen:

- Profile,
- Chat,
- Likes,
- Ranglisten,
- sichtbare Online-Zahlen,
- Engagement-Analytics.
