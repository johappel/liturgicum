#!/usr/bin/env python3
"""
generate_prompt.py
Generiert Bildprompts für die Räume des Digitalen Resonanzraums.

Verwendung:
  python generate_prompt.py                     → Raumliste anzeigen
  python generate_prompt.py vorhof              → langer Prompt für Vorhof
  python generate_prompt.py klage --kurz        → kurzer Prompt für Klageraum
  python generate_prompt.py alle                → alle langen Prompts
  python generate_prompt.py alle --kurz         → alle kurzen Prompts

Asset-Modi (Anker und Artefakte gemäß V2-Regeln aus samples/referenz/prompts.md):
  python generate_prompt.py spuren --assets           → alle Asset-Schlüssel für Spuren auflisten
  python generate_prompt.py spuren --asset candle_field   → Prompt für einzelnen Anker
  python generate_prompt.py spuren --asset candle_unlit   → Prompt für freigestelltes Artefakt

JSON-Ausgabe für imagerouter (gpt-image-2):
  python generate_prompt.py spuren --json                 → Hintergrund-Prompt als imagerouter-Body
  python generate_prompt.py spuren --asset stone_bed --json
Optional:
  --size <auto|1024x1024|1792x1024|...>  default: auto
  --quality <auto|low|medium|high>       default: auto
"""

import json
import sys
import textwrap

# ─────────────────────────────────────────────────────────────────────────────
# Raumdaten  (Grammatik + Anker + Prompt-Bausteine)
# ─────────────────────────────────────────────────────────────────────────────

