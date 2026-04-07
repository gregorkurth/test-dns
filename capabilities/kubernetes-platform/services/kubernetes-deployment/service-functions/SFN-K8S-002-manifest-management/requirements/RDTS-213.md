# RDTS-213: Zero-Trust Pod-zu-Pod-Richtlinien mit Cilium und mTLS

---

## Metadaten

| Feld | Wert |
|------|------|
| **Requirement ID** | RDTS-213 |
| **Typ** | Architektur |
| **Quelle** | [ARCH] |
| **Priorität** | 🟥 MUSS (SHALL) |
| **Service Function** | SFN-K8S-002 – Manifest Management |
| **Quelldokument** | App-Template-Anweisung |
| **Kapitel** | 6. Security / Authentifizierung |
| **Status** | Offen |

---

## Anforderungstext (Original)

> Pod-zu-Pod-Kommunikation muss nach Zero-Trust-Prinzip umgesetzt werden (Default-Deny, explizites Allowlisting) und TLS-verschluesselt sein (mTLS), bevorzugt mit Cilium-Richtlinien.

## Anforderungstext (Erläuterung)

Kubernetes-Manifeste enthalten Cilium-basierte Netzwerkregeln (CiliumNetworkPolicy oder CiliumClusterwideNetworkPolicy), sodass nur dokumentierte Kommunikationspfade zwischen Pods erlaubt sind. Zusaetzlich ist eine mTLS-Absicherung fuer erlaubte Pod-zu-Pod-Verbindungen nachgewiesen.

---

## Akzeptanzkriterien

1. Default-Deny-Regel fuer relevante Namespaces ist vorhanden
2. Explizite Allow-Regeln fuer notwendige App-Pfade sind vorhanden
3. Pod-zu-Pod-Traffic auf freigegebenen Pfaden ist TLS-verschluesselt (mTLS)
4. Richtlinien und mTLS-Konfiguration sind versioniert im Repository hinterlegt
5. Dokumentierte Kommunikationsmatrix entspricht den deployten Regeln

---

## Verknüpfte Features

- OBJ-10: Kubernetes Deployment
- OBJ-12: Security & Authentifizierung
