# Service: Argo CD Installation (SVC-GIT-ARGOCD)

> **Capability:** CAP-009 GitOps / Argo CD
> **Maturität:** L0 – Not achieved

## Beschreibung

Dieser Service stellt die deklarative Installation der App via Argo CD im App-of-Apps-Modell sicher. Alle Argo-CD-Ressourcen liegen versioniert im Repository. Fuer Zielumgebungen werden ein Release-Projekt und ein separates Konfigurationsprojekt als Git-Quellen unterstuetzt.

## Service Functions

| SFN-ID | Service Function | Beschreibung |
|--------|-----------------|-------------|
| SFN-GIT-001 | App-of-Apps-Struktur | Root-Application, AppProject, ApplicationSet definieren |
| SFN-GIT-002 | Sync Management | Synchronisationslogik und -policy konfigurieren |

## Requirements

| Req-ID | Typ | Priorität | Beschreibung |
|--------|-----|-----------|-------------|
| RDTS-901 | [ARCH] | 🟥 MUSS | Argo-CD-Ressourcen liegen deklarativ im Repository |
| RDTS-902 | [ARCH] | 🟥 MUSS | Root-Application oder AppSet als Einstiegspunkt definiert |
| RDTS-903 | [ARCH] | 🟥 MUSS | Alle Teilkomponenten als separate Applications strukturierbar |
| RDTS-904 | [ARCH] | 🟥 MUSS | Projekte, Namespaces, Quellen und Sync-Policy nachvollziehbar definiert |
| RDTS-905 | [ARCH] | 🟧 SOLLTE | Automated Sync konfigurierbar (auto-sync + self-heal optional) |
| RDTS-906 | [ARCH] | 🟥 MUSS | Argo-CD-Definitionen sind Bestandteil des Zarf-Pakets |
| RDTS-907 | [ARCH] | 🟥 MUSS | Root-App bindet Release- und Konfigurationsprojekt (Gitea) als getrennte Quellen ein |
