# Definition of Done: Feature

Diese Checkliste ist kurz, verbindlich und fuer alle Rollen lesbar.

Ein Feature gilt erst als abgeschlossen, wenn alle Punkte geprueft sind.

## Definition-of-Done Check

- [ ] Feature ist fachlich fertig und in `features/OBJ-*.md` aktualisiert
- [ ] Feature-Status in `features/INDEX.md` nachgezogen
- [ ] Requirements sind vorhanden oder aktualisiert (`capabilities/**/requirements/`)
- [ ] Testfaelle sind vorhanden oder aktualisiert (`capabilities/**/tests/auto|manual/`)
- [ ] Testnachweise sind erfasst (auto oder manual) und nachvollziehbar
- [ ] QA-Nachweis ist im Feature dokumentiert (`QA Test Results`)
- [ ] ADR geprueft: Entscheidung noetig?
- [ ] Wenn ADR noetig: ADR erstellt oder aktualisiert (`docs/adr/`)
- [ ] arc42 geprueft: betroffene Kapitel identifiziert
- [ ] Betroffene arc42-Kapitel nachgezogen (`docs/arc42/`)
- [ ] Benutzerhandbuch geprueft und falls betroffen nachgezogen (`docs/user-manual/`)
- [ ] Betriebs-/Technikdoku geprueft und falls betroffen nachgezogen (`docs/operations.md`, `docs/architecture.md`, `docs/release-process.md`)
- [ ] QA hat Dokumentationsqualitaet mitgeprueft (vollstaendige Links, konsistente Begriffe, nachvollziehbare Ergebnisse)
- [ ] Falls Release betroffen: Version folgt `YYYY.MM.N` und ist in Release-Doku konsistent gepflegt
- [ ] Confluence-Export durchgefuehrt (falls gefordert)
- [ ] Export im zentralen Log dokumentiert (`docs/exports/EXPORT-LOG.md`)

## Regel fuer Confluence

Confluence ist nie die Primaerquelle.
Primaerquelle ist immer Git.

Reihenfolge:
1. Im Repo dokumentieren
2. Freigeben
3. Exportieren
4. Export-Log ausfuellen
