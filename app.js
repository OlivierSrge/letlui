// ============================================================
// L ET LUI SIGNATURE — Logique frontend
// ============================================================

// --- Utilitaires ---

function formatPrix(montant) {
  return Number(montant).toLocaleString("fr-FR") + " " + CONFIG.DEVISE;
}

function getParam(nom) {
  return new URLSearchParams(window.location.search).get(nom);
}

async function appelerAPI(params) {
  var url = new URL(CONFIG.API_URL);
  Object.keys(params).forEach(function (k) {
    url.searchParams.append(k, params[k]);
  });
  var resp = await fetch(url.toString());
  return resp.json();
}

async function posterAPI(data) {
  var resp = await fetch(CONFIG.API_URL, {
    method: "POST",
    headers: { "Content-Type": "text/plain" },
    body: JSON.stringify(data),
  });
  return resp.json();
}

// Placeholder SVG pour images manquantes
var IMG_PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 500' fill='none'%3E%3Crect width='400' height='500' fill='%23F0F0F0'/%3E%3Cpath d='M180 220h40v60h-40z' fill='%23DDD'/%3E%3Ccircle cx='200' cy='200' r='20' fill='%23DDD'/%3E%3C/svg%3E";

// ============================================================
// PAGE CATALOGUE (index.html)
// ============================================================

async function chargerCatalogue() {
  var grille = document.getElementById("produits-grid");
  var filtresContainer = document.getElementById("filtres");
  if (!grille || !filtresContainer) return;

  try {
    var data = await appelerAPI({ action: "produits" });
    var produits = data.produits || [];

    // Extraire les catégories uniques
    var categories = [];
    produits.forEach(function (p) {
      if (p.categorie && categories.indexOf(p.categorie) === -1) {
        categories.push(p.categorie);
      }
    });

    // Créer les boutons filtres
    var filtresHTML = '<button class="filtre-btn actif" data-categorie="tous">Tous</button>';
    categories.forEach(function (cat) {
      filtresHTML += '<button class="filtre-btn" data-categorie="' + cat + '">' + cat + "</button>";
    });
    document.querySelector(".filtres-list").innerHTML = filtresHTML;

    // Afficher les produits
    function afficherProduits(filtre) {
      var html = "";
      var produitsFiltrés = filtre === "tous"
        ? produits
        : produits.filter(function (p) { return p.categorie === filtre; });

      if (produitsFiltrés.length === 0) {
        html = '<div class="vide"><p>Aucun pack dans cette catégorie pour le moment.</p></div>';
      } else {
        produitsFiltrés.forEach(function (p, index) {
          // Trouver l'index original dans la liste complète
          var origIndex = produits.indexOf(p);
          html +=
            '<a href="produit.html?id=' + origIndex + '" class="produit-card" style="animation-delay:' + (index * 0.08) + 's">' +
              '<div class="produit-card-img-wrap">' +
                '<img class="produit-card-img" src="' + (p.image || IMG_PLACEHOLDER) + '" alt="' + p.nom + '" loading="lazy" onerror="this.src=\'' + IMG_PLACEHOLDER + '\'">' +
                '<div class="produit-card-overlay"><span>Voir le pack</span></div>' +
              '</div>' +
              '<div class="produit-card-body">' +
                '<div class="produit-card-categorie">' + (p.categorie || "") + "</div>" +
                '<div class="produit-card-nom">' + p.nom + "</div>" +
                '<div class="produit-card-prix">' + formatPrix(p.prix) + "</div>" +
              "</div>" +
            "</a>";
        });
      }
      grille.innerHTML = html;
    }

    afficherProduits("tous");

    // Gestion des filtres
    document.querySelector(".filtres-list").addEventListener("click", function (e) {
      if (!e.target.classList.contains("filtre-btn")) return;
      document.querySelectorAll(".filtre-btn").forEach(function (b) {
        b.classList.remove("actif");
      });
      e.target.classList.add("actif");
      afficherProduits(e.target.dataset.categorie);
    });
  } catch (err) {
    grille.innerHTML =
      '<div class="erreur-msg">' +
        '<h2>Impossible de charger les packs</h2>' +
        '<p>Vérifiez votre connexion internet et réessayez.</p>' +
      '</div>';
  }
}

// ============================================================
// PAGE PRODUIT (produit.html)
// ============================================================

var produitActuel = null;
var codePromoValide = null;
var reductionPourcent = 0;

