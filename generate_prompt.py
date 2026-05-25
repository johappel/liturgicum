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
"""

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
# CLI
# ─────────────────────────────────────────────────────────────────────────────

def main() -> None:
    args = sys.argv[1:]

    if not args:
        print("\nVerfügbare Räume:\n")
        for key, r in RAEUME.items():
            print(f"  {key:<14} → {r['name']}")
        print("\nVerwendung:")
        print("  python generate_prompt.py <raum-id>          langer Prompt")
        print("  python generate_prompt.py <raum-id> --kurz   kurzer Prompt")
        print("  python generate_prompt.py alle               alle langen Prompts")
        print("  python generate_prompt.py alle --kurz        alle kurzen Prompts")
        print()
        return

    raum_id = args[0].lower()
    kurz = "--kurz" in args

    breite = 100

    if raum_id == "alle":
        for key, r in RAEUME.items():
            trennlinie = "─" * breite
            print(f"\n{trennlinie}")
            print(f"# {r['name']}")
            print(f"{trennlinie}\n")
            print(textwrap.fill(generate_prompt(key, kurz=kurz), width=breite))
            print()
    else:
        print()
        print(textwrap.fill(generate_prompt(raum_id, kurz=kurz), width=breite))
        print()


if __name__ == "__main__":
    main()
