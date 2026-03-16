# Products & Lizenzen – Domain Naming

> Mapping: Service Functions → Produkte → Lizenzen
> Quellen: FMN SP5 SI Domain Naming, Platform Architecture Delivery Model, CHE CC-517 Config Form

---

## Produkt-Matrix

| Produkt | Version | Service Function | Lizenz | Lizenzart | Open Source | Anmerkung |
|---------|---------|-----------------|--------|-----------|-------------|-----------|
| **BIND9** | 9.18.x | SFN-TIN26, SFN-TIN370, SFN-TIN43, SFN-TIN114 | Mozilla Public License 2.0 | Open Source | Ja | Standard DNS-Server, ISC |
| **Unbound** | 1.19.x | SFN-RESOLV-QUERY, SFN-RESOLV-DNSSEC | BSD 3-Clause | Open Source | Ja | Validierender Resolver |
| **Bird2** | 2.0.x | SFN-TIN114 | GNU GPL v2 | Open Source | Ja | BGP-Daemon für Anycast-Routing |

---

## Lizenz-Zusammenfassung

| Lizenzart | Produkte | Anforderungen |
|-----------|---------|---------------|
| **Open Source** | BIND9, Unbound, Bird2 | Keine Lizenzgebühren, Sourcecode muss verfügbar sein |
| **GNU GPL v2** | Bird2 | Abgeleitete Werke müssen ebenfalls unter GPL stehen |

---

## Service Function → Produkt Mapping (Detail)

### SFN-TIN26: DNS Query (Authoritative)

| Produkt | Verwendungszweck |
|---------|-----------------|
| BIND9 | Autoritativer DNS-Server, Zonen-Hosting, Delegation |

### SFN-TIN370: DNS Root Zone Hosting

| Produkt | Verwendungszweck |
|---------|-----------------|
| BIND9 | Root-Zone-Signierung und -Hosting |

### SFN-TIN43: DNS Zone Transfer

| Produkt | Verwendungszweck |
|---------|-----------------|
| BIND9 | AXFR/IXFR Zone Transfers mit TSIG-Authentifizierung |

### SFN-TIN114: Anycast DNS Advertising

| Produkt | Verwendungszweck |
|---------|-----------------|
| BIND9 | Anycast-fähiger Nameserver |
| Bird2 | BGP-Routing-Daemon für Anycast-Adressankündigung |

### SFN-RESOLV-QUERY: Recursive DNS Resolution

| Produkt | Verwendungszweck |
|---------|-----------------|
| Unbound | Rekursiver Resolver mit DNSSEC-Validierung |

### SFN-RESOLV-DNSSEC: DNSSEC Validation

| Produkt | Verwendungszweck |
|---------|-----------------|
| Unbound | DNSSEC-Validierung, Trust Anchor Management |

### SFN-DNS-LOGGING: DNS Security & Event Logging

| Produkt | Verwendungszweck |
|---------|-----------------|
| BIND9 | DNS Query Logging, Zone Transfer Logging |
| Unbound | Resolver Event Logging |

---

## Airgapped-Anforderungen

Alle Produkte müssen als Container-Images in Harbor vorliegen:

```
harbor.local/domain-naming/bind9:9.18.x
harbor.local/domain-naming/unbound:1.19.x
harbor.local/domain-naming/bird2:2.0.x
```

> **Annahme**: Das Harbor-Registry ist unter `harbor.local` erreichbar und wurde durch den Plattform-Operator befüllt.

---

*Zuletzt aktualisiert: 2026-03-16*
