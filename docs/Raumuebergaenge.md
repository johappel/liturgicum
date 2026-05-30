# Raumübergänge

Dieses Dokument beschreibt, wie die Übergänge zwischen den Räumen inszeniert werden sollen. Ziel ist nicht ein Szenenwechsel, sondern das Erleben einer Schwelle. Der Besucher soll spüren: derselbe Resonanzraum verändert seinen Zustand, statt dass eine neue Seite geladen wird.

Die Raumfolge lautet:

Vorhof -> Spuren -> Hören -> Klage -> Antwort -> Verdichtung -> Berufung -> Schwelle -> Sendung

## 1. Grundregeln für alle Übergänge

1. Kein harter Schnitt, keine Schwarzblende, kein Teleport.
2. Dieselbe Kameralogik bleibt erhalten: niedriger Blickpunkt, Bühne in der mittleren bis linken Tiefenzone, Ausgang oben-rechts, Erinnerung an den vorherigen Raum unten-links.
3. Jeder Übergang hat vier Phasen: Reifung -> Schleier -> Mitnahme -> Ankunft.
4. Pro Wechsel bleibt mindestens ein Motiv erhalten, ein Motiv verwandelt sich, ein Motiv tritt neu hinzu.
5. Der neue Raum erscheint zuerst als Luft-, Licht- oder Klangzustand, erst danach als klar lesbare Architektur.
6. Das Ausgangsportal öffnet sich atmosphärisch durch Reife, nicht durch Klick, Countdown oder Fortschrittsanzeige.
7. Rückkehr ist immer möglich. Sie benutzt dieselben Motive in umgekehrter Dramaturgie: das Neue zieht sich zurück, das Vorherige tritt wieder aus Dunst, Klang und Materialität hervor.

## 2. Standardform eines Übergangs

Jeder Übergang folgt demselben inneren Ablauf:

- Reifung: Licht, Nebel, Klang oder Materialität beginnen sich im aktuellen Raum zu verschieben.
- Schleier: Der Raum wird für einen kurzen Moment weniger eindeutig lesbar, etwa durch Dunst, Gegenlicht, Regen, Staub, Stoff oder Lichtschleier.
- Mitnahme: Ein tragendes Motiv des alten Raums bleibt sichtbar und wird in den neuen Raum hinein transformiert.
- Ankunft: Die Anker des nächsten Raums werden lesbar, ohne dass die Blickachse bricht.

Empfohlene Dauer pro Wechsel:

- kurze Übergänge: 4 bis 5 Sekunden
- normale Übergänge: 6 bis 8 Sekunden
- Schwellen mit starkem innerem Umschlag: 8 bis 10 Sekunden

## 3. Übergangschoreografie je Raumwechsel

### 3.1 Vorhof -> Spuren

**Dramaturgischer Sinn**

Aus dem offenen, entgrenzenden Ankommen werden erste konkrete Zeichen. Die Weite des Vorhofs verdichtet sich zu lesbaren Spuren der Anwesenheit.

**Visuell**

- diffuser Nebel bleibt bestehen,
- der weite Raum bekommt erste punktuelle Lichtorte,
- aus bloßer Schwelle werden Steinfläche, kleine Schalen, Wasserkante,
- der Weg verliert seine Allgemeinheit und wird zur konkreten Spur.

**Klanglich**

- weiter, leerer Raumton,
- einzelne helle Resonanzen treten hinzu,
- erste kleine Nachklänge statt bloßer Stille.

**Interaktionsimpuls**

Verweilen oder langsames Vorwärtsgehen lässt kleine Lichtpunkte an Spurenorten lesbar werden.

**Dauer**

5 bis 6 Sekunden.

**Prompt-Baustein**

"Der offene dämmrige Vorhof verdichtet sich langsam zu einem Spurenraum; Nebel bleibt, aber kleine Schalenlichter, Steinfläche und eine stille Wasserkante treten aus dem Dunst hervor; dieselbe niedrige Kamera, dieselbe Blickachse, kein Schnitt, sondern Übergang durch atmosphärische Reifung."

