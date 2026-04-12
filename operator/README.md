# OBJ-13 Operator Skeleton

Dieses Verzeichnis enthaelt das echte Grundgeruest fuer den Kubernetes Operator aus OBJ-13.
Fuer OBJ-26 enthaelt es zusaetzlich den Read-Stand des dedizierten Scheduled Test Operators.

## Was bereits vorhanden ist
- Go-Modul mit `controller-runtime`-Struktur
- `DNSConfiguration` API-Typen inklusive Statusfeldern
- Reconcile-Skeleton mit Idempotenzpruefung, Fehlerpfad und Finalizer-Ansatz
- Beispiel-CR sowie lokale Beispielartefakte fuer Status und Change-History
- Beispielartefakte fuer Scheduled Test Runs (`test-operator-state.json`, `test-run-history.json`)

## Was bewusst noch Skeleton ist
- Kein kompiliertes Binary-Nachweis in diesem Repo-Lauf, weil lokal kein `go` verfuegbar war
- Kein echter Git-Fetch gegen das Baseline-Repository
- Kein produktiver Sync gegen die OBJ-3-App-API
- Kein dauerhafter Audit-Store ausser den Beispielartefakten

## Sicherheitsleitplanken
- MCP bleibt optional und darf nur ueber CRD + Reconcile wirken
- Schreibzugriffe duerfen keine direkte Umgehung der Governance etablieren
- Baseline-Quelle bleibt ein separates Git/Gitea-Repository
