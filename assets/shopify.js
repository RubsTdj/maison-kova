/*
  Maison KOVA, branchement Shopify (API Storefront, appelée depuis le navigateur).

  Rôle :
  - Prix et stock : lus dans Shopify au chargement et appliqués au catalogue (assets/catalogue.js garde
    les textes et les visuels). Shopify devient la source unique des prix et du stock.
  - Paiement : « Passer au paiement » crée un panier Shopify (cartCreate) et envoie l'acheteur vers
    le paiement Shopify (cart.checkoutUrl). Shopify gère carte bancaire, TVA, livraison, commandes, e-mails.

  Activer : renseigner `domaine` et `jeton` ci-dessous (voir docs/SHOPIFY.md).
  Le jeton est le « jeton d'accès public » du canal Headless : il est fait pour être utilisé dans le
  navigateur et peut être publié. Ne JAMAIS mettre ici un jeton Admin ou un jeton privé.

  Correspondance avec le catalogue :
  - handle Shopify = handle du catalogue (tee-arche, tee-ahava, casquette-flamme) ;
  - option « Taille » = S, M, L, XL pour les tees ; la casquette n'a qu'une variante (taille unique).
*/
window.KOVA_SHOPIFY = (function () {
  'use strict';

  var CONFIG = {
    domaine: '',            // ex. 'maison-kova.myshopify.com'
    jeton: '',              // jeton d'accès public Storefront (canal Headless)
    version: '2026-10',     // version de l'API Storefront
    delaiMax: 5000          // au-delà, le site s'affiche avec les données du catalogue
  };

  var C = window.KOVA_CATALOGUE;
  var actif = !!(CONFIG.domaine && CONFIG.jeton);
  var charge = false; // vrai une fois les prix et variantes Shopify appliqués

  function gql(query, variables) {
    var ctrl = 'AbortController' in window ? new AbortController() : null;
    var minuteur = ctrl ? setTimeout(function () { ctrl.abort(); }, CONFIG.delaiMax) : null;
    return fetch('https://' + CONFIG.domaine + '/api/' + CONFIG.version + '/graphql.json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Shopify-Storefront-Access-Token': CONFIG.jeton },
      body: JSON.stringify({ query: query, variables: variables || {} }),
      signal: ctrl ? ctrl.signal : undefined
    }).then(function (r) {
      if (minuteur) clearTimeout(minuteur);
      if (!r.ok) throw new Error('Shopify ' + r.status);
      return r.json();
    }).then(function (j) {
      if (j.errors && j.errors.length) throw new Error(j.errors[0].message);
      return j.data;
    });
  }

  // Une seule requête pour toutes les pièces (un alias par handle)
  function requeteProduits() {
    return 'query Pieces {' + C.produits.map(function (p, i) {
      return ' p' + i + ': product(handle: ' + JSON.stringify(p.handle) + ') { handle availableForSale variants(first: 20) { nodes { id availableForSale quantityAvailable selectedOptions { name value } price { amount currencyCode } } } }';
    }).join('') + ' }';
  }

  function appliquer(data) {
    C.produits.forEach(function (p, i) {
      var sp = data['p' + i];
      if (!sp) { console.warn('[Shopify] pièce introuvable : ' + p.handle); return; }
      var nodes = sp.variants.nodes;
      p.variantes.forEach(function (v) {
        var n = v.taille === 'TU' ? (nodes.length === 1 ? nodes[0] : null) : nodes.filter(function (x) {
          return x.selectedOptions.some(function (o) { return /taille|size/i.test(o.name) && o.value.toUpperCase() === v.taille; });
        })[0];
        if (!n) { console.warn('[Shopify] variante introuvable : ' + v.id); v.stock = 0; return; }
        v.gid = n.id;
        v.prix = Number(n.price.amount);
        // quantityAvailable demande la permission « inventaire » ; sinon on se fie à availableForSale
        v.stock = !n.availableForSale ? 0 : (typeof n.quantityAvailable === 'number' && n.quantityAvailable > 0 ? n.quantityAvailable : undefined);
      });
      var prixVariantes = p.variantes.map(function (v) { return v.prix; }).filter(function (x) { return typeof x === 'number'; });
      if (prixVariantes.length) p.prix = Math.min.apply(null, prixVariantes);
      p.prixVariable = prixVariantes.some(function (x) { return x !== p.prix; });
    });
  }

  // Résolue quand les prix et stocks Shopify sont appliqués (ou tout de suite si Shopify n'est pas branché)
  var pret = !actif ? Promise.resolve(false) : gql(requeteProduits()).then(function (data) {
    appliquer(data);
    charge = true;
    return true;
  }).catch(function (e) {
    console.warn('[Shopify] lecture impossible, affichage avec le catalogue local :', e.message);
    return false;
  });

  // Crée le panier Shopify et renvoie l'adresse du paiement
  function paiement(lignes) {
    if (!actif) return Promise.reject(new Error('non-branche'));
    if (!charge) return Promise.reject(new Error('non-charge'));
    var manquantes = lignes.filter(function (l) { return !l.variante.gid; });
    if (manquantes.length) return Promise.reject(new Error('variante-inconnue'));
    return gql('mutation Panier($lignes: [CartLineInput!]!) { cartCreate(input: { lines: $lignes }) { cart { id checkoutUrl } userErrors { field message } } }', {
      lignes: lignes.map(function (l) { return { merchandiseId: l.variante.gid, quantity: l.qte }; })
    }).then(function (d) {
      var r = d.cartCreate;
      if (r.userErrors && r.userErrors.length) throw new Error(r.userErrors[0].message);
      return r.cart.checkoutUrl;
    });
  }

  return { config: CONFIG, actif: actif, pret: pret, paiement: paiement };
})();