RAEUME: dict[str, dict] = {
    "masterscreen": {
        "name": "Master-Screen / Stilanker",
        "grammatik": {
            "schwere":         "mittel",
            "temperatur":      "neutral",
            "geschwindigkeit": "langsam",
            "licht":           "diffus bis warm, mehrschichtig",
            "klang":           "leise, offen",
            "weite":           "mittel–weit",
        },
        "beschreibung": (
            "stiller sakral offener Schwellenraum zwischen Innen und Außen, "
            "wie eine Mischung aus Schattentheater, lebendiger Ikone, "
            "poetischer Traumlandschaft und kontemplativer Installation, "
            "hybride 2D-Ästhetik mit klarer Tiefenschichtung: "
            "ferner Hintergrund mit offenem Horizont und diffusem Licht, "
            "mittlere Ebene mit architektonischer Schwelle oder Torbogen, "
            "Wasserfläche oder Steinboden als tragende Fläche, "
            "Vordergrund mit feinen Scherenschnitt-Silhouetten von Zweigen, Tüchern, Wurzeln oder stillen Objektformen"
        ),
        "licht": (
            "nicht dunkel um des Dunkels willen, sondern von kostbarem Licht durchzogen, "
            "Staub oder Pollen im Licht, sehr subtile Zeichen von Anwesenheit anderer "
            "als Lichtspuren, Wasserkreise oder ferne Schatten"
        ),
        "boden":    "Wasserfläche oder Steinboden, Weg, Schwelle",
        "stimmung": (
            "ruhig, würdevoll, langsam, geheimnisvoll, cineastisch, atmosphärisch, "
            "reduzierte Symbolik, weiche Nebel- und Lichttiefe, hochwertige Texturen, "
            "poetische Materialität, kein Kitsch"
        ),
        "anker": [
            "Schwelle oder Torbogen",
            "Wasserfläche oder Steinboden",
            "einzelne Kerzen",
            "Steine und Schale",
            "Laterne",
            "Baum- oder Astsilhouette",
        ],
        "_kein_portal": True,
    },

    "vorhof": {
        "name": "Vorhof / Übergang",
        "grammatik": {
            "schwere":         "leicht",
            "temperatur":      "kühl",
            "geschwindigkeit": "verlangsamend",
            "licht":           "diffus, dämmrig",
            "klang":           "weit, leer",
            "weite":           "offen, entgrenzend",
        },
        "beschreibung": (
            "stiller sakral offener Schwellenraum zwischen Außenwelt und innerem Raum, "
            "nebliger Vorraum mit architektonischer Schwelle oder Torbogen, "
            "weiter leerer Übergangsraum, angedeuteter Weg in einen stilleren Innenraum"
        ),
        "licht":    "diffuse Lichtöffnung im Halbdunkel, zarte Pflanzen- und Astsilhouetten",
        "boden":    "Stein, Luft, Stoff",
        "stimmung": "verlangsamend, würdevoll, Einladung statt Aufforderung",
        "anker":    ["Schwelle oder Torbogen", "Weg", "Lichtspalt"],
    },

    "spuren": {
        "name": "Raum der Spuren",
        "grammatik": {
            "schwere":         "leicht–mittel",
            "temperatur":      "neutral",
            "geschwindigkeit": "langsam",
            "licht":           "warm, punktuell",
            "klang":           "verhalten, nachhallend",
            "weite":           "mittel",
        },
        "beschreibung": (
            "stiller steinerner Hof oder kontemplative Steinlandschaft mit warmen Lichtpunkten "
            "und wassernahem Bereich, alte Wand oder Nische mit verblassenden Zeichen, "
            "niedrige Steinformen im Vordergrund"
        ),
        "licht":    "warme punktuelle Lichtpunkte, ruhige Wasserkante mit feinen Kreisen",
        "boden":    "Stein, Wasser, feuchte Fläche",
        "stimmung": "würdevoll, anonym, belebt ohne Lärm",
        "anker":    ["Kerzenort mit kleinen Schalen", "Steinfläche", "Wasserkante"],
    },

    "hoeren": {
        "name": "Raum des Hörens",
        "grammatik": {
            "schwere":         "leicht",
            "temperatur":      "neutral–kühl",
            "geschwindigkeit": "still",
            "licht":           "zentral, sanft leuchtend",
            "klang":           "resonant, konzentriert",
            "weite":           "kreisförmig, gesammelt",
        },
        "beschreibung": (
            "kreisförmiger oder apsisartiger stiller Innenraum mit ruhigem Zentrum "
            "und sanftem Leuchten, lichte Rundung oder offene Lichtung, "
            "Sitzsilhouetten und ruhiger Vordergrundrahmen"
        ),
        "licht":    "zentrales sanftes Leuchten, viel Stille und Leerraum",
        "boden":    "Stein, ruhige kreisförmige Fläche",
        "stimmung": "kontemplativ, gesammelt, sakral offen, keine Predigtästhetik",
        "anker":    ["Sitzort oder Kreisform", "Klangzentrum", "zentrale Lichtquelle"],
    },

    "klage": {
        "name": "Raum der Klage",
        "grammatik": {
            "schwere":         "schwer",
            "temperatur":      "kühl, nass",
            "geschwindigkeit": "still",
            "licht":           "gedämpft, vereinzelt glimmend",
            "klang":           "tief, schwer",
            "weite":           "eng–mittel, drückend",
        },
        "beschreibung": (
            "dunkler offener Wasser- oder Steinraum mit regennasser oder verwitterter Materialität, "
            "tiefer Dunkelraum mit vereinzeltem verhaltenen Glimmen, "
            "eingebrochenes Dach, Wände und Säulen, überall Zertstörung, verwitterte Tücher, Gegenstände von Menschen oder Kindern"
        ),
        "licht":    "gedämpftes Licht ohne aufhellenden Trost, Wind- und Regenschichten",
        "boden":    "nasses dunkles Wasser, schwerer Stein",
        "stimmung": "schmerzvoll, würdevoll, schwer, ohne Kitsch, ohne Wellness-Anmutung",
        "anker":    ["Steinbett oder Steinablage", "Schale für Klage", "Wasserort", "Klagewand"],
    },

    "antwort": {
        "name": "Raum der Antwort",
        "grammatik": {
            "schwere":         "mittel",
            "temperatur":      "warm werdend",
            "geschwindigkeit": "langsam öffnend",
            "licht":           "warm, wachsend",
            "klang":           "weich, resonant",
            "weite":           "mittel–weit",
        },
        "beschreibung": (
            "stiller Hof mit Wasser und Licht oder lichter Baumraum "
            "als Übergang zwischen Dunkelheit und Helligkeit, "
            "ruhiges Wasserbecken, Baum- oder Astform, offene Schale, Lichtachse"
        ),
        "licht":    "warme zurückhaltende Helligkeit, leichte Lichtkanten, wachsende Wärme",
        "boden":    "Wasser, Erde, Stein",
        "stimmung": "hoffnungsvoll ohne Pathos, leise Selbstwirksamkeit",
        "anker":    ["Schale oder Wasserbecken", "Baum oder Astform", "Lichtort"],
    },

    "verdichtung": {
        "name": "Raum der Verdichtung",
        "grammatik": {
            "schwere":         "mittel",
            "temperatur":      "neutral–warm",
            "geschwindigkeit": "pulsierend still",
            "licht":           "Nachtlicht, punktuell schimmernd",
            "klang":           "dicht, schwingend",
            "weite":           "weit, atmosphärisch",
        },
        "beschreibung": (
            "offene nächtliche Weite oder abstrahierte Halle aus Dunkel und Leuchten, "
            "mehrschichtige Licht- und Nebelflächen, ruhige horizontale Raumkanten, "
            "atmosphärische Dichte ohne Eventcharakter"
        ),
        "licht":    "schwingende Schatten, feine Stern- oder Partikelebenen, punktuelles Nachtlicht",
        "boden":    "trocken, abstrakt, dunkel",
        "stimmung": "würdevoll, gesammelt, keine Eventisierung, keine sichtbare Gruppe",
        "anker":    ["Lichtfeld oder Klangzentrum", "Wasser- oder Resonanzfläche"],
    },

    "berufung": {
        "name": "Raum der Berufung / leisen Wirksamkeit",
        "grammatik": {
            "schwere":         "leicht, gehalten",
            "temperatur":      "warm",
            "geschwindigkeit": "still, empfangend",
            "licht":           "zugewandt, von oben oder innen, gerichtet",
            "klang":           "nah, resonant",
            "weite":           "mittel, gesammelt",
        },
        "beschreibung": (
            "stiller innerer Raum des Gehörtwerdens und Gerufenseins, "
            "kein Aufbruch sondern Innehalten — der Moment vor dem Aufbruch, "
            "ein gehaltener Ort der sagt: du bist gemeint, "
            "kleine erhöhte Nische oder inneres Heiligtum, "
            "warmes Licht das auf den Betrachter zukommt oder von oben fällt, "
            "kein offener Horizont sondern eine Zuwendung"
        ),
        "licht":    "warmes gerichtetes Licht von oben oder aus der Tiefe des Raums auf den Betrachter zu, "
                    "nicht Morgendämmerung sondern Ansprache, still und tragend",
        "boden":    "Stein, stille Fläche, leichte Erhöhung",
        "stimmung": "still, gehalten, getragen, nicht heroisch, Berührung ohne Griff, "
                    "Bubers Du — im Du begegnet das ewige Du",
        "anker":    [
            "Lichtzentrum oder zugewandte Lichtquelle",
            "erhöhter leerer Ort oder Sitznische (der Platz ist für dich gehalten)",
            "symbolische Öffnung oder Resonanzfeld (Ansprache, nicht Ausgang)",
        ],
    },

    "schwelle": {
        "name": "Schwellenraum / Ausgang",
        "grammatik": {
            "schwere":         "leicht",
            "temperatur":      "warm",
            "geschwindigkeit": "still",
            "licht":           "intim, schützend",
            "klang":           "zurückhaltend, nah",
            "weite":           "eng–intim",
        },
        "beschreibung": (
            "stiller geschützter Ausgangsraum zwischen Innen und Außen, "
            "warme Nische mit Laterne, Bank an Wand oder Fenster, "
            "gedämpfter Raum mit ruhiger Schreibfläche, vertraulich ohne soziale Bühne"
        ),
        "licht":    "intimes Licht, schützend statt ausstellend, sanfte Schatten von Pflanzen oder Stoffen",
        "boden":    "Stein, Holz",
        "stimmung": "vertraulich, intim, keine Formularanmutung",
        "anker":    ["Bank oder Sitzplatz", "Schreibfläche", "Laterne", "Tür oder Fenster nach draußen"],
    },

    "sendung": {
        "name": "Sendung / Rückkehr",
        "grammatik": {
            "schwere":         "leicht",
            "temperatur":      "warm–hell",
            "geschwindigkeit": "nach außen öffnend",
            "licht":           "hell, nach außen ziehend",
            "klang":           "verblassend, Nachhall",
            "weite":           "offen",
        },
        "beschreibung": (
            "heller werdender Ausgang oder offenes Fenster zur realen Welt, "
            "Wegführung ins Draußen, leichte Außenkonturen, "
            "verblassende Innenraumsilhouette, letzte Lichtkante vor dem Alltag"
        ),
        "licht":    "Licht zieht nach außen, Innenraum verblasst langsam",
        "boden":    "Schwelle, Weg, Außenkante",
        "stimmung": "sendend statt abschließend, Nachhall statt Pathos",
        "anker":    ["offenes Fenster oder Tür", "Wegkante oder Schwelle", "Horizontöffnung"],
    },
}

