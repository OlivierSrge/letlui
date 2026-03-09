# L et Lui Signature — Guide pour Claude Code

## Projet
Site de **Wedding Planner** au Cameroun. Vente de **packs prestations mariage** (photographie, beauté, décoration, etc.). Paiement via **Orange Money** (numéro fixe, pas de lien). Système d'affiliation avec codes promo.

## Versions stables
- **v1** : première version stable (tag git `v1`)
- **v2** : ajout sélecteur de quantité + cache 3 couches + `produits.json` CDN + bouton "Mettre à jour le site" dans Google Sheets (tag git `v2`) ← **version actuelle**

## Stack technique (100% gratuit)
- **Frontend** : HTML/CSS/JS statique sur **Netlify** (déploiement auto via GitHub)
- **Backend** : **Google Apps Script** déployé en Web App
- **Base de données** : **Google Sheets** (4 onglets)
- **Images** : **Google Drive** (liens publics, convertis en `lh3.googleusercontent.com/d/FILE_ID`)

## Liens
- **Site live** : domaine Hostinger connecté via nameservers Netlify + https://letlui-signature.netlify.app/ (fallback)
- **GitHub** : https://github.com/OlivierSrge/letlui (branche `main`)
- **Netlify** : connecté au GitHub — chaque `git push origin main` redéploie automatiquement en ~30s

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
| `produit.html` | Page détail d'un pack — image, infos, sélecteur quantité, formulaire de réservation, overlay chargement |
| `style.css` | Design complet mobile-first (Inter + Playfair Display, noir/blanc/orange) |
| `app.js` | Logique frontend — cache 3 couches, filtres, validation code promo, quantité, commande, confirmation |
| `config.js` | Contient l'URL de l'API Apps Script (1 seule variable à changer si redéploiement) |
| `produits.json` | Snapshot statique des produits servi par Netlify CDN — mis à jour via bouton Google Sheets |
| `google-apps-script/Code.gs` | Backend complet — endpoints API + emails + CacheService + publication GitHub |
| `Code_a_copier.txt` | Copie du script à coller dans Apps Script (inclut `installerBoutique`). PAS dans git. |

## Système de cache 3 couches (pour performance en Afrique)
1. **localStorage** (TTL 5min) — instant pour les visiteurs qui reviennent + refresh silencieux en arrière-plan
2. **`/produits.json`** sur Netlify CDN (~100ms) — rapide pour les nouveaux visiteurs
3. **Apps Script API** — fallback uniquement si les 2 autres échouent

**Mise à jour du cache :** Dans Google Sheets → menu "L et Lui" → "Mettre à jour le site"
- Vide le CacheService Apps Script, relit les produits frais depuis le Sheet
- Pousse `produits.json` sur GitHub via l'API GitHub (token stocké dans Script Properties : `GITHUB_TOKEN`)
- Netlify redéploie en ~30s

**Important :** Les codes affiliés ne passent PAS par `produits.json` — ils sont toujours lus en temps réel depuis le Sheet.

## Sélecteur de quantité (ajouté en v2)
- Boutons `−` / `+` sur la page produit (min 1, max 10)
- Prix total = prix unitaire × quantité
- La quantité est envoyée dans le POST de commande
- Commission et réduction calculées sur le prix total
- Si quantité > 1 : affiché dans la page de confirmation et stocké dans Notes du Sheet

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
2. Remplit le formulaire (nom, tel, email, code promo optionnel, quantité)
3. Clic "Réserver maintenant" → POST vers Apps Script
4. Le script vérifie le code promo, calcule le montant final (prix × quantité − réduction), crée une ligne dans Commandes
5. **Email au vendeur** : récap complet + infos affilié + commission
6. **Email au client** : récap + numéro Orange Money pour payer
7. **Page confirmation** : récap + numéro Orange Money affiché directement

---

## Comment modifier le site

### Modifier le frontend (HTML/CSS/JS)
Claude travaille dans le worktree `compassionate-cerf`. Après modification :
```
git -C /Users/olivierserge/letlui checkout main
git -C /Users/olivierserge/letlui merge claude/compassionate-cerf
git -C /Users/olivierserge/letlui push origin main
```
Netlify redéploie automatiquement en ~30 secondes.

### Modifier le backend (Google Apps Script)
1. Modifier `google-apps-script/Code.gs` ET `Code_a_copier.txt` (les garder synchronisés)
2. L'utilisateur recolle le code dans Apps Script (Extensions > Apps Script)
3. Puis : **Déployer > Gérer les déploiements > crayon > Nouvelle version > Déployer**
4. IMPORTANT : utiliser "Nouvelle version" (pas "Nouveau déploiement") pour garder la même URL

### Modifier la structure du Google Sheet
1. Modifier la fonction `installerBoutique()` dans `Code_a_copier.txt`
2. L'utilisateur recolle et relance `installerBoutique` dans Apps Script
3. ⚠️ DANGER : `installerBoutique` fait un `clear()` sur chaque onglet — **toujours demander une sauvegarde avant**

## Points techniques importants
- Les formules dans `installerBoutique` doivent utiliser les noms **ANGLAIS** (IF, COUNTIF, SUMIF) — pas les noms français
- Les images Google Drive sont converties via `lh3.googleusercontent.com/d/FILE_ID`
- Le `.gitignore` exclut `Code_a_copier.txt` et `.DS_Store`
- L'affilié n'est PAS notifié par email quand son code est utilisé (feature pas encore implémentée)
- Le `config.js` contient l'URL API — à mettre à jour uniquement si "Nouveau déploiement" (pas "Nouvelle version")
- `GITHUB_TOKEN` est stocké dans Apps Script Script Properties (pas dans le code)

## Git
- Branche principale : `main`
- SSH configuré : `~/.ssh/id_ed25519` (StrictHostKeyChecking no dans `~/.ssh/config`)
- Remote SSH : `git@github.com:OlivierSrge/letlui.git`
- Commits signés par : Olivier SERGE (olivierfinestone@gmail.com)
- Tags : `v1` (version initiale stable), `v2` (version actuelle avec cache + quantité)
