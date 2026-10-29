/*
  Fiche produit : produit.html?p=<handle>&t=<taille>
  Rendue depuis le catalogue (assets/catalogue.js). Phase 2 : même rendu, données issues de Shopify.
  Pré-lancement : « M'avertir de la sortie », avec la taille choisie (pour caler les quantités à produire).
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
      '<div class="not-found"><div class="eyebrow">Erreur 404</div>' +
      '<h1 class="h-xl">Pièce<br>introuvable.</h1>' +
      '<p class="texte">Ce modèle n\'existe pas, ou plus.</p>' +
      '<a class="btn" href="./#drop">Découvrir le Drop 01 <span class="arr" aria-hidden="true">→</span></a></div>';
    return;
  }

  var aTailles = !!produit.tailles;
  var variante = produit.variantes.filter(function (v) { return v.key === params.get('t'); })[0] || (aTailles ? null : produit.variantes[0]);
  var quantite = 1;
  var A_VENIR = 'Communiqué au lancement.';

  /* ---------- Rendu ---------- */
  function shotHTML(g, i) {
    var media;
    if (g.type === 'video') {
      media = '<video data-boucle muted loop playsinline preload="none" poster="' + esc(g.poster) + '" aria-label="' + esc(g.alt) + '"><source src="' + esc(g.src) + '" type="video/mp4"></video>';
    } else {
      media = '<img' + (g.cover ? ' class="cover"' : '') + ' src="' + esc(g.src) + '" alt="' + esc(g.alt) + '"' + (i === 0 ? ' fetchpriority="high"' : ' loading="lazy"') + '>';
    }
    return '<figure class="shot fond-' + esc(g.fond) + (g.type === 'motif' ? ' is-motif' : '') + '">' + media + '</figure>';
  }

  function taillesHTML() {
    if (!aTailles) return '<div class="field-label label"><span>Taille</span><span class="val">Unique, sangle réglable</span></div>';
    return '<fieldset class="sizes-field">' +
      '<legend class="field-label label"><span>Taille</span> <span class="val" data-taille-label>' + (variante ? esc(variante.taille) : (venteOuverte ? 'À choisir' : 'Facultatif')) + '</span></legend>' +
      '<div class="sizes">' + produit.variantes.map(function (v) {
        return '<label class="size"><input type="radio" name="taille" value="' + esc(v.key) + '"' + (variante === v ? ' checked' : '') + '><span>' + esc(v.taille) + '</span></label>';
      }).join('') + '</div>' +
      '<p class="hint">' + (venteOuverte ? '' : 'Votre taille nous aide à ajuster la production. ') + '<a href="#guide-tailles" data-ouvrir-guide>Guide des tailles</a></p>' +
      '</fieldset>';
  }

  function actionHTML() {
    if (venteOuverte) {
      return '<div class="qty-row">' +
        '<div class="qty" role="group" aria-label="Quantité">' +
          '<button type="button" data-q="-1" aria-label="Diminuer la quantité">−</button>' +
          '<output data-qte aria-live="polite">1</output>' +
          '<button type="button" data-q="1" aria-label="Augmenter la quantité">+</button>' +
        '</div>' +
        '<button class="btn" type="button" data-ajouter><span data-ajouter-label>Ajouter au panier</span> <span class="arr" aria-hidden="true">→</span></button>' +
      '</div><p class="msg" role="status" aria-live="polite" data-msg></p>';
    }
    return '<form class="notify" data-notify novalidate>' +
      '<label class="label" for="email-produit">M\'avertir de la sortie</label>' +
      '<div class="ligne-form">' +
        '<input id="email-produit" name="email" type="email" autocomplete="email" required placeholder="Adresse e-mail">' +
        '<button class="label" type="submit">M\'avertir <span class="arr" aria-hidden="true">→</span></button>' +
      '</div>' +
      '<p class="hint">Un seul e-mail, le jour de la sortie. <a href="legal.html#confidentialite">Confidentialité</a>. Visuels avant production.</p>' +
      '<p class="status" role="status" aria-live="polite"></p>' +
    '</form>';
  }

  function accordeonHTML() {
    var html = '<div class="acc">';
    html += '<details open><summary>La broderie</summary><div class="content"><dl class="spec-table">' +
      produit.broderie.map(function (l) { return '<div><dt>' + esc(l[0]) + '</dt><dd>' + esc(l[1]) + '</dd></div>'; }).join('') +
      '</dl></div></details>';
    html += '<details><summary>Matière et entretien</summary><div class="content">' +
      '<p>' + esc(produit.matiere || 'Composition ' + A_VENIR.toLowerCase()) + '</p>' +
      (produit.entretien ? '<ul class="plain">' + produit.entretien.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('') + '</ul>' : '') +
      '</div></details>';
    if (aTailles) {
      // À COMPLÉTER : mesures par taille (largeur poitrine, longueur dos) dès que le fabricant les confirme
      html += '<details id="guide-tailles"><summary>Guide des tailles</summary><div class="content">' +
        '<p>Coupe ample. Les mesures détaillées par taille seront publiées avec les pièces définitives.</p>' +
        '</div></details>';
    }
    // À COMPLÉTER : délais, frais et conditions de retour
    html += '<details><summary>Livraison et retours</summary><div class="content">' +
      '<p>Délais et frais de livraison : ' + A_VENIR.toLowerCase() + '</p>' +
      '<p>Droit de rétractation de 14 jours à compter de la réception.</p>' +
      '</div></details>';
    return html + '</div>';
  }

  var n = produit.galerie.length;
  main.innerHTML =
    '<div class="pdp-grid">' +
      '<div class="gallery-wrap">' +
        '<div class="gallery" tabindex="0" aria-label="Visuels de la pièce">' + produit.galerie.map(shotHTML).join('') + '</div>' +
        (n > 1 ? '<span class="gallery-count label" aria-hidden="true"><span data-index>1</span> / ' + n + '</span>' : '') +
      '</div>' +
      '<div class="buy"><div class="buy-inner">' +
        '<div class="title-row">' +
          '<nav class="eyebrow" aria-label="Fil d\'Ariane"><a href="./#drop" style="text-decoration:none">' + esc(C.drop) + '</a> · ' + esc(produit.type) + '</nav>' +
          '<h1>' + esc(produit.nom) + '</h1>' +
          '<div class="sub label">' +
            '<span class="chip"><span class="dot" style="--c:' + produit.hexTissu + '"></span>' + esc(produit.nomTissu) + '</span>' +
            '<span class="chip"><span class="dot" style="--c:' + produit.hexFil + '"></span>' + esc(produit.nomFil) + '</span>' +
            (produit.hebreu ? '<span class="he" lang="he" dir="rtl">' + esc(produit.hebreu) + '</span>' : '') +
          '</div>' +
        '</div>' +
        '<div class="price-row"><span class="label">' + esc(produit.prix === null ? 'Prix communiqué au lancement' : K.prix(produit.prix)) + '</span><span class="label">' + (venteOuverte ? 'TTC' : 'Bientôt') + '</span></div>' +
        '<p class="desc"><strong>' + esc(produit.accroche) + '</strong> ' + esc(produit.description) + '</p>' +
        taillesHTML() +
        actionHTML() +
        accordeonHTML() +
      '</div></div>' +
    '</div>' +
    '<section class="sec" aria-labelledby="t-drop"><div class="wrap">' +
      '<div class="sec-head"><div><div class="eyebrow">' + esc(C.drop) + '</div><h2 id="t-drop" class="h-xl rvl">Le reste<br>du drop.</h2></div></div>' +
      '<div class="cards deux">' + C.produits.filter(function (p) { return p !== produit; }).map(K.carte).join('') + '</div>' +
    '</div></section>';

  document.title = produit.nom + ', ' + produit.libelle.toLowerCase() + '. Maison KOVA';
  var meta = document.querySelector('meta[name="description"]');
  if (meta) meta.setAttribute('content', produit.nom + ' : ' + produit.accroche + ' ' + produit.description);

  /* ---------- Interactions ---------- */
  var labelTaille = main.querySelector('[data-taille-label]');

  function tailleChoisie() {
    var r = main.querySelector('input[name="taille"]:checked');
    return r ? produit.variantes.filter(function (v) { return v.key === r.value; })[0] : (aTailles ? null : produit.variantes[0]);
  }

  main.addEventListener('change', function (e) {
    if (e.target.name !== 'taille') return;
    variante = tailleChoisie();
    labelTaille.textContent = variante.taille;
    try { history.replaceState(null, '', K.url(produit, variante)); } catch (err) {}
  });

  var lienGuide = main.querySelector('[data-ouvrir-guide]');
  if (lienGuide) lienGuide.addEventListener('click', function () { main.querySelector('#guide-tailles').open = true; });

  // Compteur de la galerie (mobile, défilement horizontal)
  var galerie = main.querySelector('.gallery');
  var index = main.querySelector('[data-index]');
  if (index) {
    galerie.addEventListener('scroll', function () {
      index.textContent = Math.min(n, Math.round(galerie.scrollLeft / galerie.clientWidth) + 1);
    }, { passive: true });
  }

  if (venteOuverte) {
    var btnAjouter = main.querySelector('[data-ajouter]');
    var labelAjouter = main.querySelector('[data-ajouter-label]');
    var msg = main.querySelector('[data-msg]');
    var sortie = main.querySelector('[data-qte]');
    var enCours = false;
    var majQuantite = function () {
      sortie.textContent = quantite;
      main.querySelector('[data-q="-1"]').disabled = quantite <= 1;
      main.querySelector('[data-q="1"]').disabled = quantite >= K.config.quantiteMax;
    };
    main.querySelector('.qty').addEventListener('click', function (e) {
      var b = e.target.closest('[data-q]');
      if (!b || b.disabled) return;
      quantite = Math.max(1, Math.min(K.config.quantiteMax, quantite + Number(b.getAttribute('data-q'))));
      majQuantite();
    });
    btnAjouter.addEventListener('click', function () {
      if (enCours) return;
      var v = tailleChoisie();
      if (!v) { msg.textContent = 'Merci de choisir une taille.'; main.querySelector('input[name="taille"]').focus(); return; }
      enCours = true;
      msg.textContent = '';
      K.panier.ajouter(v.id, quantite).then(function (r) {
        if (r.ajoute === 0) { msg.textContent = r.dispo === 0 ? 'Cette taille est épuisée.' : 'Quantité maximale déjà dans votre panier (' + r.dispo + ').'; enCours = false; return; }
        labelAjouter.textContent = 'Ajouté';
        quantite = 1;
        majQuantite();
        K.panier.ouvrir();
        setTimeout(function () { labelAjouter.textContent = 'Ajouter au panier'; enCours = false; }, 1400);
      });
    });
    majQuantite();
  } else {
    K.brancherListe(main.querySelector('[data-notify]'), function () {
      var v = tailleChoisie();
      var t = v && v.taille !== 'TU' ? v.taille : null;
      return {
        produits: [produit.handle],
        taille: t,
        confirmation: 'C\'est noté' + (t ? ', en ' + t : '') + '. Vous recevrez un seul e-mail, le jour de la sortie.'
      };
    });
  }

  K.initBoucles();
})();
