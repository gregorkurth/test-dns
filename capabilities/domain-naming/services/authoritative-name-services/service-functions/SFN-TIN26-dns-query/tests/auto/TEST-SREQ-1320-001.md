# TEST-SREQ-1320-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-1320-001
> **Requirement:** [SREQ-1320](../../requirements/SREQ-1320.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test gegen BIND9-Instanz via `dig`-Kommando oder Python-`dns`-Bibliothek.

## Pytest-Stub

```python
# tests/auto/test_sreq_1320_001.py
# Automatischer Test fuer SREQ-1320: Zone-Validierung mit DS-Record-Set ist moeglich
# Ausfuehrung: pytest tests/auto/test_sreq_1320_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS1 = "ns1.core.ndp.che"
NS2 = "ns2.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_1320_positiv():
    """
    Positiv-Test fuer SREQ-1320.
    Prueft: Zone-Validierung mit DS-Record-Set ist moeglich
    Quelle: FMN SP5 SI Domain Naming
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [NS1]
    # TODO: Konkrete Assertion implementieren
    # Beispiel:
    # answer = resolver.resolve(ZONE, "NS")
    # assert len(answer) >= 2, "Mindestens 2 NS-Records erwartet"
    pass


def test_sreq_1320_negativ():
    """
    Negativ-Test fuer SREQ-1320.
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
