# Policy Exceptions Register

## Zweck

Dokumentiert alle zeitlich begrenzten Ausnahmen zu Security-Policies.
Ohne gueltige Ausnahme-ID darf kein `degraded-local`-Betrieb in `prod` aktiviert werden.

## Regeln

- Ausnahmen muessen vor Aktivierung genehmigt sein.
- Jede Ausnahme braucht Owner, Risiko, Ablaufdatum und Mitigation.
- Nach Ablaufdatum ist die Ausnahme automatisch ungueltig.
- Ausnahmen sind in CI/Admission/GitOps referenzierbar.

## Register

| Exception-ID | Scope | Betroffene Policy | Environment | Grund | Owner | Freigabe durch | Gueltig von | Gueltig bis | Mitigation/Plan | Status |
|---|---|---|---|---|---|---|---|---|---|---|
| EXC-YYYY-NNN | Namespace/Workload | Policy-ID | dev/test/prod | Kurzbeschreibung | Team/Person | Gremium | YYYY-MM-DD | YYYY-MM-DD | Rueckbau-/Fix-Plan | draft/approved/expired |

## Checkliste vor Freigabe

- [ ] Risiko und Business-Impact bewertet
- [ ] Rueckbau-/Ablaufplan hinterlegt
- [ ] OTel-Event fuer `security.posture.degraded` aktiv
- [ ] Sichtbarer Warnhinweis fuer Nutzer/Operator vorhanden
