/*
  Catalogue Maison KOVA, Drop 01.
  Source unique pour l'accueil, la boutique, la fiche produit et le panier.

  Modèle Shopify : produit > variantes (option « Taille »). handle = handle Shopify,
  variante.key = valeur de l'option, variante.stock = quantityAvailable (phase 2).

  Prix : en euros TTC. null tant qu'il n'est pas fixé : le site affiche alors « Prix à venir ».
  Visuels : image = visuel principal (cartes), survol = second visuel au survol, galerie = fiche produit.
  Couleurs de fil : celles des fiches techniques (rouge #C72B23, bordeaux #8F222C).
*/
window.KOVA_CATALOGUE = (function () {
  var FILS = {
    rouge: { nom: 'Fil rouge', court: 'Rouge', hex: '#C72B23' },
    bordeaux: { nom: 'Fil bordeaux', court: 'Bordeaux', hex: '#8F222C' }
  };
  var TISSUS = {
    noir: { nom: 'Noir', hex: '#141414' },
    blanc: { nom: 'Blanc', hex: '#F4F2EE' }
  };

  // Tailles des tees : PROVISOIRE, à confirmer avec le fabricant
  var TAILLES_TEE = ['S', 'M', 'L', 'XL'];
  var ENTRETIEN_TEE = ['Lavage 30 °C à l\'envers', 'Ne pas sécher en machine', 'Repasser sur l\'envers'];

  var CATEGORIES = [
    { cle: 'tees', nom: 'T-shirts' },
    { cle: 'casquettes', nom: 'Casquettes' }
  ];

  var produits = [
    {
      handle: 'tee-arche',
      nom: 'Tee Arche',
      categorie: 'tees',
      type: 'T-shirt',
      libelle: 'T-shirt noir',
      tissu: 'noir',
      fil: 'rouge',
      prix: null,
      tailles: TAILLES_TEE,
      accroche: 'Le signe de la maison, au centre.',
      description: 'L\'arche et son point, brodés en rouge à hauteur du plexus. Le mot KOVA juste en dessous.',
      broderie: [
        ['Motif', 'Arche + KOVA'],
        ['Taille', '5 × 8,7 cm'],
        ['Placement', 'Centré, mi-poitrine'],
        ['Fil', 'Rouge #C72B23']
      ],
      matiere: '100 % coton',
      entretien: ENTRETIEN_TEE,
      motif: 'images/drop/motif-arche-kova.webp',
      image: 'images/drop/tee-arche-plie.webp',
      alt: 'Tee Arche : t-shirt noir plié, arche brodée en rouge au centre de la poitrine',
      survol: 'images/drop/arche-gros-plan.webp',
      galerie: [
        { type: 'image', src: 'images/drop/tee-arche-plie.webp', alt: 'Tee noir plié, arche brodée en rouge', fond: 'noir', cover: true },
        { type: 'image', src: 'images/drop/arche-gros-plan.webp', alt: 'Gros plan sur l\'arche brodée en relief, fil rouge sur coton noir', fond: 'noir', cover: true },
        { type: 'video', src: 'media/broderie.mp4', poster: 'media/broderie.webp', alt: 'L\'arche en train d\'être brodée en fil rouge', fond: 'noir' },
        { type: 'image', src: 'images/drop/dessin-tee-arche.webp', alt: 'Dessin coté : arche et KOVA de 5 × 8,7 cm, centrés à mi-poitrine', fond: 'dessin' }
      ]
    },
    {
      handle: 'tee-ahava',
      nom: 'Tee Ahava',
      categorie: 'tees',
      type: 'T-shirt',
      libelle: 'T-shirt blanc',
      tissu: 'blanc',
      fil: 'bordeaux',
      prix: null,
      tailles: TAILLES_TEE,
      hebreu: 'אהבה',
      sens: 'L\'amour',
      accroche: 'L\'amour, écrit en hébreu et dessiné en cœur.',
      description: 'Quatre lettres, un seul geste. Brodé en bordeaux sur la poitrine gauche, KOVA en dessous.',
      broderie: [
        ['Motif', 'Cœur Ahava + KOVA'],
        ['Taille', '6 × 7,5 cm'],
        ['Placement', 'Poitrine gauche'],
        ['Fil', 'Bordeaux #8F222C']
      ],
      matiere: '100 % coton',
      entretien: ENTRETIEN_TEE,
      motif: 'images/drop/motif-ahava-kova.webp',
      image: 'images/drop/tee-ahava-plie.webp',
      alt: 'Tee Ahava : t-shirt blanc plié, cœur Ahava et KOVA brodés en bordeaux sur la poitrine gauche',
      survol: 'images/drop/ahava-gros-plan.webp',
      galerie: [
        { type: 'image', src: 'images/drop/tee-ahava-plie.webp', alt: 'Tee blanc plié, cœur Ahava brodé en bordeaux', fond: 'noir', cover: true },
        { type: 'image', src: 'images/drop/ahava-gros-plan.webp', alt: 'Gros plan sur le cœur Ahava et KOVA brodés en relief, fil bordeaux sur coton blanc', fond: 'blanc', cover: true },
        { type: 'image', src: 'images/drop/dessin-tee-ahava.webp', alt: 'Dessin coté : cœur Ahava et KOVA de 6 × 7,5 cm sur la poitrine gauche', fond: 'dessin' }
      ]
    },
    {
      handle: 'casquette-flamme',
      nom: 'Casquette Flamme',
      categorie: 'casquettes',
      type: 'Casquette',
      libelle: 'Casquette noire',
      tissu: 'noir',
      fil: 'rouge',
      prix: null,
      tailles: null, // taille unique, sangle réglable
      // La flamme de Breslev : hommage à Rabbi Nahman, « האש שלי תוקד עד ביאת המשיח » (Hayé Moharan)
      hebreu: 'האש שלי',
      sens: 'Mon feu',
      accroche: 'La flamme de Breslev.',
      description: 'Ses flammes sont formées des lettres hébraïques « mon feu », en hommage à Rabbi Nahman de Breslev et à sa parole : « Mon feu brûlera jusqu\'à la venue du Messie. » Brodée en rouge sur le devant, KOVA sur le côté gauche.',
      broderie: [
        ['Devant', 'Flamme, 5,5 cm de haut'],
        ['Lettres', 'האש שלי, « mon feu »'],
        ['Côté gauche', 'KOVA, 4 cm de large'],
        ['Fil', 'Rouge #C72B23'],
        ['Taille', 'Unique, sangle réglable']
      ],
      matiere: null,
      entretien: null,
      motif: 'images/drop/motif-flamme.webp',
      image: 'images/drop/casquette-flamme-studio.webp',
      alt: 'Casquette Flamme : casquette noire, flamme brodée en rouge sur le devant et KOVA sur le côté',
      survol: 'images/drop/casquette-flamme-detail.webp',
      galerie: [
        { type: 'image', src: 'images/drop/casquette-flamme-studio.webp', alt: 'Casquette noire vue de trois quarts, flamme rouge brodée', fond: 'noir', cover: true },
        { type: 'image', src: 'images/drop/casquette-flamme-detail.webp', alt: 'Gros plan : flamme rouge sur le devant, KOVA sur le côté', fond: 'noir', cover: true }
      ]
    }
  ];

  produits.forEach(function (p) {
    p.nomTissu = TISSUS[p.tissu].nom;
    p.hexTissu = TISSUS[p.tissu].hex;
    p.nomFil = FILS[p.fil].nom;
    p.filCourt = FILS[p.fil].court;
    p.hexFil = FILS[p.fil].hex;
    p.nomCategorie = CATEGORIES.filter(function (c) { return c.cle === p.categorie; })[0].nom;
    // Variantes Shopify : une par taille, ou « TU » (taille unique)
    p.variantes = (p.tailles || ['TU']).map(function (t) {
      return { key: t.toLowerCase(), taille: t, id: p.handle + '/' + t.toLowerCase() };
    });
  });

  function produit(handle) {
    for (var i = 0; i < produits.length; i++) if (produits[i].handle === handle) return produits[i];
    return null;
  }

  // Retourne { produit, variante } pour un id "handle/key", ou null
  function variante(id) {
    var parts = String(id || '').split('/');
    var p = produit(parts[0]);
    if (!p) return null;
    for (var i = 0; i < p.variantes.length; i++) if (p.variantes[i].key === parts[1]) return { produit: p, variante: p.variantes[i] };
    return null;
  }

  return { devise: 'EUR', drop: 'Drop 01', categories: CATEGORIES, produits: produits, produit: produit, variante: variante };
})();
