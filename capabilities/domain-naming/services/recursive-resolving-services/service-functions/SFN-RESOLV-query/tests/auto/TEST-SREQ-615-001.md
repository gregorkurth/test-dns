# TEST-SREQ-615-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-615-001
> **Requirement:** [SREQ-615](../../requirements/SREQ-615.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test gegen Unbound-Resolver rs1.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_615_001.py
# Resolver hat keine Forwarder-Konfiguration fuer MNP-Zonen
# Ausfuehrung: pytest tests/auto/test_sreq_615_001.py -v

import dns.resolver
import pytest

RESOLVER = "rs1.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_615_resolv_positiv():
    """
    Prueft (Resolver-Seite): Resolver hat keine Forwarder-Konfiguration fuer MNP-Zonen
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
