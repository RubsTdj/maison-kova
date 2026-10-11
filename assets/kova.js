/*
  Maison KOVA, scripts communs : tuiles produit, menu mobile, panier, liste d'attente.
  Sans dépendance ni build. Le panier vit dans le localStorage du visiteur.

  Phase 2 : le panier sera porté par Shopify (Storefront API, cartCreate / cartLinesAdd).
  Les points de branchement sont signalés par "PHASE 2".
*/
(function () {
  'use strict';

  var CONFIG = {
    // PHASE 2 : URL d'insertion de la liste d'attente (ex. Supabase REST /rest/v1/liste_attente) + en-têtes publics.
    listeAttenteEndpoint: null,
    listeAttenteHeaders: {},
    // Garde-fou par ligne de panier tant que le stock réel n'est pas branché.
    quantiteMax: 10,
    cleStockage: 'kova.panier.v1'
  };

  var C = window.KOVA_CATALOGUE;
  var reduitMouvement = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilitaires ---------- */
  function prix(n) {
    var entier = Math.round(n * 100) % 100 === 0;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: C.devise, minimumFractionDigits: entier ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function url(produit, variante) {
    return 'produit.html?p=' + encodeURIComponent(produit.handle) + (variante ? '&v=' + encodeURIComponent(variante.key) : '');
  }
  // Analytics : branché seulement si PostHog est présent sur la page (phase 2).
  function track(evenement, props) {
    try { if (window.posthog && window.posthog.capture) window.posthog.capture(evenement, props || {}); } catch (e) {}
  }

  /* ---------- Tuiles produit ---------- */
  function tuile(produit, variante, opts) {
    opts = opts || {};
    var label = produit.nom + ', ' + variante.nomCouleur.toLowerCase() + ', ' + variante.nomFil.toLowerCase() + ', ' + prix(produit.prix);
    return '<a class="tile' + (opts.reveal === false ? '' : ' rv') + '" href="' + url(produit, variante) + '" aria-label="' + esc(label) + '">' +
      '<div class="top"><span class="no">N°' + esc(variante.no) + '</span><span>' + esc(opts.titre || variante.etiquette) + '</span></div>' +
      '<div class="img"><img class="cap" src="' + esc(variante.image) + '" alt="' + esc(variante.alt) + '" loading="lazy" width="1000" height="800"></div>' +
      '<div class="add" aria-hidden="true">VOIR LA CASQUETTE →</div>' +
      '<div class="bar"><div class="name">' + esc(opts.nom || variante.nomCouleur) + '</div><div class="price">' + prix(produit.prix) + '</div></div>' +
      '</a>';
  }

  function rendreGrilles() {
    var grilles = document.querySelectorAll('[data-produits]');
    Array.prototype.forEach.call(grilles, function (g) {
      var html = '';
      g.getAttribute('data-produits').split(',').forEach(function (handle) {
        var p = C.produit(handle.trim());
        if (!p) return;
        p.variantes.forEach(function (v) { html += tuile(p, v); });
      });
      g.innerHTML = html;
    });
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var header = document.querySelector('.site-header');
    var btn = header && header.querySelector('.menu-btn');
    if (!btn) return;
    function fermer() { header.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false'); }
    btn.addEventListener('click', function () {
      var ouvert = header.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
    });
    header.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', fermer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && header.classList.contains('menu-open')) { fermer(); btn.focus(); } });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches) fermer(); });
  }

  /* ---------- Panier ---------- */
  var stockageMemoire = null;
  function lire() {
    try {
      var brut = JSON.parse(window.localStorage.getItem(CONFIG.cleStockage) || '[]');
      return Array.isArray(brut) ? brut : [];
    } catch (e) { return stockageMemoire || []; }
  }
  function ecrire(lignes) {
    stockageMemoire = lignes;
    try { window.localStorage.setItem(CONFIG.cleStockage, JSON.stringify(lignes)); } catch (e) {}
  }
  // Ne garde que les lignes qui existent encore au catalogue
  function lignesValides() {
    return lire().filter(function (l) { return l && C.variante(l.id) && l.qte > 0; }).map(function (l) {
      var r = C.variante(l.id);
      return { id: l.id, qte: Math.min(l.qte, CONFIG.quantiteMax), produit: r.produit, variante: r.variante };
    });
  }

  // Revérifie le stock au moment de l'ajout.
  // PHASE 2 : interroger la Storefront API (quantityAvailable) au lieu du catalogue local.
  function stockDisponible(id) {
    var r = C.variante(id);
    if (!r) return Promise.resolve(0);
    var s = typeof r.variante.stock === 'number' ? r.variante.stock : Infinity;
    return Promise.resolve(Math.min(s, CONFIG.quantiteMax));
  }

  var panier = {
    lignes: lignesValides,
    nombre: function () { return lignesValides().reduce(function (n, l) { return n + l.qte; }, 0); },
    sousTotal: function () { return lignesValides().reduce(function (t, l) { return t + l.qte * l.produit.prix; }, 0); },

    ajouter: function (id, qte) {
      qte = Math.max(1, qte | 0);
      return stockDisponible(id).then(function (dispo) {
        var lignes = lire();
        var ligne = lignes.filter(function (l) { return l.id === id; })[0];
        var dejaLa = ligne ? ligne.qte : 0;
        var possible = Math.max(0, dispo - dejaLa);
        var ajoute = Math.min(qte, possible);
        if (ajoute > 0) {
          if (ligne) ligne.qte += ajoute; else lignes.push({ id: id, qte: ajoute });
          ecrire(lignes);
          track('add_to_cart', { variant: id, quantity: ajoute });
          majCompteur(true);
          rendreTiroir();
        }
        return { ajoute: ajoute, demande: qte, dispo: dispo, dejaLa: dejaLa };
      });
    },

    changer: function (id, qte) {
      var lignes = lire();
      return stockDisponible(id).then(function (dispo) {
        lignes = lignes.map(function (l) { return l.id === id ? { id: id, qte: Math.max(0, Math.min(qte, dispo)) } : l; })
          .filter(function (l) { return l.qte > 0; });
        ecrire(lignes);
        majCompteur(false);
        rendreTiroir();
      });
    },

    retirer: function (id) {
      ecrire(lire().filter(function (l) { return l.id !== id; }));
      majCompteur(false);
      rendreTiroir();
    },

    ouvrir: function () { ouvrirTiroir(); },
    fermer: function () { fermerTiroir(); }
  };

  function majCompteur(anime) {
    var n = panier.nombre();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) {
      el.textContent = n;
      el.classList.toggle('has-items', n > 0);
      if (anime && !reduitMouvement) {
        el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump');
      }
    });
    document.querySelectorAll('[data-cart-open]').forEach(function (b) {
      b.setAttribute('aria-label', 'Ouvrir le panier, ' + n + (n > 1 ? ' articles' : ' article'));
    });
  }

  /* Tiroir (élément <dialog> : focus piégé et touche Échap gérés par le navigateur) */
  var tiroir, dernierFocus;
  function creerTiroir() {
    tiroir = document.createElement('dialog');
    tiroir.className = 'drawer';
    tiroir.setAttribute('aria-labelledby', 'panier-titre');
    tiroir.innerHTML =
      '<div class="d-head"><h2 id="panier-titre">Panier<span class="n" data-drawer-count></span></h2>' +
      '<button class="close" type="button" data-cart-close>Fermer ✕</button></div>' +
      '<div class="d-body" data-drawer-body></div>' +
      '<div class="d-foot" data-drawer-foot></div>';
    document.body.appendChild(tiroir);

    tiroir.addEventListener('click', function (e) {
      if (e.target === tiroir) { fermerTiroir(); return; } // clic sur le fond
      var t = e.target.closest('button, a');
      if (!t) return;
      var id;
      if (t.hasAttribute('data-cart-close')) fermerTiroir();
      else if ((id = t.getAttribute('data-plus'))) panier.changer(id, qteDe(id) + 1).then(function () { refocus('data-plus', id); });
      else if ((id = t.getAttribute('data-moins'))) panier.changer(id, qteDe(id) - 1).then(function () { refocus('data-moins', id); });
      else if ((id = t.getAttribute('data-retirer'))) { panier.retirer(id); refocus(); }
      else if (t.hasAttribute('data-commander')) commander();
      else if (t.tagName === 'A') {
        // Lien interne (fiche produit, ancre de la home) : fermeture immédiate pour laisser la navigation se faire
        tiroir.classList.remove('closing');
        tiroir.close();
      }
    });
    tiroir.addEventListener('cancel', function (e) { e.preventDefault(); fermerTiroir(); });
    rendreTiroir();
  }
  // Le tiroir est re-rendu à chaque changement : on rend le focus au même bouton (ou au bouton Fermer).
  function refocus(attr, id) {
    var cible = null;
    if (attr) tiroir.querySelectorAll('[' + attr + ']').forEach(function (b) { if (b.getAttribute(attr) === id && !b.disabled) cible = b; });
    (cible || tiroir.querySelector('[data-cart-close]')).focus();
  }
  function qteDe(id) {
    var l = lire().filter(function (x) { return x.id === id; })[0];
    return l ? l.qte : 0;
  }

  function rendreTiroir() {
    if (!tiroir) return;
    var lignes = lignesValides();
    var n = lignes.reduce(function (s, l) { return s + l.qte; }, 0);
    tiroir.querySelector('[data-drawer-count]').textContent = n ? '(' + n + ')' : '';
    var corps = tiroir.querySelector('[data-drawer-body]');
    var pied = tiroir.querySelector('[data-drawer-foot]');
    var accueil = document.body.hasAttribute('data-home') ? '#collection' : './#collection';

    if (!lignes.length) {
      corps.innerHTML = '<div class="empty"><p>Ton panier<br>est vide.</p><a class="btn" href="' + accueil + '">Voir la collection <span class="arr" aria-hidden="true">→</span></a></div>';
      pied.innerHTML = '';
      pied.hidden = true;
      return;
    }
    pied.hidden = false;
    corps.innerHTML = '<ul class="lines">' + lignes.map(function (l) {
      var p = l.produit, v = l.variante, lien = url(p, v);
      return '<li class="line">' +
        '<a class="thumb" href="' + lien + '" tabindex="-1" aria-hidden="true"><img src="' + esc(v.image) + '" alt="" width="1000" height="800"></a>' +
        '<div class="info"><a href="' + lien + '"><span class="nm">' + esc(p.nom) + '</span></a>' +
        '<span class="vr">' + esc(v.nomCouleur) + ' · ' + esc(v.nomFil) + ' · N°' + esc(v.no) + '</span>' +
        '<div class="controls"><div class="qty" role="group" aria-label="Quantité ' + esc(p.nom + ' ' + v.nomCouleur) + '">' +
        '<button type="button" data-moins="' + esc(l.id) + '" aria-label="Retirer un">−</button>' +
        '<output aria-live="polite">' + l.qte + '</output>' +
        '<button type="button" data-plus="' + esc(l.id) + '" aria-label="Ajouter un"' + (l.qte >= CONFIG.quantiteMax ? ' disabled' : '') + '>+</button></div>' +
        '<button class="rm" type="button" data-retirer="' + esc(l.id) + '">Retirer</button></div></div>' +
        '<div class="lp">' + prix(l.qte * p.prix) + '</div>' +
        '</li>';
    }).join('') + '</ul>';
    pied.innerHTML =
      '<div class="subtotal"><span>Sous-total</span><strong>' + prix(panier.sousTotal()) + '</strong></div>' +
      '<p class="fine">TTC. Livraison calculée à l\'étape suivante.</p>' +
      '<button class="btn block" type="button" data-commander>Commander <span class="arr" aria-hidden="true">→</span></button>' +
      '<div data-checkout-msg aria-live="polite"></div>';
  }

  // PHASE 2 : rediriger vers le checkout Shopify (cart.checkoutUrl).
  function commander() {
    track('checkout_click', { items: panier.nombre(), subtotal: panier.sousTotal() });
    var zone = tiroir.querySelector('[data-checkout-msg]');
    var liste = document.body.hasAttribute('data-home') ? '#liste' : './#liste';
    zone.innerHTML = '<div class="checkout-msg">Le paiement ouvre avec le Drop 01. Ton panier reste gardé sur cet appareil. <a href="' + liste + '">Inscris-toi à la liste d\'attente</a> pour être prévenu le jour J.</div>';
  }

  function ouvrirTiroir() {
    if (!tiroir) creerTiroir();
    if (tiroir.open) return;
    dernierFocus = document.activeElement;
    rendreTiroir();
    tiroir.classList.remove('closing');
    tiroir.showModal();
    var fermerBtn = tiroir.querySelector('[data-cart-close]');
    if (fermerBtn) fermerBtn.focus();
  }

  function fermerTiroir(sansRetourFocus) {
    if (!tiroir || !tiroir.open) return;
    function fin() {
      tiroir.classList.remove('closing');
      tiroir.close();
      if (!sansRetourFocus && dernierFocus && dernierFocus.focus) dernierFocus.focus();
    }
    if (reduitMouvement) { fin(); return; }
    tiroir.classList.add('closing');
    var fait = false;
    tiroir.addEventListener('animationend', function h() { tiroir.removeEventListener('animationend', h); if (!fait) { fait = true; fin(); } });
    setTimeout(function () { if (!fait) { fait = true; fin(); } }, 400); // filet de sécurité
  }

  function initPanier() {
    creerTiroir();
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cart-open]');
      if (b) { e.preventDefault(); ouvrirTiroir(); }
    });
    // Synchronise les onglets ouverts en parallèle
    window.addEventListener('storage', function (e) {
      if (e.key === CONFIG.cleStockage) { majCompteur(false); rendreTiroir(); }
    });
    majCompteur(false);
  }

  /* ---------- Liste d'attente ---------- */
  function initListeAttente() {
    document.querySelectorAll('[data-waitlist]').forEach(function (form) {
      var input = form.querySelector('input[type="email"]');
      var statut = form.querySelector('.status');
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        statut.removeAttribute('data-etat');
        var email = input.value.trim();
        if (!email || !input.checkValidity()) {
          statut.setAttribute('data-etat', 'erreur');
          statut.textContent = 'Il manque une adresse e-mail valide.';
          input.focus();
          return;
        }
        track('waitlist_submit');
        if (!CONFIG.listeAttenteEndpoint) {
          // Honnête tant que rien n'est branché : on ne prétend pas avoir enregistré l'adresse.
          statut.textContent = 'Merci. Version de démonstration : la liste d\'attente n\'est pas encore branchée, ton adresse n\'a pas été enregistrée.';
          return;
        }
        var bouton = form.querySelector('button[type="submit"]');
        bouton.disabled = true;
        var headers = Object.assign({ 'Content-Type': 'application/json' }, CONFIG.listeAttenteHeaders);
        fetch(CONFIG.listeAttenteEndpoint, { method: 'POST', headers: headers, body: JSON.stringify({ email: email, source: location.pathname }) })
          .then(function (r) {
            if (!r.ok) throw new Error(r.status);
            form.reset();
            statut.textContent = 'C\'est noté. Un seul e-mail, le jour du lancement.';
          })
          .catch(function () {
            statut.setAttribute('data-etat', 'erreur');
            statut.textContent = 'Ça n\'est pas passé. Réessaie dans un instant.';
          })
          .then(function () { bouton.disabled = false; });
      });
    });
  }

  /* ---------- Démarrage ---------- */
  window.KOVA = { config: CONFIG, prix: prix, esc: esc, url: url, tuile: tuile, panier: panier, track: track };

  function init() {
    rendreGrilles();
    initMenu();
    initPanier();
    initListeAttente();
    document.dispatchEvent(new CustomEvent('kova:pret'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
