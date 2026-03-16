# SREQ-615: Keine Forwarder für Zonen anderer MNPs

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | SREQ-615 |
| **Typ** | Sicherheit / Interoperabilität |
| **Quelle** | [NATO] |
| **Priorität** | MUSS (SHALL) |
| **Service Function** | SFN-TIN26 – DNS Query (Authoritative) |
| **Quelldokument** | FMN Spiral 5 Service Instructions for Domain Naming, 23 November 2023 |
| **Seite** | 17 |
| **Kapitel** | 5.1.1 (TIN-26) |
| **Status** | Offen |

---

## Anforderungstext (Original)

> The Domain Name Service shall operate without using forwarders for zones hosted by other MNPs.

## Anforderungstext (Deutsch)

Der Domain Name Service muss ohne Forwarder für Zonen betrieben werden, die von anderen MNPs gehostet werden. Die Auflösung muss iterativ über die Root-Zone erfolgen, nicht durch Weiterleitungen an bekannte Nameserver anderer Teilnehmer.

---

## Kontext

Die Verwendung von Forwardern schafft Abhängigkeiten und Single Points of Failure. Im FMN-Kontext muss jeder MNP in der Lage sein, DNS-Auflösung vollständig autonom über die gemeinsame Root-Zone durchzuführen. Forwarder für externe Zonen sind verboten, da sie die Robustheit des föderativen DNS-Designs untergraben.

---

## Akzeptanzkriterien

1. In der BIND9/Unbound-Konfiguration sind keine Forwarder für Zonen anderer MNPs konfiguriert.
2. DNS-Queries für andere MNP-Zonen werden iterativ über Root-Server aufgelöst.
3. Die BIND9-Konfiguration enthält keine `forwarders`-Direktive für MNP-spezifische Zonen.

---

## Abhängigkeiten

| Abhängigkeit | Typ | Beschreibung |
|-------------|-----|-------------|
| SREQ-617 | Voraussetzung | Root-Zone muss lokal gehostet sein für iterative Auflösung |
| SFN-TIN370 | Voraussetzung | Root-Zone-Hosting ermöglicht iterative Auflösung ohne Forwarder |

---

## Tests

| Testfall | Typ |
|----------|-----|
| [TEST-SREQ-615-001](../tests/auto/TEST-SREQ-615-001.md) | Automatisch (pytest) |
| [TEST-SREQ-615-001-manual](../tests/manual/TEST-SREQ-615-001-manual.md) | Manuell |
