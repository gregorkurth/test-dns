#!/usr/bin/env bash
# Laed OpenFastTrace JAR herunter (einmalig, lokal)
# Ausfuehren: bash scripts/download-oft.sh

set -euo pipefail

OFT_VERSION="4.0.1"
OFT_JAR="tools/oft.jar"
OFT_URL="https://github.com/itsallcode/openfasttrace/releases/download/${OFT_VERSION}/openfasttrace-${OFT_VERSION}.jar"

mkdir -p tools

if [ -f "$OFT_JAR" ]; then
  echo "OFT JAR bereits vorhanden: $OFT_JAR"
  exit 0
fi

echo "Lade OpenFastTrace ${OFT_VERSION} herunter..."
curl -L -o "$OFT_JAR" "$OFT_URL"
echo "Fertig: $OFT_JAR"
