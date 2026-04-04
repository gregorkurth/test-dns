# arc42 im Repo

In diesem Ordner liegt die Architektur-Dokumentation nach arc42.

## Ziel

Dieser Ordner beschreibt die Applikation so, dass auch spaeter noch klar ist:
- warum sie existiert
- in welchem Kontext sie arbeitet
- aus welchen Bausteinen sie besteht
- wie sie zur Laufzeit funktioniert
- wie sie betrieben und released wird
- welche Risiken und offenen Punkte es gibt

## Warum arc42 hier gut passt

arc42 ist gut fuer dieses Repo, weil:
- die Kapitel klar getrennt sind
- jedes Kapitel einzeln gepflegt werden kann
- jedes Kapitel einzeln nach Confluence exportiert werden kann
- Architektur, Betrieb, Risiken und Entscheidungen zusammen sichtbar werden

## Die Kapitel

| Kapitel | Datei | Wann aktualisieren? |
|--------|-------|---------------------|
| 1. Einfuehrung und Ziele | `01-introduction-and-goals.md` | wenn sich Produktziel oder Stakeholder aendern |
| 2. Randbedingungen | `02-constraints.md` | bei neuen Rahmenbedingungen, Vorgaben, Airgap, Security, Compliance |
| 3. Kontextabgrenzung | `03-context-and-scope.md` | bei neuen Umsystemen, Schnittstellen, Rollen |
| 4. Loesungsstrategie | `04-solution-strategy.md` | wenn sich Grundansatz oder Leitentscheidungen aendern |
| 5. Bausteinsicht | `05-building-block-view.md` | bei neuen Komponenten, Services, Modulen |
| 6. Laufzeitsicht | `06-runtime-view.md` | bei neuen Ablaeufen, Requests, Jobs, Deploy-Prozessen |
| 7. Verteilungssicht | `07-deployment-view.md` | bei K8s-, GitOps-, Registry-, Zarf- oder Zielumgebungs-Aenderungen |
| 8. Querschnittliche Konzepte | `08-cross-cutting-concepts.md` | bei Security, Logging, Observability, Rollenmodell, Doku-Regeln |
| 9. Architekturentscheidungen | `09-architecture-decisions.md` | wenn neue ADRs hinzukommen |
| 10. Qualitaetsanforderungen | `10-quality-requirements.md` | bei neuen Qualitaetszielen oder Freigabe-Regeln |
| 11. Risiken und technische Schulden | `11-risks-and-technical-debt.md` | wenn Risiken erkannt oder reduziert werden |
| 12. Glossar und Arbeitsprodukte | `12-glossary-and-work-products.md` | wenn Begriffe, Artefakte oder Export-Regeln wachsen |

## Die einfache Pflege-Regel

Wenn etwas Neues entsteht, pruefe immer diese 4 Fragen:

1. Muss ein Feature angepasst werden?
2. Muss ein Requirement oder Test angepasst werden?
3. Braucht es ein ADR?
4. Muss ein arc42-Kapitel nachgezogen werden?

## Sehr einfache Daumenregel

- Neues Ziel? Kapitel 1
- Neue Vorgabe? Kapitel 2
- Neue Schnittstelle? Kapitel 3
- Neue Grundidee? Kapitel 4
- Neuer Baustein? Kapitel 5
- Neuer Ablauf? Kapitel 6
- Neue Deployment-Variante? Kapitel 7
- Neues Sicherheits- oder Betriebskonzept? Kapitel 8
- Neue Entscheidung? Kapitel 9 plus `docs/adr/`
- Neue Freigaberegel? Kapitel 10
- Neues Risiko? Kapitel 11
- Neuer Begriff oder Export-Prozess? Kapitel 12

## Export nach Confluence

Jede Datei ist absichtlich einzeln.
So kann jedes Kapitel einzeln exportiert oder per Copy-Job auf USB uebertragen werden.

Mehr dazu:
- `docs/CONFLUENCE-EXPORT-GUIDE.md`
