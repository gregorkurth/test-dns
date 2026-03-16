# TEST-SREQ-612-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-612-001
> **Requirement:** [SREQ-612](../../requirements/SREQ-612.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test via Python-`dns`-Bibliothek gegen ns1.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_612_001.py
# Hidden Master nicht in NS-Records; nur sekundaere NS sichtbar
# Ausfuehrung: pytest tests/auto/test_sreq_612_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS = "ns1.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_612_positiv():
    """
    Prueft: Hidden Master nicht in NS-Records; nur sekundaere NS sichtbar
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
