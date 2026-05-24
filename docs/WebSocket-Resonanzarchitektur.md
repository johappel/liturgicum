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

### Ereignisstruktur

Für die Umsetzung sollte ein Resonanzereignis aus klar getrennten Schichten bestehen:

- `gesture`: Was geschieht semantisch?
- `target`: Worauf wirkt die Geste?
- `zone`: In welchem groben Bereich des Raums geschieht es?
- `variant`: Welche symbolische Ausprägung bekommt das Objekt oder die Wirkung?
- `intensity`: Wie stark prägt das Ereignis den Raum?

Lokal darf der eigene Client zusätzlich mit exakten Punkten arbeiten, etwa für den Ursprung einer Wasserwelle oder die Stelle einer Nebelöffnung.

Diese exakten Punkte gehören aber nicht in das geteilte WebSocket-Protokoll.

Nicht senden:

- pixelgenaue Klickkoordinaten anderer,
- Cursorpfade,
- Bewegungsbahnen,
- dauerhaft verknüpfbare Objektpositionen.

Besser senden:

- Raum,
- Geste,
- Zielobjekt,
- grobe Zone,
- Intensität,
- symbolische Variante.

Optionale Render-Hinweise sind möglich, aber nur als schwache Vorschläge für die lokale Darstellung.

Sie dürfen nicht zu einem dauerhaften Figurenmodell werden.

Erlaubt sind zum Beispiel:

- `silhouettePose`: `passing`, `standing`, `seated`, `kneeling`, `reaching`
- `movementMode`: `still`, `swaying`, `drifting`, `dissolving`
- `presenceMode`: `brief`, `ambient`, `fading`

Nicht daraus machen:

- langfristig verfolgbaren Figurenzustand,
- kontinuierliche Körperanimation über das Netzwerk,
- wiedererkennbare Personendarstellung.

Erweitertes Beispiel:

```json
{
  "type": "gesture",
  "room": "lament",
  "gesture": "stone_laid",
  "target": "stone_bed",
  "zone": "front_left",
  "intensity": 0.42,
  "variant": {
    "size": "large",
    "shape": "flat",
    "tone": "slate",
    "surface": "weathered",
    "marking": "etched_line"
  },
  "renderHint": {
    "silhouettePose": "kneeling",
    "movementMode": "dissolving",
    "presenceMode": "brief"
  },
  "clientTime": 1760000000000
}
```

Weitere mögliche Gesten:

```json
{
  "type": "gesture",
  "room": "traces",
  "gesture": "candle_lit",
  "target": "candle_cluster",
  "zone": "rear_right",
  "intensity": 0.7,
  "variant": {
    "height": "short",
    "waxTone": "ivory",
    "flameMood": "steady"
  }
}
```

```json
{
  "type": "gesture",
  "room": "response",
  "gesture": "water_touched",
  "target": "water_pool",
  "zone": "center",
  "intensity": 0.36,
  "variant": {
    "rippleScale": "medium",
    "surfaceTone": "dark_glass",
    "echo": "soft"
  }
}
```

```json
{
  "type": "gesture",
  "room": "response",
  "gesture": "leaf_scattered",
  "target": "bowl",
  "zone": "front_right",
  "intensity": 0.28,
  "variant": {
    "leafTone": "earth",
    "amount": "few",
    "motion": "drift"
  }
}
```

```json
{
  "type": "gesture",
  "room": "threshold",
  "gesture": "threshold_crossed",
  "target": "mist_layer",
  "zone": "center_path",
  "intensity": 0.22,
  "variant": {
    "density": "light",
    "drift": "slow",
    "opening": "narrow"
  }
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
  "target": "horizon_line",
  "zone": "far_center",
  "intensity": 0.3
}
```

### Variantenlogik für zentrale Zielobjekte

Varianten dürfen symbolische Differenz erzeugen, aber keine Identität transportieren.

#### Stein

Empfohlene Felder:

- `size`: `small`, `medium`, `large`
- `shape`: `round`, `flat`, `irregular`
- `tone`: `ash`, `slate`, `earth`, `chalk`
- `surface`: `smooth`, `rough`, `weathered`
- `marking`: `none`, `etched_line`, `weathered_sign`, `warm_glow`

Nicht erlauben:

- Klarnamen,
- freie Gravurtexte,
- individuelle Widmungen.

