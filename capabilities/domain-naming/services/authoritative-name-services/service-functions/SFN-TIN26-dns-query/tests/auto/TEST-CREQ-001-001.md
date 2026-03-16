# TEST-CREQ-001-001: Automatischer Test

> **Testfall-ID:** TEST-CREQ-001-001
> **Requirement:** [CREQ-001](../../requirements/CREQ-001.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test gegen BIND9-Instanz via `dig`-Kommando oder Python-`dns`-Bibliothek.

## Pytest-Stub

```python
# tests/auto/test_creq_001_001.py
# Automatischer Test fuer CREQ-001: Zone core.ndp.che und Reverse-Zone sind konfiguriert
# Ausfuehrung: pytest tests/auto/test_creq_001_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS1 = "ns1.core.ndp.che"
NS2 = "ns2.core.ndp.che"
ZONE = "core.ndp.che"


def test_creq_001_positiv():
    """
    Positiv-Test fuer CREQ-001.
    Prueft: Zone core.ndp.che und Reverse-Zone sind konfiguriert
    Quelle: FMN SP5 SI Domain Naming
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [NS1]
    # TODO: Konkrete Assertion implementieren
    # Beispiel:
    # answer = resolver.resolve(ZONE, "NS")
    # assert len(answer) >= 2, "Mindestens 2 NS-Records erwartet"
    pass


def test_creq_001_negativ():
    """
    Negativ-Test fuer CREQ-001.
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
