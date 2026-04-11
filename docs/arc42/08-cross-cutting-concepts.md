# arc42 Kapitel 8: Querschnittliche Konzepte

## Zweck

Hier sammeln wir Regeln, die fast ueberall gelten.

## Was hier hinein gehoert

- Dokumentationsregeln
- Dokumentations-Gate in der Definition of Done
- Teststrategie
- Security
- Rollenmodell
- Logging und Monitoring
- Traceability
- Release- und Change-Management

## Helm-Standards (OBJ-25)

- Chart-Werte muessen schema-validiert sein (`values.schema.json`).
- Widerspruechliche Werte werden frueh im Template-Validierungsblock gestoppt (`templates/validation.yaml`).
- Security Defaults sind im Basisprofil verpflichtend:
- `runAsNonRoot`
- `readOnlyRootFilesystem`
- `allowPrivilegeEscalation: false`
- Profiletrennung lokal/internal/prod ist verbindlich, um Fehlverwendung in Produktion zu reduzieren.
- OCI Push Readiness ist Teil des Release-Prozesses:
- Erst bei erfolgreichem Lint/Template + chart push gilt der Schritt als abgeschlossen.
- Management-Transparenz fuer Betreiber ist Pflicht:
- Chart-Dateien, Offline-Checks und Release-Status muessen in API/UI sichtbar sein.

## Wann pflegen?

- wenn neue teamweite Regeln entstehen
- wenn Security oder Testkonzept angepasst wird
- wenn Dokumentationspflichten wachsen
- wenn neue Build-/Deployment-Standards (z. B. Helm) verbindlich werden

## Quelle im Repo

- `docs/DOCUMENTATION-GUIDE.md`
- `docs/DEFINITION-OF-DONE-FEATURE.md`
- `docs/QUICK-GUIDE-FEATURE-UND-REQUIREMENT.md`
- `features/OBJ-25-helm-charts.md`
- `features/OBJ-11-monitoring-observability.md`
- `features/OBJ-12-security-authentifizierung.md`
- `features/OBJ-17-sbom-security-scanning.md`
