#!/usr/bin/env python3
"""
generate_transition_prompt.py
Generiert Übergangsprompts zwischen den Räumen des Digitalen Resonanzraums.

Verwendung:
  python generate_transition_prompt.py                        → Übergänge anzeigen
  python generate_transition_prompt.py vorhof spuren         → langer Übergangsprompt
  python generate_transition_prompt.py vorhof->spuren        → langer Übergangsprompt
  python generate_transition_prompt.py vorhof spuren --kurz  → kurzer Übergangsprompt
  python generate_transition_prompt.py alle                  → alle langen Übergänge
"""

import sys
import textwrap

from generate_prompt import KOMPOSITION_BLOCK, NEGATIV_BLOCK, RAEUME, STIL_BLOCK


RAUMFOLGE = [
    "vorhof",
    "spuren",
    "hoeren",
    "klage",
    "antwort",
    "verdichtung",
    "berufung",
    "schwelle",
    "sendung",
]


UEBERGAENGE: dict[tuple[str, str], dict[str, str]] = {
    ("vorhof", "spuren"): {
        "motiv_bleibt": "Nebel, Wegkante und steinerne Schwelle",
        "motiv_verwandelt": "die offene Schwelle wird zu einer lesbaren Spur aus Steinfläche, kleinen Schalen und Wasserkante",
        "motiv_neu": "punktuelle warme Lichtorte",
        "visuell": (
            "der diffuse Vorhof verdichtet sich langsam, der weite Übergangsraum bekommt erste konkrete Spuren "
            "von Anwesenheit, Steinfläche, kleine Schalen und stille Wasserkante treten aus dem Dunst hervor"
        ),
        "klang": "weiter leerer Raumton sammelt erste helle Nachklänge und zurückhaltende Resonanzpunkte",
        "impuls": "langsames Vorwärtsgehen oder Verweilen lässt Lichtpunkte an den Spurenorten lesbar werden",
        "dauer": "5 bis 6 Sekunden",
    },
    ("spuren", "hoeren"): {
        "motiv_bleibt": "Stein, Wasser und kleine Lichtorte",
        "motiv_verwandelt": "verteilte Hinweise sammeln sich kreisförmig um ein ruhiges Zentrum",
        "motiv_neu": "Klangzentrum und Sitzordnung",
        "visuell": (
            "der Spurenraum ordnet sich um ein stilles Zentrum, mehrere kleine Licht- und Spurzeichen "
            "werden zu einer konzentrierten Kreisform mit ruhigem Innenraum"
        ),
        "klang": "verhaltene Einzelresonanzen bündeln sich zu einem tragenden konzentrierten Grundton",
        "impuls": "ruhiges Innehalten sammelt verstreute Zeichen in Klang und Licht",
        "dauer": "5 bis 7 Sekunden",
    },
    ("hoeren", "klage"): {
        "motiv_bleibt": "das zentrale Leuchten und die gesammelte Blickachse",
        "motiv_verwandelt": "das Hören sinkt in Nässe, dunklen Stein und mehr Gewicht ab",
        "motiv_neu": "Klagewand, Steinablage und regennasse Schwere",
        "visuell": (
            "der ruhige Hörraum kippt nicht abrupt, sondern sinkt langsam in einen schwereren, nasseren Raum, "
            "das zentrale Licht bleibt als schwacher Glutkern erhalten"
        ),
        "klang": "der tragende Ton wird tiefer, dichter und nasser, mit mehr Last und weniger Offenheit",
        "impuls": "längeres Verweilen legt verborgene Schwere frei, statt einen Effekt auszulösen",
        "dauer": "7 bis 8 Sekunden",
    },
    ("klage", "antwort"): {
        "motiv_bleibt": "Wasser, Schale und schwerer Stein",
        "motiv_verwandelt": "in die Schwere wächst langsam ein warmer Gegenpol hinein",
        "motiv_neu": "Baum- oder Astform und ein erster warmer Lichtort",
        "visuell": (
            "der Klageraum bleibt lesbar, während eine leise warme Antwort in Licht, organischer Form und "
            "behutsamer Öffnung hinzutritt"
        ),
        "klang": "über tiefer Schwere erscheint ein weicher Resonanzton, der die Klage nicht auslöscht",
        "impuls": "das Bleiben bei der Klage lässt einen zweiten Pol entstehen: Antwort statt Lösung",
        "dauer": "7 bis 8 Sekunden",
    },
    ("antwort", "verdichtung"): {
        "motiv_bleibt": "warmes Licht, Wasser und Resonanz",
        "motiv_verwandelt": "der einzelne Lichtort vervielfacht sich zu einem gemeinsamen Feld",
        "motiv_neu": "nächtliche Punktlichter und atmosphärische Dichte",
        "visuell": (
            "der Antwortraum wird weiter und dichter zugleich, warmes Licht verteilt sich in mehrere stille Punkte, "
            "Wasser oder Klang werden flächiger"
        ),
        "klang": "ein einzelner warmer Ton wird zu einem dichten schwingenden Feld, nicht lauter, sondern vielschichtiger",
        "impuls": "Resonanz sammelt mehrere Licht- und Klangpunkte zu einem gemeinsamen Feld",
        "dauer": "6 bis 8 Sekunden",
    },
    ("verdichtung", "berufung"): {
        "motiv_bleibt": "nächtliche Resonanz und sakrale Tiefe",
        "motiv_verwandelt": "die vielen Lichtpunkte bündeln sich zu einem einzigen zugewandten Lichtzentrum",
        "motiv_neu": "erhöhter leerer Ort oder Sitznische als persönlicher Rufort",
        "visuell": (
            "der weite Verdichtungsraum zieht sich zu einem gehaltenen Innenraum zusammen, "
            "das Licht kommt auf den Betrachter zu statt in die Ferne zu ziehen"
        ),
        "klang": "das dichte Feld bündelt sich zu einem nahen persönlichen Resonanzton",
        "impuls": "langes Verweilen zieht diffuse Resonanz in eine persönliche Ansprache zusammen",
        "dauer": "8 bis 10 Sekunden",
    },
    ("berufung", "schwelle"): {
        "motiv_bleibt": "zugewandtes Licht und gehaltener Innenraum",
        "motiv_verwandelt": "die innere Ansprache wird zu einem konkreten Ort des Antwortens",
        "motiv_neu": "Bank, Schreibfläche, Laterne und geschützte Tür oder Fensteröffnung",
        "visuell": (
            "der Raum der Berufung wird intimer und praktischer, aus der leeren Nische werden Dinge des "
            "stillen Bereitseins, ohne den sakralen Ernst zu verlieren"
        ),
        "klang": "naher Resonanzton wird ruhiger, schützender und beinahe häuslich intim",
        "impuls": "aus reinem Empfangen wird stilles Bereitsein: sitzen, schreiben, sammeln",
        "dauer": "6 bis 7 Sekunden",
    },
    ("schwelle", "sendung"): {
        "motiv_bleibt": "Innenlicht, Schwelle und Wegkante",
        "motiv_verwandelt": "der geschützte Innenraum wird langsam luftiger und nach außen offen",
        "motiv_neu": "Horizontöffnung und reale Außenweite",
        "visuell": (
            "der Schwellenraum hellt sich langsam auf, Tür oder Fenster bauen sich zu Luft, Weg und Horizont aus, "
            "während das Innenlicht als Nachhall bestehen bleibt"
        ),
        "klang": "naher Schutzton verliert sich langsam in Luft und Weite, ohne abzubrechen",
        "impuls": "die Schwelle wird durchlässig; der nächste Schritt ist möglich, aber nicht erzwungen",
        "dauer": "7 bis 9 Sekunden",
    },
}


