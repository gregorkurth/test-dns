# TEST-SREQ-529-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-529-001
> **Requirement:** [SREQ-529](../../requirements/SREQ-529.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test via Python-`dns`-Bibliothek gegen ns1.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_529_001.py
# Zone Transfer ohne TSIG wird abgewiesen
# Ausfuehrung: pytest tests/auto/test_sreq_529_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS = "ns1.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_529_positiv():
    """
    Prueft: Zone Transfer ohne TSIG wird abgewiesen
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [NS]
    # TODO: Konkrete Assertion implementieren
    pass
```

## Vorbedingungen

- DNS-Server ist unter `ns1.core.ndp.che` erreichbar
- Python-Paket `dnspython` ist installiert

## Erwartetes Ergebnis

Alle Assertions erfolgreich; pytest Exit-Code 0.
