# Betrieb

Dieser Teil ist fuer Operator und Plattform-Betrieb gedacht.

## Was du hier erwarten kannst

- Start und Stop
- Update und Release-Import
- Backup und Wiederherstellung
- Fehlerbilder und erste Checks
- OTel-Betriebsmodi

## Alltagsschritte

1. App starten oder neu starten.
2. Status und Erreichbarkeit pruefen.
3. Bei Release-Wechseln die neue Version importieren.
4. Nach dem Import einen Smoke-Test ausfuehren.
5. Wichtige Aenderungen im Export-Log oder im Betriebsprotokoll festhalten.

## OTel-Modi

- `local`
  - fuer Entwicklungs-, Test- und Offline-Phasen
  - Telemetrie wird lokal gepuffert
  - bei Zielausfall bleiben Daten spaeter nachlieferbar
- `clickhouse`
  - fuer den produktiven Zielbetrieb
  - Telemetrie wird zentral gespeichert und ausgewertet

## Backup

- Repository sichern
- lokale Daten sichern, falls sie verwendet werden
- Release-Artefakte und Doku-Exporte mitfuehren

## Typische Probleme

- App antwortet nicht: Konfiguration und Prozess pruefen
- OTel ist leer: Zielmodus und Netzweg pruefen
- Import schlug fehl: Release-Projekt, Konfigurationsprojekt und Argo CD pruefen

## Weiter lesen

- [Betriebsdokumentation](../operations.md)
- [Offline-Installation](../offline-install.md)
- [Argo CD](../argocd.md)
