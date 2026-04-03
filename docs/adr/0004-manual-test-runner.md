# 4. Manueller Test-Runner als Teil der Next.js-App

Datum: 2026-04-03

## Status

Akzeptiert

## Kontext

Manuelle Tests (DNS-Konfigurationsprüfungen, Interoperabilitätstests) müssen von Testern im Feld durchgeführt und rückrapportiert werden. Der bisherige Ansatz (Markdown-Datei ausdrucken/ausfüllen) ist fehleranfällig und schwer auswertbar.

## Entscheid

Wir bauen einen **Manual Test Runner** als Seite in der bestehenden Next.js-App (`/test-runner`). Die Seite:

1. Liest manuelle Testfall-Markdowns aus `capabilities/` zur Build-Zeit
2. Zeigt Testschritte als interaktive Checkliste
3. Erlaubt dem Tester, jeden Schritt als ✅/❌/⏭ zu markieren und Beobachtungen zu notieren
4. Generiert am Ende eine ausgefüllte Ergebnis-Markdown-Datei (inkl. OFT-Tag)
5. Tester lädt die Datei herunter und committet sie via Gitea/GitLab-Web-UI

## Konsequenzen

- Tester braucht keinen Terminal-Zugang
- OFT-Traceability wird durch committed Ergebnis-Dateien in `tests/results/` geschlossen
- Keine direkte API-Integration in v1 – Download + manueller Commit
