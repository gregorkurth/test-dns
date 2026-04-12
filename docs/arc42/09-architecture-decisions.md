# arc42 Kapitel 9: Architekturentscheidungen

## 9.1 Ziel

Dieses Kapitel ist der Wegweiser zu allen relevanten Architekturentscheidungen.
Die Entscheidungstexte liegen in ADR-Dateien, dieses Kapitel ordnet und bewertet sie.

## 9.2 Aktuelle ADR-Uebersicht

| ADR | Thema | Status | Hauptauswirkung |
|---|---|---|---|
| ADR-0001 | OpenFastTrace fuer Traceability | Akzeptiert | durchgaengige Requirement-/Test-Verknuepfung |
| ADR-0002 | Airgapped Deployment ohne externe Abhaengigkeiten | Akzeptiert | Offline-First als Architekturvorgabe |
| ADR-0003 | GitHub als Git-Plattform (historischer Stand) | Akzeptiert | SCM-Entscheidung mit Prozessfolgen |
| ADR-0004 | Manual Test Runner in Next.js | Akzeptiert | Testprozesse in Produktoberflaeche integriert |
| ADR-0005 | Next.js Static Generation fuer Capability-Daten | Akzeptiert | bessere Lesesicht und Offline-Verhalten |

Hinweis:

- Die aktuelle operative Vorgabe (GitLab primar, Gitea Zielumgebung) wird in
  Anforderungen/Prozessdoku gefuehrt. Falls diese die ADR-Lage aendert, ist ein
  neues ADR oder eine ADR-Aktualisierung verpflichtend.

## 9.3 Entscheidungsprozess (verbindlich)

Ein ADR ist verpflichtend, wenn mindestens ein Kriterium zutrifft:

- neue Technologie als verbindlicher Standard
- Aenderung sicherheitsrelevanter Grundmechanismen
- Aenderung am Lieferpfad (Build/Release/Deploy/Offline)
- Aenderung, die mehrere Teams/Objekte betrifft
- Aenderung mit langfristigen Betriebsfolgen oder Vendor-Lock-In-Risiko

## 9.4 ADR-Mindestinhalt

Jedes ADR muss enthalten:

- eindeutige ADR-ID und Titel
- Status (Proposed/Accepted/Deprecated/Superseded)
- Entscheidungsdatum
- Kontext und Alternativen
- Konsequenzen (positiv/negativ)
- Entscheider bzw. Gremiumname (Pflichtfeld)
- Referenzen auf betroffene Features/Requirements

## 9.5 Beziehung zu anderen Artefakten

| Artefakt | Beziehung zu ADR |
|---|---|
| `features/OBJ-*.md` | ADR-Referenzen bei strategischen Designentscheiden |
| `docs/arc42/*.md` | Kapitel 4/5/7/8 spiegeln accepted ADRs |
| `docs/DEFINITION-OF-DONE-FEATURE.md` | ADR-Pruefung als DoD-Baustein |
| `docs/exports/EXPORT-LOG.md` | Export-/Kommunikationsnachvollzug fuer Entscheidungen |

## 9.6 Pflege-Regeln

1. Neues ADR angenommen: sofort in `docs/adr/INDEX.md` eintragen.
2. Bei Superseding: alte und neue ADR-Datei gegenseitig referenzieren.
3. arc42 Kapitel 4, 5, 7, 8 auf Auswirkungen pruefen und nachziehen.
4. Release Notes aktualisieren, falls Entscheidung auslieferungsrelevant ist.

## 9.7 Verbindliche Quellen

- `docs/adr/INDEX.md`
- `docs/adr/`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
