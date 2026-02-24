// ============================================================
// LETLUI BOUTIQUE — Google Apps Script (Backend)
// ============================================================
// Ce fichier est à copier-coller dans Google Apps Script
// (Extensions > Apps Script depuis votre Google Sheet)
// ============================================================

// --- CONFIGURATION ---
var EMAIL_VENDEUR = "olivierfinestone@gmail.com";
var ORANGE_MONEY_NUMERO = "6 93 40 79 64";
var ORANGE_MONEY_NOM = "Olivier SERGE";

// --- Noms des onglets ---
var ONGLET_PRODUITS = "Produits";
var ONGLET_AFFILIES = "Affiliés_Codes";
var ONGLET_COMMANDES = "Commandes";

// ============================================================
// POINT D'ENTRÉE — Requêtes GET
// ============================================================
function doGet(e) {
  var action = e.parameter.action;
  var resultat;

  if (action === "produits") {
    resultat = getProduits();
  } else if (action === "valider_code") {
    resultat = validerCode(e.parameter.code);
  } else {
    resultat = { erreur: "Action inconnue" };
  }

  return ContentService
    .createTextOutput(JSON.stringify(resultat))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// POINT D'ENTRÉE — Requêtes POST
// ============================================================
function doPost(e) {
  var data;
  try {
    data = JSON.parse(e.postData.contents);
  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ succes: false, message: "Données invalides" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var resultat;

  if (data.action === "commande") {
    resultat = creerCommande(data);
  } else {
    resultat = { succes: false, message: "Action inconnue" };
  }

  return ContentService
    .createTextOutput(JSON.stringify(resultat))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// GET PRODUITS — Retourne tous les produits actifs
// ============================================================
function getProduits() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ONGLET_PRODUITS);
  var data = sheet.getDataRange().getValues();
  var headers = data[0];
  var produits = [];

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var actif = String(row[5]).toUpperCase().trim();

    if (actif === "OUI") {
      produits.push({
        nom: row[0],
        description: row[1],
        prix: Number(row[2]),
        categorie: row[3],
        image: convertirLienDrive(String(row[4])),
      });
    }
  }

  return { produits: produits };
}

// ============================================================
// VALIDER CODE PROMO
// ============================================================
function validerCode(code) {
  if (!code || code.trim() === "") {
    return { valide: false, message: "Aucun code fourni" };
  }

  code = code.trim().toUpperCase();
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ONGLET_AFFILIES);
  var data = sheet.getDataRange().getValues();

  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var codeSheet = String(row[0]).toUpperCase().trim();
    var actif = String(row[5]).toUpperCase().trim();

    if (codeSheet === code && actif === "OUI") {
      return {
        valide: true,
        reduction: Number(row[3]),
        affilié: row[1],
        message: "Code valide ! Réduction de " + row[3] + "% appliquée",
      };
    }
  }

  return { valide: false, message: "Code invalide ou expiré" };
}

// ============================================================
// CRÉER COMMANDE
// ============================================================
function creerCommande(data) {
  // Validation des champs obligatoires
  if (!data.nom_client || data.nom_client.trim().length < 2) {
    return { succes: false, message: "Nom invalide" };
  }
  if (!data.tel_client || data.tel_client.trim().length < 6) {
    return { succes: false, message: "Numéro de téléphone invalide" };
  }
  if (!data.email_client || data.email_client.indexOf("@") === -1) {
    return { succes: false, message: "Email invalide" };
  }
  if (!data.produit_nom) {
    return { succes: false, message: "Produit manquant" };
  }

  // Limites de longueur (anti-spam)
  if (data.nom_client.length > 100 || data.tel_client.length > 30 || data.email_client.length > 100) {
    return { succes: false, message: "Données trop longues" };
  }

  var prixOriginal = Number(data.prix);
  var codePromo = data.code_promo ? data.code_promo.trim().toUpperCase() : "";
  var nomAffilie = "";
  var emailAffilie = "";
  var reductionPourcent = 0;
  var commissionPourcent = 0;

  // Vérifier le code promo si fourni
  if (codePromo !== "") {
    var sheetAffil = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ONGLET_AFFILIES);
    var dataAffil = sheetAffil.getDataRange().getValues();

    for (var i = 1; i < dataAffil.length; i++) {
      var row = dataAffil[i];
      var codeSheet = String(row[0]).toUpperCase().trim();
      var actif = String(row[5]).toUpperCase().trim();

      if (codeSheet === codePromo && actif === "OUI") {
        nomAffilie = row[1];
        emailAffilie = row[2];
        reductionPourcent = Number(row[3]);
        commissionPourcent = Number(row[4]);
        break;
      }
    }
  }

  // Calculer le montant final
  var reduction = Math.round(prixOriginal * reductionPourcent / 100);
  var montantFinal = prixOriginal - reduction;
  var commission = Math.round(montantFinal * commissionPourcent / 100);

  // Date formatée
  var maintenant = new Date();
  var dateFormatee = Utilities.formatDate(maintenant, "Africa/Douala", "yyyy-MM-dd HH:mm");

  // Ajouter la ligne dans l'onglet Commandes
  var sheetCmd = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ONGLET_COMMANDES);
  sheetCmd.appendRow([
    dateFormatee,
    data.nom_client.trim(),
    data.tel_client.trim(),
    data.email_client.trim(),
    data.produit_nom,
    prixOriginal,
    codePromo || "",
    nomAffilie || "",
    reductionPourcent || 0,
    montantFinal,
    "",  // Lien Orange Money (à remplir par le vendeur)
    "En attente",
    "",  // Notes
  ]);

  // Envoyer email au vendeur
  envoyerEmailVendeur({
    produit: data.produit_nom,
    prix_original: prixOriginal,
    montant_final: montantFinal,
    reduction_pourcent: reductionPourcent,
    nom_client: data.nom_client.trim(),
    tel_client: data.tel_client.trim(),
    email_client: data.email_client.trim(),
    code_promo: codePromo,
    nom_affilie: nomAffilie,
    email_affilie: emailAffilie,
    commission: commission,
    commission_pourcent: commissionPourcent,
    date: dateFormatee,
  });

  // Envoyer email au client avec instructions de paiement
  envoyerEmailClient({
    nom_client: data.nom_client.trim(),
    email_client: data.email_client.trim(),
    produit: data.produit_nom,
    montant_final: montantFinal,
  });

  return {
    succes: true,
    message: "Commande enregistrée avec succès",
    client: data.nom_client.trim(),
    montant_final: montantFinal,
    code_promo: codePromo || null,
    reduction: reductionPourcent,
  };
}

