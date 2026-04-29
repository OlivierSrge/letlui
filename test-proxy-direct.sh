#!/bin/bash

# Test direct du proxy Pass VIP Vercel
# Usage: ./test-proxy-direct.sh

echo "🧪 Test proxy Pass VIP — POST direct vers Vercel"
echo "================================================"

PROXY_URL="https://llui-signature-hebergements.vercel.app/api/boutique/pass-proxy"

PAYLOAD='{
  "nomClient": "Test Client",
  "email": "test@example.com",
  "telephone": "+225 07 12 34 56",
  "gradePasse": "Or",
  "duree": "15 jours",
  "montantFinal": 7500,
  "codePromo": null,
  "nomAffilie": null,
  "emailAffilie": null
}'

echo ""
echo "📡 Envoi vers: $PROXY_URL"
echo "📦 Payload:"
echo "$PAYLOAD" | jq .
echo ""

# Curl avec timeout et affichage détaillé
curl -X POST "$PROXY_URL" \
  -H "Content-Type: text/plain" \
  -d "$PAYLOAD" \
  --max-time 30 \
  --verbose \
  2>&1 | tee proxy-test-result.txt

echo ""
echo "✅ Test terminé — résultat sauvegardé dans proxy-test-result.txt"
