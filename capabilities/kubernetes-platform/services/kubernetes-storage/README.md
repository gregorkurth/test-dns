# Service: Storage Management (SVC-K8S-STORAGE)

> **Service ID:** SVC-K8S-STORAGE
> **Capability:** CAP-002 Kubernetes Platform
> **Maturität:** L0 – Idea (Stand: 2026-04-11)

---

## Beschreibung

Dieser Service stellt sicher, dass die App Storage-Profil-fähig ist und zwischen Rook-Ceph (primär) und lokalem Storage (Fallback) umschaltbar betrieben werden kann. Rook-Ceph wird als zentral verwaltetes Storage-Backend der Plattform bereitgestellt und bietet Block-Storage (RBD), File/CIFS-Storage (CephFS) und S3-kompatiblen Object-Storage (RGW). Ist kein Rook-Ceph vorhanden, greift die App auf lokalen Storage zurück und kennzeichnet dies im GUI und in der Dokumentation.

---

## Service Functions

| SFN-ID | Service Function | Beschreibung |
|--------|-----------------|-------------|
| SFN-K8S-006 | Storage Profile Config | Helm-Values-gesteuerte Profil-Umschaltung (ceph/local) |
| SFN-K8S-007 | Ceph Block Storage | RBD-PVC für Single-Pod-Workloads (ReadWriteOnce) |
| SFN-K8S-008 | Ceph File/CIFS Storage | CephFS-PVC für Multi-Pod-Mounts (ReadWriteMany, CIFS-mountbar) |
| SFN-K8S-009 | Ceph S3 Object Storage | ObjectBucketClaim via Ceph RGW (S3-kompatibel) |
| SFN-K8S-010 | Local Storage Fallback | hostPath/local-PV Fallback mit GUI-Warnhinweis |

---

## Storage-Profil-Überblick

```
storage.profile: ceph
  ├── block   → StorageClass: rook-ceph-block   (RWO)
  ├── file    → StorageClass: rook-cephfs        (RWX, CIFS-mountbar)
  └── s3      → Ceph RGW Endpoint + OBC          (HTTP/S3)

storage.profile: local  (Fallback, nur dev/test)
  ├── block   → local PV oder hostPath
  ├── file    → emptyDir oder local PV
  └── s3      → lokales Dateisystem-Verzeichnis
```

---

## Anforderungen

| REQ-ID | Anforderung |
|--------|------------|
| RDTS-220 | Die App MUSS das Storage-Profil (ceph oder local) über Helm Values konfigurierbar machen. |
| RDTS-221 | Im Ceph-Profil MÜSSEN PVCs für Block-Storage (RBD, RWO) deklarativ im Chart bereitgestellt sein. |
| RDTS-222 | Im Ceph-Profil MÜSSEN PVCs für File-Storage (CephFS, RWX) deklarativ im Chart bereitgestellt sein. |
| RDTS-223 | Im Ceph-Profil MUSS ein ObjectBucketClaim für S3-kompatiblen Object-Storage (Ceph RGW) deklarativ im Chart bereitgestellt sein. |
| RDTS-224 | Im Local-Profil MUSS die App ohne Rook-Ceph lauffähig sein (hostPath/emptyDir/local PV als Ersatz). |
| RDTS-225 | Im Local-Profil MUSS die Web-GUI einen sichtbaren Hinweis anzeigen, dass der degradierte Speichermodus aktiv ist. |
| RDTS-226 | Der Kubernetes Operator MUSS prüfen, ob die konfigurierten StorageClasses im Cluster vorhanden sind, und den CR-Status entsprechend setzen. |

---

## Abhängigkeiten

| DPD-ID | Abhängigkeit | Typ |
|--------|-------------|-----|
| DPD-STOR-001 | Rook-Ceph (Plattform-Komponente) | Optional (Fallback wenn nicht vorhanden) |
| DPD-STOR-002 | SVC-K8S-OPERATOR (SFN-K8S-004 Reconciliation Loop) | Nutzer (Status-Reporting) |
| DPD-STOR-003 | OBJ-25 Helm Charts | Implementierung (Values-Struktur) |

---

## Helm-Values-Konvention

```yaml
storage:
  profile: ceph          # ceph | local
  ceph:
    block:
      storageClass: rook-ceph-block
      size: 1Gi
    file:
      storageClass: rook-cephfs
      size: 5Gi
    s3:
      endpoint: ""       # Ceph RGW URL
      bucket: dns-management
      accessKeySecret: dns-s3-credentials
  local:
    path: /data          # Basispfad für hostPath (nur dev/test)
```

---

## Links

- [App-Template-Anweisung – Abschnitt 2a](../../../../req-init/app-template.md)
- [Kubernetes Deployment Service](../kubernetes-deployment/README.md)
- [Kubernetes Operator Service](../kubernetes-operator/README.md)
