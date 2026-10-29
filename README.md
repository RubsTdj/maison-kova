# Maison KOVA

Site de la marque Maison KOVA. Signature : « Plus qu'un style, une vision ». HTML, CSS et JavaScript purs : aucun framework, aucun build. Les polices viennent de Google Fonts.

En ligne (GitHub Pages) : https://rubstdj.github.io/maison-kova/

## État : pré-lancement du Drop 01

Trois pièces, toutes brodées :

| Pièce | Broderie | Fil |
| --- | --- | --- |
| Tee Arche (t-shirt noir) | Arche + KOVA, 5 × 8,7 cm, centré mi-poitrine | Rouge #C72B23 |
| Tee Ahava (t-shirt blanc) | Cœur Ahava + KOVA, 6 × 7,5 cm, poitrine gauche | Bordeaux #8F222C |
| Casquette Flamme (noire) | Flamme 5,5 cm devant, KOVA 4 cm côté gauche | Rouge #C72B23 |

Pas de vente pour l'instant : chaque fiche propose « Me prévenir », avec la taille choisie (utile pour caler les quantités à produire). Le panier existe dans le code mais reste masqué.

## Pages et parcours

- **Accueil** (`index.html`) : teaser vidéo (vertical sur mobile, paysage sur desktop, son activable) > manifeste > Drop 01 (3 cartes) > savoir-faire (broderie) > liste d'attente.
- **Fiche produit** (`produit.html?p=tee-arche&t=m`) : galerie, taille, « Me prévenir », détails de broderie, entretien, guide des tailles, livraison, le reste du drop.
- **La Maison** (`maison.html`) : origine du nom, les trois signes, les broderies au millimètre, étiquettes et packaging.
- **Mentions légales et confidentialité** (`legal.html`) : modèle à compléter.
- **Menu** : Drop 01 (et les 3 pièces en accès direct sur mobile), La Maison, Me prévenir.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `assets/catalogue.js` | **Source unique** des pièces : textes, tailles, broderies, visuels, prix |
| `assets/kova.css` | Toute la DA (couleurs, typos, composants) |
| `assets/kova.js` | Cartes, menu, teaser vidéo, liste d'attente, panier, et l'interrupteur `venteOuverte` |
| `assets/produit.js` | Rendu et interactions de la fiche produit |
| `media/` | Teasers compressés (1,5 Mo chacun), boucles de broderie, images d'attente, image de partage `og.jpg` |
| `images/drop/` | Visuels des pièces, gros plans, motifs brodés, étiquettes |
| `brand/` | Fichiers de marque en pleine résolution (arche en SVG vectoriel, logos, motifs) |

## Modifier

- **Prix** : champ `prix` de chaque pièce dans `assets/catalogue.js`. Tant qu'il vaut `null`, le site affiche « Prix au lancement ».
- **Tailles** : `TAILLES_TEE` en haut de `assets/catalogue.js` (S à XL, **provisoire**).
- **Ouvrir la vente** : `venteOuverte: true` dans `assets/kova.js`. Le bouton Panier remplace « Me prévenir » et les fiches affichent « Ajouter au panier ». Il faut d'abord des prix et un paiement (voir Phase 2).
- **Textes à compléter** (entre crochets sur le site) : e-mail de contact, liens Instagram et TikTok, guide des tailles, livraison et retours, composition de la casquette, mentions légales.

Conversion WebP (Python + Pillow) :

```bash
python3 -c "from PIL import Image; import sys; [Image.open(f).save(f[:-4]+'.webp','WEBP',quality=84,method=6) for f in sys.argv[1:]]" images/drop/nouveau.png
```

## Visuels

- Le Tee Arche et le Tee Ahava sont montrés avec leurs **dessins techniques** : il n'existe pas encore de photo du tee blanc. À remplacer par des photos d'échantillons dès qu'ils existent (même cadrage pour les trois pièces).
- La flamme de la casquette et l'arche du tee plié étaient brodées en orange sur les visuels d'origine. Elles ont été repassées dans le rouge des fiches techniques (#C72B23) pour montrer ce que le client recevra. Les étiquettes et le hangtag restent orange, comme le vrai packaging.
- Les anciens visuels des 18 casquettes ont été retirés du site. Ils restent dans l'historique Git (commit `f812679` et antérieurs).

## Prévisualiser en local

```bash
npx serve .
```

Puis ouvrir http://localhost:3000.

## Publier

GitHub Pages, branche `main`, dossier racine (Settings > Pages > Deploy from a branch). Chaque push sur `main` met le site à jour en une minute environ.

Pour un domaine personnalisé (ex. `maisonkova.fr`) : Settings > Pages > Custom domain, puis un enregistrement DNS chez le registrar. Penser alors à mettre à jour l'URL de `og:image` dans les pages.

## Phase 2 (e-commerce), points de branchement

Chercher `PHASE 2` dans `assets/` :

- `catalogue.js` suit le modèle Shopify (produit > variantes avec l'option « Taille », `handle`, `stock` = `quantityAvailable`).
- `kova.js` > `CONFIG.listeAttenteEndpoint` : URL d'insertion de la liste d'attente (ex. table Supabase avec une policy RLS en insertion seule). Chaque inscription envoie `{ email, produits, taille, source }`. Tant que l'URL est vide, le formulaire dit honnêtement que l'adresse n'est pas enregistrée.
- `kova.js` > `stockDisponible()` et `commander()` : stock et checkout Shopify.
- `kova.js` > `track()` : les événements `waitlist_submit`, `teaser_play`, `teaser_sound`, `add_to_cart`, `checkout_click` partent vers PostHog dès que le snippet est ajouté (prévoir le consentement, voir `legal.html`).

## À savoir

- Le texte hébreu (אהבה, כובע) est à faire valider par quelqu'un qui lit l'hébreu.
- Les noms et motifs ne sont pas encore vérifiés à l'INPI / EUIPO.
