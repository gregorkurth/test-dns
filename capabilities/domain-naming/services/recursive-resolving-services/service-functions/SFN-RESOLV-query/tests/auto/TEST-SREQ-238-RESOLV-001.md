# TEST-SREQ-238-RESOLV-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-238-RESOLV-001
> **Requirement:** [SREQ-238](../../requirements/SREQ-238.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test gegen Unbound-Resolver rs1.core.ndp.che.

## Pytest-Stub

```python
# tests/auto/test_sreq_238_resolv_001.py
# Resolver verarbeitet SOA-, NS- und A-Records korrekt
# Ausfuehrung: pytest tests/auto/test_sreq_238_resolv_001.py -v

import dns.resolver
import pytest

RESOLVER = "rs1.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_238_resolv_positiv():
    """
    Prueft (Resolver-Seite): Resolver verarbeitet SOA-, NS- und A-Records korrekt
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
