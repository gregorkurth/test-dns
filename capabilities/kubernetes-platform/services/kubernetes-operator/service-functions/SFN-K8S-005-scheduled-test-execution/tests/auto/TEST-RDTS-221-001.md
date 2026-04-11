# TEST-RDTS-221-001: Keine ueberlappenden Testlaeufe (Single Active Run)

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-221-001 |
| **Typ** | Automatisch (pytest) |
| **Requirement** | [RDTS-221](../../requirements/RDTS-221.md) |
| **Service Function** | SFN-K8S-005 - Scheduled Test Execution |
| **Status** | Stub - nicht implementiert |

## pytest Implementierung (Stub)

```python
import pytest

@pytest.mark.requirement("RDTS-221")
@pytest.mark.service_function("SFN-K8S-005")
def test_rdts_221_001():
    """Testet: Keine ueberlappenden Testlaeufe (Single Active Run)"""
    pytest.skip("Stub - noch nicht implementiert")
```

