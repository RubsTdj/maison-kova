/*
  Catalogue Maison KOVA, Drop 01.
  Source unique pour la home, la fiche produit, la liste d'attente et (plus tard) le panier.

  Modèle Shopify : produit > variantes (option « Taille »). handle = handle Shopify,
  variante.key = valeur de l'option, variante.stock = quantityAvailable (phase 2).

  Prix : null tant qu'il n'est pas fixé. Le site affiche alors « Prix communiqué au lancement ».
  Visuels : motif = l'œuvre brodée (cartes), image = visuel principal, survol = visuel au survol des cartes.
  Remplacer image / survol / galerie par les photos d'échantillons dès qu'elles existent.
  Couleurs de fil : celles des fiches techniques (rouge #C72B23, bordeaux #8F222C).
*/
window.KOVA_CATALOGUE = (function () {
  var FILS = {
    rouge: { nom: 'Fil rouge', hex: '#C72B23' },
    bordeaux: { nom: 'Fil bordeaux', hex: '#8F222C' }
  };
  var TISSUS = {
    noir: { nom: 'Noir', hex: '#141414' },
    blanc: { nom: 'Blanc', hex: '#F4F2EE' }
  };

  // Tailles des tees : PROVISOIRE, à confirmer avec le fabricant
  var TAILLES_TEE = ['S', 'M', 'L', 'XL'];
  var ENTRETIEN_TEE = ['Lavage 30 °C à l\'envers', 'Ne pas sécher en machine', 'Repasser sur l\'envers'];

  var produits = [
    {
      handle: 'tee-arche',
      nom: 'Tee Arche',
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
      alt: 'Tee noir plié avec son hangtag, arche brodée en rouge au centre de la poitrine',
      survol: 'images/drop/tee-arche-plie.webp',
      galerie: [
        { type: 'image', src: 'images/drop/tee-arche-plie.webp', alt: 'Tee noir plié avec son hangtag, arche brodée en rouge', fond: 'noir', cover: true },
        { type: 'image', src: 'images/drop/dessin-tee-arche.webp', alt: 'Dessin coté : arche et KOVA de 5 × 8,7 cm, centrés à mi-poitrine', fond: 'dessin' },
        { type: 'video', src: 'media/broderie-2.mp4', poster: 'media/broderie-2.webp', alt: 'L\'arche en train d\'être brodée en fil rouge', fond: 'noir' },
        { type: 'image', src: 'images/drop/arche-gros-plan.webp', alt: 'Gros plan sur l\'arche brodée en relief, fil rouge sur coton noir', fond: 'noir', cover: true },
        { type: 'motif', src: 'images/drop/motif-arche-kova.webp', alt: 'Le motif : arche et KOVA en rouge', fond: 'noir' }
      ]
    },
    {
      handle: 'tee-ahava',
      nom: 'Tee Ahava',
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
      alt: 'Tee blanc plié avec son hangtag, cœur Ahava et KOVA brodés en bordeaux sur la poitrine gauche',
      survol: 'images/drop/tee-ahava-plie.webp',
      galerie: [
        { type: 'image', src: 'images/drop/tee-ahava-plie.webp', alt: 'Tee blanc plié avec son hangtag, cœur Ahava brodé en bordeaux', fond: 'noir', cover: true },
        { type: 'motif', src: 'images/drop/motif-ahava-kova.webp', alt: 'Le motif : cœur Ahava et KOVA en bordeaux', fond: 'blanc' },
        { type: 'image', src: 'images/drop/dessin-tee-ahava.webp', alt: 'Dessin coté : cœur Ahava et KOVA de 6 × 7,5 cm sur la poitrine gauche', fond: 'dessin' }
      ]
    },
    {
      handle: 'casquette-flamme',
      nom: 'Casquette Flamme',
      type: 'Casquette',
      libelle: 'Casquette noire',
      tissu: 'noir',
      fil: 'rouge',
      prix: null,
      tailles: null, // taille unique, sangle réglable
      accroche: 'Là où tout a commencé.',
      description: 'La flamme brodée en rouge sur le devant, KOVA sur le côté gauche. Chaque langue de feu est séparée de la suivante par un jour de tissu.',
      broderie: [
        ['Devant', 'Flamme, 5,5 cm de haut'],
        ['Côté gauche', 'KOVA, 4 cm de large'],
        ['Fil', 'Rouge #C72B23'],
        ['Taille', 'Unique, sangle réglable']
      ],
      matiere: null,
      entretien: null,
      motif: 'images/drop/motif-flamme.webp',
      image: 'images/drop/casquette-flamme-studio.webp',
      alt: 'Casquette noire, flamme brodée en rouge sur le devant et KOVA sur le côté',
      survol: 'images/drop/casquette-flamme-studio.webp',
      galerie: [
        { type: 'image', src: 'images/drop/casquette-flamme-studio.webp', alt: 'Casquette noire vue de trois quarts, flamme rouge brodée', fond: 'noir', cover: true },
        { type: 'image', src: 'images/drop/casquette-flamme-detail.webp', alt: 'Gros plan : flamme rouge sur le devant, KOVA sur le côté', fond: 'noir', cover: true },
        { type: 'motif', src: 'images/drop/motif-flamme.webp', alt: 'Le motif : la flamme en rouge', fond: 'noir' }
      ]
    }
  ];

  produits.forEach(function (p, i) {
    p.no = ('0' + (i + 1)).slice(-2);
    p.nomTissu = TISSUS[p.tissu].nom;
    p.hexTissu = TISSUS[p.tissu].hex;
    p.nomFil = FILS[p.fil].nom;
    p.hexFil = FILS[p.fil].hex;
    // Variantes Shopify : une par taille, ou « TU » (taille unique)
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

  return { devise: 'EUR', drop: 'Drop 01', produits: produits, produit: produit, variante: variante };
})();
