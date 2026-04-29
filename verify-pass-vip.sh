#!/bin/bash

# Vérification que le code Pass VIP est bien présent dans app.js
# Usage: ./verify-pass-vip.sh

echo "🔍 Vérification du code Pass VIP dans app.js"
echo "=============================================="
echo ""

if [ ! -f "app.js" ]; then
  echo "❌ Erreur: fichier app.js introuvable"
  exit 1
fi

echo "✅ Fichier app.js trouvé"
echo ""

# Vérifier la détection Pass VIP
if grep -q "PASS VIP.*Détection" app.js; then
  echo "✅ Détection Pass VIP présente"
else
  echo "❌ Détection Pass VIP ABSENTE"
  exit 1
fi

# Vérifier l'appel proxy
if grep -q "pass-proxy" app.js; then
  echo "✅ Appel proxy Vercel présent"
else
  echo "❌ Appel proxy Vercel ABSENT"
  exit 1
fi

# Vérifier Content-Type text/plain
if grep -q '"Content-Type": "text/plain"' app.js; then
  echo "✅ Content-Type: text/plain configuré"
else
  echo "❌ Content-Type: text/plain ABSENT"
  exit 1
fi

# Vérifier la fonction de confirmation dédiée
if grep -q "afficherConfirmationPassVIP" app.js; then
  echo "✅ Confirmation Pass VIP dédiée présente"
else
  echo "❌ Confirmation Pass VIP dédiée ABSENTE"
  exit 1
fi

echo ""
echo "✅ Toutes les vérifications RÉUSSIES"
echo ""
echo "📊 Statistiques:"
grep -c "PASS VIP" app.js | xargs echo "   - Mentions 'PASS VIP':"
wc -l app.js | awk '{print "   - Lignes totales: " $1}'
