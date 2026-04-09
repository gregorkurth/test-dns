# MCP DNS CRUD (AI-Agent Zugriff)

## Ziel

Dieses Dokument beschreibt einen MCP-Server, der den bestehenden DNS-REST-Endpunkt als Tools fuer AI-Agenten bereitstellt.

- Participants: CRUD
- Zone-File-Generierung

Server-Datei: `tools/mcp-dns-crud-server.mjs`

---

## Schnellstart

1. API lokal starten:

```bash
npm run dev
```

2. MCP-Server starten:

```bash
npm run mcp:dns
```

3. Base-URL konfigurieren (optional):

```bash
DNS_API_BASE_URL=http://localhost:3000/api/v1 npm run mcp:dns
```

---

## Verfuegbare MCP Tools

- `dns_list_participants`
- `dns_get_participant`
- `dns_create_participant`
- `dns_update_participant`
- `dns_delete_participant`
- `dns_generate_zone_file`

Hinweis: Die Tools nutzen die bestehenden REST-Endpunkte unter `/api/v1`.

---

## Beispiel MCP-Client-Konfiguration

```json
{
  "mcpServers": {
    "dns-crud": {
      "command": "node",
      "args": ["/ABSOLUTER/PFAD/zum/repo/tools/mcp-dns-crud-server.mjs"],
      "env": {
        "DNS_API_BASE_URL": "http://localhost:3000/api/v1",
        "DNS_API_CLIENT_ID": "mcp-dns-crud"
      }
    }
  }
}
```

Optional:
- `DNS_API_TOKEN` fuer Bearer-Auth, falls API-Schutz aktiviert wird.

---

## Security-Vorgaben fuer MCP-Betrieb

Fuer produktive Nutzung gelten die verbindlichen Regeln aus:
- `req-init/security-baseline.md`

Wichtige Punkte:
- Skill-/Tool-Whitelisting ist Pflicht.
- MCP-Workloads in isolierten Kubernetes-Namespaces betreiben.
- SIEM-Weiterleitung ueber OTel aktivieren (`siem-mode=clickhouse` in `prod`).
- Secrets standardmaessig ueber OpenBao (`secrets-mode=openbao`), lokale Variante nur als degradierter Modus mit Warnhinweis/Ausnahme.

---

## Kubernetes-Hinweis (minimal)

Wenn der MCP-Server im Cluster laeuft:

- eigener Namespace, Default-Deny NetworkPolicies
- eigener ServiceAccount mit minimalen Rechten
- keine Klartext-Secrets in Deployment-Manifests
- OPA/Gatekeeper-Policies fuer Label- und Runtime-Hardening aktivieren