#### Kerze

Empfohlene Felder:

- `height`: `short`, `medium`, `tall`
- `waxTone`: `ivory`, `ash`, `amber`
- `flameMood`: `steady`, `faint`, `warming`
- `holder`: `stone`, `metal`, `bare`

Die Kerze soll als Spur wirken, nicht als persönliches Besitzobjekt.

#### Wasser

Empfohlene Felder:

- `rippleScale`: `small`, `medium`, `large`
- `surfaceTone`: `dark_glass`, `grey_blue`, `ash_reflective`
- `echo`: `soft`, `deep`, `lingering`

Das Wasser erhält lokal einen exakten Wellenursprung, geteilt wird aber nur Zielobjekt plus Zone.

#### Blatt

Empfohlene Felder:

- `leafTone`: `earth`, `ochre`, `ash_green`
- `amount`: `single`, `few`, `scatter`
- `motion`: `drop`, `drift`, `float`

Blätter sollten wie Gabe oder Spur wirken, nicht wie Wurfobjekte.

#### Nebel

Empfohlene Felder:

- `density`: `light`, `medium`, `heavy`
- `drift`: `slow`, `folding`, `lingering`
- `opening`: `narrow`, `soft`, `wide`

Nebel ist meist kein eigenständiges Artefakt, sondern ein atmosphärisches Zielobjekt oder eine Raumreaktion.
Wenn eine Scherenschnittpräsenz eine Nebelbewegung auslöst, sollte deshalb eher `threshold_crossed` oder eine ähnliche Geste gesendet werden als eine „Nebel-Aktion“ einer Person.

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
water_touched: max 6 pro 5 Minuten pro Session
leaf_scattered: max 4 pro 10 Minuten pro Session
threshold_crossed: serverseitig entprellt
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
  "target": "stone_bed",
  "zone": "front_left",
  "intensity": 0.5,
  "variant": {
    "size": "large",
    "shape": "flat",
    "tone": "slate",
    "surface": "weathered",
    "marking": "etched_line"
  }
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
2. WebSocket-Geste wird mit Zielobjekt, Zone und Kerzenvariante gesendet.
3. Andere Clients erhalten ein Resonanzereignis.
4. Dort erscheint vielleicht nicht dieselbe Kerze, sondern:
   - ein ferner Lichtpunkt,
   - ein wärmerer Klang,
   - ein schwacher Schimmer an einer Wand.

Wichtig:

Nicht jede Handlung muss eins zu eins gespiegelt werden.

Besser:

> Handlung wird in Atmosphäre übersetzt.

## 13.1 Beispiel: Raum der Antwort

Eine Person berührt die Wasserfläche.

Ablauf:

1. Lokal entsteht genau am Berührpunkt ein Wasserkreis.
2. WebSocket sendet kein exaktes `x`/`y`, sondern nur Zielobjekt und grobe Zone.
3. Andere Clients erhalten daraus eine ferne oder versetzte Wasserreaktion.

Beispiel:

```json
{
  "type": "gesture",
  "room": "response",
  "gesture": "water_touched",
  "target": "water_pool",
  "zone": "center",
  "intensity": 0.36,
  "variant": {
    "rippleScale": "medium",
    "surfaceTone": "dark_glass",
    "echo": "soft"
  }
}
```

Erfahrung:

> Jemand hat das Wasser berührt.
> Ich sehe weder die Hand noch die Person.
> Aber der Raum antwortet.

## 13.2 Beispiel: Vorhof und Nebel

Eine Person überschreitet die Schwelle.

Ablauf:

1. Lokal weicht der Nebel entlang des eigenen Pfades etwas zurück.
2. Der WebSocket-Impuls bleibt symbolisch und sendet nur Schwelle, Nebelschicht und grobe Zone.
3. Andere Clients erleben keine Figur, sondern eine leichte Öffnung im Raum.

Beispiel:

```json
{
  "type": "gesture",
  "room": "threshold",
  "gesture": "threshold_crossed",
  "target": "mist_layer",
  "zone": "center_path",
  "intensity": 0.22,
  "variant": {
    "density": "light",
    "drift": "slow",
    "opening": "soft"
  }
}
```

Erfahrung:

> Etwas ist durch den Raum gegangen.
> Nicht als Figur, sondern als Verschiebung von Luft, Licht und Nebel.

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
