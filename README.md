# L et Lui Signature — Guide de déploiement

Boutique e-commerce avec système d'affiliation et paiement Orange Money.

---

## Étape 1 — Créer le Google Sheet

1. Allez sur **sheets.google.com** et créez un nouveau classeur
2. Nommez-le **"L et Lui Signature"**
3. Créez **4 onglets** (en cliquant sur le `+` en bas) :

### Onglet `Produits`
Dans la première ligne (en-têtes), écrivez dans chaque colonne :

| A | B | C | D | E | F |
|---|---|---|---|---|---|
| Nom | Description | Prix | Catégorie | Image_URL | Actif |

### Onglet `Affiliés_Codes`
En-têtes :

| A | B | C | D | E | F | G | H | I |
|---|---|---|---|---|---|---|---|---|
| Code_Promo | Nom_Affilié | Email_Affilié | Réduction_% | Commission_% | Actif | Nb_Commandes | Montant_Généré | Commission_À_Payer |

**Formules automatiques** (à mettre dans G2, H2, I2 puis tirer vers le bas) :

- **G2** (Nb commandes) :
  ```
  =SI(A2="";"";NB.SI(Commandes!G:G;A2))
  ```

- **H2** (Montant généré) :
  ```
  =SI(A2="";"";SOMME.SI(Commandes!G:G;A2;Commandes!J:J))
  ```

- **I2** (Commission à payer) :
  ```
  =SI(A2="";"";H2*E2/100)
  ```

### Onglet `Commandes`
En-têtes :

| A | B | C | D | E | F | G | H | I | J | K | L | M |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Date | Client_Nom | Client_Tel | Client_Email | Produit | Prix_Original | Code_Utilisé | Affilié | Réduction_% | Montant_Final | Lien_Orange_Money | Statut | Notes |

### Onglet `Dashboard_Stats`
Ce sont des formules de synthèse. Voici un exemple simple :

Dans la cellule **A1** : `Tableau de bord`

| Cellule | Contenu | Formule |
|---|---|---|
| A3 | Total commandes | |
| B3 | *(formule)* | `=NB.SI(Commandes!L:L;"<>")` |
| A4 | Commandes en attente | |
| B4 | *(formule)* | `=NB.SI(Commandes!L:L;"En attente")` |
| A5 | Commandes confirmées | |
| B5 | *(formule)* | `=NB.SI(Commandes!L:L;"Confirmée")` |
| A6 | Commandes annulées | |
| B6 | *(formule)* | `=NB.SI(Commandes!L:L;"Annulée")` |
| A8 | Chiffre d'affaires (confirmé) | |
| B8 | *(formule)* | `=SOMME.SI(Commandes!L:L;"Confirmée";Commandes!J:J)` |
| A9 | Total commissions à payer | |
| B9 | *(formule)* | `=SOMME(Affiliés_Codes!I:I)` |

---

## Étape 2 — Installer le script backend (Google Apps Script)

1. Dans votre Google Sheet, cliquez sur **Extensions** > **Apps Script**
2. Un éditeur de code s'ouvre. **Supprimez tout le contenu** qui s'y trouve
3. Ouvrez le fichier `google-apps-script/Code.gs` de ce projet
4. **Copiez-collez tout le contenu** dans l'éditeur Apps Script
5. **IMPORTANT** : À la ligne 8, remplacez `VOTRE_EMAIL@gmail.com` par votre vraie adresse email
6. Cliquez sur l'icône de disquette (ou Ctrl+S) pour sauvegarder

### Déployer comme Web App :

1. Cliquez sur **Déployer** > **Nouveau déploiement**
2. Cliquez sur la roue dentée à côté de "Sélectionner le type" > **Application Web**
3. **Description** : "API Boutique"
4. **Exécuter en tant que** : Moi
5. **Qui peut accéder** : Tout le monde
6. Cliquez sur **Déployer**
7. Google vous demandera d'autoriser l'accès — cliquez sur **Autoriser**
   - Si un avertissement apparaît ("Cette application n'est pas validée"), cliquez sur **Paramètres avancés** > **Accéder à [nom du projet]**
8. **Copiez l'URL** qui s'affiche (elle ressemble à `https://script.google.com/macros/s/XXXXX/exec`)

> **Gardez cette URL !** Vous en aurez besoin pour l'étape suivante.

### En cas de modification du script :
Si vous modifiez le code plus tard, vous devez redéployer :
1. **Déployer** > **Gérer les déploiements**
2. Cliquez sur le crayon (modifier)
3. Dans **Version**, sélectionnez **Nouvelle version**
4. Cliquez sur **Déployer**

