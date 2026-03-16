# TEST-SREQ-240-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-240-001
> **Requirement:** [SREQ-240](../../requirements/SREQ-240.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test: Prueft ob Unbound statisch konfigurierte Trust Anchors verarbeitet.

## Pytest-Stub

```python
# tests/auto/test_sreq_240_001.py
# Statisch konfigurierte Zonen / Trust Anchors werden unterstuetzt
# Ausfuehrung: pytest tests/auto/test_sreq_240_001.py -v

import dns.resolver
import pytest

RESOLVER = "rs1.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_240_trust_anchor_configured():
    """
    Prueft: Unbound hat Trust Anchor fuer Root-Zone konfiguriert.
    DNSSEC-Validierung ist aktiv.
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [RESOLVER]
    # TODO: DNSSEC-validierte Query ausfuehren
    # answer = resolver.resolve(ZONE, 'A', want_dnssec=True)
    # assert answer.response.flags & dns.flags.AD  # AD-Flag = Authenticated Data
    pass


def test_sreq_240_static_zone_resolves():
    """
    Prueft: Statisch konfigurierte Zone wird korrekt aufgeloest.
    """
    # TODO: Implementierung
    pass
```

## Vorbedingungen

- Unbound mit aktivierter DNSSEC-Validierung laeuft
- Trust Anchor fuer Root-Zone ist konfiguriert
- Python-Paket `dnspython` ist installiert

## Erwartetes Ergebnis

Alle Assertions erfolgreich; pytest Exit-Code 0.
