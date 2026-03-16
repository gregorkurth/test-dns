# TEST-SREQ-611-RESOLV-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-611-RESOLV-001
> **Requirement:** [SREQ-611](../../requirements/SREQ-611.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test gegen Unbound-Resolver rs1.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_611_resolv_001.py
# Resolver verwendet konfigurierte Unicast-IP fuer ausgehende Queries
# Ausfuehrung: pytest tests/auto/test_sreq_611_resolv_001.py -v

import dns.resolver
import pytest

RESOLVER = "rs1.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_611_resolv_positiv():
    """
    Prueft (Resolver-Seite): Resolver verwendet konfigurierte Unicast-IP fuer ausgehende Queries
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [RESOLVER]
    # TODO: Konkrete Assertion implementieren
    pass
```

## Vorbedingungen

- Unbound-Resolver laeuft unter `rs1.core.ndp.che`
- Python-Paket `dnspython` ist installiert

## Erwartetes Ergebnis

Alle Assertions erfolgreich; pytest Exit-Code 0.
