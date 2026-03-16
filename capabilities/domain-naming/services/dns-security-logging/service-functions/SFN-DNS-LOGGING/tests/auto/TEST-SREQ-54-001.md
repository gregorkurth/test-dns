# TEST-SREQ-54-001: Automatischer Test

> **Testfall-ID:** TEST-SREQ-54-001
> **Requirement:** [SREQ-54](../../requirements/SREQ-54.md)
> **Typ:** Automatisch (pytest)
> **Status:** Offen

## Teststrategie

Automatisierter pytest-Test: Prueft DNS-Logging durch Ausfuehren von Queries und Auswertung der Log-Dateien.

## Pytest-Stub

```python
# tests/auto/test_sreq_54_001.py
# Zone Transfer, fehlgeschlagene Anfragen und Zonenmodifikationen werden geloggt
# Ausfuehrung: pytest tests/auto/test_sreq_54_001.py -v

import dns.resolver
import subprocess
import pytest
import os

NS = "ns1.core.ndp.che"
LOG_PATH = "/var/log/named/named.log"  # Anpassen an tatsaechlichen Pfad


def test_sreq_54_log_exists():
    """
    Prueft: Zone Transfer, fehlgeschlagene Anfragen und Zonenmodifikationen werden geloggt
    """
    # TODO: Log-Datei auf Vorhandensein pruefen
    # assert os.path.exists(LOG_PATH), f'Log-Datei nicht gefunden: {LOG_PATH}'
    pass


def test_sreq_54_log_content():
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