# ─────────────────────────────────────────────────────────────────────────────
# Stabile Blöcke
# ─────────────────────────────────────────────────────────────────────────────

STIL_BLOCK = (
    "Perspektive wie im Master-Screen, "
    "hybrides 2D-Screendesign, "
    "Scherenschnitt und Silhouetten, "
    "kontemplatives sakral offenes Bühnenbild, "
    "viel Leerraum, "
    "poetische Materialität, "
    "weiche Nebel- und Lichttiefe, "
    "mehrschichtige atmosphärische Tiefe"
)

KOMPOSITION_BLOCK = (
    # Kamera & Blickachse
    "Kameralogik: niedriger Blickpunkt auf Boden- oder Stuhlhöhe, "
    "Blickachse diagonal von unten-vorne nach oben-hinten in die Szenetiefe, "
    # Raumszene / Bühne
    "Raumszene und Bühne in Bildmitte bis oben-links: "
    "hier entfaltet sich das Raumthema, hier liegen alle Raumanker, "
    # Eingangsportal
    "Eingangsportal unten-links: bereits hinter dem Betrachter, "
    "atmosphärische Öffnung im Dunst, keine scharfe Kante, "
    "nicht wie eine Bühnentür von außen, sondern wie ein Durchgang den man gerade passiert hat, "
    # Ausgangsportal
    "Ausgangsportal oben-rechts: erhöht, ins Licht führend, "
    "noch geschlossen oder schimmernd, öffnet sich durch Verweilen, "
    # Parallax
    "Parallaxtiefe bestätigt die Blickachse: "
    "Vordergrund unten groß und nah, Mittelgrund kleiner, "
    "Hintergrund oben weit und atmosphärisch weich"
)

