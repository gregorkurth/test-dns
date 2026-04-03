<!--
VORLAGE: Neuen automatischen Testfall (Stub) anlegen
=====================================================
1. Datei kopieren nach: capabilities/.../tests/auto/TEST-SREQ-xxx-001.md
2. Alle Felder anpassen
3. OFT-Tags anpassen
4. Python-Code im Stub ausimplementieren
-->

# TEST-SREQ-xxx-001: Automatischer Test

`utest~sreq-xxx-001~1`
Covers: req~sreq-xxx~1

> **Testfall-ID:** TEST-SREQ-xxx-001
> **Requirement:** [SREQ-xxx](../../requirements/SREQ-xxx.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

[Beschreiben wie der Test aufgebaut ist – z.B. dig-Befehl, dnspython-Bibliothek]

## Pytest-Stub

```python
# tests/auto/sfn_xxx/test_sreq_xxx_001.py
# [utest->req~sreq-xxx~1]

import pytest

@pytest.mark.req("SREQ-xxx")
class TestSREQxxx:
    def test_positiv(self, dns_server, dns_zone):
        """
        Positiv-Test für SREQ-xxx.
        Prüft: [Was wird geprüft?]
        """
        # TODO: Implementieren
        pass

    def test_negativ(self, dns_server, dns_zone):
        """
        Negativ-Test für SREQ-xxx.
        Stellt sicher, dass unerlaubte Operationen abgewiesen werden.
        """
        # TODO: Implementieren
        pass
```

## Vorbedingungen

- BIND9 läuft und ist unter dem konfigurierten DNS-Server erreichbar
- Python-Paket `dnspython` ist installiert

## Erwartetes Ergebnis

Alle Assertions erfolgreich; pytest Exit-Code 0.