### 3.2 Spuren -> Hören

**Dramaturgischer Sinn**

Das Verstreute sammelt sich. Viele kleine Hinweise ordnen sich um ein stilles Zentrum.

**Visuell**

- mehrere kleine Lichter rücken in eine stillere Ordnung,
- Kreisform oder Sitzordnung wird lesbar,
- Wasser und Stein bleiben, aber dienen nun einem Klangzentrum,
- der Raum wird weniger suchend und mehr gesammelt.
- Der Hörraum erscheint zuerst als unklare Nebelverdichtung am Ausgang; erst danach wird sein Hintergrundbild langsam darin lesbar.

**Klanglich**

- verhaltene Einzelresonanzen,
- allmähliche Bündelung in einen tragenden Grundton,
- weniger Nachhall, mehr Konzentration.

**Interaktionsimpuls**

Ein ruhiges Innehalten sammelt verteilte Spuren in einem gemeinsamen Klang- und Lichtzentrum.

**Aktueller Prototyp**

Im Spuren-Raum ist der Übergang nach Hören an eine unsichtbare `GATE_POLY`-Aktionszone gebunden. Ein Klick in diese Zone ruft direkt `onRequestForward` auf und spielt einen leisen Gate-Cue, dessen Lautstärke von der Raumtiefe abhängt. Die atmosphärische Reife kann weiterhin die Stimmung verändern, blockiert den direkten Action-Zonen-Wechsel aber nicht.

Der technische Übergang ist kein Vollbild-Crossfade mehr: `RoomManager` übergibt für `hoeren` einen Portalmodus an `runTransition(...)`. Dieser Portalmodus ist als Nebel-Schwelle gestaltet. Um die Ausgangsposition herum bauen sich mehrere animierte Nebelschichten auf; das Hintergrundbild von `rooms/hoeren/background.png` ist zuerst kaum sichtbar und wird erst vorsichtig durch den Nebel hindurch lesbar. Dadurch wirkt der Wechsel wie ein Hineinhören und Weitergehen durch eine Schwelle, nicht wie eine neue Folie.

Der Rückweg zum Vorhof liegt in `BACK_ACTION_POLY` und ruft direkt `onRequestBack` auf. Die Zone ist über `?debugActionZones=1` kalibrierbar.

**Dauer**

5 bis 7 Sekunden.

**Prompt-Baustein**

"Ein Spurenraum sammelt sich zu einem Hörraum; kleine Lichter und Spuren ordnen sich kreisförmig um ein stilles Zentrum, Stein und Wasserkante bleiben als Erinnerung bestehen, die Szene wird ruhiger, konzentrierter, resonanter, ohne Bruch der Kameralogik."

### 3.3 Hören -> Klage

**Dramaturgischer Sinn**

Sammlung kippt in Schwere. Das Hören wird nicht beendet, sondern mit Schmerz und Gewicht aufgeladen.

**Visuell**

- das Zentrum bleibt, aber Licht wird tiefer und gedämpfter,
- Feuchtigkeit, dunkler Stein und beschädigte Flächen treten hinzu,
- der Raum zieht sich enger zusammen,
- der bisher stille Mittelpunkt wird zum Ort des Aushaltens.

**Klanglich**

- der tragende Ton sinkt ab,
- tiefere Resonanzen und nasser Nachhall,
- mehr Dichte, weniger Offenheit.

**Interaktionsimpuls**

Längeres Verweilen verdunkelt nicht künstlich, sondern legt verborgene Schwere frei.

**Dauer**

7 bis 8 Sekunden.

**Prompt-Baustein**

"Der gesammelte Hörraum sinkt in einen Klageraum; das zentrale Licht bleibt als schwacher Glutkern erhalten, während Nässe, dunkler Stein, Enge und schwerer Nachhall den Raum verdichten; kein Schnitt, sondern langsames Absinken in Schwere."