NEGATIV_BLOCK = (
    "keine UI, keine Schrift, keine identifizierbaren Personen, keine Avatarwirkung, "
    "keine Game-Ästhetik, keine Fantasy-Burg, keine realistische Kirche, "
    "keine blinkenden Effekte, kein Kitsch, keine Social-Media-Anmutung, 16:9"
)

# ─────────────────────────────────────────────────────────────────────────────
# Prompt-Bau
# ─────────────────────────────────────────────────────────────────────────────

def _grammatik_als_text(g: dict) -> str:
    return (
        f"Atmosphärische Raumgrammatik: "
        f"Schwere {g['schwere']}, "
        f"Temperatur {g['temperatur']}, "
        f"Tempo {g['geschwindigkeit']}, "
        f"Licht {g['licht']}, "
        f"Klang {g['klang']}, "
        f"Weite {g['weite']}"
    )


def generate_prompt(raum_id: str, kurz: bool = False) -> str:
    if raum_id not in RAEUME:
        verfuegbar = ", ".join(RAEUME.keys())
        return f"Unbekannter Raum: '{raum_id}'.\nVerfügbar: {verfuegbar}"

    r = RAEUME[raum_id]
    anker_text = ", ".join(r["anker"])

    if kurz:
        teile = [
            f"Generiere einen neuen digitalen Resonanzraum, {r['name']}",
            "hybrides 2D-Screendesign, Scherenschnitt, sakral offen",
            r["beschreibung"],
            r["licht"],
            f"Raumanker sichtbar im Bild: {anker_text}",
            r["stimmung"],
            NEGATIV_BLOCK,
        ]
    else:
        mit_portal = not r.get("_kein_portal", False)
        teile = [
            f"Generiere einen neuen sakralen Resonanzraum, {r['name']}",
            STIL_BLOCK,
            r["beschreibung"],
            r["licht"],
            f"Bodenmaterialität: {r['boden']}",
            f"Raumanker sichtbar und räumlich verankert im Bild: {anker_text}",
        ]
        if mit_portal:
            teile.append(KOMPOSITION_BLOCK)
        else:
            teile.append(
                "dieses Bild etabliert die Kameralogik und Kompositionsregel für alle Räume: "
                "niedrige Kamera, Blickachse diagonal in die Tiefe, "
                "Raumszene in Bildmitte bis oben-links, "
                "Eingangsportal unten-links hinter dem Betrachter, "
                "Ausgangsportal oben-rechts ins Licht — "
                "aus ihm lassen sich Vorhof, Spurenraum, Hörraum, Klageraum, "
                "Antwortraum, Verdichtungsraum, Berufungsraum, Schwellenraum "
                "und Sendungsraum stilistisch und kompositorisch ableiten"
            )
        teile += [
            _grammatik_als_text(r["grammatik"]),
            r["stimmung"],
            NEGATIV_BLOCK,
        ]

    return ", ".join(teile) + "."