async function chargerProduit() {
  var container = document.getElementById("produit-detail");
  if (!container) return;

  var id = getParam("id");
  if (id === null) {
    container.innerHTML = '<div class="erreur-msg"><h2>Pack introuvable</h2><p><a href="index.html" class="btn-retour">&larr; Retour au catalogue</a></p></div>';
    return;
  }

  try {
    var data = await appelerAPI({ action: "produits" });
    var produits = data.produits || [];
    var produit = produits[parseInt(id)];

    if (!produit) {
      container.innerHTML = '<div class="erreur-msg"><h2>Pack introuvable</h2><p><a href="index.html" class="btn-retour">&larr; Retour au catalogue</a></p></div>';
      return;
    }

    produitActuel = produit;
    document.title = produit.nom + " — " + CONFIG.NOM_BOUTIQUE;

    container.innerHTML =
      '<a href="index.html" class="btn-retour">&larr; Retour au catalogue</a>' +

      '<div class="produit-layout">' +
        // Colonne image
        '<div class="produit-galerie">' +
          '<img class="produit-detail-img" src="' + (produit.image || IMG_PLACEHOLDER) + '" alt="' + produit.nom + '" onerror="this.src=\'' + IMG_PLACEHOLDER + '\'">' +
        '</div>' +

        // Colonne infos
        '<div class="produit-info">' +
          '<div class="produit-detail-categorie">' + (produit.categorie || "") + '</div>' +
          '<h1 class="produit-detail-nom">' + produit.nom + '</h1>' +
          '<div class="produit-detail-prix">' + formatPrix(produit.prix) + '</div>' +
          '<div class="produit-detail-divider"></div>' +
          '<p class="produit-detail-desc">' + (produit.description || "") + '</p>' +

          // Trust badges
          '<div class="trust-badges">' +
            '<div class="trust-badge">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' +
              'Paiement sécurisé' +
            '</div>' +
            '<div class="trust-badge">' +
              '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 3a4 4 0 1 0 0 8 4 4 0 0 0 0-8z"/></svg>' +
              'Service personnalisé' +
            '</div>' +
          '</div>' +

          // Formulaire
          '<div class="commande-form">' +
            '<h2>Réserver ce pack</h2>' +

            '<div class="form-group">' +
              '<label for="nom">Nom complet <span class="obligatoire">*</span></label>' +
              '<input type="text" id="nom" placeholder="Ex : Marie Diallo" required autocomplete="name">' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="tel">Téléphone <span class="obligatoire">*</span></label>' +
              '<input type="tel" id="tel" placeholder="Ex : +225 07 XX XX XX" required autocomplete="tel">' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="email">Email <span class="obligatoire">*</span></label>' +
              '<input type="email" id="email" placeholder="Ex : marie@gmail.com" required autocomplete="email">' +
            '</div>' +

            '<div class="form-group">' +
              '<label for="code_promo">Code promo</label>' +
              '<div class="promo-zone">' +
                '<input type="text" id="code_promo" placeholder="Entrer un code">' +
                '<button type="button" class="btn-verifier" id="btn-verifier">Appliquer</button>' +
              '</div>' +
              '<div class="promo-msg" id="promo-msg"></div>' +
            '</div>' +

            '<div class="prix-recap" id="prix-recap">' +
              '<div class="prix-ligne total"><span>Total</span><span>' + formatPrix(produit.prix) + '</span></div>' +
            '</div>' +

            '<button type="button" class="btn-commander" id="btn-commander">Réserver maintenant</button>' +
          '</div>' +
        '</div>' +
      '</div>';

    // Événements
    document.getElementById("btn-verifier").addEventListener("click", verifierCode);
    document.getElementById("btn-commander").addEventListener("click", passerCommande);
    document.getElementById("code_promo").addEventListener("keydown", function (e) {
      if (e.key === "Enter") { e.preventDefault(); verifierCode(); }
    });

  } catch (err) {
    container.innerHTML =
      '<div class="erreur-msg"><h2>Impossible de charger le pack</h2><p>Vérifiez votre connexion internet et réessayez.</p></div>';
  }
}

