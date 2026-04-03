"""
pytest Konfiguration fuer DNS-Auto-Tests.

Marker-Konvention:
  @pytest.mark.req("SREQ-234")   <- verknuepft Test mit Requirement
  @pytest.mark.req("CREQ-001")   <- verknuepft Test mit Custom-Requirement

OFT Inline-Tag fuer Traceability (am Anfang der Testdatei):
  # [utest->req~sreq-234~1]
"""

import os
import pytest


def pytest_configure(config):
    """Marker-Dokumentation registrieren."""
    config.addinivalue_line(
        "markers",
        "req(id): Verknuepfung zu einem Requirement. Beispiel: @pytest.mark.req('SREQ-234')"
    )


@pytest.fixture(scope="session")
def dns_server():
    """IP-Adresse des DNS-Servers aus Umgebungsvariable oder Default."""
    server = os.environ.get("DNS_SERVER", "ns1.core.ndp.che")
    return server


@pytest.fixture(scope="session")
def dns_zone():
    """Haupt-DNS-Zone fuer Tests."""
    return os.environ.get("DNS_ZONE", "core.ndp.che")