// ============================================================
// ENVOI EMAIL AU VENDEUR
// ============================================================
function envoyerEmailVendeur(info) {
  var sujet = "Nouvelle commande — " + info.produit;

  var corps =
    "Nouvelle commande reçue !\n\n" +
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "PRODUIT : " + info.produit + "\n" +
    "MONTANT : " + formatFCFA(info.montant_final) + " FCFA";

  if (info.reduction_pourcent > 0) {
    corps += " (réduction " + info.reduction_pourcent + "% appliquée, prix original : " + formatFCFA(info.prix_original) + " FCFA)";
  }

  corps += "\n━━━━━━━━━━━━━━━━━━━━\n\n";

  corps +=
    "CLIENT\n" +
    "Nom : " + info.nom_client + "\n" +
    "Téléphone : " + info.tel_client + "\n" +
    "Email : " + info.email_client + "\n\n";

  if (info.code_promo) {
    corps +=
      "CODE PROMO UTILISÉ : " + info.code_promo + "\n" +
      "AFFILIÉ : " + info.nom_affilie + " (" + info.email_affilie + ")\n" +
      "Commission due : " + formatFCFA(info.commission) + " FCFA (" + info.commission_pourcent + "%)\n\n";
  }

  corps +=
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "Action requise :\n" +
    "1. Envoyer le lien de paiement Orange Money de " + formatFCFA(info.montant_final) + " FCFA au client par email\n" +
    "2. Attendre la confirmation du paiement\n" +
    "3. Aller dans Google Sheets > Commandes\n" +
    "4. Changer le statut de cette commande à \"Confirmée\"\n" +
    "━━━━━━━━━━━━━━━━━━━━\n\n" +
    "Date commande : " + info.date;

  try {
    MailApp.sendEmail(EMAIL_VENDEUR, sujet, corps);
  } catch (err) {
    Logger.log("Erreur envoi email : " + err.message);
  }
}

// ============================================================
// ENVOI EMAIL AU CLIENT — Instructions de paiement
// ============================================================
function envoyerEmailClient(info) {
  var sujet = "L et Lui Signature — Votre commande pour " + info.produit;

  var corps =
    "Bonjour " + info.nom_client + ",\n\n" +
    "Merci pour votre commande !\n\n" +
    "━━━━━━━━━━━━━━━━━━━━\n" +
    "RÉCAPITULATIF\n" +
    "Produit : " + info.produit + "\n" +
    "Montant à payer : " + formatFCFA(info.montant_final) + " FCFA\n" +
    "━━━━━━━━━━━━━━━━━━━━\n\n" +
    "Pour finaliser votre commande, envoyez " + formatFCFA(info.montant_final) + " FCFA par Orange Money au :\n\n" +
    "Numéro : " + ORANGE_MONEY_NUMERO + "\n" +
    "Nom du titulaire : " + ORANGE_MONEY_NOM + "\n\n" +
    "━━━━━━━━━━━━━━━━━━━━\n\n" +
    "Votre commande sera confirmée dès réception du paiement.\n\n" +
    "Merci pour votre confiance !\n" +
    "L'équipe L et Lui Signature";

  try {
    MailApp.sendEmail(info.email_client, sujet, corps);
  } catch (err) {
    Logger.log("Erreur envoi email client : " + err.message);
  }
}

// ============================================================
// UTILITAIRES
// ============================================================

// Convertir lien Google Drive en lien image direct
function convertirLienDrive(url) {
  if (!url) return "";

  var fileId = "";

  // Format : https://drive.google.com/file/d/FILE_ID/view
  var match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
  if (match) {
    fileId = match[1];
  }

  // Format : https://drive.google.com/open?id=FILE_ID
  if (!fileId) {
    match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match) {
      fileId = match[1];
    }
  }

  if (fileId) {
    return "https://lh3.googleusercontent.com/d/" + fileId;
  }

  // Déjà au bon format ou URL externe
  return url;
}

// Formater un nombre avec séparateur de milliers
function formatFCFA(n) {
  return Number(n).toLocaleString("fr-FR");
}