def _raumgrammatik_text(raum_id: str) -> str:
    grammatik = RAEUME[raum_id]["grammatik"]
    return (
        f"Schwere {grammatik['schwere']}, "
        f"Temperatur {grammatik['temperatur']}, "
        f"Tempo {grammatik['geschwindigkeit']}, "
        f"Licht {grammatik['licht']}, "
        f"Klang {grammatik['klang']}, "
        f"Weite {grammatik['weite']}"
    )


def _parse_transition(args: list[str]) -> tuple[str, str, bool]:
    kurz = "--kurz" in args
    clean_args = [arg for arg in args if arg != "--kurz"]

    if len(clean_args) == 1 and clean_args[0] == "alle":
        return "alle", "", kurz

    if len(clean_args) == 1:
        token = clean_args[0].lower()
        for separator in ("->", ":"):
            if separator in token:
                start, ziel = token.split(separator, 1)
                return start, ziel, kurz

    if len(clean_args) == 2:
        return clean_args[0].lower(), clean_args[1].lower(), kurz

    raise ValueError("Bitte zwei Raum-IDs angeben oder <raum1>-><raum2> verwenden.")


def _verfuegbare_uebergaenge() -> list[tuple[str, str]]:
    return list(UEBERGAENGE.keys())


def generate_transition_prompt(start_id: str, ziel_id: str, kurz: bool = False) -> str:
    schluessel = (start_id, ziel_id)
    if schluessel not in UEBERGAENGE:
        verfuegbar = ", ".join(f"{start}->{ziel}" for start, ziel in _verfuegbare_uebergaenge())
        return (
            f"Unbekannter Übergang: '{start_id}' -> '{ziel_id}'.\n"
            f"Verfügbar: {verfuegbar}"
        )

    start_raum = RAEUME[start_id]
    ziel_raum = RAEUME[ziel_id]
    u = UEBERGAENGE[schluessel]

    if kurz:
        teile = [
            (
                f"Generiere einen atmosphärischen Schwellenübergang von {start_raum['name']} "
                f"zu {ziel_raum['name']}"
            ),
            "gleiche Kamera, gleiche Blickachse, kein Schnitt",
            f"bleibendes Motiv: {u['motiv_bleibt']}",
            f"Verwandlung: {u['motiv_verwandelt']}",
            f"neu hinzutretend: {u['motiv_neu']}",
            u["visuell"],
            u["klang"],
            NEGATIV_BLOCK,
        ]
    else:
        teile = [
            (
                f"Generiere einen sakralen Übergang im digitalen Resonanzraum, "
                f"von {start_raum['name']} zu {ziel_raum['name']}"
            ),
            STIL_BLOCK,
            (
                "kein Szenenwechsel sondern Schwelle, vier Phasen: Reifung, Schleier, Mitnahme, Ankunft, "
                "kein harter Schnitt, keine Schwarzblende, kein Teleport"
            ),
            KOMPOSITION_BLOCK,
            f"Ausgangsraum-Grammatik: {_raumgrammatik_text(start_id)}",
            f"Zielraum-Grammatik: {_raumgrammatik_text(ziel_id)}",
            f"Motiv das bleibt: {u['motiv_bleibt']}",
            f"Motiv das sich verwandelt: {u['motiv_verwandelt']}",
            f"Neues Motiv: {u['motiv_neu']}",
            f"Visuelle Choreografie: {u['visuell']}",
            f"Klangliche Choreografie: {u['klang']}",
            f"Interaktionsimpuls: {u['impuls']}",
            f"Empfohlene Dauer: {u['dauer']}",
            (
                f"Raumanker des Zielraums lesbar in der Ankunft: "
                f"{', '.join(ziel_raum['anker'])}"
            ),
            NEGATIV_BLOCK,
        ]

    return ", ".join(teile) + "."


