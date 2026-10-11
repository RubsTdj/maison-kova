# Brief pour Claude Code

Contexte : marque de casquettes brodées haut de gamme, KOVA (en hébreu, "kova" = casquette). Ce dépôt contient un prototype statique validé visuellement. Objectif : le garder fonctionnel en POC, puis le transformer en vrai site e-commerce.

## Direction artistique (à respecter pixel par pixel)
- Fond crème #ECE7DB, noir #0A0A0A, orange #FF4B1F (accent unique). Typo : Anton (titres), Space Grotesk (texte), Space Mono (libellés). Pas de dégradés, pas d'ombres décoratives, bordures noires fines.
- Ton : streetwear de luxe, rock, moderne. Broderie toujours discrète, en blanc ou en orange, jamais en or.
- Animations en CSS pur (intro du hero, révélations au scroll, bandeau défilant). Respecter prefers-reduced-motion.

## Structure du site
Hero (intro) > Collection Flamme (6 coloris) > Roi & Reine (Malka, Meller) > Amour (Ahava) > Basiques (mot KOVA) > Liste d'attente > Footer.

## Phase 1, POC (maintenant)
- Garder index.html statique, le publier sur GitHub Pages. Ne pas introduire de framework ni de build.
- Corriger seulement ce qui casse (responsive, accessibilité, liens d'ancre).

## Phase 2, e-commerce (plus tard, ne pas commencer sans accord)
- Shopify comme moteur de commerce (stock, commandes, paiement, TVA), front Next.js en headless via Storefront API.
- Supabase uniquement pour la liste d'attente et les drops. Resend pour les e-mails.
- Contenus éditoriaux (collection, couleur de fil, textes) dans les metafields Shopify.
- Ne jamais mettre de jeton Admin côté client. Revérifier le stock au moment de l'ajout au panier.

## Interdits
- Ne rien déployer ailleurs que GitHub Pages sans demande explicite.
- Ne pas acheter de domaine, ne pas créer de compte payant.
