# RDTS-201: Multi-Stage Dockerfile

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-201 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-001 – Container Packaging |
| **Quelldokument** | App-Template-Anweisung |
| **Seite** | – |
| **Kapitel** | 2. Kubernetes als Zielplattform |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Die Applikation muss als Container-Image mit einem Multi-Stage Dockerfile gebaut werden, um eine optimale Imagegrösse zu erreichen (Build-Stage und Runtime-Stage getrennt).

## Anforderungstext (Erläuterung)

Das Dockerfile trennt Build-Abhängigkeiten (Node.js, npm) von der Laufzeitumgebung. Das finale Image enthält nur die kompilierte Next.js-App und den Node.js-Runtime.

---

## Kontext

Airgapped-Umgebungen erfordern kleine, vollständige Images. Multi-Stage Builds reduzieren die Imagegrösse und verhindern Build-Tool-Leaks in Produktion.

---

## Akzeptanzkriterien

1. Dockerfile enthält mindestens zwei Stages (builder, runtime)
2. Finales Image enthält keine Build-Tools (npm, node-gyp etc.)
3. Image-Grösse < 500 MB
4. `docker build` läuft ohne Netzwerkzugriff erfolgreich (nach initialem Layer-Cache)

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| OBJ-7 | Feature | Kubernetes Deployment Feature-Spec |
| RDTS-202 | Requirement | Airgapped-Image baut auf Multi-Stage auf |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-201-001](../tests/auto/TEST-RDTS-201-001.md) | Automatisch (pytest) |
| [TEST-RDTS-201-001-manual](../tests/manual/TEST-RDTS-201-001-manual.md) | Manuell |
