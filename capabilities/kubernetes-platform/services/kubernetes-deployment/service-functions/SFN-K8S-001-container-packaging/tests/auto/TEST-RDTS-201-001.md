# TEST-RDTS-201-001: Multi-Stage Dockerfile

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-201-001 |
| **Typ** | Automatisch (pytest) |
| **Requirement** | [RDTS-201](../../requirements/RDTS-201.md) |
| **Service Function** | SFN-K8S-001 - Container Packaging |
| **Status** | Stub - nicht implementiert |

## pytest Implementierung (Stub)

```python
import pytest

@pytest.mark.requirement("RDTS-201")
@pytest.mark.service_function("SFN-K8S-001")
def test_rdts_201_001():
    """Testet: Multi-Stage Dockerfile inkl. OCI-Konformitaet"""
    pytest.skip("Stub - noch nicht implementiert")
```
