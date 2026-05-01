#!/usr/bin/env python3
"""Script de remplacement du message Pass VIP"""

import os
import shutil
from datetime import datetime

APP_JS = "app.js"

print("=" * 50)
print("REMPLACEMENT MESSAGE PASS VIP")
print("=" * 50)
print()

if not os.path.exists(APP_JS):
    print(f"❌ Fichier non trouvé : {APP_JS}")
    exit(1)

print(f"✅ Fichier trouvé : {APP_JS}")

backup = f"{APP_JS}.backup-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
shutil.copy2(APP_JS, backup)
print(f"✅ Backup créé : {backup}")
print()

with open(APP_JS, 'r', encoding='utf-8') as f:
    lines = f.readlines()

nouvelle_fonction = '''function afficherConfirmationPassVIP(data) {
  var container = document.getElementById("produit-detail");
  var timestamp = Date.now().toString(36).toUpperCase();
  var random = Math.random().toString(36).substring(2, 6).toUpperCase();
  var codeSuivi = 'PV-' + timestamp + '-' + random;
  
  container.innerHTML =
    '<div class="confirmation" style="max-width: 650px; margin: 0 auto;">' +
      '<div class="confirmation-icon">&#10003;</div>' +
      '<h1 style="color: #1A1A1A; margin-bottom: 8px;">✅ Commande enregistrée !</h1>' +
      '<p style="color: #666; margin-bottom: 24px;">Suivez les instructions ci-dessous pour finaliser votre Pass VIP.</p>' +
      '<div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">' +
        '<p style="margin: 0 0 8px 0; color: #666; font-size: 14px;">Montant à payer</p>' +
        '<p style="margin: 0; color: #1A1A1A; font-size: 36px; font-weight: bold;">' + formatPrix(data.montantFinal) + '</p>' +
      '</div>' +
      '<div style="background: linear-gradient(135deg, #F9F5F2 0%, #E8C4B8 100%); border-left: 4px solid #D4AF37; border-radius: 8px; padding: 20px; margin-bottom: 20px;">' +
        '<p style="margin: 0 0 12px 0; color: #1A1A1A; font-size: 16px; font-weight: 600;"><span style="margin-right: 8px;">📱</span> Effectuez votre paiement Orange Money</p>' +
        '<div style="background: white; padding: 12px; border-radius: 6px; margin-bottom: 12px;">' +
          '<p style="margin: 0 0 4px 0; color: #666; font-size: 12px;">Numéro Orange Money</p>' +
          '<p style="margin: 0; color: #D4AF37; font-size: 28px; font-weight: bold; letter-spacing: 2px; font-family: monospace;">693 407 964</p>' +
        '</div>' +
        '<div style="background: #E8F5E9; padding: 12px; border-radius: 6px;">' +
          '<p style="margin: 0 0 4px 0; color: #1B5E20; font-size: 12px; font-weight: 600;">✓ Bénéficiaire</p>' +
          '<p style="margin: 0; color: #2E7D32; font-size: 14px;">L&Lui Signature</p>' +
        '</div>' +
      '</div>' +
      '<div style="background: white; padding: 16px; border-radius: 8px; border: 2px dashed #D4AF37; margin-bottom: 20px;">' +
        '<p style="margin: 0 0 8px 0; color: #1A1A1A; font-size: 14px; font-weight: 600;"><span style="margin-right: 8px;">⏱️</span> Prochaine étape</p>' +
        '<p style="margin: 0; color: #666; font-size: 13px; line-height: 1.6;">Un administrateur validera votre paiement et vous enverra un email avec votre code promo et les instructions d\\'activation de votre Pass VIP.</p>' +
      '</div>' +
      '<div class="recap-box">' +
        '<div class="recap-ligne"><span>Email</span><span>' + data.email + '</span></div>' +
        '<div class="recap-ligne"><span>Pass</span><span>' + data.typePass + '</span></div>' +
        (data.codePromo ? '<div class="recap-ligne"><span>Code promo</span><span>' + data.codePromo + ' (-' + data.reduction + '%)</span></div>' : '') +
        '<div class="recap-ligne"><span>Code de suivi</span><span style="font-family: monospace;">' + codeSuivi + '</span></div>' +
      '</div>' +
      '<a href="index.html" class="btn-retour-accueil">Retour au catalogue</a>' +
    '</div>';
  window.scrollTo({ top: 0, behavior: 'smooth' });
  console.log("✅ Commande Pass VIP envoyée - Code:", codeSuivi);
}
'''

print("🔄 Remplacement des lignes 523-545...")
nouvelles_lines = lines[:522] + [nouvelle_fonction + '\n'] + lines[545:]

with open(APP_JS, 'w', encoding='utf-8') as f:
    f.writelines(nouvelles_lines)

print("✅ Remplacement effectué !")
print()

print("VÉRIFICATION :")
with open(APP_JS, 'r') as f:
    content = f.read()
    if '693 407 964' in content:
        print("✅ Numéro Orange Money trouvé")
    if 'codeSuivi' in content:
        print("✅ Code de suivi trouvé")
print()
print("Prochaine étape : python3 -m http.server 8000")
