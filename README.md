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
| `images/*.webp` | Visuels servis par le site (≈ 650 Ko au total) |
| `images/png/` | Rendus 3D originaux en PNG (10 Mo), gardés pour la phase 2 et l'aperçu de partage |

## Modifier

- **Prix** : une seule ligne, `PRIX_EUR` en haut de `assets/catalogue.js`. **59 € est provisoire**, à remplacer.
- **Ajouter un coloris** : ajouter l'image PNG dans `images/png/`, la convertir en WebP (commande ci-dessous), puis ajouter une ligne `v(...)` dans le produit concerné.
- **Textes à compléter** (entre crochets sur le site) : adresse e-mail de contact, composition, entretien, livraison et retours.

Conversion WebP (Python + Pillow) :

```bash
python3 -c "from PIL import Image; import sys; [Image.open(f).save('images/'+f.split('/')[-1][:-4]+'.webp','WEBP',quality=84,method=6) for f in sys.argv[1:]]" images/png/nouveau.png
```

## Prévisualiser en local

```bash
npx serve .
```

Puis ouvrir http://localhost:3000. Ouvrir `index.html` en double-cliquant marche aussi, à part le panier qui peut être bloqué par le navigateur en `file://`.

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

- Les visuels de casquettes sont des rendus 3D, pas des photos.
- Les noms et motifs ne sont pas encore vérifiés à l'INPI / EUIPO.
