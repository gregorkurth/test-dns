# TEST-SREQ-614-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-614-001
> **Requirement:** [SREQ-614](../../requirements/SREQ-614.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test gegen BIND9-Instanz via `dig`-Kommando oder Python-`dns`-Bibliothek.

## Pytest-Stub

```python
# tests/auto/test_sreq_614_001.py
# Automatischer Test fuer SREQ-614: Reverse-Lookup-Zonen werden auf 8-Bit-Grenzen delegiert
# Ausfuehrung: pytest tests/auto/test_sreq_614_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS1 = "ns1.core.ndp.che"
NS2 = "ns2.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_614_positiv():
    """
    Positiv-Test fuer SREQ-614.
    Prueft: Reverse-Lookup-Zonen werden auf 8-Bit-Grenzen delegiert
    Quelle: FMN SP5 SI Domain Naming
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [NS1]
    # TODO: Konkrete Assertion implementieren
    # Beispiel:
    # answer = resolver.resolve(ZONE, "NS")
    # assert len(answer) >= 2, "Mindestens 2 NS-Records erwartet"
    pass


def test_sreq_614_negativ():
    """
    Negativ-Test fuer SREQ-614.
    Stellt sicher, dass unerlaubte Operationen abgewiesen werden.
    """
    # TODO: Negativtest implementieren
    pass
```

## Vorbedingungen

- BIND9 laeuft und ist unter `ns1.core.ndp.che` erreichbar
- Zone `core.ndp.che` ist konfiguriert und geladen
- Python-Paket `dnspython` ist installiert (`pip install dnspython`)

## Erwartetes Ergebnis

Alle Assertions erfolgreich; pytest Exit-Code 0.