# ─────────────────────────────────────────────────────────────────────────────
# Asset-Prompts (Anker und Artefakte, V2-Regeln aus samples/referenz/prompts.md)
# ─────────────────────────────────────────────────────────────────────────────

# Stabiler Negativ-Block für freigestellte Einzel-Assets.
ASSET_NEGATIV = (
    "keine Schrift, keine Labels, keine Überschriften, kein Board, kein Moodboard, "
    "kein Splitscreen, keine Katalogansicht, keine Collage, keine Produktpräsentation, "
    "keine mehreren Kategorien in einem Bild, keine UI, keine identifizierbaren Personen"
)

# Stilanker für Asset-Prompts: derselbe Material-/Lichtcharakter wie der Raum.
ASSET_STIL_SPUREN = (
    "derselbe materialreiche kontemplative Stil wie der Raum der Spuren — "
    "stiller steinerner Hof mit warmen Lichtpunkten, ruhiger Wasserkante, "
    "verwitterten Steinflächen, weicher Nebeltiefe, poetischer Materialität, "
    "weiches diffuses Licht, würdevoll, sakral offen, hybrides 2D-Screendesign"
)

# Die Spuren-Assets gemäß docs/Assets-Spuren.md.
# Pro Asset:
#   - `kind`:    "anchor" (sitzt im Raum, nicht freigestellt) | "artifact" (alpha-freigestellt) | "silhouette"
#   - `name`:    Anzeigename
#   - `body`:    konkrete Bildbeschreibung (das, was zu sehen sein soll)
#   - `default_size`: Empfohlene Bildgröße für imagerouter (oder "auto").
RAUMASSETS: dict[str, dict[str, dict]] = {
    "spuren": {
        "background": {
            "kind": "background",
            "name": "Hintergrund Spuren (Master-Bühne)",
            "body": None,  # nutzt generate_prompt("spuren") (langer Raum-Prompt)
            "default_size": "1792x1024",
        },
        "candle_field": {
            "kind": "anchor",
            "name": "Anker: Kerzenfeld (leer)",
            "body": (
                "eine flache niedrige Steinplatte mit drei bis fünf leeren Kerzenpositionen "
                "und zwei kleinen flachen Tonschalen daneben, ruhige schwere Form, "
                "leicht erhöhte Perspektive von vorne-unten, "
                "auf neutraler Steinplatte und mit ein wenig Bodenkontext aus demselben Raum, "
                "noch keine Kerze entzündet"
            ),
            "default_size": "1024x1024",
        },
        "stone_bed": {
            "kind": "anchor",
            "name": "Anker: Steinbett",
            "body": (
                "eine flache Bodenfläche mit vier bis sechs halb in den Sand oder feuchten Stein "
                "eingesunkenen dunklen Steinen unterschiedlicher Größe, ruhig verteilt, "
                "leicht erhöhte Perspektive, weiches diffuses Licht, ohne Beschriftung der Steine"
            ),
            "default_size": "1024x1024",
        },
        "water_edge": {
            "kind": "anchor",
            "name": "Anker: Wasserkante",
            "body": (
                "eine ruhige flache Wasseroberfläche an einer Steinkante, "
                "kaum sichtbare feine Wellenkreise, leichte Reflexionen warmer Lichtpunkte aus dem Raum, "
                "leicht erhöhte Perspektive, als sichtbare Raumstation gedacht"
            ),
            "default_size": "1024x1024",
        },
        "candle_unlit": {
            "kind": "artifact",
            "name": "Artefakt: Kerze (unangezündet)",
            "body": (
                "ein einzelner einfacher weißer Kerzenkörper, ruhige zylindrische Form, "
                "sauberer Docht, weiches diffuses Licht, poetische Materialität, "
                "ohne weitere Objekte, ohne Flamme, "
                "freigestellt auf transparentem Hintergrund — die Flamme entsteht später als Hybrid-Asset"
            ),
            "default_size": "1024x1024",
        },
        "stone_loose_a": {
            "kind": "artifact",
            "name": "Artefakt: loser Stein, Variante A",
            "body": (
                "ein einzelner handgroßer dunkler Stein, glatte ruhige Oberfläche, leicht feucht, "
                "subtile Materialtiefe, weiches Licht, ovale ruhige Grundform, "
                "freigestellt auf transparentem Hintergrund"
            ),
            "default_size": "1024x1024",
        },
        "stone_loose_b": {
            "kind": "artifact",
            "name": "Artefakt: loser Stein, Variante B",
            "body": (
                "ein einzelner handgroßer dunkler Stein, glatte Oberfläche mit feiner Maserung, "
                "leicht kantigere Grundform als ein einfacher Kiesel, leicht feucht, "
                "freigestellt auf transparentem Hintergrund"
            ),
            "default_size": "1024x1024",
        },
        "stone_loose_c": {
            "kind": "artifact",
            "name": "Artefakt: loser Stein, Variante C",
            "body": (
                "ein einzelner handgroßer dunkler Stein, leicht flachere Grundform, "
                "warme tiefdunkle Tönung, glatte ruhige Oberfläche, leicht feucht, "
                "freigestellt auf transparentem Hintergrund"
            ),
            "default_size": "1024x1024",
        },
        "silhouette_passing": {
            "kind": "silhouette",
            "name": "Silhouette: Vorübergehende Figur",
            "body": (
                "eine schemenhafte identitätslose menschliche Silhouette im leichten Schritt, "
                "kein Gesicht, keine harten Konturen, weicher Alpha-Verlauf zu den Rändern, "
                "dunkler warmer Grauton, würdevoll, kein Avatar, kein Charakter, kein Comic, "
                "freigestellt auf transparentem Hintergrund"
            ),
            "default_size": "1024x1024",
        },
        "silhouette_seated": {
            "kind": "silhouette",
            "name": "Silhouette: Sitzende Figur",
            "body": (
                "eine schemenhafte identitätslose menschliche Silhouette, ruhig sitzend, "
                "kein Gesicht, keine harten Konturen, weicher Alpha-Verlauf zu den Rändern, "
                "dunkler warmer Grauton, würdevoll, kein Charakter, "
                "freigestellt auf transparentem Hintergrund"
            ),
            "default_size": "1024x1024",
        },
        "silhouette_kneeling": {
            "kind": "silhouette",
            "name": "Silhouette: Kniende Figur",
            "body": (
                "eine schemenhafte identitätslose menschliche Silhouette, ruhig kniend, "
                "kein Gesicht, keine harten Konturen, weicher Alpha-Verlauf zu den Rändern, "
                "dunkler warmer Grauton, würdevoll, kein Charakter, "
                "freigestellt auf transparentem Hintergrund"
            ),
            "default_size": "1024x1024",
        },
    },
}


