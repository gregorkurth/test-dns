# SFN-TIN26: DNS Query (Authoritative)

> **Service Function ID:** SFN-TIN26
> **Quelle:** FMN SP5 SI Domain Naming, Kapitel 5.1.1 (TIN-26), Seite 14–18
> **Service:** Authoritative Name Services (SVC-AUTH)
> **Quelle-Typ:** [NATO]

---

## Beschreibung

Ein DNS-Query ist ein Austausch zwischen einem DNS-Resolver und einem autoritativen Nameserver. Der autoritative Nameserver beantwortet die Anfrage gemäss lokal konfigurierten Daten, verweist den Resolver an einen anderen autoritativen DNS-Server einer delegierten Zone oder weist die Anfrage ab.

CHE CC-517: Zone core.ndp.che und 109.x.x.in-addr.arpa werden durch ns1.core.ndp.che und ns2.core.ndp.che bedient.

---

## Requirements

| ID | Typ | Quelle | Beschreibung | Priorität |
|----|-----|--------|-------------|-----------|
| [SREQ-234](requirements/SREQ-234.md) | [NATO] | FMN SP5, S.16 | Mission Top-Level-Domains unterstützen | MUSS |
| [SREQ-235](requirements/SREQ-235.md) | [NATO] | FMN SP5, S.16 | Country Code Top-Level-Domains unterstützen | MUSS |
| [SREQ-238](requirements/SREQ-238.md) | [NATO] | FMN SP5, S.16 | SOA-, NS- und A-Record mindestens unterstützen | MUSS |
| [SREQ-239](requirements/SREQ-239.md) | [NATO] | FMN SP5, S.16 | Reverse-Zone mit PTR-Records unterstützen | MUSS |
| [SREQ-613](requirements/SREQ-613.md) | [NATO] | FMN SP5, S.16 | Zwei unabhängige Nameserver pro delegierter Zone | MUSS |
| [SREQ-614](requirements/SREQ-614.md) | [NATO] | FMN SP5, S.16 | Delegation von Reverse-Lookup-Zonen für IPv4-Präfixe auf 8-Bit-Grenzen | MUSS |
| [SREQ-615](requirements/SREQ-615.md) | [NATO] | FMN SP5, S.17 | Keine Forwarder für Zonen anderer MNPs | MUSS |
| [SREQ-616](requirements/SREQ-616.md) | [NATO] | FMN SP5, S.16 | Keine rekursiven DNS-Queries unterstützen | MUSS |
| [SREQ-378](requirements/SREQ-378.md) | [NATO] | FMN SP5, S.16 | Eigene Zone-Datei pro signierter Zone | MUSS |
| [SREQ-379](requirements/SREQ-379.md) | [NATO] | FMN SP5, S.17 | Unsignierte Zonen delegieren können | MUSS |
| [SREQ-380](requirements/SREQ-380.md) | [NATO] | FMN SP5, S.16 | Signierung von Subdomains delegieren können | MUSS |
| [SREQ-382](requirements/SREQ-382.md) | [NATO] | FMN SP5, S.17 | Signierte Zonen bedienen können | MUSS |
| [SREQ-611](requirements/SREQ-611.md) | [NATO] | FMN SP5, S.17 | Konfigurierte Unicast-IP bei Anfragen an andere Server verwenden | MUSS |
| [SREQ-1311](requirements/SREQ-1311.md) | [NATO] | FMN SP5, S.17 | Glue-IP-Adressen müssen mit autoritativen A-Records übereinstimmen | MUSS |
| [SREQ-1312](requirements/SREQ-1312.md) | [NATO] | FMN SP5, S.17 | NS-Records müssen mit Delegation im Parent übereinstimmen | MUSS |
| [SREQ-1313](requirements/SREQ-1313.md) | [NATO] | FMN SP5, S.17 | Daten der autoritativen Nameserver müssen konsistent sein | MUSS |
| [SREQ-1314](requirements/SREQ-1314.md) | [NATO] | FMN SP5, S.17 | Alle autoritativen NS müssen gleichen NS-Record-Set liefern | MUSS |
| [SREQ-1315](requirements/SREQ-1315.md) | [NATO] | FMN SP5, S.17 | Alle autoritativen NS müssen gleichen SOA-Record liefern | MUSS |
| [SREQ-1316](requirements/SREQ-1316.md) | [NATO] | FMN SP5, S.17 | DNS-Antwort-Payload darf 512 Oktett nicht überschreiten (Referral) | MUSS |
| [SREQ-1317](requirements/SREQ-1317.md) | [NATO] | FMN SP5, S.17 | Nicht-Anycast-Antworten: Source-IP = Destination-IP der initialen Anfrage | MUSS |
| [SREQ-1318](requirements/SREQ-1318.md) | [NATO] | FMN SP5, S.17 | Trust Anchors müssen als vollständige DS-Records bereitgestellt werden | MUSS |
| [SREQ-1319](requirements/SREQ-1319.md) | [NATO] | FMN SP5, S.17 | DNSKEY in Child-Zone muss zu jedem DS-Record passen | MUSS |
| [SREQ-1320](requirements/SREQ-1320.md) | [NATO] | FMN SP5, S.17 | Validierung der Zone muss mit bereitgestelltem DS-Record-Set möglich sein | MUSS |
| [CREQ-001](requirements/CREQ-001.md) | [CUST] | CHE Config Form | Delegierte Zone: core.ndp.che | MUSS |
| [CREQ-002](requirements/CREQ-002.md) | [CUST] | CHE Config Form | Nameserver: ns1.core.ndp.che, ns2.core.ndp.che | MUSS |
| [CREQ-003](requirements/CREQ-003.md) | [CUST] | CHE Config Form | Resolver: rs1.core.ndp.che, rs2.core.ndp.che | MUSS |

