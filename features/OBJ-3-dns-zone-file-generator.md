# OBJ-3: DNS Zone File Generator

## Status: Planned
**Created:** 2026-03-17
**Last Updated:** 2026-03-17

## Dependencies
- OBJ-2 (Participant Configuration Form) – Konfigurationsdaten werden als Input verwendet

## User Stories
- Als Mission Network Operator möchte ich aus den erfassten Konfigurationsdaten (OBJ-2) mit einem Klick BIND9-konforme Zone-Files generieren, damit ich diese direkt in meinen Nameserver laden kann.
- Als Operator möchte ich sowohl Forward- als auch Reverse-Zone-Files generieren, damit ich die vollständige DNS-Delegation abdecke.
- Als Operator möchte ich die generierten Files vor dem Download in der App in einem Code-Editor vorschauen, damit ich sie überprüfen kann.
- Als Operator möchte ich, dass die generierten Zone-Files die SOA-, NS-, A- und PTR-Records korrekt enthalten (SREQ-238, SREQ-239), damit die Files sofort deploybar sind.
- Als Operator möchte ich, dass die SOA-Werte (Serial, Refresh, Retry, Expire, TTL) konfigurierbar sind, damit ich sie an meine Mission-Anforderungen anpassen kann.

## Acceptance Criteria
- [ ] Forward Zone-File wird aus Konfigurationsdaten generiert mit: SOA-Record, NS-Records (mind. 2), A-Records für alle Nameserver und Resolver, CNAME/A-Records für spezifische Hosts
- [ ] Reverse Zone-File wird für jede delegierte Reverse-Zone generiert mit: SOA-Record, NS-Records, PTR-Records
- [ ] SOA-Parameter sind konfigurierbar: Serial (auto-generiert als YYYYMMDDXX), Refresh, Retry, Expire, Minimum TTL
- [ ] Generated Output wird in einem Read-Only Code-Block mit Syntax-Highlighting angezeigt
- [ ] "Kopieren"-Button (Copy to Clipboard) ist vorhanden
- [ ] Generierung passiert vollständig im Browser (kein Server-Call)
- [ ] Zone-File-Format ist BIND9-kompatibel (RFC 1035)
- [ ] Wenn Anycast aktiviert ist, wird ein A-Record für den Anycast Root NS generiert
- [ ] Validierungsfehler aus OBJ-2 blockieren die Generierung mit klarer Fehlermeldung

## Edge Cases
- Konfiguration enthält keine Reverse-Zone → Nur Forward-Zone wird generiert, Hinweis angezeigt
- Operator ändert Konfiguration nach Generierung → Zone-File wird automatisch neu generiert (oder Warnung "Konfiguration geändert, bitte neu generieren")
- Serial-Nummer Überlauf am selben Tag (> 99 Revisions) → Hinweis mit manuellem Override-Feld
- Sonderzeichen in FQDNs → Validierung in OBJ-2 verhindert dies; Generator zeigt Fallback-Fehler
- Sehr grosse Zonen (> 100 Records) → Performance: Generierung unter 500ms

## Technical Requirements
- Pure-Client-Side-Generierung (keine Server-Side-Rendering für die Generierungslogik nötig)
- Syntax-Highlighting via `highlight.js` oder ähnliches (lokal gebundelt für Offline-Betrieb)
- Output-Format: Plain Text, kompatibel mit BIND9 named.conf zone-Direktiven

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
