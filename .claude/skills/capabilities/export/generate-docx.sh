#!/usr/bin/env bash
# =============================================================================
# generate-docx.sh – Capabilities Structure → DOCX Export
# =============================================================================
# Verwendung:
#   bash capabilities/export/generate-docx.sh [capability-slug]
#
# Voraussetzungen:
#   brew install pandoc
#
# Output:
#   capabilities/export/[capability-slug]-YYYYMMDD.docx
#
# Formatierung:
#   Verwendet capabilities/export/reference.docx als Word-Vorlage (falls vorhanden).
#   Ohne Vorlage: Standard-pandoc-Formatierung.
# =============================================================================

set -euo pipefail

# ── Argumente ──────────────────────────────────────────────────────────────────
CAP_SLUG="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CAP_DIR="$REPO_ROOT/capabilities"
OUTPUT_DIR="$SCRIPT_DIR"
DATUM=$(date +%Y%m%d)
REFERENCE_DOCX="$SCRIPT_DIR/reference.docx"

if [[ -z "$CAP_SLUG" ]]; then
  CAP_SLUG=$(ls -d "$CAP_DIR"/*/  2>/dev/null | head -1 | xargs basename || echo "capability")
fi

OUTPUT_FILE="$OUTPUT_DIR/${CAP_SLUG}-${DATUM}.docx"
COMBINED_MD="$OUTPUT_DIR/.combined-$$.md"

# ── Voraussetzungen prüfen ─────────────────────────────────────────────────────
if ! command -v pandoc &>/dev/null; then
  echo "❌ pandoc nicht gefunden. Installation:"
  echo "   brew install pandoc"
  exit 1
fi

echo "📄 Erstelle DOCX: $OUTPUT_FILE"

# ── Markdown-Dateien sammeln und kombinieren ───────────────────────────────────
# (identische Logik wie generate-pdf.sh, aber ohne LaTeX-spezifische Befehle)
{
  echo "---"
  echo "title: 'Capabilities Structure'"
  echo "subtitle: '$(basename "$CAP_DIR/$CAP_SLUG" | tr '-' ' ')'"
  echo "date: '$(date +%d.%m.%Y)'"
  echo "---"
  echo ""

  # 1. INDEX
  if [[ -f "$CAP_DIR/INDEX.md" ]]; then
    echo "# Capabilities Index"
    echo ""
    sed 's/\[README\]([^)]*)/README/g' "$CAP_DIR/INDEX.md"
    echo ""
    echo "---"
    echo ""
  fi

  # 2. Capability README
  if [[ -f "$CAP_DIR/$CAP_SLUG/README.md" ]]; then
    sed 's/\[README\]([^)]*)/README/g; s/\[Maturity[^]]*\]([^)]*)/Maturity Status/g; s/\[Products[^]]*\]([^)]*)/Products/g' "$CAP_DIR/$CAP_SLUG/README.md"
    echo ""
    echo "---"
    echo ""
  fi

  # 3. Maturity
  if [[ -f "$CAP_DIR/$CAP_SLUG/maturity.md" ]]; then
    sed 's/^# /## /g' "$CAP_DIR/$CAP_SLUG/maturity.md"
    echo ""
    echo "---"
    echo ""
  fi

  # 4. Products
  if [[ -f "$CAP_DIR/$CAP_SLUG/products.md" ]]; then
    sed 's/^# /## /g' "$CAP_DIR/$CAP_SLUG/products.md"
    echo ""
    echo "---"
    echo ""
  fi

  # 5. Services
  for SVC_DIR in "$CAP_DIR/$CAP_SLUG/services"/*/; do
    [[ -d "$SVC_DIR" ]] || continue
    SVC_NAME=$(basename "$SVC_DIR")

    echo "# Service: $SVC_NAME"
    echo ""
    if [[ -f "$SVC_DIR/README.md" ]]; then
      sed 's/^## /### /g; s/^# /## /g; s/\[Requirements\]([^)]*)/Requirements/g' "$SVC_DIR/README.md"
      echo ""
    fi

    # Service Functions
    for SFN_DIR in "$SVC_DIR/service-functions"/*/; do
      [[ -d "$SFN_DIR" ]] || continue
      SFN_NAME=$(basename "$SFN_DIR")

      echo "## $SFN_NAME"
      echo ""
      if [[ -f "$SFN_DIR/README.md" ]]; then
        sed 's/^## /### /g; s/^# /## /g; s/\[TEST-[^]]*\]([^)]*)//g' "$SFN_DIR/README.md"
        echo ""
      fi

      # Requirements
      for REQ_FILE in "$SFN_DIR/requirements/"*.md; do
        [[ -f "$REQ_FILE" ]] || continue
        REQ_ID=$(basename "$REQ_FILE" .md)
        echo "### $REQ_ID"
        echo ""
        sed 's/^## /#### /g; s/^# /### /g; s/\[TEST-[^]]*\]([^)]*)//g' "$REQ_FILE"
        echo ""
      done
      echo "---"
      echo ""
    done
  done

  # Anhang: Traceability Matrix
  echo "# Anhang: Requirements Traceability Matrix"
  echo ""
  echo "| Requirement ID | Quelle | Service Function | Service | Priorität |"
  echo "|---------------|--------|-----------------|---------|-----------|"
  for SVC_DIR in "$CAP_DIR/$CAP_SLUG/services"/*/; do
    [[ -d "$SVC_DIR" ]] || continue
    SVC_NAME=$(basename "$SVC_DIR")
    for SFN_DIR in "$SVC_DIR/service-functions"/*/; do
      [[ -d "$SFN_DIR" ]] || continue
      SFN_NAME=$(basename "$SFN_DIR")
      for REQ_FILE in "$SFN_DIR/requirements/"*.md; do
        [[ -f "$REQ_FILE" ]] || continue
        REQ_ID=$(basename "$REQ_FILE" .md)
        QUELLE=$(grep -o '\[NATO\]\|\[ARCH\]\|\[CUST\]\|\[INT\]' "$REQ_FILE" 2>/dev/null | head -1 || echo "–")
        PRIO=$(grep -o 'MUSS\|SHALL\|SHOULD\|SOLLTE\|MAY\|KANN\|INFO' "$REQ_FILE" 2>/dev/null | head -1 || echo "–")
        echo "| $REQ_ID | $QUELLE | $SFN_NAME | $SVC_NAME | $PRIO |"
      done
    done
  done

} > "$COMBINED_MD"

# ── DOCX generieren ────────────────────────────────────────────────────────────
PANDOC_ARGS=(
  "$COMBINED_MD"
  --from markdown
  --to docx
  --toc
  --toc-depth=3
  --number-sections
  --output "$OUTPUT_FILE"
)

# Word-Vorlage verwenden, falls vorhanden
if [[ -f "$REFERENCE_DOCX" ]]; then
  PANDOC_ARGS+=(--reference-doc="$REFERENCE_DOCX")
  echo "   Verwende Word-Vorlage: reference.docx"
fi

pandoc "${PANDOC_ARGS[@]}"

# ── Aufräumen ──────────────────────────────────────────────────────────────────
rm -f "$COMBINED_MD"

if [[ -f "$OUTPUT_FILE" ]]; then
  echo "✅ DOCX erstellt: $OUTPUT_FILE"
  echo "   Grösse: $(du -sh "$OUTPUT_FILE" | cut -f1)"
  echo ""
  echo "💡 Tipp: Um eine eigene Word-Vorlage zu verwenden:"
  echo "   1. Öffne das generierte DOCX in Word"
  echo "   2. Passe Formatvorlagen (Normal, Heading 1-3, Table) an"
  echo "   3. Speichere als: capabilities/export/reference.docx"
  echo "   4. Beim nächsten Export wird die Vorlage automatisch verwendet"
else
  echo "❌ DOCX-Erstellung fehlgeschlagen"
  exit 1
fi
