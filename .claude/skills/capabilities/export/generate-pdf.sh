#!/usr/bin/env bash
# =============================================================================
# generate-pdf.sh – Capabilities Structure → PDF Export
# =============================================================================
# Verwendung:
#   bash capabilities/export/generate-pdf.sh [capability-slug]
#
# Voraussetzungen:
#   brew install pandoc
#   brew install --cask mactex-no-gui   (oder: brew install basictex)
#
# Output:
#   capabilities/export/[capability-slug]-YYYYMMDD.pdf
# =============================================================================

set -euo pipefail

# ── Argumente ──────────────────────────────────────────────────────────────────
CAP_SLUG="${1:-}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CAP_DIR="$REPO_ROOT/capabilities"
OUTPUT_DIR="$SCRIPT_DIR"
DATUM=$(date +%Y%m%d)

if [[ -z "$CAP_SLUG" ]]; then
  # Automatisch ersten Capability-Ordner erkennen
  CAP_SLUG=$(ls -d "$CAP_DIR"/*/  2>/dev/null | head -1 | xargs basename || echo "capability")
fi

OUTPUT_FILE="$OUTPUT_DIR/${CAP_SLUG}-${DATUM}.pdf"
COMBINED_MD="$OUTPUT_DIR/.combined-$$.md"

# ── Voraussetzungen prüfen ─────────────────────────────────────────────────────
if ! command -v pandoc &>/dev/null; then
  echo "❌ pandoc nicht gefunden. Installation:"
  echo "   brew install pandoc"
  echo "   brew install --cask mactex-no-gui"
  exit 1
fi

echo "📄 Erstelle PDF: $OUTPUT_FILE"

# ── Markdown-Dateien sammeln und kombinieren ───────────────────────────────────
{
  # YAML-Frontmatter für pandoc
  echo "---"
  echo "title: 'Capabilities Structure – $(basename "$CAP_DIR/$CAP_SLUG" | tr '-' ' ' | awk '{for(i=1;i<=NF;i++) $i=toupper(substr($i,1,1)) substr($i,2); print}')'"
  echo "subtitle: 'NATO C3 Taxonomy | Services · Requirements · Tests'"
  echo "date: '$(date +%d.%m.%Y)'"
  echo "toc: true"
  echo "toc-depth: 3"
  echo "numbersections: true"
  echo "colorlinks: true"
  echo "linkcolor: blue"
  echo "geometry: 'margin=2.5cm'"
  echo "fontsize: '11pt'"
  echo "---"
  echo ""

  # 1. Capabilities INDEX
  if [[ -f "$CAP_DIR/INDEX.md" ]]; then
    echo "# Capabilities Index"
    echo ""
    # Links in absolute Verweise umwandeln (für PDF-Lesbarkeit)
    sed 's/\[README\]([^)]*)/README/g' "$CAP_DIR/INDEX.md"
    echo ""
    echo "\\newpage"
    echo ""
  fi

  # 2. Capability README
  if [[ -f "$CAP_DIR/$CAP_SLUG/README.md" ]]; then
    sed 's/^# /# /; s/\[README\]([^)]*)/README/g' "$CAP_DIR/$CAP_SLUG/README.md"
    echo ""
    echo "\\newpage"
    echo ""
  fi

  # 3. Maturity
  if [[ -f "$CAP_DIR/$CAP_SLUG/maturity.md" ]]; then
    sed 's/^# /## /g' "$CAP_DIR/$CAP_SLUG/maturity.md"
    echo ""
    echo "\\newpage"
    echo ""
  fi

  # 4. Products
  if [[ -f "$CAP_DIR/$CAP_SLUG/products.md" ]]; then
    sed 's/^# /## /g' "$CAP_DIR/$CAP_SLUG/products.md"
    echo ""
    echo "\\newpage"
    echo ""
  fi

  # 5. Services
  for SVC_DIR in "$CAP_DIR/$CAP_SLUG/services"/*/; do
    [[ -d "$SVC_DIR" ]] || continue
    SVC_NAME=$(basename "$SVC_DIR")

    if [[ -f "$SVC_DIR/README.md" ]]; then
      echo "# Service: $SVC_NAME"
      echo ""
      # Headings eine Ebene tiefer
      sed 's/^## /### /g; s/^# /## /g; s/\[Requirements\]([^)]*)/Requirements/g' "$SVC_DIR/README.md"
      echo ""
    fi

    # 6. Service Functions
    for SFN_DIR in "$SVC_DIR/service-functions"/*/; do
      [[ -d "$SFN_DIR" ]] || continue
      SFN_NAME=$(basename "$SFN_DIR")

      if [[ -f "$SFN_DIR/README.md" ]]; then
        echo "## Service Function: $SFN_NAME"
        echo ""
        sed 's/^## /### /g; s/^# /## /g; s/\[TEST-[^]]*\]([^)]*)//g' "$SFN_DIR/README.md"
        echo ""
      fi

      # 7. Requirements
      for REQ_FILE in "$SFN_DIR/requirements/"*.md; do
        [[ -f "$REQ_FILE" ]] || continue
        REQ_ID=$(basename "$REQ_FILE" .md)
        echo "### Requirement: $REQ_ID"
        echo ""
        sed 's/^## /#### /g; s/^# /### /g; s/\[TEST-[^]]*\]([^)]*)//g' "$REQ_FILE"
        echo ""
      done

      echo "\\newpage"
      echo ""
    done
  done

  # 8. Anhang: Traceability Matrix
  echo "# Anhang: Requirements Traceability Matrix"
  echo ""
  echo "| Requirement ID | Typ | Quelle | Service Function | Service | Priorität |"
  echo "|---------------|-----|--------|-----------------|---------|-----------|"
  for SVC_DIR in "$CAP_DIR/$CAP_SLUG/services"/*/; do
    [[ -d "$SVC_DIR" ]] || continue
    SVC_NAME=$(basename "$SVC_DIR")
    for SFN_DIR in "$SVC_DIR/service-functions"/*/; do
      [[ -d "$SFN_DIR" ]] || continue
      SFN_NAME=$(basename "$SFN_DIR")
      for REQ_FILE in "$SFN_DIR/requirements/"*.md; do
        [[ -f "$REQ_FILE" ]] || continue
        REQ_ID=$(basename "$REQ_FILE" .md)
        TYP=$(grep -m1 "Req.*Typ\|\\*\\*Typ\\*\\*" "$REQ_FILE" 2>/dev/null | sed 's/.*|[[:space:]]*//' | tr -d '\n' || echo "–")
        QUELLE=$(grep -m1 "\\[NATO\\]\\|\\[ARCH\\]\\|\\[CUST\\]\\|\\[INT\\]" "$REQ_FILE" 2>/dev/null | grep -o '\[NATO\]\|\[ARCH\]\|\[CUST\]\|\[INT\]' | head -1 || echo "–")
        PRIO=$(grep -m1 "MUSS\|SHALL\|SOLLTE\|SHOULD\|KANN\|MAY" "$REQ_FILE" 2>/dev/null | grep -o '🟥 MUSS\|🟧 SOLLTE\|🟨 KANN\|ℹ️ INFO\|MUSS\|SHALL\|SHOULD\|MAY' | head -1 || echo "–")
        echo "| $REQ_ID | $TYP | $QUELLE | $SFN_NAME | $SVC_NAME | $PRIO |"
      done
    done
  done

} > "$COMBINED_MD"

# ── PDF generieren ─────────────────────────────────────────────────────────────
pandoc "$COMBINED_MD" \
  --from markdown \
  --to pdf \
  --pdf-engine=xelatex \
  --toc \
  --toc-depth=3 \
  --number-sections \
  -V "mainfont=Helvetica" \
  -V "monofont=Courier New" \
  --output "$OUTPUT_FILE" \
  2>&1 || {
    # Fallback: wkhtmltopdf oder pdflatex
    echo "⚠️  xelatex fehlgeschlagen, versuche pdflatex..."
    pandoc "$COMBINED_MD" \
      --from markdown \
      --to pdf \
      --pdf-engine=pdflatex \
      --toc \
      --number-sections \
      --output "$OUTPUT_FILE"
  }

# ── Aufräumen ──────────────────────────────────────────────────────────────────
rm -f "$COMBINED_MD"

if [[ -f "$OUTPUT_FILE" ]]; then
  echo "✅ PDF erstellt: $OUTPUT_FILE"
  echo "   Grösse: $(du -sh "$OUTPUT_FILE" | cut -f1)"
else
  echo "❌ PDF-Erstellung fehlgeschlagen"
  exit 1
fi
