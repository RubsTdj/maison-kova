# Brief pour Claude Code

Contexte : Maison KOVA, marque de pièces brodées (en hébreu, « kova » = casquette). Signature : « Plus qu'un style, une vision ». Symbole : l'arche et son point. Le site est en pré-lancement du Drop 01 (Tee Arche, Tee Ahava, Casquette Flamme).

## Direction artistique
- Fond noir dominant #0A0A0A, texte crème #ECE7DB, orange #FF4B1F en accent unique pour la marque et l'interface (logo, boutons, liens).
- Rouge #C72B23 et bordeaux #8F222C : couleurs de fil, réservées aux produits et à leurs motifs. Ne pas les utiliser pour l'interface.
- Typo : Anton (titres), Space Grotesk (texte), Space Mono (libellés). Pas de dégradés, pas d'ombres décoratives, traits fins.
- Le site doit montrer la broderie telle qu'elle sera produite (couleurs des fiches techniques).
- Animations en CSS pur (révélations au scroll, bandeau défilant). Respecter prefers-reduced-motion (pas de lecture auto de vidéo).

## Structure du site
- Accueil : teaser vidéo > manifeste > Drop 01 > savoir-faire > liste d'attente > footer.
- Fiche produit, La Maison, mentions légales et confidentialité.

## Phase 1, pré-lancement (maintenant)
- Site statique sur GitHub Pages. Pas de framework ni de build.
- « Me prévenir » à la place du panier (`venteOuverte: false` dans `assets/kova.js`).

## Phase 2, e-commerce (plus tard, ne pas commencer sans accord)
- Shopify comme moteur de commerce (stock, commandes, paiement, TVA), front Next.js en headless via Storefront API.
- Supabase uniquement pour la liste d'attente et les drops. Resend pour les e-mails.
- Ne jamais mettre de jeton Admin côté client. Revérifier le stock au moment de l'ajout au panier.

## Interdits
- Ne rien déployer ailleurs que GitHub Pages sans demande explicite.
- Ne pas acheter de domaine, ne pas créer de compte payant.
