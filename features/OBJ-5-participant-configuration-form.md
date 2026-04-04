# OBJ-5: Participant Configuration Form

## Status: Planned
**Created:** 2026-03-17
**Last Updated:** 2026-03-17

## Dependencies
- OBJ-4 (Capabilities Dashboard) – Requirements-IDs werden zur Validierungsreferenz verwendet

## User Stories
- Als Mission Network Operator möchte ich Teilnehmer-Konfigurationsdaten (Participant Details, delegierte Zonen, Nameserver, Resolver, Anycast) in einem strukturierten Formular erfassen, damit ich alle notwendigen DNS-Parameter an einem Ort habe.
- Als Operator möchte ich, dass das Formular die Struktur des FMN Configuration Form (Felder 1–3) widerspiegelt, damit die Dateneingabe vertraut ist.
- Als Operator möchte ich, dass Pflichtfelder validiert werden, damit keine unvollständigen oder fehlerhaften Konfigurationen entstehen.
- Als Operator möchte ich mehrere Nameserver und Resolver pro Teilnehmer erfassen können, damit ich den FMN-Mindeststandard (2 NS) einhalten kann.
- Als Operator möchte ich eine ausgefüllte Konfiguration speichern und wieder laden können (Browser LocalStorage), damit ich nicht bei jedem Seitenaufruf neu beginnen muss.

## Acceptance Criteria
- [ ] Formular enthält alle Felder des FMN DNS Configuration Form: Participant Name, CC-Number, PoC, Delegated Zones (forward + reverse), Nameserver (IP + FQDN), Resolvers, Anycast (ja/nein, IP, FQDN)
- [ ] Mindestens 2 Nameserver-Einträge können erfasst werden (dynamisch hinzufügbar/entfernbar)
- [ ] Mindestens 2 Resolver-Einträge können erfasst werden
- [ ] Pflichtfeld-Validierung: Participant Name, CC-Number, min. 1 Delegated Zone, min. 2 NS mit FQDN und IP
- [ ] FQDN-Format wird validiert (z.B. `ns1.core.ndp.che`)
- [ ] IP-Adress-Format wird validiert (IPv4)
- [ ] Formular-Daten werden in Browser-LocalStorage gespeichert (persistiert bei Seitenreload)
- [ ] "Konfiguration zurücksetzen"-Button leert das Formular und LocalStorage
- [ ] Visuelles Feedback bei Validierungsfehlern (Inline-Fehlermeldungen)
- [ ] FMN Spiral-Version auswählbar (SP4 / SP5)

## Edge Cases
- Operator gibt ungültige IP-Adresse ein → Inline-Fehler mit Beispiel-Format
- Operator löscht einen von genau 2 NS → Warnung "Mindestens 2 Nameserver erforderlich (SREQ-613)"
- Operator aktiviert Anycast ohne IP-Adresse → Fehler "Unicast-IP für Anycast-Server erforderlich"
- Browser hat LocalStorage deaktiviert → Hinweis "Speicherung nicht möglich, Daten gehen beim Reload verloren"
- Delegierte Zone enthält Grossbuchstaben → Automatisch zu Kleinbuchstaben konvertieren
- Reverse-Zone: Operator gibt IPv4-Adresse ein statt arpa-Notation → Konvertierungshinweis oder Auto-Konvertierung

## Technical Requirements
- Formular-State mit React Hook Form + Zod-Validierung
- Persistenz via Browser LocalStorage (kein Backend)
- Offline-fähig (keine externe Validierungs-API)

---
<!-- Sections below are added by subsequent skills -->

## Tech Design (Solution Architect)
_To be added by /architecture_

## QA Test Results
_To be added by /qa_

## Deployment
_To be added by /deploy_
