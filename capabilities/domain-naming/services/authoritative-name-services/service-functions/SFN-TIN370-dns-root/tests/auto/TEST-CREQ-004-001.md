# TEST-CREQ-004-001: Automatischer Test

> **Testfall-ID:** TEST-CREQ-004-001
> **Requirement:** [CREQ-004](../../requirements/CREQ-004.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test via Python-`dns`-Bibliothek gegen root-ns.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_creq_004_001.py
# root-ns.core.ndp.che ist als Anycast-NS konfiguriert
# Ausfuehrung: pytest tests/auto/test_creq_004_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS = "root-ns.core.ndp.che"
ZONE = "core.ndp.che"


def test_creq_004_positiv():
    """
    Prueft: root-ns.core.ndp.che ist als Anycast-NS konfiguriert
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
