/*
  Fiche produit (thème clair) : produit.html?p=<handle>&t=<taille>
  Rendue depuis le catalogue (assets/catalogue.js). Phase 2 : même rendu, données issues de Shopify.
  Parcours : choisir une taille, « Ajouter au panier », le panier s'ouvre avec la confirmation.
  Sur mobile, une barre d'achat reste en bas de l'écran dès que le bouton principal n'est plus visible.
*/
(function () {
  'use strict';

  var C = window.KOVA_CATALOGUE;
  var K = window.KOVA;
  var esc = K.esc;
  var main = document.getElementById('contenu');
  var venteOuverte = K.config.venteOuverte;

  var params = new URLSearchParams(location.search);
  var produit = C.produit(params.get('p'));

  if (!produit) {
    document.title = 'Pièce introuvable. Maison KOVA';
    main.innerHTML =
      '<div class="wrap not-found"><span class="cap">Erreur 404</span><h1>Pièce introuvable.</h1>' +
      '<p class="hint" style="font-size:15px">Ce modèle n\'existe pas, ou plus.</p>' +
      '<a class="btn" href="boutique.html">Voir la boutique</a></div>';
    return;
  }

  var aTailles = !!produit.tailles;
  var variante = produit.variantes.filter(function (v) { return v.key === params.get('t'); })[0] || (aTailles ? null : produit.variantes[0]);
  var A_VENIR = 'communiqués au lancement';

  /* ---------- Rendu ---------- */
  function shotHTML(g, i) {
    var media = g.type === 'video'
      ? '<video data-boucle muted loop playsinline preload="none" poster="' + esc(g.poster) + '" aria-label="' + esc(g.alt) + '"><source src="' + esc(g.src) + '" type="video/mp4"></video>'
      : '<img' + (g.cover ? ' class="cover"' : '') + ' src="' + esc(g.src) + '" alt="' + esc(g.alt) + '"' + (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + '>';
    return '<figure class="shot fond-' + esc(g.fond) + '">' + media + '</figure>';
  }

  function taillesHTML() {
    if (!aTailles) return '<div><div class="field-label"><span>Taille</span></div><p class="taille-unique" style="margin:0">Taille unique, sangle réglable.</p></div>';
    return '<fieldset class="sizes-field" data-tailles>' +
      '<legend class="field-label"><span>Taille <span data-taille-label style="font-weight:400">' + (variante ? ': ' + esc(variante.taille) : '') + '</span></span>' +
      '<button type="button" data-ouvrir-guide>Guide des tailles</button></legend>' +
      '<div class="sizes">' + produit.variantes.map(function (v) {
        return '<label class="size"><input type="radio" name="taille" value="' + esc(v.key) + '"' + (variante === v ? ' checked' : '') + '><span>' + esc(v.taille) + '</span></label>';
      }).join('') + '</div></fieldset>';
  }

  function actionHTML() {
    if (venteOuverte) {
      return '<div style="display:flex;flex-direction:column;gap:10px">' +
        '<button class="btn block" type="button" data-ajouter><span data-ajouter-label>Ajouter au panier</span></button>' +
        '<p class="msg" role="status" aria-live="polite" data-msg></p></div>';
    }
    return '<form class="notify" data-notify novalidate>' +
      '<label class="field-label" for="email-produit" style="margin:0">M\'avertir de la sortie</label>' +
      '<div class="ligne-form">' +
        '<input id="email-produit" name="email" type="email" autocomplete="email" required placeholder="Adresse e-mail">' +
        '<button type="submit">M\'avertir</button>' +
      '</div>' +
      '<p class="hint">Un seul e-mail, le jour de la sortie. <a href="legal.html#confidentialite">Confidentialité</a></p>' +
      '<p class="status" role="status" aria-live="polite"></p>' +
    '</form>';
  }

  function accordeonHTML() {
    var html = '<div class="acc">';
    html += '<details open><summary>La broderie</summary><div class="content"><dl class="spec-table">' +
      produit.broderie.map(function (l) { return '<div><dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd></div>'; }).join('') +
      '</dl></div></details>';
    html += '<details><summary>Matière et entretien</summary><div class="content">' +
      '<p>' + esc(produit.matiere || 'Composition communiquée au lancement.') + '</p>' +
      (produit.entretien ? '<ul class="plain">' + produit.entretien.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' : '') +
      '</div></details>';
    if (aTailles) {
      // À COMPLÉTER : mesures par taille (largeur poitrine, longueur dos) dès que le fabricant les confirme
      html += '<details id="guide-tailles"><summary>Guide des tailles</summary><div class="content">' +
        '<p>Les mesures détaillées par taille seront publiées avec les pièces définitives.</p>' +
        '</div></details>';
    }
    // À COMPLÉTER : délais, frais et conditions de retour
    html += '<details id="livraison"><summary>Livraison et retours</summary><div class="content">' +
      '<p>Délais et frais de livraison ' + A_VENIR + '.</p>' +
      '<p>Vous disposez de 14 jours à compter de la réception pour changer d\'avis.</p>' +
      '</div></details>';
    return html + '</div>';
  }

  var n = produit.galerie.length;
  main.innerHTML =
    '<div class="wrap pdp-page">' +
      '<nav class="crumbs mono" aria-label="Fil d\'Ariane">' +
        '<a href="boutique.html">Boutique</a><span aria-hidden="true">/</span>' +
        '<a href="boutique.html?c=' + esc(produit.categorie) + '">' + esc(produit.nomCategorie) + '</a><span aria-hidden="true">/</span>' +
        '<span aria-current="page">' + esc(produit.nom) + '</span>' +
      '</nav>' +
      '<div class="pdp-grid">' +
        '<div class="gallery-wrap">' +
          '<div class="gallery" tabindex="0" aria-label="Visuels de la pièce">' + produit.galerie.map(shotHTML).join('') + '</div>' +
          (n > 1 ? '<span class="gallery-count" aria-hidden="true"><span data-index>1</span> / ' + n + '</span>' : '') +
        '</div>' +
        '<div class="buy">' +
          '<div style="display:flex;flex-direction:column;gap:14px">' +
            '<h1>' + esc(produit.nom) + '</h1>' +
            '<div class="prix">' + esc(K.prix(produit.prix)) + '</div>' +
          '</div>' +
          '<p class="desc"><strong>' + esc(produit.accroche) + '</strong> ' + esc(produit.description) + '</p>' +
          '<dl class="attributs">' +
            '<div><dt>Couleur</dt><dd><span class="dot" style="--c:' + produit.hexTissu + '"></span>' + esc(produit.nomTissu) + '</dd></div>' +
            '<div><dt>Broderie</dt><dd><span class="dot" style="--c:' + produit.hexFil + '"></span>' + esc(produit.nomFil) + (produit.hebreu ? ' · <span class="he" lang="he" dir="rtl">' + esc(produit.hebreu) + '</span>' : '') + '</dd></div>' +
          '</dl>' +
          taillesHTML() +
          actionHTML() +
          '<div class="livraison"><span>Brodé, pas imprimé. ' + esc(produit.matiere || '') + '</span><span>Retour possible sous 14 jours. <a href="#livraison" data-ouvrir-livraison>Livraison et retours</a></span></div>' +
          accordeonHTML() +
        '</div>' +
      '</div>' +
      '<section class="reste" aria-labelledby="t-reste">' +
        '<h2 id="t-reste">Vous aimerez aussi</h2>' +
        '<div class="p-grid deux">' + C.produits.filter(function (p) { return p !== produit; }).map(K.carte).join('') + '</div>' +
      '</section>' +
    '</div>' +
    (venteOuverte ? '<div class="buy-bar" data-buy-bar aria-hidden="true"><div class="info"><strong>' + esc(produit.nom) + '</strong><span data-bar-info>' + esc(K.prix(produit.prix)) + '</span></div><button class="btn" type="button" data-ajouter-bar tabindex="-1">Ajouter au panier</button></div>' : '');

  document.title = produit.nom + ', ' + produit.libelle.toLowerCase() + '. Maison KOVA';
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', produit.nom + ' : ' + produit.accroche + ' ' + produit.description);

  /* ---------- Interactions ---------- */
  var labelTaille = main.querySelector('[data-taille-label]');
  var champTailles = main.querySelector('[data-tailles]');
  var msg = main.querySelector('[data-msg]');

  function tailleChoisie() {
    var r = main.querySelector('input[name="taille"]:checked');
    return r ? produit.variantes.filter(function (v) { return v.key === r.value; })[0] : (aTailles ? null : produit.variantes[0]);
  }

  main.addEventListener('change', function (e) {
    if (e.target.name !== 'taille') return;
    variante = tailleChoisie();
    labelTaille.textContent = ': ' + variante.taille;
    if (champTailles) champTailles.classList.remove('erreur');
    if (msg) msg.textContent = '';
    try { history.replaceState(null, '', K.url(produit, variante)); } catch (err) {}
  });

  function ouvrirDetails(id) {
    var d = main.querySelector('#' + id);
    if (d) { d.open = true; d.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  }
  var lienGuide = main.querySelector('[data-ouvrir-guide]');
  if (lienGuide) lienGuide.addEventListener('click', function () { ouvrirDetails('guide-tailles'); });
  main.querySelector('[data-ouvrir-livraison]').addEventListener('click', function (e) { e.preventDefault(); ouvrirDetails('livraison'); });

  // Compteur de la galerie (mobile, défilement horizontal)
  var galerie = main.querySelector('.gallery');
  var index = main.querySelector('[data-index]');
  if (index) galerie.addEventListener('scroll', function () { index.textContent = Math.min(n, Math.round(galerie.scrollLeft / galerie.clientWidth) + 1); }, { passive: true });

  if (venteOuverte) {
    var btnAjouter = main.querySelector('[data-ajouter]');
    var labelAjouter = main.querySelector('[data-ajouter-label]');
    var barre = document.querySelector('[data-buy-bar]');
    var enCours = false;

    function ajouter() {
      if (enCours) return;
      var v = tailleChoisie();
      if (!v) {
        // Pas de taille : on le dit clairement, on ramène l'utilisateur au choix
        champTailles.classList.add('erreur');
        msg.textContent = 'Choisissez votre taille.';
        champTailles.scrollIntoView({ behavior: 'smooth', block: 'center' });
        main.querySelector('input[name="taille"]').focus({ preventScroll: true });
        return;
      }
      enCours = true;
      msg.textContent = '';
      K.panier.ajouter(v.id, 1).then(function (r) {
        if (r.ajoute === 0) { msg.textContent = r.dispo === 0 ? 'Cette taille est épuisée.' : 'Quantité maximale déjà dans votre panier.'; enCours = false; return; }
        labelAjouter.textContent = 'Ajouté au panier';
        K.panier.ouvrir();
        setTimeout(function () { labelAjouter.textContent = 'Ajouter au panier'; enCours = false; }, 1600);
      });
    }
    btnAjouter.addEventListener('click', ajouter);
    if (barre) {
      barre.querySelector('[data-ajouter-bar]').addEventListener('click', ajouter);
      // La barre n'apparaît que lorsque le bouton principal sort de l'écran
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (es) {
          var visible = !es[0].isIntersecting;
          barre.classList.toggle('visible', visible);
          barre.setAttribute('aria-hidden', visible ? 'false' : 'true');
          barre.querySelector('button').tabIndex = visible ? 0 : -1;
        }).observe(btnAjouter);
      }
    }
  } else {
    K.brancherListe(main.querySelector('[data-notify]'), function () {
      var v = tailleChoisie();
      var t = v && v.taille !== 'TU' ? v.taille : null;
      return { produits: [produit.handle], taille: t, confirmation: 'C\'est noté' + (t ? ', en ' + t : '') + '. Vous recevrez un seul e-mail, le jour de la sortie.' };
    });
  }

  K.initBoucles();
})();
