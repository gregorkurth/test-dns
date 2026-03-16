# TEST-SREQ-242-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-242-001
> **Requirement:** [SREQ-242](../../requirements/SREQ-242.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test via Python-`dns`-Bibliothek gegen root-ns.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_242_001.py
# Root-Zone wird von BIND9 autoritativ bedient
# Ausfuehrung: pytest tests/auto/test_sreq_242_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS = "root-ns.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_242_positiv():
    """
    Prueft: Root-Zone wird von BIND9 autoritativ bedient
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [NS]
    # TODO: Konkrete Assertion implementieren
    pass
```

## Vorbedingungen

- DNS-Server ist unter `root-ns.core.ndp.che` erreichbar
- Python-Paket `dnspython` ist installiert

## Erwartetes Ergebnis

Alle Assertions erfolgreich; pytest Exit-Code 0.
