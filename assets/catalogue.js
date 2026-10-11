/*
  Catalogue Maison KOVA.
  Source unique pour la home, la fiche produit et le panier.

  La structure suit le modèle Shopify (produit > variantes avec une option "Coloris")
  pour que la phase 2 (Storefront API) remplace ce fichier sans toucher aux templates :
  handle = handle Shopify, variant.key = valeur de l'option, variant.stock = quantityAvailable.

  Prix : PROVISOIRE, à remplacer (une seule valeur, ci-dessous).
*/
window.KOVA_CATALOGUE = (function () {
  var PRIX_EUR = 59; // PROVISOIRE, prix pas encore fixé

  var COULEURS = {
    noir: '#1C1B17',
    creme: '#E6DDCA',
    foret: '#264233',
    marine: '#1E2D5C',
    bordeaux: '#6A1F2E',
    sable: '#D4BF95'
  };
  var FILS = {
    blanc: { nom: 'Fil blanc', hex: '#F2EFE8' },
    orange: { nom: 'Fil orange', hex: '#FF4B1F' }
  };

  var SPECS = ['6 panneaux', 'Œillets brodés', 'Broderie en relief', 'Sangle réglable', 'Taille unique'];

  // key : identifiant de variante dans l'URL et le panier (couleur, ou couleur-fil si ambigu)
  // no : numéro de référence affiché sur les tuiles
  // etiquette : libellé haut droit de la tuile (copie validée de la maquette)
  function v(key, no, couleur, nomCouleur, fil, etiquette, image, alt) {
    return { key: key, no: no, couleur: couleur, nomCouleur: nomCouleur, hexCouleur: COULEURS[couleur], fil: fil, etiquette: etiquette, image: image, alt: alt };
  }

  var produits = [
    {
      handle: 'flamme',
      nom: 'Flamme',
      collection: 'Collection Flamme',
      ancre: 'flamme',
      accroche: 'Même casquette, même broderie. Seule la couleur change.',
      description: 'Chaque langue de feu est séparée de la suivante par un jour de tissu. Les lettres hébraïques restent lisibles dans les volumes.',
      motif: { type: 'flamme' },
      variantes: [
        v('noir', '01', 'noir', 'Noir', 'blanc', 'Flamme blanche', 'images/f_noir.webp', "Casquette noire brodée d'une flamme blanche"),
        v('creme', '02', 'creme', 'Crème', 'orange', 'Flamme orange', 'images/f_creme.webp', "Casquette crème brodée d'une flamme orange"),
        v('foret', '03', 'foret', 'Forêt', 'blanc', 'Flamme blanche', 'images/f_foret.webp', "Casquette vert forêt brodée d'une flamme blanche"),
        v('marine', '04', 'marine', 'Marine', 'blanc', 'Flamme blanche', 'images/f_marine.webp', "Casquette bleu marine brodée d'une flamme blanche"),
        v('bordeaux', '05', 'bordeaux', 'Bordeaux', 'blanc', 'Flamme blanche', 'images/f_bordeaux.webp', "Casquette bordeaux brodée d'une flamme blanche"),
        v('sable', '06', 'sable', 'Sable', 'orange', 'Flamme orange', 'images/f_sable.webp', "Casquette sable brodée d'une flamme orange")
      ]
    },
    {
      handle: 'malka',
      nom: 'Malka',
      collection: 'Collection Roi & Reine',
      ancre: 'roi-reine',
      hebreu: 'מלכה',
      sens: 'La reine',
      accroche: 'Deux mots, deux couronnes.',
      description: 'Les lettres hébraïques forment elles-mêmes les pointes.',
      motif: { type: 'image', src: 'images/a_malka.webp' },
      variantes: [
        v('noir', '07', 'noir', 'Noir', 'blanc', 'Malka blanc', 'images/k_malka_noir.webp', 'Casquette noire brodée de la couronne Malka en blanc'),
        v('bordeaux', '08', 'bordeaux', 'Bordeaux', 'blanc', 'Malka blanc', 'images/k_malka_bordeaux.webp', 'Casquette bordeaux brodée de la couronne Malka en blanc')
      ]
    },
    {
      handle: 'meller',
      nom: 'Meller',
      collection: 'Collection Roi & Reine',
      ancre: 'roi-reine',
      hebreu: 'מלך',
      sens: 'Le roi',
      accroche: 'Deux mots, deux couronnes.',
      description: 'Les lettres hébraïques forment elles-mêmes les pointes.',
      motif: { type: 'image', src: 'images/a_melech.webp' },
      variantes: [
        v('noir', '09', 'noir', 'Noir', 'orange', 'Meller orange', 'images/k_melech_noir.webp', 'Casquette noire brodée de la couronne Meller en orange'),
        v('marine', '10', 'marine', 'Marine', 'blanc', 'Meller blanc', 'images/k_melech_marine.webp', 'Casquette bleu marine brodée de la couronne Meller en blanc')
      ]
    },
    {
      handle: 'ahava',
      nom: 'Ahava',
      collection: 'Collection Amour',
      ancre: 'amour',
      hebreu: 'אהבה',
      sens: "L'amour",
      accroche: "L'amour, écrit en hébreu et dessiné en forme de cœur.",
      description: 'Quatre lettres, un seul geste.',
      motif: { type: 'image', src: 'images/a_ahava.webp' },
      variantes: [
        v('noir', '11', 'noir', 'Noir', 'blanc', 'Ahava blanc', 'images/k_ahava_noir.webp', 'Casquette noire brodée du cœur Ahava en blanc'),
        v('creme', '12', 'creme', 'Crème', 'orange', 'Ahava orange', 'images/k_ahava_creme.webp', 'Casquette crème brodée du cœur Ahava en orange'),
        v('bordeaux', '13', 'bordeaux', 'Bordeaux', 'blanc', 'Ahava blanc', 'images/k_ahava_bordeaux.webp', 'Casquette bordeaux brodée du cœur Ahava en blanc')
      ]
    },
    {
      handle: 'kova',
      nom: 'KOVA',
      collection: 'Les basiques',
      ancre: 'basiques',
      hebreu: 'כובע',
      sens: 'La casquette',
      accroche: "Le nom de la marque, brodé à l'avant.",
      description: "Rien d'autre.",
      motif: { type: 'mot', texte: 'KOVA' },
      variantes: [
        v('noir-blanc', '14', 'noir', 'Noir', 'blanc', 'KOVA blanc', 'images/b_noir_b.webp', 'Casquette noire brodée du mot KOVA en blanc'),
        v('noir-orange', '15', 'noir', 'Noir', 'orange', 'KOVA orange', 'images/b_noir_o.webp', 'Casquette noire brodée du mot KOVA en orange'),
        v('marine', '16', 'marine', 'Marine', 'blanc', 'KOVA blanc', 'images/b_marine_b.webp', 'Casquette bleu marine brodée du mot KOVA en blanc'),
        v('foret', '17', 'foret', 'Forêt', 'blanc', 'KOVA blanc', 'images/b_foret_b.webp', 'Casquette vert forêt brodée du mot KOVA en blanc'),
        v('creme', '18', 'creme', 'Crème', 'orange', 'KOVA orange', 'images/b_creme_o.webp', 'Casquette crème brodée du mot KOVA en orange')
      ]
    }
  ];

  produits.forEach(function (p) {
    p.prix = PRIX_EUR;
    p.specs = SPECS;
    p.variantes.forEach(function (va) {
      va.id = p.handle + '/' + va.key;
      va.nomFil = FILS[va.fil].nom;
      va.hexFil = FILS[va.fil].hex;
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

  return { devise: 'EUR', produits: produits, produit: produit, variante: variante };
})();
