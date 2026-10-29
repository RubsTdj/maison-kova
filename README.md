# Maison KOVA

Site de la marque Maison KOVA. Signature : « Plus qu'un style, une vision ». HTML, CSS et JavaScript purs : aucun framework, aucun build. Les polices viennent de Google Fonts.

Deux thèmes, une même marque, textes au vouvoiement :

- **Luxe silencieux (noir)** pour raconter la marque : accueil et La Maison. Noir pur, typographie fine en capitales espacées, presque pas de texte, très grandes images.
- **Maison éditoriale (crème)** pour acheter : boutique, fiches produit, panier, pages d'information. Fond lumineux, codes e-commerce classiques, parcours évident jusqu'au paiement.

Le thème se choisit par la classe du `<body>` : `theme-noir` ou `theme-clair`.

En ligne (GitHub Pages) : https://rubstdj.github.io/maison-kova/

## Le Drop 01

Trois pièces, toutes brodées :

| Pièce | Broderie | Fil |
| --- | --- | --- |
| Tee Arche (t-shirt noir) | Arche + KOVA, 5 × 8,7 cm, centré mi-poitrine | Rouge #C72B23 |
| Tee Ahava (t-shirt blanc) | Cœur Ahava + KOVA, 6 × 7,5 cm, poitrine gauche | Bordeaux #8F222C |
| Casquette Flamme (noire) | Flamme 5,5 cm devant, KOVA 4 cm côté gauche | Rouge #C72B23 |

Le parcours d'achat est actif (`venteOuverte: true`). Le paiement passe par **Shopify** : le branchement est prêt dans `assets/shopify.js`, il ne manque que le domaine de la boutique et son jeton public (voir `docs/SHOPIFY.md`). En attendant, les prix s'affichent « Prix à venir » et « Passer au paiement » indique que le paiement n'est pas encore branché.

## Pages et parcours

- **Accueil** (`index.html`, noir) :
  - **Chargement** : l'arche se dessine au trait orange, se remplit, puis « MAISON KOVA » apparaît (2,5 s, une fois par session, clic pour passer, absent si l'utilisateur limite les animations).
  - **La porte** : l'arche reste au centre, la vidéo de broderie se voit à travers son ouverture. En faisant défiler, on entre dans l'arche jusqu'à la broderie en plein écran, puis « Plus qu'un style, une vision » apparaît (`initPorte` dans `kova.js`).
  - Puis les 3 pièces en grand > « Entrer dans la boutique » > photo portée > un paragraphe > liste.
- **Boutique** (`boutique.html`, clair) : tout le catalogue, filtres par catégorie (`?c=tees`, `?c=casquettes`), prix visibles, réassurance.
- **Fiche produit** (`produit.html?p=tee-arche&t=m`, clair) : fil d'Ariane, galerie, prix, couleur et fil, taille (erreur claire si oubliée), « Ajouter au panier », barre d'achat fixe sur mobile, détails, « Vous aimerez aussi ».
- **Panier** : tiroir latéral clair sur toutes les pages, confirmation d'ajout, quantités, sous-total, « Passer au paiement », « Continuer mes achats ».
- **La Maison** (`maison.html`, noir) : origine du nom, teaser vidéo, les trois signes, les dessins cotés.
- **Mentions légales et confidentialité** (`legal.html`, clair) : modèle à compléter.
- **Menu** : Boutique (T-shirts, Casquettes), La Maison, Panier toujours visible.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `assets/catalogue.js` | **Source unique** des pièces : textes, tailles, broderies, visuels, prix |
| `assets/kova.css` | Toute la DA (couleurs, typos, composants) |
| `assets/kova.js` | Cartes (accueil et boutique), filtres, menu, teaser vidéo, inscriptions, panier, et l'interrupteur `venteOuverte` |
| `assets/produit.js` | Rendu et interactions de la fiche produit |
| `assets/shopify.js` | Branchement Shopify : prix et stock lus dans Shopify, panier et redirection vers le paiement |
| `docs/SHOPIFY.md` | Mise en place de la boutique Shopify, étape par étape |
| `media/` | Teasers compressés (1,5 Mo chacun), boucles de broderie, images d'attente, image de partage `og.jpg` |
| `images/drop/` | Visuels des pièces, gros plans, motifs brodés, dessins cotés |
| `brand/` | Fichiers de marque en pleine résolution (arche en SVG vectoriel, logos, motifs) |

## Modifier

