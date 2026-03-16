# SREQ-615: Keine Forwarder für Zonen anderer MNPs (Resolver)

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-615 |
| **Typ** | Sicherheit / Interoperabilität |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-RESOLV-QUERY – Recursive DNS Resolution |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 17 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service shall operate without using forwarders for zones hosted by other MNPs.

## Anforderungstext (Deutsch)

Der rekursive Resolver muss ohne Forwarder für Zonen betrieben werden, die von anderen MNPs gehostet werden. Die Auflösung erfolgt iterativ über die Root-Zone, ohne Anfragen an bekannte Nameserver anderer MNPs weiterzuleiten.

---

## Kontext

Auch der rekursive Resolver (Unbound) darf keine Forwarder-Konfiguration für MNP-spezifische Zonen aufweisen. Die Verwendung von Forwardern schafft Abhängigkeiten und kann im Ausfall eines MNP zu DNS-Ausfällen führen. Iterative Auflösung via Root-Zone ist resilienter.

---

## Akzeptanzkriterien

1. Die Unbound-Konfiguration enthält keine `forward-zone`-Direktiven für Zonen anderer MNPs.
2. DNS-Auflösung für MNP-Zonen erfolgt iterativ über Root-Server.
3. Der Resolver funktioniert autonom ohne Verbindung zu MNP-Forwardern.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SFN-TIN370 | Voraussetzung | Root-Zone muss lokal verfügbar sein für iterative Auflösung |
| SREQ-617 | Voraussetzung | Lokale Root-Zone für eigene Resolver |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-615-001](../tests/auto/TEST-SREQ-615-001.md) | Automatisch (pytest) |
| [TEST-SREQ-615-001-manual](../tests/manual/TEST-SREQ-615-001-manual.md) | Manuell |
