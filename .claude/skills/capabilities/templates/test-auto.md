# TEST-{{REQ_ID}}-001: {{TEST_TITEL}}

---

## Metadaten

| Feld | Wert |
|------|------|
| **Test ID** | TEST-{{REQ_ID}}-001 |
| **Typ** | Automatisch (pytest) |
| **Requirement** | [{{REQ_ID}}](../../requirements/{{REQ_ID}}.md) |
| **Service Function** | {{SFN_ID}} – {{SFN_NAME}} |
| **Priorität** | {{PRIORITAET}} |
| **Status** | Stub – nicht implementiert |

---

## Beschreibung

{{TEST_BESCHREIBUNG}}

---

## Vorbedingungen

- {{VORBEDINGUNG_1}}
- {{VORBEDINGUNG_2}}

---

## pytest Implementierung (Stub)

```python
"""
TEST-{{REQ_ID}}-001: {{TEST_TITEL}}

Requirement: {{REQ_ID}} – {{REQ_TITEL}}
Service Function: {{SFN_ID}}
"""
import pytest


@pytest.mark.requirement("{{REQ_ID}}")
@pytest.mark.service_function("{{SFN_ID}}")
def test_{{REQ_ID_LOWER}}_{{TEST_SLUG}}():
    """
    {{TEST_BESCHREIBUNG}}

    Akzeptanzkriterien:
    - {{AK_1}}
    - {{AK_2}}
    """
    # TODO: Testimplementierung
    # Vorbedingungen herstellen
    # Testschritt ausführen
    # Ergebnis prüfen
    pytest.skip("Stub – noch nicht implementiert")
```

---

## Erwartetes Ergebnis

{{ERWARTETES_ERGEBNIS}}

---

## Testdaten / Fixtures

```python
# Beispiel-Fixture (in conftest.py ergänzen)
@pytest.fixture
def {{FIXTURE_NAME}}():
    """{{FIXTURE_BESCHREIBUNG}}"""
    # TODO: Fixture implementieren
    pass
```