- **Prix et stock** : dans Shopify, une fois branché. Avant cela (ou si Shopify ne répond pas), champ `prix` de `assets/catalogue.js`, en euros TTC ; `null` affiche « Prix à venir ».
- **Tailles** : `TAILLES_TEE` en haut de `assets/catalogue.js` (S à XL, **provisoire**).
- **Vente ou pré-lancement** : `venteOuverte` dans `assets/kova.js`. À `true`, parcours d'achat complet. À `false`, le panier disparaît et les fiches proposent « M'avertir de la sortie » avec la taille. Avant une mise en ligne publique en `true`, il faut des prix et un paiement (voir Phase 2).
- **À compléter** : prix, mesures du guide des tailles, délais et frais de livraison, composition de la casquette, mentions légales (entre crochets), e-mail de contact et réseaux sociaux.

Conversion WebP (Python + Pillow) :

```bash
python3 -c "from PIL import Image; import sys; [Image.open(f).save(f[:-4]+'.webp','WEBP',quality=84,method=6) for f in sys.argv[1:]]" images/drop/nouveau.png
```

## Visuels

- **Cartes** : `image` (photo principale) et `survol` (gros plan de la broderie, affiché au survol). Le champ `motif` (l'œuvre brodée seule) sert sur La Maison.
- **Dessins cotés** (`images/drop/dessin-tee-*.webp`) : silhouettes au trait avec les vrais logos, à l'échelle des fiches techniques (5 unités = 1 cm). Ils remplacent les fiches techniques d'origine.
- **Casquette** : rendu existant, flamme repassée en rouge, posé sur un fond studio sombre.
- **Tees** : les deux tees ont une photo pliée dans la même mise en scène (pierre sombre). La broderie du tee blanc est déjà au bordeaux des fiches (#8C2C39 mesuré pour #8F222C visé), elle n'a pas été retouchée.
- Pour de nouvelles photos (échantillons ou IA), remplacer `image`, `survol` et `galerie` dans `assets/catalogue.js`, sans toucher au reste. Des références publiques pour Canva sont dans `images/import/ref/` (les crédits IA du compte étaient épuisés lors du dernier essai).
- Les sources photo font moins de 1 000 px de large : le plein cadre et les gros plans perdent en netteté sur grand écran. Prévoir des photos d'au moins 2 400 px.
- La flamme de la casquette et l'arche du tee plié étaient brodées en orange sur les visuels d'origine. Elles ont été repassées dans le rouge des fiches techniques (#C72B23) pour montrer ce que le client recevra.
- Les anciens visuels des 18 casquettes ont été retirés du site. Ils restent dans l'historique Git (commit `f812679` et antérieurs).

## Prévisualiser en local

```bash
npx serve .
```

Puis ouvrir http://localhost:3000.

## Publier

GitHub Pages, branche `main`, dossier racine (Settings > Pages > Deploy from a branch). Chaque push sur `main` met le site à jour en une minute environ.

Pour un domaine personnalisé (ex. `maisonkova.fr`) : Settings > Pages > Custom domain, puis un enregistrement DNS chez le registrar. Penser alors à mettre à jour l'URL de `og:image` dans les pages.

## Branchements

- **Paiement, prix, stock : Shopify** (`assets/shopify.js`, guide dans `docs/SHOPIFY.md`). API Storefront appelée depuis le navigateur avec le jeton public : lecture des pièces par `handle`, puis `cartCreate` et redirection vers `cart.checkoutUrl`.
- **Inscriptions** (liste, nouveautés, alerte de sortie) : `kova.js` > `CONFIG.listeAttenteEndpoint` (ex. table Supabase avec une policy RLS en insertion seule). Chaque inscription envoie `{ email, produits, taille, source }`. Tant que l'URL est vide, le formulaire dit honnêtement que l'adresse n'est pas enregistrée.
- **Mesure d'audience** : `kova.js` > `track()`. Les événements `waitlist_submit`, `teaser_play`, `add_to_cart`, `checkout_click` partent vers PostHog dès que le snippet est ajouté (prévoir le consentement, voir `legal.html`).

## À savoir

- La flamme est la flamme de Breslev, dessinée avec les lettres האש שלי (« mon feu »), en hommage à Rabbi Nahman : « האש שלי תוקד עד ביאת המשיח » (« Mon feu brûlera jusqu'à la venue du Messie », Hayé Moharan ; le numéro de section varie selon les éditions).
- Le texte hébreu (אהבה, כובע, האש שלי) est à faire valider par quelqu'un qui lit l'hébreu.
- Les noms et motifs ne sont pas encore vérifiés à l'INPI / EUIPO.
