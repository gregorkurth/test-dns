# RDTS-203: Image-Export für Offline-Transfer

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-203 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟧 SOLLTE (SHOULD) |
| **Service Function** | SFN-K8S-001 – Container Packaging |
| **Quelldokument** | App-Template-Anweisung |
| **Seite** | – |
| **Kapitel** | 2. Kubernetes als Zielplattform |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Das Container-Image soll als tar-Archiv exportierbar sein, damit es in airgapped Umgebungen ohne Registry-Zugriff geladen werden kann (z. B. via `docker save` / `docker load` oder `kind load`).

## Anforderungstext (Erläuterung)

Für Umgebungen ohne Harbor/Registry wird ein Mechanismus bereitgestellt, um das Image als Datei zu transferieren.

---

## Kontext

Nicht jede airgapped Umgebung verfügt über eine interne Container-Registry. Der tar-Export ermöglicht den Transfer via USB/DVD.

---

## Akzeptanzkriterien

1. `docker save` erzeugt ein funktionales tar-Archiv
2. `docker load` / `kind load docker-image` lädt das Archiv erfolgreich
3. Prozess ist dokumentiert (README oder ops-Doku)

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| RDTS-201 | Voraussetzung | Image muss gebaut sein |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-203-001](../tests/auto/TEST-RDTS-203-001.md) | Automatisch (pytest) |
| [TEST-RDTS-203-001-manual](../tests/manual/TEST-RDTS-203-001-manual.md) | Manuell |
