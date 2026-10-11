/*
  Fiche produit : produit.html?p=<handle>&v=<variante>
  Rendue depuis le catalogue (assets/catalogue.js). Phase 2 : même rendu, données issues de Shopify.
*/
(function () {
  'use strict';

  var C = window.KOVA_CATALOGUE;
  var K = window.KOVA;
  var esc = K.esc;
  var main = document.getElementById('contenu');

  var params = new URLSearchParams(location.search);
  var produit = C.produit(params.get('p'));

  if (!produit) {
    document.title = 'Casquette introuvable. Maison KOVA';
    main.innerHTML =
      '<div class="not-found"><div class="eyebrow">Erreur 404</div>' +
      '<h1 class="h-xl">Casquette<br>introuvable.</h1>' +
      '<p class="lede">Ce modèle n\'existe pas, ou plus.</p>' +
      '<a class="btn" href="./#collection">Voir la collection <span class="arr" aria-hidden="true">→</span></a></div>';
    return;
  }

  var variante = produit.variantes.filter(function (v) { return v.key === params.get('v'); })[0] || produit.variantes[0];
  var quantite = 1;

  /* ---------- Rendu ---------- */
  function motifHTML() {
    var m = produit.motif;
    if (m.type === 'flamme') return '<svg viewBox="0 0 520 721" aria-hidden="true"><use href="#flame"/></svg>';
    if (m.type === 'image') return '<div class="masked" style="-webkit-mask-image:url(' + esc(m.src) + ');mask-image:url(' + esc(m.src) + ')"></div>';
    return '<div class="word">' + esc(m.texte) + '</div>';
  }

  function swatchesHTML() {
    return produit.variantes.map(function (v) {
      var actif = v === variante;
      return '<button type="button" role="radio" class="swatch" data-key="' + esc(v.key) + '"' +
        ' style="--sw:' + v.hexCouleur + ';--fil:' + v.hexFil + '"' +
        ' aria-checked="' + actif + '" tabindex="' + (actif ? 0 : -1) + '"' +
        ' aria-label="' + esc(v.nomCouleur + ', ' + v.nomFil.toLowerCase() + ', N°' + v.no) + '" title="' + esc(v.nomCouleur + ' · ' + v.nomFil) + '"></button>';
    }).join('');
  }

  // "Le reste du drop" : un coloris par autre modèle, en variant les couleurs pour éviter quatre casquettes noires
  var couleursPrises = [variante.couleur];
  var autres = C.produits.filter(function (p) { return p !== produit; }).map(function (p) {
    var v = p.variantes.filter(function (x) { return couleursPrises.indexOf(x.couleur) < 0; })[0] || p.variantes[0];
    couleursPrises.push(v.couleur);
    return { produit: p, variante: v };
  });

  main.innerHTML =
    '<nav class="crumbs" aria-label="Fil d\'Ariane">' +
      '<a href="./#collection">Shop</a><span class="sep" aria-hidden="true">/</span>' +
      '<a href="./#' + esc(produit.ancre) + '">' + esc(produit.collection) + '</a><span class="sep" aria-hidden="true">/</span>' +
      '<span aria-current="page">' + esc(produit.nom) + ' <span data-no>N°' + esc(variante.no) + '</span></span>' +
    '</nav>' +
    '<div class="pdp-grid">' +
      '<div class="gallery">' +
        '<figure class="shot">' +
          '<div class="lbl"><span data-no>N°' + esc(variante.no) + '</span><span>Visuel non contractuel</span></div>' +
          '<div class="frame"><img data-main src="' + esc(variante.image) + '" alt="' + esc(variante.alt) + '" width="1000" height="800" fetchpriority="high"></div>' +
        '</figure>' +
        '<figure class="shot dark" data-motif style="--fil:' + variante.hexFil + '">' +
          '<div class="lbl"><span>Le motif</span><span class="accent" data-fil>' + esc(variante.nomFil) + '</span></div>' +
          '<div class="frame"><div class="motif">' + motifHTML() + '</div></div>' +
          '<figcaption class="sr-only">Le motif ' + esc(produit.nom) + ' tel qu\'il est brodé, <span data-fil>' + esc(variante.nomFil.toLowerCase()) + '</span>.</figcaption>' +
        '</figure>' +
      '</div>' +
      '<div class="buy"><div class="buy-inner">' +
        '<div class="title-row">' +
          '<div class="eyebrow">' + esc(produit.collection) + '</div>' +
          '<h1>' + esc(produit.nom) + '</h1>' +
          (produit.hebreu ? '<div class="sub"><span class="accent">' + esc(produit.sens) + '</span><span class="he" lang="he" dir="rtl">' + esc(produit.hebreu) + '</span></div>' : '') +
        '</div>' +
        '<div class="price-row"><span class="price">' + K.prix(produit.prix) + '</span><span class="price-note">TTC</span></div>' +
        '<p class="desc"><strong>' + esc(produit.accroche) + '</strong> ' + esc(produit.description) + '</p>' +
        '<fieldset>' +
          '<legend class="field-label" id="coloris-label"><span>Coloris</span> <span class="val" data-variant-label>' + esc(variante.nomCouleur + ' · ' + variante.nomFil) + '</span></legend>' +
          '<div class="swatches" role="radiogroup" aria-labelledby="coloris-label">' + swatchesHTML() + '</div>' +
        '</fieldset>' +
        '<div>' +
          '<div class="field-label"><span id="qte-label">Quantité</span></div>' +
          '<div class="qty-row">' +
            '<div class="qty" role="group" aria-labelledby="qte-label">' +
              '<button type="button" data-q="-1" aria-label="Diminuer la quantité">−</button>' +
              '<output data-qte aria-live="polite">1</output>' +
              '<button type="button" data-q="1" aria-label="Augmenter la quantité">+</button>' +
            '</div>' +
            '<button class="btn" type="button" data-ajouter><span data-ajouter-label>Ajouter au panier</span> <span class="arr" aria-hidden="true">→</span></button>' +
          '</div>' +
        '</div>' +
        '<p class="msg" role="status" aria-live="polite" data-msg></p>' +
        '<div class="reassure"><span>Taille unique</span><span>Sangle réglable</span><span>Petite série</span></div>' +
        '<div class="acc">' +
          '<details open><summary>Détails</summary><div class="content"><ul class="spec clair">' +
            produit.specs.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') +
          '</ul></div></details>' +
          '<details><summary>Matière et entretien</summary><div class="content">' +
            '<p class="placeholder">[COMPOSITION À DÉFINIR]</p><p class="placeholder">[CONSEILS D\'ENTRETIEN À DÉFINIR]</p>' +
          '</div></details>' +
          '<details><summary>Livraison et retours</summary><div class="content">' +
            '<p class="placeholder">[DÉLAIS ET FRAIS DE LIVRAISON À DÉFINIR]</p>' +
            '<p>Droit de rétractation de 14 jours à compter de la réception.</p>' +
            '<p class="placeholder">[CONDITIONS DE RETOUR À DÉFINIR]</p>' +
          '</div></details>' +
        '</div>' +
      '</div></div>' +
    '</div>' +
    '<section class="s-creme" aria-labelledby="t-drop">' +
      '<div class="sec-head"><h2 id="t-drop" class="h-xl rvl">Le reste<br>du drop.</h2><div class="lede rv">Les autres collections du Drop 01.</div></div>' +
      '<div class="grid c4 bt">' + autres.map(function (a) { return K.tuile(a.produit, a.variante, { nom: a.produit.nom }); }).join('') + '</div>' +
    '</section>';

  /* ---------- Interactions ---------- */
  var img = main.querySelector('[data-main]');
  var motif = main.querySelector('[data-motif]');
  var btnAjouter = main.querySelector('[data-ajouter]');
  var labelAjouter = main.querySelector('[data-ajouter-label]');
  var msg = main.querySelector('[data-msg]');
  var sortie = main.querySelector('[data-qte]');
  var swatches = Array.prototype.slice.call(main.querySelectorAll('.swatch'));
  var enCours = false;

  function majTitre() {
    document.title = produit.nom + ', ' + variante.nomCouleur.toLowerCase() + '. Maison KOVA';
  }

  function majQuantite() {
    sortie.textContent = quantite;
    main.querySelector('[data-q="-1"]').disabled = quantite <= 1;
    main.querySelector('[data-q="1"]').disabled = quantite >= K.config.quantiteMax;
  }

  function majDisponibilite() {
    var epuise = variante.stock === 0;
    btnAjouter.disabled = epuise;
    labelAjouter.textContent = epuise ? 'Épuisé' : 'Ajouter au panier';
  }

  function changerImage(src, alt) {
    if (img.getAttribute('src') === src) return;
    var pre = new Image();
    pre.src = src;
    img.classList.add('swap');
    var appliquer = function () {
      img.src = src; img.alt = alt;
      requestAnimationFrame(function () { img.classList.remove('swap'); });
    };
    (pre.decode ? pre.decode() : Promise.resolve()).then(function () { setTimeout(appliquer, 150); }, appliquer);
  }

  function choisir(key, donnerFocus) {
    var v = produit.variantes.filter(function (x) { return x.key === key; })[0];
    if (!v || v === variante) return;
    variante = v;
    swatches.forEach(function (s) {
      var actif = s.getAttribute('data-key') === key;
      s.setAttribute('aria-checked', actif);
      s.tabIndex = actif ? 0 : -1;
      if (actif && donnerFocus) s.focus();
    });
    main.querySelectorAll('[data-no]').forEach(function (el) { el.textContent = 'N°' + v.no; });
    main.querySelector('[data-variant-label]').textContent = v.nomCouleur + ' · ' + v.nomFil;
    main.querySelectorAll('[data-fil]').forEach(function (el, i) { el.textContent = i === 0 ? v.nomFil : v.nomFil.toLowerCase(); });
    motif.style.setProperty('--fil', v.hexFil);
    changerImage(v.image, v.alt);
    msg.textContent = '';
    majDisponibilite();
    majTitre();
    try { history.replaceState(null, '', K.url(produit, v)); } catch (e) {}
  }

  main.querySelector('.swatches').addEventListener('click', function (e) {
    var s = e.target.closest('.swatch');
    if (s) choisir(s.getAttribute('data-key'), false);
  });
  // Clavier : comportement de groupe radio (flèches, Début, Fin)
  main.querySelector('.swatches').addEventListener('keydown', function (e) {
    var i = swatches.indexOf(document.activeElement);
    if (i < 0) return;
    var n = swatches.length, j = null;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') j = (i + 1) % n;
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') j = (i - 1 + n) % n;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = n - 1;
    if (j === null) return;
    e.preventDefault();
    choisir(swatches[j].getAttribute('data-key'), true);
  });

  main.querySelector('.qty').addEventListener('click', function (e) {
    var b = e.target.closest('[data-q]');
    if (!b || b.disabled) return;
    quantite = Math.max(1, Math.min(K.config.quantiteMax, quantite + Number(b.getAttribute('data-q'))));
    majQuantite();
  });

  btnAjouter.addEventListener('click', function () {
    if (enCours || btnAjouter.disabled) return;
    enCours = true;
    msg.textContent = '';
    K.panier.ajouter(variante.id, quantite).then(function (r) {
      if (r.ajoute === 0) {
        msg.textContent = r.dispo === 0 ? 'Ce coloris est épuisé.' : 'Tu as déjà la quantité maximale de ce coloris dans ton panier (' + r.dispo + ').';
        enCours = false;
        return;
      }
      if (r.ajoute < r.demande) msg.textContent = 'Seulement ' + r.ajoute + ' ajouté' + (r.ajoute > 1 ? 's' : '') + ', la limite par coloris est atteinte.';
      labelAjouter.textContent = 'Ajouté ✓';
      quantite = 1;
      majQuantite();
      K.panier.ouvrir();
      setTimeout(function () { majDisponibilite(); enCours = false; }, 1400);
    });
  });

  majQuantite();
  majDisponibilite();
  majTitre();
})();
