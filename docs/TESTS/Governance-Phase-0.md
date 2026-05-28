# Governance-Check Phase 0 — Spuren-Ergänzungen

Prüfung der in Phase 0 entstandenen Doku-Erweiterungen gegen [docs/TESTS/Kontrollfragen.md](../TESTS/Kontrollfragen.md) und das [Liturgische Manifest](../Liturgisches-Manifest.md). Datum: 2026-05-29. Ergebnis pro Dokument und konsolidiert.

## Geprüfte Dokumente

| Datei | Ergänzung | Manifest-Check vor Ort |
|-------|-----------|------------------------|
| [docs/Design-Artefakte.md](../Design-Artefakte.md) §11 | Raumanker Spuren (Positionen, Hit-Zonen, Einzelanker) | §11.4 ✅ |
| [docs/Raeume.md](../Raeume.md) §8 | Animations-/Timing-Grammatik (Gestenphasen, Portale, Reife, Partikel) | §8.5 ✅ |
| [docs/Interaktions-Spezifikation.md](../Interaktions-Spezifikation.md) §11 | Verweildauer-Heuristik | §11.5 ✅ |
| [docs/Interaktions-Spezifikation.md](../Interaktions-Spezifikation.md) §12 | Eingabe-Parität und Accessibility | §12.9 ✅ |
| [docs/Assets-Spuren.md](../Assets-Spuren.md) §7 | Asset-Schnittliste (AI / Prozedural / Pixabay) | §7 ✅ |
| [docs/Technischer-Implementationsplan.md](../Technischer-Implementationsplan.md) | Risiken, DoD, Anti-Metriken konsolidiert; alter Plan abgelöst | implizit (Manifest-Verweise §3.3, §4.4, §5) ✅ |

## Konsolidierte Ampel-Bewertung (Kontrollfragen §18)

| Bereich | Ampel | Begründung |
|---------|-------|------------|
| Präsenz (§2) | 🟢 | Verweildauer-Reife zwingt nicht; Anker erscheinen schrittweise. |
| Stille (§3) | 🟢 | Ambient + FogLayer als atmende Schicht; kein UI-Lärm. |
| Resonanz (§4) | 🟢 | Reaktion auf Anwesenheit (Reife), nicht nur auf Klicks. |
| Anonymität / Würde (§5) | 🟢 | Silhouetten identitätslos; kein User-Identifier im Store. |
| Nähe und Distanz (§6) | 🟢 | Rückweg nach Vorhof als „Loslassen" statt UI-Button; Beobachten möglich. |
| Liturgische Qualität (§7) | 🟢 | Anker sind Stationen, nicht Features; Übergänge mit Eigenzeit. |
| Klage (§8) | 🟡 | Spuren ist nicht der Klageraum; Bezug erst in Phase 4. **Kein Manifest-Verstoß**, nur Hinweis auf zukünftige Phase. |
| Hoffnung (§9) | 🟢 | Resonanz-Antwort als kleines Aufleuchten, keine Versprechen. |
| Sinnhaftigkeit / Berufung (§10) | 🟢 | Spurensetzen ohne Punkte/Likes; Ausgang nach Hören ohne Auf­forderung. |
| Technik (§11) | 🟢 | Statisch hostbar, kein Login, kein Tracking, A11y in §12 spezifiziert. |
| Anti-Plattform (§12) | 🟢 | Keines der Anti-Muster (Likes, Follower, Streaks, Profile, Zähler) in den Spezifikationen. |
| Audio (§13) | 🟢 | Lautstärke + Mute (§12.4), Untertitel (§12.6), Pixabay-Auswahl meidet Wellness-Charakter. |
| Visuell (§14) | 🟢 | Silhouetten andeutend, keine Gesichter; viel Leerraum im Master-Screen. |
| Impuls (§15) | n.a. | Spuren liefert keinen Textimpuls; Hörraum erst in Phase 5. |
| Ausgangsraum (§16) | n.a. | Schwellenraum erst Phase 7. |
| Schlussfrage (§19) | 🟢 | Spuren funktioniert auch ohne Fremd-Aktivität (Simulator zeigt vergangene Spuren als Atmosphäre, nicht als Wettbewerb). |

## Befund

Alle Phase-0-Ergänzungen sind **grün** im Sinne des Ampelsystems. Eine gelbe Markierung bei Klage ist kein Defekt der Spuren-Spec, sondern nur ein Verweis darauf, dass Klage-Spezifika im Klageraum (Phase 4 / Phase 5 der Roadmap) auditiert werden müssen, sobald dort gebaut wird.

Keine Phase-0-Ergänzung muss überarbeitet oder gestrichen werden. Übergang zu Phase 1 (Asset-Produktion Spuren) ist freigegeben.

## Folgepflichten

- Phase 1.6 (Asset-Lizenz-Audit) muss vor Phase 4 (Soft-Launch) abgeschlossen sein.
- Phase 3.10 muss diesen Governance-Check für das *implementierte* Erlebnis wiederholen und Befund in `docs/TESTS/Erprobungsraum-Spuren.md` festhalten.
- Bei jeder neuen Raum-Spezifikation in Phase 5 ist ein analoger Governance-Check-Block anzulegen.
