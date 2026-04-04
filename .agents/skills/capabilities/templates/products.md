# Products & Lizenzen – {{CAP_NAME}}

> Mapping: Service Functions → Produkte → Lizenzen
> Quellen: {{QUELLDOKUMENTE}}

---

## Produkt-Matrix

| Produkt | Version | Service Function | Lizenz | Lizenzart | Open Source | Anmerkung |
|---------|---------|-----------------|--------|-----------|-------------|-----------|
| **{{PRODUKT_NAME}}** | {{VERSION}} | {{SFN_IDS}} | {{LIZENZ}} | {{LIZENZART}} | {{OPEN_SOURCE}} | {{ANMERKUNG}} |

---

## Lizenz-Zusammenfassung

| Lizenzart | Produkte | Anforderungen |
|-----------|---------|---------------|
| **{{LIZENZART}}** | {{PRODUKTE}} | {{ANFORDERUNGEN}} |

---

## Service Function → Produkt Mapping (Detail)

### {{SFN_ID}}: {{SFN_NAME}}

| Produkt | Verwendungszweck |
|---------|-----------------|
| {{PRODUKT_NAME}} | {{VERWENDUNGSZWECK}} |

---

## Airgapped-Anforderungen

Alle Produkte müssen als Container-Images in Harbor vorliegen:

```
harbor.local/{{CAP_SLUG}}/{{IMAGE_NAME}}:{{VERSION}}
```

> **Annahme**: Das Harbor-Registry ist unter `harbor.local` erreichbar und wurde durch den Plattform-Operator befüllt.

---

*Zuletzt aktualisiert: {{DATUM}}*
