# Incident Response Leitfaden

## Ziel

Standardisiertes Vorgehen fuer Security-Incidents im Service-Betrieb.

## Schweregrade

| Severity | Beschreibung | Reaktion |
|---|---|---|
| critical | Aktiver Angriff oder Datenabfluss wahrscheinlich | Sofortalarm, Incident-Bridge, Containment |
| high | Sicherheitsverletzung mit hohem Risiko | Reaktion innerhalb SLA, schnelle Eindämmung |
| medium | Auffaelligkeit mit begrenztem Impact | Analyse und Ticket innerhalb SLA |
| low | Geringes Risiko, Beobachtung erforderlich | Backlog/Monitoring |

## Ablauf

1. Erkennen: Alert aus OTel/SIEM/Hubble/Tetragon empfangen.
2. Klassifizieren: Severity und betroffene Assets bestimmen.
3. Eindämmen: Netzwerkpfade sperren, Tokens rotieren, Pods isolieren.
4. Beheben: Root Cause beheben, Policies/Code korrigieren.
5. Wiederherstellen: Betrieb kontrolliert freigeben.
6. Nachbereiten: Post-Incident-Review, Dokumentation und Lessons Learned.

## Mindestdaten fuer Forensik

- Zeitstempel (UTC)
- Namespace, Workload, Pod
- Image-Digest und Release-Version
- Policy-ID / Alert-ID
- Betroffener Flow (Quelle, Ziel, Port, Protokoll)
- Actor/Identitaet (ServiceAccount, Agent-ID, Skill-ID)

## Nachweisartefakte

- Ticket/Incident-ID
- Log- und Event-Auszuege
- Mitigation- und Recovery-Nachweise
- Referenzierte Policy-/Code-Aenderungen (Commit/PR)
