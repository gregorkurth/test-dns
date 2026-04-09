# TEST-RDTS-202-001: Airgapped Container-Image

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-202-001 |
| **Typ** | Automatisch (pytest) |
| **Requirement** | [RDTS-202](../../requirements/RDTS-202.md) |
| **Service Function** | SFN-K8S-001 - Container Packaging |
| **Status** | Stub - nicht implementiert |

## pytest Implementierung (Stub)

```python
import pytest

@pytest.mark.requirement("RDTS-202")
@pytest.mark.service_function("SFN-K8S-001")
def test_rdts_202_001():
    """Testet: Airgapped Container-Image inkl. OCI-Konformitaet"""
    pytest.skip("Stub - noch nicht implementiert")
```
