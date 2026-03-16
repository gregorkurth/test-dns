# SREQ-610: Anycast-Anfragen über dieselbe Anycast-Adresse beantworten

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-610 |
| **Typ** | Funktional / Netzwerk |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN114 – Anycast DNS Advertising |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 26 |
| **Kapitel** | 5.1.4 (TIN-114) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service shall respond the anycast queries using the same anycast address that it is listening on.

## Anforderungstext (Deutsch)

Der Domain Name Service muss Anycast-Anfragen mit derselben Anycast-Adresse beantworten, auf der er lauscht. Die Source-IP der Antwort muss die Anycast-IP-Adresse sein, an die die ursprüngliche Anfrage gerichtet war.

---

## Kontext

Wenn ein DNS-Server auf einer Anycast-Adresse lauscht, muss er sicherstellen, dass Antworten ebenfalls von dieser Anycast-Adresse ausgehen. Andernfalls würden Clients eine Antwort von einer unerwarteten IP-Adresse erhalten, was von Firewalls blockiert werden könnte. Diese Anforderung ergänzt SREQ-1317 (Nicht-Anycast) mit dem Anycast-spezifischen Verhalten.

---

## Akzeptanzkriterien

1. DNS-Antworten auf Anycast-Anfragen haben die Anycast-IP als Source-IP.
2. Das Betriebssystem ist so konfiguriert, dass Antworten über das Anycast-Interface gesendet werden.
3. Netzwerk-Capture zeigt Source-IP = Anycast-IP für Queries an die Anycast-Adresse.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-609 | Voraussetzung | Anycast muss konfigurierbar sein |
| SREQ-1317 | Verwandt | Nicht-Anycast-Antworten: Source-IP = Destination-IP |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-610-001](../tests/auto/TEST-SREQ-610-001.md) | Automatisch (pytest) |
| [TEST-SREQ-610-001-manual](../tests/manual/TEST-SREQ-610-001-manual.md) | Manuell |