def list_assets(raum_id: str) -> str:
    if raum_id not in RAUMASSETS:
        return f"Keine Asset-Definitionen für Raum '{raum_id}'."
    lines = [f"Assets für Raum '{raum_id}':"]
    for key, a in RAUMASSETS[raum_id].items():
        lines.append(f"  {key:<22} [{a['kind']:<10}] {a['name']}")
    return "\n".join(lines)


def generate_asset_prompt(raum_id: str, asset_key: str) -> str:
    if raum_id not in RAUMASSETS or asset_key not in RAUMASSETS[raum_id]:
        return f"Unbekanntes Asset: {raum_id}:{asset_key}"
    asset = RAUMASSETS[raum_id][asset_key]

    if asset["kind"] == "background":
        # Hintergrund nutzt den vollständigen Raum-Prompt.
        return generate_prompt(raum_id, kurz=False)

    if asset["kind"] == "anchor":
        # Ankerobjekt sitzt im Raum, nicht freigestellt.
        teile = [
            f"{asset['name']} für den digitalen Resonanzraum",
            asset["body"],
            ASSET_STIL_SPUREN,
            "als sichtbare feste Raumstation gedacht, nicht freigestellt, "
            "auf neutraler Steinplatte oder direkt im Bodenmaterial des Raums verankert",
            ASSET_NEGATIV,
        ]
        return ", ".join(teile) + "."

    if asset["kind"] == "artifact":
        # Freigestelltes Einzelobjekt.
        teile = [
            f"{asset['name']} für den digitalen Resonanzraum",
            asset["body"],
            ASSET_STIL_SPUREN,
            ASSET_NEGATIV,
            "Freigestellt!",
        ]
        return ", ".join(teile) + "."

    if asset["kind"] == "silhouette":
        teile = [
            f"{asset['name']} für den digitalen Resonanzraum",
            asset["body"],
            "absichtlich identitätslos, andeutend statt darstellend, "
            "wird im Code mit animierter Alpha und leichtem Drift in den Raum geblendet",
            ASSET_NEGATIV,
            "Freigestellt!",
        ]
        return ", ".join(teile) + "."

    return f"Unbekannter Asset-Typ: {asset['kind']}"


