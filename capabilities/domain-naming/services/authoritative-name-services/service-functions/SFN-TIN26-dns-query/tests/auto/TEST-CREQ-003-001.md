# TEST-CREQ-003-001: Automatischer Test

> **Testfall-ID:** TEST-CREQ-003-001
> **Requirement:** [CREQ-003](../../requirements/CREQ-003.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test gegen BIND9-Instanz via `dig`-Kommando oder Python-`dns`-Bibliothek.

## Pytest-Stub

```python
# tests/auto/test_creq_003_001.py
# Automatischer Test fuer CREQ-003: rs1.core.ndp.che und rs2.core.ndp.che sind erreichbar
# Ausfuehrung: pytest tests/auto/test_creq_003_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS1 = "ns1.core.ndp.che"
NS2 = "ns2.core.ndp.che"
ZONE = "core.ndp.che"


def test_creq_003_positiv():
    """
    Positiv-Test fuer CREQ-003.
    Prueft: rs1.core.ndp.che und rs2.core.ndp.che sind erreichbar
    Quelle: FMN SP5 SI Domain Naming
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [NS1]
    # TODO: Konkrete Assertion implementieren
    # Beispiel:
    # answer = resolver.resolve(ZONE, "NS")
    # assert len(answer) >= 2, "Mindestens 2 NS-Records erwartet"
    pass


def test_creq_003_negativ():
    """
    Negativ-Test fuer CREQ-003.
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