def main() -> None:
    args = sys.argv[1:]
    breite = 100

    if not args:
        print("\nVerfügbare Übergänge:\n")
        for start_id, ziel_id in _verfuegbare_uebergaenge():
            print(f"  {start_id:<12} -> {ziel_id:<12}  {RAEUME[start_id]['name']} -> {RAEUME[ziel_id]['name']}")
        print("\nVerwendung:")
        print("  python generate_transition_prompt.py <raum1> <raum2>          langer Übergangsprompt")
        print("  python generate_transition_prompt.py <raum1>-><raum2>         langer Übergangsprompt")
        print("  python generate_transition_prompt.py <raum1> <raum2> --kurz   kurzer Übergangsprompt")
        print("  python generate_transition_prompt.py alle                     alle langen Übergänge")
        print()
        return

    try:
        start_id, ziel_id, kurz = _parse_transition(args)
    except ValueError as exc:
        print(f"\n{exc}\n")
        return

    if start_id == "alle":
        for current_start, current_ziel in _verfuegbare_uebergaenge():
            trennlinie = "─" * breite
            print(f"\n{trennlinie}")
            print(f"# {RAEUME[current_start]['name']} -> {RAEUME[current_ziel]['name']}")
            print(f"{trennlinie}\n")
            print(textwrap.fill(generate_transition_prompt(current_start, current_ziel, kurz=kurz), width=breite))
            print()
        return

    print()
    print(textwrap.fill(generate_transition_prompt(start_id, ziel_id, kurz=kurz), width=breite))
    print()


if __name__ == "__main__":
    main()