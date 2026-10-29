# Brief pour Claude Code

Contexte : Maison KOVA, marque de pièces brodées (en hébreu, « kova » = casquette). Signature : « Plus qu'un style, une vision ». Symbole : l'arche et son point. Drop 01 : Tee Arche, Tee Ahava, Casquette Flamme.

## Direction artistique
- Deux thèmes : luxe silencieux (noir pur, typo fine en capitales espacées, très peu de texte, grandes images) pour l'accueil et La Maison ; maison éditoriale (crème #ECE7DB, codes e-commerce lisibles) pour la boutique, les fiches et le panier.
- Orange #FF4B1F : la marque (arche, logo sur noir), jamais du texte courant sur fond clair. Rouge #C72B23 et bordeaux #8F222C : couleurs de fil, réservées aux pièces.
- Typo : Anton (titres de la boutique, logo), Space Grotesk (texte, capitales espacées), Space Mono (libellés). Pas de dégradés, traits fins.
- On montre la qualité des pièces portées et de près. On ne parle pas des étiquettes ni du packaging.
- Le parcours d'achat doit rester évident : prix, taille, « Ajouter au panier », panier toujours visible, paiement.
- Animations en CSS pur. Respecter prefers-reduced-motion.

## Phase 1 (maintenant)
- Site statique sur GitHub Pages. Pas de framework ni de build.
- Panier actif pour les tests (`venteOuverte: true`), prix et paiement à venir.

## Phase 2, e-commerce (plus tard, ne pas commencer sans accord)
- Shopify comme moteur de commerce (stock, commandes, paiement, TVA), front Next.js en headless via Storefront API.
- Supabase uniquement pour la liste d'attente et les drops. Resend pour les e-mails.
- Ne jamais mettre de jeton Admin côté client. Revérifier le stock au moment de l'ajout au panier.

## Interdits
- Ne rien déployer ailleurs que GitHub Pages sans demande explicite.
- Ne pas acheter de domaine, ne pas créer de compte payant.
