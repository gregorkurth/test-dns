# RDTS-202: Airgapped-fähiges Container-Image

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-202 |
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

> Das Container-Image muss alle Assets (HTML, CSS, JS, Schriften, Icons) enthalten. Zur Laufzeit darf kein Zugriff auf externe Registries, CDNs oder npm-Repositories erfolgen.

## Anforderungstext (Erläuterung)

Das Image ist vollständig selbstständig. Kein `npm install`, kein CDN-Fetch, kein externer Font-Download zur Laufzeit.

---

## Kontext

Mission Networks sind oft airgapped. Jeder externe Zugriff zur Laufzeit würde die App unbenutzbar machen.

---

## Akzeptanzkriterien

1. Container startet ohne Netzwerkverbindung erfolgreich
2. Alle statischen Assets werden aus dem Container serviert
3. Keine externen URLs in generierten HTML/CSS/JS-Dateien
4. `docker run --network=none` zeigt App korrekt an

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| RDTS-201 | Voraussetzung | Multi-Stage Build muss Assets korrekt kopieren |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-RDTS-202-001](../tests/auto/TEST-RDTS-202-001.md) | Automatisch (pytest) |
| [TEST-RDTS-202-001-manual](../tests/manual/TEST-RDTS-202-001-manual.md) | Manuell |
