# TEST-SREQ-234-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-234-001
> **Requirement:** [SREQ-234](../../requirements/SREQ-234.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test gegen BIND9-Instanz via `dig`-Kommando oder Python-`dns`-Bibliothek.

## Pytest-Stub

```python
# tests/auto/test_sreq_234_001.py
# Automatischer Test fuer SREQ-234: Mission Top-Level-Domains werden unterstuetzt
# Ausfuehrung: pytest tests/auto/test_sreq_234_001.py -v

import dns.resolver
import dns.query
import dns.rdatatype
import pytest

NS1 = "ns1.core.ndp.che"
NS2 = "ns2.core.ndp.che"
ZONE = "core.ndp.che"


def test_sreq_234_positiv():
    """
    Positiv-Test fuer SREQ-234.
    Prueft: Mission Top-Level-Domains werden unterstuetzt
    Quelle: FMN SP5 SI Domain Naming
    """
    resolver = dns.resolver.Resolver()
    resolver.nameservers = [NS1]
    # TODO: Konkrete Assertion implementieren
    # Beispiel:
    # answer = resolver.resolve(ZONE, "NS")
    # assert len(answer) >= 2, "Mindestens 2 NS-Records erwartet"
    pass


def test_sreq_234_negativ():
    """
    Negativ-Test fuer SREQ-234.
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
