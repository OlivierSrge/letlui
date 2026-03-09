# L et Lui Signature — Guide pour Claude Code

## Projet
Site de **Wedding Planner** au Cameroun. Vente de **packs prestations mariage** (photographie, beauté, décoration, etc.). Paiement via **Orange Money** (numéro fixe, pas de lien). Système d'affiliation avec codes promo.

## Stack technique (100% gratuit)
- **Frontend** : HTML/CSS/JS statique sur **Netlify** (déploiement auto via GitHub)
- **Backend** : **Google Apps Script** déployé en Web App
- **Base de données** : **Google Sheets** (4 onglets)
- **Images** : **Google Drive** (liens publics, convertis en `lh3.googleusercontent.com/d/FILE_ID`)

## Liens
- **Site live** : https://letlui-signature.netlify.app/
- **GitHub** : https://github.com/OlivierSrge/letlui (branche `main`)
- **Netlify** : connecté au GitHub — chaque `git push` redéploie automatiquement en ~30s

## Infos métier
- **Email vendeur** : olivierfinestone@gmail.com
- **Orange Money** : 6 93 40 79 64 — Olivier SERGE
- **Pays** : Cameroun
- **Devise** : FCFA
- **Fuseau horaire** : Africa/Douala

---

## Fichiers du projet

| Fichier | Rôle |
|---|---|
| `index.html` | Page d'accueil — bandeau promo, hero section, filtres catégories, grille des packs |
| `produit.html` | Page détail d'un pack — image, infos, formulaire de réservation, overlay chargement |
| `style.css` | Design complet mobile-first (Inter + Playfair Display, noir/blanc/orange) |
| `app.js` | Logique frontend — appels API, filtres, validation code promo, commande, confirmation |
| `config.js` | Contient l'URL de l'API Apps Script (1 seule variable à changer si redéploiement) |
| `google-apps-script/Code.gs` | Backend complet — endpoints API + emails + utilitaires |
| `Code_a_copier.txt` | Copie du script à coller dans Apps Script (inclut `installerBoutique`). PAS dans git. |

## Google Sheets — Structure des 4 onglets

### Onglet `Produits`
| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| Nom | Description | Prix | Catégorie | Image_URL | Description_Longue_HTML | Actif |

- **Description** : texte court affiché sur la page pack
- **Description_Longue_HTML** : HTML complet (headings, listes, etc.) affiché en bas de la page pack
- **Actif** : `OUI` ou `NON` — colonne **G** (index 6 dans le code)
- **Image_URL** : lien Google Drive, converti automatiquement par le backend

### Onglet `Affiliés_Codes`
| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Code_Promo | Nom_Affilié | Email_Affilié | Réduction_% | Commission_% | Actif | Nb_Commandes* | Montant_Généré* | Commission_À_Payer* |

*G, H, I sont auto-calculés par formules (COUNTIF/SUMIF en anglais)

### Onglet `Commandes`
| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Date | Client_Nom | Client_Tel | Client_Email | Produit | Prix_Original | Code_Utilisé | Affilié | Réduction_% | Montant_Final | Lien_Orange_Money | Statut | Notes |

### Onglet `Dashboard_Stats`
Formules de synthèse : total commandes, en attente/confirmées/annulées, CA, commissions.

## API Backend — 3 endpoints

```
GET  ?action=produits              → retourne tous les packs actifs en JSON
GET  ?action=valider_code&code=XX  → vérifie un code promo (valide/invalide + réduction%)
POST body={action:"commande",...}  → crée commande + envoie emails vendeur & client
```

## Flux de commande
1. Client choisit un pack sur le site
2. Remplit le formulaire (nom, tel, email, code promo optionnel)
3. Clic "Réserver maintenant" → POST vers Apps Script
4. Le script vérifie le code promo, calcule le montant final, crée une ligne dans Commandes
5. **Email au vendeur** : récap complet + infos affilié + commission
6. **Email au client** : récap + numéro Orange Money pour payer
7. **Page confirmation** : récap + numéro Orange Money affiché directement

---

## Comment modifier le site

### Modifier le frontend (HTML/CSS/JS)
1. Modifier les fichiers dans ce dossier
2. `git add <fichiers> && git commit -m "description" && git push`
3. Netlify redéploie automatiquement en ~30 secondes

### Modifier le backend (Google Apps Script)
1. Modifier `google-apps-script/Code.gs` ET `Code_a_copier.txt` (les garder synchronisés)
2. L'utilisateur doit recoller le code dans Apps Script (Extensions > Apps Script)
3. Puis : **Déployer > Gérer les déploiements > crayon > Nouvelle version > Déployer**
4. IMPORTANT : utiliser "Nouvelle version" (pas "Nouveau déploiement") pour garder la même URL

### Modifier la structure du Google Sheet
1. Modifier la fonction `installerBoutique()` dans `Code_a_copier.txt`
2. L'utilisateur recolle et relance `installerBoutique` dans Apps Script
3. ATTENTION : `installerBoutique` fait un `clear()` sur chaque onglet — les données existantes sont effacées

## Points techniques importants
- Les formules dans `installerBoutique` doivent utiliser les noms **ANGLAIS** (IF, COUNTIF, SUMIF) — pas les noms français
- Les images Google Drive sont converties via `lh3.googleusercontent.com/d/FILE_ID`
- Le `.gitignore` exclut `Code_a_copier.txt` et `.DS_Store`
- L'affilié n'est PAS notifié par email quand son code est utilisé (feature pas encore implémentée)
- Le `config.js` contient l'URL API — à mettre à jour uniquement si "Nouveau déploiement" (pas "Nouvelle version")

## Git
- Branche : `main`
- Commits signés par : Olivier SERGE (olivierfinestone@gmail.com)