async function verifierCode() {
  var codeInput = document.getElementById("code_promo");
  var msg = document.getElementById("promo-msg");
  var code = codeInput.value.trim().toUpperCase();

  if (!code) {
    msg.textContent = "";
    msg.className = "promo-msg";
    codePromoValide = null;
    reductionPourcent = 0;
    majPrixRecap();
    return;
  }

  msg.textContent = "Vérification...";
  msg.className = "promo-msg";

  try {
    var data = await appelerAPI({ action: "valider_code", code: code });

    if (data.valide) {
      codePromoValide = code;
      reductionPourcent = data.reduction;
      msg.textContent = "Code valide ! -" + data.reduction + "% appliqué";
      msg.className = "promo-msg succes";
    } else {
      codePromoValide = null;
      reductionPourcent = 0;
      msg.textContent = data.message || "Code invalide ou expiré";
      msg.className = "promo-msg erreur";
    }
    majPrixRecap();
  } catch (err) {
    msg.textContent = "Erreur de vérification, réessayez";
    msg.className = "promo-msg erreur";
  }
}

function majPrixRecap() {
  var recap = document.getElementById("prix-recap");
  if (!produitActuel || !recap) return;

  var prix = produitActuel.prix;
  if (reductionPourcent > 0) {
    var reduction = Math.round(prix * reductionPourcent / 100);
    var total = prix - reduction;
    recap.innerHTML =
      '<div class="prix-ligne barre"><span>Prix original</span><span>' + formatPrix(prix) + '</span></div>' +
      '<div class="prix-ligne reduction"><span>Réduction (' + reductionPourcent + '%)</span><span>-' + formatPrix(reduction) + '</span></div>' +
      '<div class="prix-ligne total"><span>Total</span><span>' + formatPrix(total) + '</span></div>';
  } else {
    recap.innerHTML =
      '<div class="prix-ligne total"><span>Total</span><span>' + formatPrix(prix) + '</span></div>';
  }
}

async function passerCommande() {
  var nom = document.getElementById("nom").value.trim();
  var tel = document.getElementById("tel").value.trim();
  var email = document.getElementById("email").value.trim();

  // Validation
  if (!nom) { alert("Veuillez entrer votre nom complet."); document.getElementById("nom").focus(); return; }
  if (!tel) { alert("Veuillez entrer votre numéro de téléphone."); document.getElementById("tel").focus(); return; }
  if (!email) { alert("Veuillez entrer votre adresse email."); document.getElementById("email").focus(); return; }
  if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) { alert("Veuillez entrer un email valide."); document.getElementById("email").focus(); return; }

  // Afficher overlay
  document.getElementById("overlay").classList.add("visible");
  document.getElementById("btn-commander").disabled = true;

  try {
    var data = await posterAPI({
      action: "commande",
      nom_client: nom,
      tel_client: tel,
      email_client: email,
      produit_nom: produitActuel.nom,
      prix: produitActuel.prix,
      code_promo: codePromoValide || "",
    });

    document.getElementById("overlay").classList.remove("visible");

    if (data.succes) {
      afficherConfirmation(data);
    } else {
      alert("Erreur : " + (data.message || "Impossible de passer la commande. Réessayez."));
      document.getElementById("btn-commander").disabled = false;
    }
  } catch (err) {
    document.getElementById("overlay").classList.remove("visible");
    alert("Erreur de connexion. Vérifiez votre connexion internet et réessayez.");
    document.getElementById("btn-commander").disabled = false;
  }
}

function afficherConfirmation(data) {
  var container = document.getElementById("produit-detail");
  container.innerHTML =
    '<div class="confirmation">' +
      '<div class="confirmation-icon">&#10003;</div>' +
      '<h1>Réservation confirmée !</h1>' +
      '<p>Merci pour votre confiance ! Vous allez recevoir les instructions de paiement par email très prochainement. Notre équipe vous contactera pour les détails de votre prestation.</p>' +
      '<div class="recap-box">' +
        '<div class="recap-ligne"><span>Produit</span><span>' + produitActuel.nom + '</span></div>' +
        '<div class="recap-ligne"><span>Client</span><span>' + data.client + '</span></div>' +
        (data.code_promo ? '<div class="recap-ligne"><span>Code promo</span><span>' + data.code_promo + ' (-' + data.reduction + '%)</span></div>' : '') +
        '<div class="recap-ligne"><span>Montant à payer</span><span>' + formatPrix(data.montant_final) + '</span></div>' +
      '</div>' +
      '<a href="index.html" class="btn-retour-accueil">Voir nos autres packs</a>' +
    '</div>';

  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================
// INITIALISATION
// ============================================================

document.addEventListener("DOMContentLoaded", function () {
  var page = window.location.pathname.split("/").pop() || "index.html";

  if (page === "index.html" || page === "") {
    chargerCatalogue();
  } else if (page === "produit.html") {
    chargerProduit();
  }
});