---

## Étape 3 — Configurer le site web

1. Ouvrez le fichier **`config.js`** avec un éditeur de texte (Bloc-notes, TextEdit, etc.)
2. Remplacez `COLLER_VOTRE_URL_ICI` par l'URL copiée à l'étape 2
3. Sauvegardez le fichier

---

## Étape 4 — Déployer le site sur Netlify

1. Allez sur **netlify.com** et connectez-vous (créez un compte gratuit si nécessaire)
2. Sur votre tableau de bord Netlify, vous verrez une zone qui dit **"Drag and drop your site output folder here"**
3. Depuis votre ordinateur, glissez-déposez **le dossier du projet** (celui qui contient `index.html`, `produit.html`, `style.css`, `app.js`, `config.js`) directement sur cette zone
   - **Attention** : ne glissez PAS le dossier `google-apps-script`, seulement les 5 fichiers du site
4. Netlify va automatiquement publier votre site et vous donner une URL (ex: `random-name-123.netlify.app`)
5. Vous pouvez renommer le site dans **Site settings** > **Change site name** (ex: `letlui-signature.netlify.app`)

---

## Étape 5 — Préparer les images produits sur Google Drive

1. Dans Google Drive, créez un dossier **"Images Boutique"**
2. Faites un clic droit sur le dossier > **Partager** > **Paramètres de partage**
3. Changez en **"Tout le monde avec le lien"** > rôle **Lecteur**
4. Uploadez vos photos de produits dans ce dossier

### Pour obtenir le lien d'une image :
1. Clic droit sur l'image > **Partager** > **Copier le lien**
2. Le lien ressemblera à : `https://drive.google.com/file/d/XXXXXXXXX/view?usp=sharing`
3. Collez ce lien dans la colonne **Image_URL** de l'onglet Produits
4. Le script convertira automatiquement ce lien en image affichable

---

## Étape 6 — Ajouter votre premier produit

Dans l'onglet **Produits** de votre Google Sheet, remplissez la ligne 2 :

| Nom | Description | Prix | Catégorie | Image_URL | Actif |
|---|---|---|---|---|---|
| Chaussures Nike Air | Confortables, disponibles en taille 42 et 43 | 15000 | Mode | *(lien Drive)* | OUI |

Allez sur votre site Netlify — le produit devrait apparaître !

---

## Étape 7 — Créer un code promo affilié

Dans l'onglet **Affiliés_Codes**, remplissez la ligne 2 :

| Code_Promo | Nom_Affilié | Email_Affilié | Réduction_% | Commission_% | Actif |
|---|---|---|---|---|---|
| JEAN10 | Jean Koné | jean@email.com | 10 | 15 | OUI |

> Les colonnes G, H, I se calculeront automatiquement grâce aux formules.

---

## Comment ça marche au quotidien

### Quand un client passe commande :
1. Vous recevez un **email** avec tous les détails
2. Vous envoyez le **lien Orange Money** au client par email
3. Une fois le paiement reçu, changez le **Statut** à **"Confirmée"** dans l'onglet Commandes

### Pour ajouter un produit :
- Ajoutez une ligne dans l'onglet **Produits** avec `OUI` dans la colonne Actif

### Pour désactiver un produit :
- Changez `OUI` en `NON` dans la colonne Actif

### Pour créer un code promo :
- Ajoutez une ligne dans l'onglet **Affiliés_Codes**

### Pour désactiver un code promo :
- Changez `OUI` en `NON` dans la colonne Actif

### Pour voir les statistiques :
- Consultez l'onglet **Dashboard_Stats**

---

## Résolution de problèmes

**Les produits ne s'affichent pas :**
- Vérifiez que l'URL dans `config.js` est correcte
- Vérifiez que le script est bien déployé en tant que Web App
- Vérifiez qu'au moins un produit a `OUI` dans la colonne Actif

**Les images ne s'affichent pas :**
- Vérifiez que le dossier Google Drive est partagé en mode public
- Vérifiez que le lien est bien collé dans la colonne Image_URL

**Le code promo ne fonctionne pas :**
- Vérifiez que le code est bien dans l'onglet Affiliés_Codes
- Vérifiez que la colonne Actif est à `OUI`

**L'email de notification n'arrive pas :**
- Vérifiez l'adresse email dans le script (ligne 8 de Code.gs)
- Vérifiez votre dossier spam
- Google limite l'envoi à ~100 emails/jour avec Apps Script gratuit
