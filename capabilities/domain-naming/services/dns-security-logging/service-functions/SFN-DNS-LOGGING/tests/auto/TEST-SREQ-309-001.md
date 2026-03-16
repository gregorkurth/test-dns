# TEST-SREQ-309-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-309-001
> **Requirement:** [SREQ-309](../../requirements/SREQ-309.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test: Prueft DNS-Logging durch Ausfuehren von Queries und Auswertung der Log-Dateien.

## Pytest-Stub

```python
# tests/auto/test_sreq_309_001.py
# Fehlgeschlagene Anfragen enthalten vollstaendige Details im Log
# Ausfuehrung: pytest tests/auto/test_sreq_309_001.py -v

import dns.resolver
import subprocess
import pytest
import os

NS = "ns1.core.ndp.che"
LOG_PATH = "/var/log/named/named.log"  # Anpassen an tatsaechlichen Pfad


def test_sreq_309_log_exists():
    """
    Prueft: Fehlgeschlagene Anfragen enthalten vollstaendige Details im Log
    """
    # TODO: Log-Datei auf Vorhandensein pruefen
    # assert os.path.exists(LOG_PATH), f'Log-Datei nicht gefunden: {LOG_PATH}'
    pass


def test_sreq_309_log_content():
    """
    Prueft: Log-Eintraege enthalten erwartete Felder.
    """
    # TODO: DNS-Query ausfuehren, dann Log auf Eintrag pruefen
    pass
```

## Vorbedingungen

- BIND9 und Unbound laufen mit aktiviertem Logging
- Testsystem hat Lesezugriff auf Log-Dateien
- Python-Paket `dnspython` ist installiert

## Erwartetes Ergebnis

Alle Assertions erfolgreich; pytest Exit-Code 0.