### 3.4 Klage -> Antwort

**Dramaturgischer Sinn**

Die Klage wird nicht übersprungen. In ihrer Mitte erscheint eine erste leise Erwiderung.

**Visuell**

- Wasser, Schale oder Steinbett bleiben,
- ein warmer Gegenpol wächst langsam in die Szene hinein,
- eine organische Form tritt hinzu: Ast, Baumform oder weicher Lichtort,
- die Enge lockert sich leicht, ohne die Schwere zu verleugnen.

**Klanglich**

- tiefe Schwere bleibt hörbar,
- darüber ein warmer, weicher Resonanzton,
- allmählicher Übergang von Last zu Antwortfähigkeit.

**Interaktionsimpuls**

Das Bleiben bei der Klage lässt einen zweiten Pol entstehen: nicht Lösung, sondern Antwort.

**Dauer**

7 bis 8 Sekunden.

**Prompt-Baustein**

"Aus dem Klageraum wächst langsam ein Antwortraum hervor; Schale, Wasser und Stein bleiben, doch warmes Licht, eine Baum- oder Astform und ein weicher Resonanzpol treten hinzu; der Raum öffnet sich behutsam, ohne seine Schwere zu verlieren."

### 3.5 Antwort -> Verdichtung

**Dramaturgischer Sinn**

Die Antwort wird nicht individualistisch ausgespielt, sondern verdichtet sich zu einem gemeinsamen Resonanzfeld.

**Visuell**

- der warme Lichtort vervielfacht sich in stille Punkte,
- Wasser oder Schale werden zu einer Fläche oder zu mehreren Zentren,
- die Szene wird nächtlicher und dichter,
- die Architektur wirkt weiter, aber atmosphärisch gefüllter.

**Klanglich**

- ein einzelner warmer Ton,
- daraus wird ein dichtes, schwingendes Feld,
- nicht lauter, sondern dichter und vielschichtiger.

**Interaktionsimpuls**

Resonanz sammelt mehrere Licht- und Klangpunkte zu einem gemeinsamen Feld.

**Dauer**

6 bis 8 Sekunden.

**Prompt-Baustein**

"Der Antwortraum verdichtet sich zu einem nächtlichen Resonanzfeld; warmes Licht vervielfacht sich in punktuelle Zentren, Wasser und Klang werden flächiger, die Architektur weitet sich atmosphärisch und bleibt doch gesammelt; kein Sprung, sondern allmähliche Verdichtung."

### 3.6 Verdichtung -> Berufung

**Dramaturgischer Sinn**

Das viele wird persönlich. Aus dem kollektiven Feld entsteht ein zugewandter Ort der Ansprache.

**Visuell**

- mehrere Resonanzpunkte beruhigen sich zu einem einzigen Lichtzentrum,
- die Weite der Verdichtung wird zu einem gehaltenen Innenraum,
- eine erhöhte leere Stelle oder Sitznische tritt hervor,
- keine Horizontöffnung, sondern ein Licht, das auf den Betrachter zukommt.

**Klanglich**

- das dichte Feld dünnt sich nicht aus, sondern bündelt sich,
- aus Vielstimmigkeit wird naher Resonanzton,
- der Raum klingt persönlicher, nicht größer.

**Interaktionsimpuls**

Längeres Verweilen zieht die diffuse Resonanz in eine persönliche Ansprache zusammen.

**Dauer**

8 bis 10 Sekunden.

**Prompt-Baustein**

"Ein dichter Verdichtungsraum bündelt sich zum Raum der Berufung; viele nächtliche Resonanzpunkte werden zu einer zugewandten Lichtquelle, ein gehaltener Innenraum mit erhöhter leerer Stelle tritt hervor, das Licht kommt dem Betrachter entgegen, keine Weite, kein Horizont, sondern Ansprache."

### 3.7 Berufung -> Schwelle

**Dramaturgischer Sinn**

