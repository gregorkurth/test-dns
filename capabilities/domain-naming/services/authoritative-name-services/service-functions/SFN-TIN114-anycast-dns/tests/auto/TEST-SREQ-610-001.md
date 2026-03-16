# TEST-SREQ-610-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-610-001
> **Requirement:** [SREQ-610](../../requirements/SREQ-610.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test via Python-`dns`-Bibliothek gegen root-ns.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_610_001.py
# DNS-Antworten auf Anycast-Anfragen haben Anycast-IP als Source
# Ausfuehrung: pytest tests/auto/test_sreq_610_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS = "root-ns.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_610_positiv():
    """
    Prueft: DNS-Antworten auf Anycast-Anfragen haben Anycast-IP als Source
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
