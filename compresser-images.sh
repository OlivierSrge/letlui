#!/bin/bash
# ============================================================
# L et Lui Signature — Script de compression locale des images
# ============================================================
# Usage : ./compresser-images.sh
# Compresse toutes les images du dossier /images/
# Redimensionne à 700px max + qualité JPEG 75%
# ============================================================

DOSSIER="$(dirname "$0")/images"

if [ ! -d "$DOSSIER" ]; then
  echo "❌ Dossier images/ introuvable."
  exit 1
fi

echo "🔍 Scan des images dans $DOSSIER..."
echo ""

TOTAL=0
OPTIMISE=0
ECONOMIE=0

for img in "$DOSSIER"/*.jpg "$DOSSIER"/*.jpeg "$DOSSIER"/*.png; do
  [ -f "$img" ] || continue
  TOTAL=$((TOTAL + 1))

  NOM=$(basename "$img")
  AVANT=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")

  # Compresser avec sips (macOS natif)
  sips -s formatOptions 75 --resampleHeightWidthMax 700 "$img" --out "$img" > /dev/null 2>&1

  APRES=$(stat -f%z "$img" 2>/dev/null || stat -c%s "$img")

  if [ "$APRES" -lt "$AVANT" ]; then
    GAIN=$(( (AVANT - APRES) * 100 / AVANT ))
    ECONOMIE=$((ECONOMIE + AVANT - APRES))
    OPTIMISE=$((OPTIMISE + 1))
    echo "  ✓ $NOM — $(( AVANT / 1024 ))KB → $(( APRES / 1024 ))KB  (-${GAIN}%)"
  else
    echo "  ~ $NOM — déjà optimisée, ignorée"
  fi
done

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  $OPTIMISE/$TOTAL images optimisées"
echo "  Économie : $(( ECONOMIE / 1024 )) KB libérés"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "✅ Terminé ! Tu peux maintenant faire git add + commit + push."
