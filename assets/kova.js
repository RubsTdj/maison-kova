/*
  Maison KOVA, scripts communs : cartes produit (accueil et boutique), filtres, menu mobile,
  teaser vidéo, inscriptions, panier. Sans dépendance ni build.

  CONFIG.venteOuverte :
  - true  : parcours d'achat complet (ajout au panier, panier, bouton de paiement).
  - false : pré-lancement. Le panier disparaît, les fiches proposent « M'avertir de la sortie ».

  Phase 2 (Shopify, Supabase, PostHog) : points de branchement signalés par "PHASE 2".
*/
(function () {
  'use strict';

  var CONFIG = {
    venteOuverte: true,
    // PHASE 2 : URL d'insertion des inscriptions (ex. Supabase REST /rest/v1/liste_attente) + en-têtes publics.
    listeAttenteEndpoint: null,
    listeAttenteHeaders: {},
    // Garde-fou par ligne de panier tant que le stock réel n'est pas branché.
    quantiteMax: 10,
    cleStockage: 'kova.panier.v3'
  };

  var C = window.KOVA_CATALOGUE;
  var reduitMouvement = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Utilitaires ---------- */
  function prix(n) {
    if (n === null || n === undefined) return 'Prix à venir';
    var entier = Math.round(n * 100) % 100 === 0;
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: C.devise, minimumFractionDigits: entier ? 0 : 2, maximumFractionDigits: 2 }).format(n);
  }
  function esc(s) {
    return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; });
  }
  function url(produit, variante) {
    return 'produit.html?p=' + encodeURIComponent(produit.handle) + (variante && variante.taille !== 'TU' ? '&t=' + encodeURIComponent(variante.key) : '');
  }
  // PHASE 2 : branché seulement si PostHog est présent sur la page.
  function track(evenement, props) {
    try { if (window.posthog && window.posthog.capture) window.posthog.capture(evenement, props || {}); } catch (e) {}
  }

  /* ---------- Cartes produit ---------- */
  // Accueil (luxe silencieux) : grande image, légende minuscule
  function pieceSilence(p) {
    return '<a class="s-piece" href="' + url(p) + '">' +
      '<span class="img"><img class="main" src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" loading="lazy">' +
      (p.survol ? '<img class="alt" src="' + esc(p.survol) + '" alt="" loading="lazy">' : '') + '</span>' +
      '<span class="leg cap"><span>' + esc(p.nom) + '</span><span>' + esc(p.nomTissu) + '</span></span></a>';
  }
  // Boutique (thème clair) : codes e-commerce, nom, variante, prix
  function carte(p) {
    return '<a class="p-card rv" href="' + url(p) + '" data-categorie="' + esc(p.categorie) + '">' +
      '<span class="p-media"><img class="main" src="' + esc(p.image) + '" alt="' + esc(p.alt) + '" loading="lazy">' +
      (p.survol ? '<img class="alt" src="' + esc(p.survol) + '" alt="" loading="lazy">' : '') + '</span>' +
      '<span class="p-info"><span class="nom">' + esc(p.nom) + '</span><span class="prix">' + esc(prix(p.prix)) + '</span>' +
      '<span class="var"><span class="dot" style="--c:' + p.hexTissu + '"></span>' + esc(p.nomTissu) + ' · Broderie ' + esc(p.filCourt.toLowerCase()) + '</span></span></a>';
  }

  // data-produits="tous" | "a,b" | "sauf:a" ; data-style="silence" | "boutique"
  function rendreGrilles() {
    document.querySelectorAll('[data-produits]').forEach(function (g) {
      var v = g.getAttribute('data-produits');
      var liste = C.produits;
      if (v.indexOf('sauf:') === 0) liste = C.produits.filter(function (p) { return p.handle !== v.slice(5); });
      else if (v !== 'tous') liste = v.split(',').map(function (h) { return C.produit(h.trim()); }).filter(Boolean);
      g.innerHTML = liste.map(g.getAttribute('data-style') === 'silence' ? pieceSilence : carte).join('');
    });
  }

  /* ---------- Filtres de la boutique ---------- */
  function initFiltres() {
    var zone = document.querySelector('[data-filtres]');
    var grille = document.querySelector('[data-grille-boutique]');
    if (!zone || !grille) return;
    var choix = [{ cle: 'tout', nom: 'Tout', n: C.produits.length }].concat(C.categories.map(function (c) {
      return { cle: c.cle, nom: c.nom, n: C.produits.filter(function (p) { return p.categorie === c.cle; }).length };
    }).filter(function (c) { return c.n > 0; }));
    var depart = new URLSearchParams(location.search).get('c');
    if (!choix.some(function (c) { return c.cle === depart; })) depart = 'tout';
    zone.innerHTML = choix.map(function (c) {
      return '<button class="filtre" type="button" data-filtre="' + c.cle + '" aria-pressed="' + (c.cle === depart) + '">' + esc(c.nom) + '<span class="n">' + c.n + '</span></button>';
    }).join('');
    var compte = document.querySelector('[data-compte]');
    function appliquer(cle) {
      var n = 0;
      grille.querySelectorAll('.p-card').forEach(function (a) {
        var ok = cle === 'tout' || a.getAttribute('data-categorie') === cle;
        a.hidden = !ok; if (ok) n++;
      });
      zone.querySelectorAll('[data-filtre]').forEach(function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-filtre') === cle ? 'true' : 'false'); });
      if (compte) compte.textContent = n + (n > 1 ? ' pièces' : ' pièce');
      try { history.replaceState(null, '', cle === 'tout' ? 'boutique.html' : 'boutique.html?c=' + cle); } catch (e) {}
    }
    zone.addEventListener('click', function (e) {
      var b = e.target.closest('[data-filtre]');
      if (b) appliquer(b.getAttribute('data-filtre'));
    });
    appliquer(depart);
  }

  /* ---------- Header : opaque dès qu'on quitte le haut de l'accueil ---------- */
  function initHeader() {
    var racine = document.documentElement, attente = false;
    function maj() { racine.classList.toggle('is-scrolled', window.scrollY > 40); attente = false; }
    window.addEventListener('scroll', function () { if (!attente) { attente = true; requestAnimationFrame(maj); } }, { passive: true });
    maj();
  }

  /* ---------- Menu mobile ---------- */
  function initMenu() {
    var header = document.querySelector('.site-header');
    var btn = header && header.querySelector('.menu-btn');
    if (!btn) return;
    function fermer() { header.classList.remove('menu-open'); btn.setAttribute('aria-expanded', 'false'); document.documentElement.classList.remove('no-scroll'); }
    btn.addEventListener('click', function () {
      var ouvert = header.classList.toggle('menu-open');
      btn.setAttribute('aria-expanded', ouvert ? 'true' : 'false');
      document.documentElement.classList.toggle('no-scroll', ouvert);
    });
    header.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', fermer); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && header.classList.contains('menu-open')) { fermer(); btn.focus(); } });
    window.matchMedia('(min-width: 901px)').addEventListener('change', function (m) { if (m.matches) fermer(); });
  }

  /* ---------- Teaser vidéo (La Maison) ----------
     Paysage sur écran large, vertical sur écran portrait. Lecture muette quand il est visible,
     bouton Son pour l'activer. Mouvement réduit : pas de lecture automatique. */
  function initTeaser() {
    var bloc = document.querySelector('[data-teaser]');
    if (!bloc) return;
    var video = bloc.querySelector('video');
    var btnSon = bloc.querySelector('[data-son]');
    var btnLecture = bloc.querySelector('[data-lecture]');
    var portrait = window.matchMedia('(max-aspect-ratio: 4/5)');
    function charger() {
      var f = portrait.matches ? 'vertical' : 'paysage';
      if (video.getAttribute('data-format') === f) return;
      var enCours = !video.paused;
      video.setAttribute('data-format', f);
      video.poster = 'media/teaser-' + f + '.webp';
      video.src = 'media/teaser-' + f + '.mp4';
      if (enCours) video.play().catch(function () {});
    }
    function majLecture() {
      var enPause = video.paused || video.ended;
      btnLecture.querySelector('span').textContent = video.ended ? 'Revoir' : enPause ? 'Lecture' : 'Pause';
    }
    function majSon() {
      btnSon.setAttribute('aria-pressed', video.muted ? 'false' : 'true');
      btnSon.setAttribute('aria-label', video.muted ? 'Activer le son' : 'Couper le son');
    }
    video.muted = true;
    charger();
    portrait.addEventListener('change', charger);
    if (!reduitMouvement && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting && !video.ended) video.play().catch(function () {}); else if (!e.isIntersecting) video.pause(); });
      }, { threshold: 0.4 }).observe(video);
    }
    ['play', 'pause', 'ended'].forEach(function (ev) { video.addEventListener(ev, majLecture); });
    btnLecture.addEventListener('click', function () {
      if (video.paused || video.ended) { video.play().catch(function () {}); track('teaser_play'); } else video.pause();
    });
    btnSon.addEventListener('click', function () {
      video.muted = !video.muted;
      if (!video.muted && video.paused) video.play().catch(function () {});
      majSon();
    });
    majLecture(); majSon();
  }

  /* ---------- Boucles vidéo décoratives : lecture seulement à l'écran ---------- */
  function initBoucles() {
    var boucles = document.querySelectorAll('video[data-boucle]:not([data-observe])');
    if (!boucles.length || reduitMouvement || !('IntersectionObserver' in window)) return;
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) e.target.play().catch(function () {}); else e.target.pause(); });
    }, { threshold: 0.25 });
    boucles.forEach(function (v) { v.muted = true; v.setAttribute('data-observe', ''); io.observe(v); });
  }

  /* ---------- Inscriptions (liste, nouveautés, alerte de sortie) ---------- */
  function envoyerInscription(donnees) {
    track('waitlist_submit', { produits: donnees.produits, taille: donnees.taille || null, source: donnees.source });
    if (!CONFIG.listeAttenteEndpoint) return Promise.resolve({ demo: true });
    var headers = Object.assign({ 'Content-Type': 'application/json' }, CONFIG.listeAttenteHeaders);
    return fetch(CONFIG.listeAttenteEndpoint, { method: 'POST', headers: headers, body: JSON.stringify(donnees) })
      .then(function (r) { if (!r.ok) throw new Error(r.status); return { demo: false }; });
  }

  function brancherListe(form, extra) {
    if (!form || form.hasAttribute('data-branche')) return;
    form.setAttribute('data-branche', '');
    var input = form.querySelector('input[type="email"]');
    var statut = form.querySelector('.status');
    var bouton = form.querySelector('button[type="submit"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      statut.removeAttribute('data-etat');
      var email = input.value.trim();
      if (!email || !input.checkValidity()) {
        statut.setAttribute('data-etat', 'erreur');
        statut.textContent = 'Merci d\'indiquer une adresse e-mail valide.';
        input.focus();
        return;
      }
      var plus = extra ? extra() : {};
      var donnees = { email: email, produits: plus.produits || [], taille: plus.taille || null, source: location.pathname + location.search };
      bouton.disabled = true;
      envoyerInscription(donnees).then(function (r) {
        if (r.demo) {
          // Honnête tant que rien n'est branché : on ne prétend pas avoir enregistré l'adresse.
          statut.textContent = 'Merci. Version de démonstration : les inscriptions ne sont pas encore branchées, votre adresse n\'a pas été enregistrée.';
        } else {
          form.reset();
          statut.textContent = plus.confirmation || 'C\'est noté. Merci.';
        }
      }).catch(function () {
        statut.setAttribute('data-etat', 'erreur');
        statut.textContent = 'L\'inscription n\'a pas abouti. Merci de réessayer dans un instant.';
      }).then(function () { bouton.disabled = false; });
    });
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
  function lignesValides() {
    return lire().filter(function (l) { return l && C.variante(l.id) && l.qte > 0; }).map(function (l) {
      var r = C.variante(l.id);
      return { id: l.id, qte: Math.min(l.qte, CONFIG.quantiteMax), produit: r.produit, variante: r.variante };
    });
  }
  // PHASE 2 : interroger la Storefront API (quantityAvailable) au lieu du catalogue local.
  function stockDisponible(id) {
    var r = C.variante(id);
    if (!r) return Promise.resolve(0);
    var s = typeof r.variante.stock === 'number' ? r.variante.stock : Infinity;
    return Promise.resolve(Math.min(s, CONFIG.quantiteMax));
  }
  function totalConnu(lignes) { return lignes.every(function (l) { return typeof l.produit.prix === 'number'; }); }

  var dernierAjout = null;
  var panier = {
    lignes: lignesValides,
    nombre: function () { return lignesValides().reduce(function (n, l) { return n + l.qte; }, 0); },
    sousTotal: function () { return lignesValides().reduce(function (t, l) { return t + l.qte * (l.produit.prix || 0); }, 0); },
    ajouter: function (id, qte) {
      qte = Math.max(1, qte | 0);
      return stockDisponible(id).then(function (dispo) {
        var lignes = lire();
        var ligne = lignes.filter(function (l) { return l.id === id; })[0];
        var dejaLa = ligne ? ligne.qte : 0;
        var ajoute = Math.min(qte, Math.max(0, dispo - dejaLa));
        if (ajoute > 0) {
          if (ligne) ligne.qte += ajoute; else lignes.push({ id: id, qte: ajoute });
          ecrire(lignes);
          dernierAjout = id;
          track('add_to_cart', { variant: id, quantity: ajoute });
          majCompteur(true);
          rendreTiroir();
        }
        return { ajoute: ajoute, demande: qte, dispo: dispo, dejaLa: dejaLa };
      });
    },
    changer: function (id, qte) {
      return stockDisponible(id).then(function (dispo) {
        ecrire(lire().map(function (l) { return l.id === id ? { id: id, qte: Math.max(0, Math.min(qte, dispo)) } : l; })
          .filter(function (l) { return l.qte > 0; }));
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
      if (anime && !reduitMouvement) { el.classList.remove('bump'); void el.offsetWidth; el.classList.add('bump'); }
    });
    document.querySelectorAll('[data-cart-open]').forEach(function (b) {
      b.setAttribute('aria-label', 'Ouvrir le panier, ' + n + (n > 1 ? ' articles' : ' article'));
    });
  }

  /* Tiroir (<dialog> : focus piégé et Échap gérés par le navigateur), toujours en thème clair */
  var tiroir, dernierFocus;
  function creerTiroir() {
    tiroir = document.createElement('dialog');
    tiroir.className = 'drawer theme-clair';
    tiroir.setAttribute('aria-labelledby', 'panier-titre');
    tiroir.innerHTML =
      '<div class="d-head"><h2 id="panier-titre">Panier <span data-drawer-count></span></h2>' +
      '<button class="close" type="button" data-cart-close>Fermer</button></div>' +
      '<p class="ajout" data-ajout hidden></p>' +
      '<div class="d-body" data-drawer-body></div>' +
      '<div class="d-foot" data-drawer-foot></div>';
    document.body.appendChild(tiroir);
    tiroir.addEventListener('click', function (e) {
      if (e.target === tiroir) { fermerTiroir(); return; }
      var t = e.target.closest('button, a');
      if (!t) return;
      var id;
      if (t.hasAttribute('data-cart-close')) fermerTiroir();
      else if ((id = t.getAttribute('data-plus'))) panier.changer(id, qteDe(id) + 1).then(function () { refocus('data-plus', id); });
      else if ((id = t.getAttribute('data-moins'))) panier.changer(id, qteDe(id) - 1).then(function () { refocus('data-moins', id); });
      else if ((id = t.getAttribute('data-retirer'))) { panier.retirer(id); refocus(); }
      else if (t.hasAttribute('data-commander')) commander();
      else if (t.tagName === 'A') { tiroir.classList.remove('closing'); tiroir.close(); }
    });
    tiroir.addEventListener('cancel', function (e) { e.preventDefault(); fermerTiroir(); });
    rendreTiroir();
  }
  function refocus(attr, id) {
    var cible = null;
    if (attr) tiroir.querySelectorAll('[' + attr + ']').forEach(function (b) { if (b.getAttribute(attr) === id && !b.disabled) cible = b; });
    (cible || tiroir.querySelector('[data-cart-close]')).focus();
  }
  function qteDe(id) {
    var l = lire().filter(function (x) { return x.id === id; })[0];
    return l ? l.qte : 0;
  }
  function libelleVariante(p, v) {
    return p.nomTissu + (v.taille === 'TU' ? ' · Taille unique' : ' · Taille ' + v.taille);
  }
  function rendreTiroir() {
    if (!tiroir) return;
    var lignes = lignesValides();
    var n = lignes.reduce(function (s, l) { return s + l.qte; }, 0);
    tiroir.querySelector('[data-drawer-count]').textContent = n ? '(' + n + ')' : '';
    var corps = tiroir.querySelector('[data-drawer-body]');
    var pied = tiroir.querySelector('[data-drawer-foot]');
    if (!lignes.length) {
      tiroir.querySelector('[data-ajout]').hidden = true;
      corps.innerHTML = '<div class="empty"><p>Votre panier est vide.</p><a class="btn" href="boutique.html">Voir la boutique</a></div>';
      pied.innerHTML = '';
      pied.hidden = true;
      return;
    }
    pied.hidden = false;
    corps.innerHTML = '<ul class="lines">' + lignes.map(function (l) {
      var p = l.produit, v = l.variante, lien = url(p, v);
      return '<li class="line">' +
        '<a class="thumb" href="' + lien + '" tabindex="-1" aria-hidden="true"><img src="' + esc(p.image) + '" alt=""></a>' +
        '<div class="info"><a href="' + lien + '"><span class="nm">' + esc(p.nom) + '</span></a>' +
        '<span class="vr">' + esc(libelleVariante(p, v)) + '</span>' +
        '<div class="controls"><div class="qty" role="group" aria-label="Quantité ' + esc(p.nom) + '">' +
        '<button type="button" data-moins="' + esc(l.id) + '" aria-label="Retirer un">−</button>' +
        '<output aria-live="polite">' + l.qte + '</output>' +
        '<button type="button" data-plus="' + esc(l.id) + '" aria-label="Ajouter un"' + (l.qte >= CONFIG.quantiteMax ? ' disabled' : '') + '>+</button></div>' +
        '<button class="rm" type="button" data-retirer="' + esc(l.id) + '">Retirer</button></div></div>' +
        '<div class="lp">' + (typeof p.prix === 'number' ? prix(l.qte * p.prix) : 'Prix à venir') + '</div>' +
        '</li>';
    }).join('') + '</ul>';
    pied.innerHTML =
      '<div class="subtotal"><span>Sous-total</span><strong>' + (totalConnu(lignes) ? prix(panier.sousTotal()) : 'À venir') + '</strong></div>' +
      '<p class="fine">TTC. Frais de livraison calculés à l\'étape suivante.</p>' +
      '<button class="btn block" type="button" data-commander>Passer au paiement</button>' +
      '<button class="btn ghost block" type="button" data-cart-close>Continuer mes achats</button>' +
      '<div data-checkout-msg aria-live="polite"></div>';
  }
  // PHASE 2 : rediriger vers le checkout Shopify (cart.checkoutUrl).
  function commander() {
    track('checkout_click', { items: panier.nombre(), subtotal: panier.sousTotal() });
    tiroir.querySelector('[data-checkout-msg]').innerHTML = '<div class="checkout-msg">Le paiement n\'est pas encore branché. Votre panier reste enregistré sur cet appareil.</div>';
  }
  function ouvrirTiroir() {
    if (!tiroir) creerTiroir();
    var ajout = tiroir.querySelector('[data-ajout]');
    var r = dernierAjout && C.variante(dernierAjout);
    ajout.hidden = !r;
    if (r) ajout.textContent = r.produit.nom + ' ajouté à votre panier.';
    dernierAjout = null;
    if (tiroir.open) return;
    dernierFocus = document.activeElement;
    rendreTiroir();
    tiroir.classList.remove('closing');
    tiroir.showModal();
    var b = tiroir.querySelector('[data-cart-close]');
    if (b) b.focus();
  }
  function fermerTiroir() {
    if (!tiroir || !tiroir.open) return;
    function fin() {
      tiroir.classList.remove('closing');
      tiroir.close();
      if (dernierFocus && dernierFocus.focus) dernierFocus.focus();
    }
    if (reduitMouvement) { fin(); return; }
    tiroir.classList.add('closing');
    var fait = false;
    tiroir.addEventListener('animationend', function h() { tiroir.removeEventListener('animationend', h); if (!fait) { fait = true; fin(); } });
    setTimeout(function () { if (!fait) { fait = true; fin(); } }, 400);
  }
  function initPanier() {
    document.querySelectorAll('[data-cart-open]').forEach(function (b) { b.hidden = !CONFIG.venteOuverte; });
    document.querySelectorAll('[data-prelancement]').forEach(function (el) { el.hidden = CONFIG.venteOuverte; });
    if (!CONFIG.venteOuverte) return;
    creerTiroir();
    document.addEventListener('click', function (e) {
      var b = e.target.closest('[data-cart-open]');
      if (b) { e.preventDefault(); ouvrirTiroir(); }
    });
    window.addEventListener('storage', function (e) {
      if (e.key === CONFIG.cleStockage) { majCompteur(false); rendreTiroir(); }
    });
    majCompteur(false);
  }

  /* ---------- Démarrage ---------- */
  window.KOVA = { config: CONFIG, prix: prix, esc: esc, url: url, carte: carte, panier: panier, track: track, brancherListe: brancherListe, initBoucles: initBoucles };

  function init() {
    rendreGrilles();
    initFiltres();
    initHeader();
    initMenu();
    initTeaser();
    initBoucles();
    initPanier();
    document.querySelectorAll('[data-waitlist]').forEach(function (f) { brancherListe(f); });
    document.dispatchEvent(new CustomEvent('kova:pret'));
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
