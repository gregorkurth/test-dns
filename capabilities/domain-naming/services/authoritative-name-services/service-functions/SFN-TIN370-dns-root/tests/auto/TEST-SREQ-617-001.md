# TEST-SREQ-617-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-617-001
> **Requirement:** [SREQ-617](../../requirements/SREQ-617.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test via Python-`dns`-Bibliothek gegen root-ns.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_617_001.py
# Lokaler Resolver verwendet lokalen Root-NS
# Ausfuehrung: pytest tests/auto/test_sreq_617_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS = "root-ns.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_617_positiv():
    """
    Prueft: Lokaler Resolver verwendet lokalen Root-NS
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
