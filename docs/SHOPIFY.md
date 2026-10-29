# Brancher Shopify (paiement, prix, stock)

Le site reste le même (GitHub Pages). Shopify s'occupe de ce qu'il fait le mieux : paiement, TVA, livraison, commandes, stock, e-mails de confirmation. Le client choisit ses pièces sur le site, clique sur « Passer au paiement » et paie sur la page de paiement Shopify, aux couleurs de la marque.

Côté code, tout est prêt dans `assets/shopify.js`. Il ne manque que deux valeurs, que seul le propriétaire de la boutique Shopify peut obtenir.

## 1. Créer la boutique (à faire par toi)

1. Créer un compte sur shopify.com/fr (essai gratuit), pays **France**, devise **EUR**.
2. Choisir une offre. **Basic** est le choix sûr : le canal Headless (accès API) y est disponible. Tarifs relevés en septembre 2026 : 36 € par mois en mensuel, 27 € par mois en annuel, plus des frais par transaction. À reconfirmer sur la page tarifs avant de payer. L'offre Starter (environ 5 € par mois) n'est pas garantie pour un site sur mesure comme le nôtre.

## 2. Régler la boutique

Dans **Paramètres** :

- **Paiements** : activer Shopify Payments (identité, IBAN).
- **Taxes et droits** : France, cocher « Tous les prix incluent les taxes » (les prix du site sont TTC).
- **Expédition et livraison** : zones (France, Union européenne…) et tarifs.
- **Politiques** : générer puis compléter les modèles (remboursement, confidentialité, conditions de vente, expédition). Ils s'affichent au moment du paiement.
- **Paiement (checkout)** : personnaliser l'apparence. Logo : `brand/maison-kova-orange.png`. Couleurs : fond crème #ECE7DB ou noir #000000, boutons #141210, accent #FF4B1F.
- **Notifications** : logo et couleurs des e-mails de commande.

La « Boutique en ligne » (thème Shopify) n'est pas utilisée : la laisser protégée par mot de passe. Les clients ne voient que notre site et la page de paiement.

## 3. Créer les trois pièces

Pour chaque pièce : titre, prix TTC, stock (« Suivre les quantités »), référence (SKU).

Deux points doivent être **exacts**, sinon le site ne retrouve pas la pièce :

| Pièce | Identifiant URL (handle) | Variantes |
| --- | --- | --- |
| Tee Arche | `tee-arche` | Option **Taille** : S, M, L, XL |
| Tee Ahava | `tee-ahava` | Option **Taille** : S, M, L, XL |
| Casquette Flamme | `casquette-flamme` | Aucune option (taille unique) |

L'identifiant URL se règle en bas de la fiche produit, dans « Référencement du moteur de recherche » > URL.

Dans « Disponibilité » de chaque produit, cocher le canal **Headless**.

## 4. Obtenir l'accès pour le site

1. Installer le canal **Headless** depuis l'App Store Shopify (gratuit).
2. « Créer une vitrine » (storefront).
3. Dans les paramètres de l'API Storefront, vérifier les autorisations : lecture des produits, **inventaire des produits** (pour afficher les tailles épuisées), paniers et paiement.
4. Copier le **jeton d'accès public** (public access token).

Envoyer ensuite deux informations :

- le domaine de la boutique, sous la forme `nom-de-la-boutique.myshopify.com` ;
- le jeton d'accès public.

Le jeton **public** est fait pour être utilisé dans le navigateur : il ne donne accès qu'aux produits et à la création de paniers. Ne jamais envoyer ni publier un jeton **Admin** ou un jeton **privé**.

## 5. Mise en service (côté site)

1. Renseigner `domaine` et `jeton` dans `assets/shopify.js`.
2. Passer une commande test (mode test de Shopify Payments), du panier jusqu'à la confirmation.
3. Vérifier les prix, une taille épuisée et la page de paiement, puis publier.

À partir de là, les prix et le stock se gèrent uniquement dans Shopify : le site les lit à chaque visite. Le champ `prix` de `assets/catalogue.js` ne sert plus que de secours si Shopify ne répond pas.

## Comment ça marche (technique)

- Au chargement, une requête GraphQL à l'API Storefront (`product(handle: …)`) récupère pour chaque pièce les variantes, leur prix et leur disponibilité. Le site attend au maximum 5 secondes, puis s'affiche avec le catalogue local.
- « Passer au paiement » envoie `cartCreate` avec les variantes du panier, puis redirige vers `cart.checkoutUrl` (paiement Shopify).
- Shopify revérifie le stock et calcule la livraison et les taxes au paiement.
- Version d'API : `2026-10` (réglable dans `assets/shopify.js`). Shopify maintient chaque version au moins 12 mois : la mettre à jour une fois par an.