# ─────────────────────────────────────────────────────────────────────────────
# imagerouter-JSON
# ─────────────────────────────────────────────────────────────────────────────

def to_imagerouter_body(
    prompt: str,
    size: str = "auto",
    quality: str = "auto",
    output_format: str = "png",
    model: str = "openai/gpt-image-2",
) -> dict:
    """
    Baut den Request-Body für POST https://api.imagerouter.io/v1/openai/images/generations.
    """
    return {
        "prompt": prompt,
        "model": model,
        "quality": quality,
        "size": size,
        "output_format": output_format,
    }




def _arg_value(args: list[str], flag: str, default: str | None = None) -> str | None:
    if flag in args:
        i = args.index(flag)
        if i + 1 < len(args):
            return args[i + 1]
    return default


def main() -> None:
    args = sys.argv[1:]

    if not args:
        print("\nVerfügbare Räume:\n")
        for key, r in RAEUME.items():
            print(f"  {key:<14} → {r['name']}")
        print("\nVerwendung:")
        print("  python generate_prompt.py <raum-id>                  langer Prompt")
        print("  python generate_prompt.py <raum-id> --kurz           kurzer Prompt")
        print("  python generate_prompt.py alle                       alle langen Prompts")
        print("  python generate_prompt.py alle --kurz                alle kurzen Prompts")
        print("  python generate_prompt.py <raum-id> --assets         Asset-Liste anzeigen")
        print("  python generate_prompt.py <raum-id> --asset <key>    Asset-Prompt")
        print("  python generate_prompt.py <raum-id> [--asset <key>] --json   imagerouter-Body")
        print("       optionale Flags für --json: --size <auto|WxH>  --quality <auto|low|medium|high>")
        print()
        return

    raum_id = args[0].lower()
    kurz = "--kurz" in args
    as_json = "--json" in args
    list_only_assets = "--assets" in args
    asset_key = _arg_value(args, "--asset")
    size = _arg_value(args, "--size", "auto") or "auto"
    quality = _arg_value(args, "--quality", "auto") or "auto"

    breite = 100

    # --assets: nur Assetliste eines Raums anzeigen
    if list_only_assets:
        print()
        print(list_assets(raum_id))
        print()
        return

    # --asset <key>: Asset-Prompt (optional als JSON)
    if asset_key:
        prompt_text = generate_asset_prompt(raum_id, asset_key)
        if prompt_text.startswith("Unbekannt"):
            print(prompt_text)
            sys.exit(1)
        if as_json:
            asset = RAUMASSETS[raum_id][asset_key]
            effective_size = size if size != "auto" else asset.get("default_size", "auto")
            body = to_imagerouter_body(prompt_text, size=effective_size, quality=quality)
            print(json.dumps(body, ensure_ascii=False, indent=2))
        else:
            print()
            print(textwrap.fill(prompt_text, width=breite))
            print()
        return

    if raum_id == "alle":
        for key, r in RAEUME.items():
            trennlinie = "─" * breite
            print(f"\n{trennlinie}")
            print(f"# {r['name']}")
            print(f"{trennlinie}\n")
            print(textwrap.fill(generate_prompt(key, kurz=kurz), width=breite))
            print()
        return

    prompt_text = generate_prompt(raum_id, kurz=kurz)
    if as_json:
        body = to_imagerouter_body(prompt_text, size=size, quality=quality)
        print(json.dumps(body, ensure_ascii=False, indent=2))
    else:
        print()
        print(textwrap.fill(prompt_text, width=breite))
        print()


if __name__ == "__main__":
    main()