---

## Tests

| Testfall | Typ | Requirement |
|----------|-----|-------------|
| [TEST-SREQ-234-001](tests/auto/TEST-SREQ-234-001.md) | Automatisch (pytest) | SREQ-234 |
| [TEST-SREQ-234-001-manual](tests/manual/TEST-SREQ-234-001-manual.md) | Manuell | SREQ-234 |
| [TEST-SREQ-235-001](tests/auto/TEST-SREQ-235-001.md) | Automatisch (pytest) | SREQ-235 |
| [TEST-SREQ-235-001-manual](tests/manual/TEST-SREQ-235-001-manual.md) | Manuell | SREQ-235 |
| [TEST-SREQ-238-001](tests/auto/TEST-SREQ-238-001.md) | Automatisch (pytest) | SREQ-238 |
| [TEST-SREQ-238-001-manual](tests/manual/TEST-SREQ-238-001-manual.md) | Manuell | SREQ-238 |
| [TEST-SREQ-239-001](tests/auto/TEST-SREQ-239-001.md) | Automatisch (pytest) | SREQ-239 |
| [TEST-SREQ-239-001-manual](tests/manual/TEST-SREQ-239-001-manual.md) | Manuell | SREQ-239 |
| [TEST-SREQ-378-001](tests/auto/TEST-SREQ-378-001.md) | Automatisch (pytest) | SREQ-378 |
| [TEST-SREQ-378-001-manual](tests/manual/TEST-SREQ-378-001-manual.md) | Manuell | SREQ-378 |
| [TEST-SREQ-379-001](tests/auto/TEST-SREQ-379-001.md) | Automatisch (pytest) | SREQ-379 |
| [TEST-SREQ-379-001-manual](tests/manual/TEST-SREQ-379-001-manual.md) | Manuell | SREQ-379 |
| [TEST-SREQ-380-001](tests/auto/TEST-SREQ-380-001.md) | Automatisch (pytest) | SREQ-380 |
| [TEST-SREQ-380-001-manual](tests/manual/TEST-SREQ-380-001-manual.md) | Manuell | SREQ-380 |
| [TEST-SREQ-382-001](tests/auto/TEST-SREQ-382-001.md) | Automatisch (pytest) | SREQ-382 |
| [TEST-SREQ-382-001-manual](tests/manual/TEST-SREQ-382-001-manual.md) | Manuell | SREQ-382 |
| [TEST-SREQ-611-001](tests/auto/TEST-SREQ-611-001.md) | Automatisch (pytest) | SREQ-611 |
| [TEST-SREQ-611-001-manual](tests/manual/TEST-SREQ-611-001-manual.md) | Manuell | SREQ-611 |
| [TEST-SREQ-613-001](tests/auto/TEST-SREQ-613-001.md) | Automatisch (pytest) | SREQ-613 |
| [TEST-SREQ-613-001-manual](tests/manual/TEST-SREQ-613-001-manual.md) | Manuell | SREQ-613 |
| [TEST-SREQ-614-001](tests/auto/TEST-SREQ-614-001.md) | Automatisch (pytest) | SREQ-614 |
| [TEST-SREQ-614-001-manual](tests/manual/TEST-SREQ-614-001-manual.md) | Manuell | SREQ-614 |
| [TEST-SREQ-615-001](tests/auto/TEST-SREQ-615-001.md) | Automatisch (pytest) | SREQ-615 |
| [TEST-SREQ-615-001-manual](tests/manual/TEST-SREQ-615-001-manual.md) | Manuell | SREQ-615 |
| [TEST-SREQ-616-001](tests/auto/TEST-SREQ-616-001.md) | Automatisch (pytest) | SREQ-616 |
| [TEST-SREQ-616-001-manual](tests/manual/TEST-SREQ-616-001-manual.md) | Manuell | SREQ-616 |
| [TEST-SREQ-1311-001](tests/auto/TEST-SREQ-1311-001.md) | Automatisch (pytest) | SREQ-1311 |
| [TEST-SREQ-1311-001-manual](tests/manual/TEST-SREQ-1311-001-manual.md) | Manuell | SREQ-1311 |
| [TEST-SREQ-1312-001](tests/auto/TEST-SREQ-1312-001.md) | Automatisch (pytest) | SREQ-1312 |
| [TEST-SREQ-1312-001-manual](tests/manual/TEST-SREQ-1312-001-manual.md) | Manuell | SREQ-1312 |
| [TEST-SREQ-1313-001](tests/auto/TEST-SREQ-1313-001.md) | Automatisch (pytest) | SREQ-1313 |
| [TEST-SREQ-1313-001-manual](tests/manual/TEST-SREQ-1313-001-manual.md) | Manuell | SREQ-1313 |
| [TEST-SREQ-1314-001](tests/auto/TEST-SREQ-1314-001.md) | Automatisch (pytest) | SREQ-1314 |
| [TEST-SREQ-1314-001-manual](tests/manual/TEST-SREQ-1314-001-manual.md) | Manuell | SREQ-1314 |
| [TEST-SREQ-1315-001](tests/auto/TEST-SREQ-1315-001.md) | Automatisch (pytest) | SREQ-1315 |
| [TEST-SREQ-1315-001-manual](tests/manual/TEST-SREQ-1315-001-manual.md) | Manuell | SREQ-1315 |
| [TEST-SREQ-1316-001](tests/auto/TEST-SREQ-1316-001.md) | Automatisch (pytest) | SREQ-1316 |
| [TEST-SREQ-1316-001-manual](tests/manual/TEST-SREQ-1316-001-manual.md) | Manuell | SREQ-1316 |
| [TEST-SREQ-1317-001](tests/auto/TEST-SREQ-1317-001.md) | Automatisch (pytest) | SREQ-1317 |
| [TEST-SREQ-1317-001-manual](tests/manual/TEST-SREQ-1317-001-manual.md) | Manuell | SREQ-1317 |
| [TEST-SREQ-1318-001](tests/auto/TEST-SREQ-1318-001.md) | Automatisch (pytest) | SREQ-1318 |
| [TEST-SREQ-1318-001-manual](tests/manual/TEST-SREQ-1318-001-manual.md) | Manuell | SREQ-1318 |
| [TEST-SREQ-1319-001](tests/auto/TEST-SREQ-1319-001.md) | Automatisch (pytest) | SREQ-1319 |
| [TEST-SREQ-1319-001-manual](tests/manual/TEST-SREQ-1319-001-manual.md) | Manuell | SREQ-1319 |
| [TEST-SREQ-1320-001](tests/auto/TEST-SREQ-1320-001.md) | Automatisch (pytest) | SREQ-1320 |
| [TEST-SREQ-1320-001-manual](tests/manual/TEST-SREQ-1320-001-manual.md) | Manuell | SREQ-1320 |
| [TEST-CREQ-001-001](tests/auto/TEST-CREQ-001-001.md) | Automatisch (pytest) | CREQ-001 |
| [TEST-CREQ-001-001-manual](tests/manual/TEST-CREQ-001-001-manual.md) | Manuell | CREQ-001 |
| [TEST-CREQ-002-001](tests/auto/TEST-CREQ-002-001.md) | Automatisch (pytest) | CREQ-002 |
| [TEST-CREQ-002-001-manual](tests/manual/TEST-CREQ-002-001-manual.md) | Manuell | CREQ-002 |
| [TEST-CREQ-003-001](tests/auto/TEST-CREQ-003-001.md) | Automatisch (pytest) | CREQ-003 |
| [TEST-CREQ-003-001-manual](tests/manual/TEST-CREQ-003-001-manual.md) | Manuell | CREQ-003 |

---

## Abhängigkeiten

| Von | Nach | Typ |
|-----|------|-----|
| SFN-TIN26 | SFN-TIN370 | Voraussetzung |
| SFN-TIN26 | IDP-191 Communications | Voraussetzung |
| SFN-TIN26 | IDP-194 Distributed Time | Voraussetzung (wenn DNSSEC) |