Die Ansprache wird konkret handhabbar. Aus dem inneren Gerufensein entsteht ein Ort, an dem Antwort und Entscheidung still vorbereitet werden.

**Visuell**

- das zugewandte Licht bleibt,
- aus der leeren Nische werden Bank, Schreibfläche, Laterne oder Tür,
- der Raum wird intimer und zugleich praktikabler,
- die Ansprache verwandelt sich in eine gehütete Schwelle.

**Klanglich**

- naher Resonanzton,
- geringere Dichte,
- ruhige, fast häusliche Intimität.

**Interaktionsimpuls**

Aus reinem Empfangen wird stilles Bereitsein: sitzen, schreiben, sammeln, noch nicht hinausgehen.

**Dauer**

6 bis 7 Sekunden.

**Prompt-Baustein**

"Der Raum der Berufung wird zum Schwellenraum; das zugewandte Licht bleibt erhalten, während Bank, Schreibfläche, Laterne und eine geschützte Tür oder Fensteröffnung sichtbar werden; derselbe sakrale Raum wird intimer und konkreter, ohne seinen stillen Charakter zu verlieren."

### 3.8 Schwelle -> Sendung

**Dramaturgischer Sinn**

Dies ist die einzige Öffnung nach außen. Sammlung löst sich nicht auf, sondern wird in die Welt entlassen.

**Visuell**

- der intime Innenraum hellt sich auf,
- Tür oder Fenster öffnen sich zu Luft, Wegkante und Horizont,
- Innenlicht bleibt als Nachhall zurück,
- Außenraum entsteht als Einladung, nicht als Befehl.

**Klanglich**

- naher Schutzton,
- langsam mehr Luft und Weite,
- der Raumklang verblasst, ohne abzubrechen.

**Interaktionsimpuls**

Die Schwelle wird durch Reife licht und durchlässig; der nächste Schritt ist möglich, aber nicht erzwungen.

**Dauer**

7 bis 9 Sekunden.

**Prompt-Baustein**

"Der Schwellenraum öffnet sich langsam zur Sendung; Laternen- und Innenlicht bleiben als warmer Nachhall, während sich Tür, Wegkante, Himmel und Horizont nach außen aufbauen; keine heroische Öffnung, sondern sanfte Entlassung in die reale Welt."

## 4. Rückkehrlogik

Rückkehr ist nie der exakt gleiche Übergang rückwärts abgespielt, sondern eine behutsame Wiederaufnahme des vorherigen Zustands.

- Sendung -> Schwelle: Außenlicht dimmt sich, Innenlicht gewinnt wieder Schutz.
- Schwelle -> Berufung: konkrete Dinge treten zurück, Ansprache wird wieder reiner Lichtort.
- Berufung -> Verdichtung: persönliches Licht löst sich wieder in ein gemeinsames Feld auf.
- Verdichtung -> Antwort: das Feld findet wieder einen wärmeren einzelnen Pol.
- Antwort -> Klage: Trost tritt zurück, Schwere wird erneut lesbar.
- Klage -> Hören: Enge löst sich in Sammlung.
- Hören -> Spuren: das Zentrum verstreut sich in lesbare Hinweise.
- Spuren -> Vorhof: konkrete Spuren verlieren sich wieder in offene Schwelle und Dunst.

## 5. Produktionshinweise

- Für Bildsequenzen oder Video-Generierung pro Übergang immer beide Räume im Prompt nennen: Ausgangsraum und Zielraum.
- Das gemeinsame Motiv muss ausdrücklich benannt werden, sonst erzeugen Modelle oft einen harten Stilbruch.
- Lichtwechsel nie isoliert prompten; immer zusammen mit Materialität, Luftzustand und Raumanker nennen.
- Wenn ein Übergang zu technisch oder filmisch wirkt, ist er zu explizit. Der Eindruck muss liturgisch und atmosphärisch bleiben.
- Der stärkste Hebel ist fast immer: Nebel plus gerichtetes Licht plus ein bleibendes Boden- oder Schalenmotiv.