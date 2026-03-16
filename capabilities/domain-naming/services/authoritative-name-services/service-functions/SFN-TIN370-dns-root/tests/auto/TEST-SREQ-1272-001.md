# TEST-SREQ-1272-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-1272-001
> **Requirement:** [SREQ-1272](../../requirements/SREQ-1272.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test via Python-`dns`-Bibliothek gegen root-ns.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_1272_001.py
# Root-Zone ist mit erlaubtem Algorithmus signiert
# Ausfuehrung: pytest tests/auto/test_sreq_1272_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS = "root-ns.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_1272_positiv():
    """
    Prueft: Root-Zone ist mit erlaubtem Algorithmus signiert
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
