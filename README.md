# Maison KOVA

Site de la marque de casquettes brodées KOVA. HTML, CSS et JavaScript purs : aucun framework, aucun build. Les polices viennent de Google Fonts.

En ligne (GitHub Pages) : https://rubstdj.github.io/maison-kova/

## Ce qui existe

- **Home** (`index.html`) : la landing validée (intro animée, Flamme, Roi & Reine, Amour, Basiques, liste d'attente). Chaque tuile mène à sa fiche produit.
- **Fiche produit** (`produit.html?p=flamme&v=noir`) : sélecteur de coloris (souris et clavier), visuel du motif dans la couleur du fil, quantité, ajout au panier, détails, et le reste du drop.
- **Panier** : tiroir latéral accessible depuis toutes les pages, gardé dans le navigateur du visiteur (localStorage). Le bouton « Commander » affiche que le paiement ouvre avec le Drop 01 : il n'y a pas encore de paiement.
- **Mobile** : menu plein écran, galerie qui glisse, aucun scroll horizontal.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `assets/catalogue.js` | **Source unique** des produits, coloris, numéros, images et du prix |
| `assets/kova.css` | Toute la DA (couleurs, typos, composants) |
| `assets/kova.js` | Tuiles, menu mobile, panier, liste d'attente |
| `assets/produit.js` | Rendu et interactions de la fiche produit |
| `images/photo/` | Visuels réalistes servis par le site (WebP) et leurs originaux PNG 1408×1136 |
| `images/a_*.webp` | Dessins des motifs (couronnes, cœur) |
| `images/png/` | Rendus 3D d'origine, sources des visuels réalistes |
| `images/import/manifest.json` + `scripts/import_visuels.py` | Import automatique des exports Canva (voir plus bas) |

## Modifier

- **Prix** : une seule ligne, `PRIX_EUR` en haut de `assets/catalogue.js`. **59 € est provisoire**, à remplacer.
- **Ajouter un coloris** : déposer la photo dans `images/photo/` (PNG + WebP, commande ci-dessous), puis ajouter une ligne `v(...)` dans le produit concerné.
- **Textes à compléter** (entre crochets sur le site) : adresse e-mail de contact, composition, entretien, livraison et retours.

Conversion WebP (Python + Pillow) :

```bash
python3 -c "from PIL import Image; import sys; [Image.open(f).save(f[:-4]+'.webp','WEBP',quality=84,method=6) for f in sys.argv[1:]]" images/photo/nouveau.png
```

## Prévisualiser en local

```bash
npx serve .
```

Puis ouvrir http://localhost:3000. Ouvrir `index.html` en double-cliquant marche aussi, à part le panier qui peut être bloqué par le navigateur en `file://`.

## Visuels réalistes (Canva)

Les photos ont été générées avec l'IA de Canva à partir des rendus 3D (même angle, même fond, broderie conservée, « KOVA » brodé sur le côté). Le conteneur de développement n'a pas accès à Canva, d'où ce circuit :

1. les images sont posées une par page sur une planche Canva (`scripts/canva-planche*.html` sert de planche vide à importer) ;
2. la planche est exportée en PNG, ce qui donne des liens temporaires ;
3. les liens sont écrits dans `images/import/manifest.json` et poussés ;
4. la GitHub Action `Importer les visuels Canva` télécharge les fichiers et les commite dans `images/photo/`.

Le gros plan de la section « La flamme » (`f_macro`) est un recadrage du hero, faute de crédits pour une génération dédiée.

## Publier

GitHub Pages, branche `main`, dossier racine (Settings > Pages > Deploy from a branch). Chaque push sur `main` met le site à jour en une minute environ.

Pour un domaine personnalisé (ex. `maisonkova.fr`) : Settings > Pages > Custom domain, puis un enregistrement DNS chez le registrar. Penser alors à mettre à jour l'URL de `og:image` dans `index.html`.

## Phase 2 (e-commerce), points de branchement

Le code est déjà découpé pour la phase 2 décrite dans `BRIEF_CLAUDE_CODE.md`. Chercher `PHASE 2` dans `assets/` :

- `catalogue.js` suit le modèle Shopify (produit > variantes avec l'option « Coloris », `handle`, `stock` = `quantityAvailable`).
- `kova.js` > `stockDisponible()` : le stock est revérifié à chaque ajout au panier, il suffit d'interroger la Storefront API à cet endroit.
- `kova.js` > `commander()` : rediriger vers `cart.checkoutUrl` de Shopify.
- `kova.js` > `CONFIG.listeAttenteEndpoint` : URL d'insertion de la liste d'attente (ex. table Supabase avec une policy RLS en insertion seule). Tant qu'elle est vide, le formulaire dit honnêtement que l'adresse n'est pas enregistrée.
- `kova.js` > `track()` : les événements `add_to_cart`, `checkout_click`, `waitlist_submit` partent vers PostHog dès que le snippet est ajouté aux pages.

## À savoir

- Les visuels sont générés par IA à partir des rendus 3D, avant production : le site affiche « visuels non contractuels ». À remplacer par des photos d'échantillons dès qu'ils existent.
- Le texte hébreu brodé sur les visuels (מלכה, מלך, אהבה) est à faire valider par quelqu'un qui lit l'hébreu.
- Les noms et motifs ne sont pas encore vérifiés à l'INPI / EUIPO.
