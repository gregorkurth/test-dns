# TEST-RDTS-610-001: Statuslogik fuer Testausfuehrungen

`utest~rdts-610-001~1`
Covers: req~rdts-610~1

| Feld | Wert |
|------|------|
| **Test ID** | TEST-RDTS-610-001 |
| **Typ** | Automatisch |
| **Requirement** | [RDTS-610](../../requirements/RDTS-610.md) |
| **Service Function** | SFN-DOC-004 - Testing Concept |
| **Status** | Stub |

```python
import pytest

@pytest.mark.requirement("RDTS-610")
def test_rdts_610_001():
    pytest.skip("Stub")
```
