/**
 * Utilitaire pour détecter automatiquement la catégorie d'un produit
 * basé sur les mots-clés et le titre
 */

// Mapping des catégories et sous-catégories avec leurs mots-clés (en français et en chinois)
const categoryKeywords = {
  // Vêtements - Catégorie principale
  clothing: {
    id: 'clothing-category-id', // À remplacer par l'ID réel de la catégorie
    keywords: [
      // Français
      'vêtement',
      'mode',
      'habit',
      'habillement',
      'tenue',
      'garde-robe',
      // Chinois
      '服装',
      '衣服',
      '时尚',
      '服饰',
    ],
    subcategories: {
      // Vêtements pour hommes
      mens_clothing: {
        id: 'mens-clothing-id',
        keywords: [
          // Français
          'homme',
          'hommes',
          'masculin',
          'garçon',
          // Chinois
          '男装',
          '男士',
          '男性',
          '男士服装',
        ],
      },
      // Vêtements pour femmes
      womens_clothing: {
        id: 'womens-clothing-id',
        keywords: [
          // Français
          'femme',
          'femmes',
          'féminin',
          'fille',
          // Chinois
          '女装',
          '女士',
          '女性',
          '女士服装',
        ],
      },
      // Hauts
      tops: {
        id: 'tops-id',
        keywords: [
          // Français
          't-shirt',
          'chemise',
          'blouse',
          'haut',
          'pull',
          'sweat',
          'polo',
          'gilet',
          'maillot',
          // Chinois
          'T恤',
          '衫衫',
          '上衣',
          '毛衣',
          '卫衣',
          '背心',
          '气质衫',
        ],
      },
      // Bas
      bottoms: {
        id: 'bottoms-id',
        keywords: [
          // Français
          'pantalon',
          'jean',
          'short',
          'bermuda',
          'jupe',
          'legging',
          'jogging',
          // Chinois
          '裤子',
          '牛仔裤',
          '短裤',
          '裙子',
          '紧身裤',
          '运动裤',
        ],
      },
      // Vestes et manteaux
      outerwear: {
        id: 'outerwear-id',
        keywords: [
          // Français
          'veste',
          'manteau',
          'blouson',
          'parka',
          'doudoune',
          'imperméable',
          'trench',
          // Chinois
          '外套',
          '夹克',
          '风衣',
          '大衣',
          '羽绒服',
          '雨衣',
        ],
      },
      // Chaussures
      shoes: {
        id: 'shoes-id',
        keywords: [
          // Français
          'chaussure',
          'basket',
          'tennis',
          'botte',
          'sandale',
          'escarpin',
          'mocassin',
          // Chinois
          '鞋',
          '运动鞋',
          '高跟鞋',
          '靴子',
          '凉鞋',
          '平底鞋',
        ],
      },
      // Accessoires
      accessories: {
        id: 'accessories-id',
        keywords: [
          // Français
          'accessoire',
          'chapeau',
          'casquette',
          'bonnet',
          'écharpe',
          'gant',
          'ceinture',
          'cravate',
          'noeud papillon',
          // Chinois
          '配件',
          '帽子',
          '棍球帽',
          '围巾',
          '手套',
          '皮带',
          '领带',
          '领结',
        ],
      },
    },
  },

  // Électronique - Catégorie principale
  electronics: {
    id: 'electronics-category-id', // À remplacer par l'ID réel de la catégorie
    keywords: [
      // Français
      'électronique',
      'tech',
      'technologie',
      'gadget',
      'appareil',
      // Chinois
      '电子产品',
      '数码',
      '科技',
      '设备',
    ],
    subcategories: {
      // Téléphones et accessoires
      phones: {
        id: 'phones-id',
        keywords: [
          // Français
          'téléphone',
          'smartphone',
          'mobile',
          'portable',
          'coque',
          'protection',
          'chargeur',
          // Chinois
          '手机',
          '智能手机',
          '手机壳',
          '手机套',
          '充电器',
        ],
      },
      // Ordinateurs et accessoires
      computers: {
        id: 'computers-id',
        keywords: [
          // Français
          'ordinateur',
          'pc',
          'laptop',
          'portable',
          'tablette',
          'clavier',
          'souris',
          'tapis de souris',
          // Chinois
          '电脑',
          '笔记本电脑',
          '平板电脑',
          '键盘',
          '鼠标',
          '鼠标垫',
        ],
      },
      // Audio et casques
      audio: {
        id: 'audio-id',
        keywords: [
          // Français
          'audio',
          'écouteur',
          'casque',
          'enceinte',
          'haut-parleur',
          'son',
          'bluetooth',
          // Chinois
          '音频',
          '耳机',
          '耳塘',
          '音箱',
          '音响',
          '蓝牙',
        ],
      },
      // Appareils photo et caméras
      cameras: {
        id: 'cameras-id',
        keywords: [
          // Français
          'appareil photo',
          'caméra',
          'photo',
          'vidéo',
          'objectif',
          'trépied',
          // Chinois
          '相机',
          '摄像头',
          '摄影',
          '镜头',
          '三脚架',
        ],
      },
      // Montres et wearables
      wearables: {
        id: 'wearables-id',
        keywords: [
          // Français
          'montre',
          'montre intelligente',
          'smartwatch',
          'bracelet connecté',
          'tracker',
          // Chinois
          '手表',
          '智能手表',
          '智能手环',
          '运动手环',
        ],
      },
    },
  },

  // Maison et jardin - Catégorie principale
  home: {
    id: 'home-category-id', // À remplacer par l'ID réel de la catégorie
    keywords: [
      // Français
      'maison',
      'intérieur',
      'ameublement',
      'habitat',
      'logement',
      'foyer',
      // Chinois
      '家居',
      '家庭',
      '家居用品',
      '家具',
    ],
    subcategories: {
      // Meubles
      furniture: {
        id: 'furniture-id',
        keywords: [
          // Français
          'meuble',
          'table',
          'chaise',
          'canapé',
          'fauteuil',
          'lit',
          'armoire',
          'commode',
          'étagère',
          // Chinois
          '家具',
          '桌子',
          '椅子',
          '沙发',
          '床',
          '衣柜',
          '橱柜',
          '架子',
        ],
      },
      // Décoration
      decor: {
        id: 'decor-id',
        keywords: [
          // Français
          'décoration',
          'déco',
          'ornement',
          'cadre',
          'tableau',
          'vase',
          'miroir',
          'horloge',
          // Chinois
          '装饰',
          '装饰品',
          '画框',
          '花瓶',
          '镜子',
          '时钟',
        ],
      },
      // Cuisine
      kitchen: {
        id: 'kitchen-id',
        keywords: [
          // Français
          'cuisine',
          'ustensile',
          'casserole',
          'poêle',
          'assiette',
          'verre',
          'couvert',
          'robot',
          // Chinois
          '厨房',
          '厨具',
          '锅',
          '平底锅',
          '盘子',
          '杯子',
          '餐具',
          '食品加工机',
        ],
      },
      // Textile maison
      textiles: {
        id: 'textiles-id',
        keywords: [
          // Français
          'textile',
          'linge',
          'drap',
          'couette',
          'oreiller',
          'serviette',
          'rideau',
          'tapis',
          // Chinois
          '家纺',
          '床上用品',
          '床单',
          '被子',
          '枫头',
          '毛巾',
          '窗帘',
          '地毯',
        ],
      },
      // Jardin
      garden: {
        id: 'garden-id',
        keywords: [
          // Français
          'jardin',
          'extérieur',
          'plante',
          'pot',
          'outil',
          'tondeuse',
          'barbecue',
          'parasol',
          // Chinois
          '花园',
          '室外',
          '植物',
          '花盆',
          '园艺工具',
          '割草机',
          '烤架',
          '太阳伞',
        ],
      },
    },
  },

  // Beauté et santé - Catégorie principale
  beauty: {
    id: 'beauty-category-id', // À remplacer par l'ID réel de la catégorie
    keywords: [
      // Français
      'beauté',
      'soin',
      'cosmétique',
      'bien-être',
      'santé',
      // Chinois
      '美容',
      '护肤',
      '化妆品',
      '养生',
      '健康',
    ],
    subcategories: {
      // Soins de la peau
      skincare: {
        id: 'skincare-id',
        keywords: [
          // Français
          'soin peau',
          'visage',
          'crème',
          'sérum',
          'masque',
          'nettoyant',
          'hydratant',
          // Chinois
          '护肤',
          '面部护理',
          '面霜',
          '精华液',
          '面膜',
          '洁面乳',
          '保湿',
        ],
      },
      // Maquillage
      makeup: {
        id: 'makeup-id',
        keywords: [
          // Français
          'maquillage',
          'fond de teint',
          'rouge à lèvres',
          'mascara',
          'fard',
          'poudre',
          'pinceau',
          // Chinois
          '化妆',
          '粉底液',
          '口红',
          '睡笔',
          '眉笔',
          '脸粉',
          '化妆刷',
        ],
      },
      // Parfums
      fragrance: {
        id: 'fragrance-id',
        keywords: [
          // Français
          'parfum',
          'eau de toilette',
          'cologne',
          'fragrance',
          'senteur',
          // Chinois
          '香水',
          '淡香水',
          '古龙水',
          '花香',
          '香氛',
        ],
      },
      // Soins des cheveux
      haircare: {
        id: 'haircare-id',
        keywords: [
          // Français
          'cheveux',
          'shampooing',
          'après-shampooing',
          'masque capillaire',
          'coiffure',
          'sèche-cheveux',
          // Chinois
          '头发',
          '洗发水',
          '护发素',
          '发膜',
          '造型',
          '吹风机',
        ],
      },
      // Soins personnels
      personal_care: {
        id: 'personal-care-id',
        keywords: [
          // Français
          'hygiène',
          'savon',
          'gel douche',
          'déodorant',
          'rasoir',
          'brosse à dents',
          'dentifrice',
          // Chinois
          '个人护理',
          '肥皮',
          '淋浴露',
          '防汗剂',
          '剑须刀',
          '牙刷',
          '牙膏',
        ],
      },
    },
  },

  // Jouets et jeux - Catégorie principale
  toys: {
    id: 'toys-category-id', // À remplacer par l'ID réel de la catégorie
    keywords: [
      // Français
      'jouet',
      'jeu',
      'divertissement',
      'enfant',
      'loisir',
      // Chinois
      '玩具',
      '游戏',
      '娱乐',
      '儿童',
      '休闲',
    ],
    subcategories: {
      // Jouets pour enfants
      kids_toys: {
        id: 'kids-toys-id',
        keywords: [
          // Français
          'jouet enfant',
          'peluche',
          'poupée',
          'figurine',
          'voiture miniature',
          'jeu de construction',
          // Chinois
          '儿童玩具',
          '毛绒玩具',
          '娃娃',
          '公仙',
          '模型车',
          '积木',
        ],
      },
      // Jeux de société
      board_games: {
        id: 'board-games-id',
        keywords: [
          // Français
          'jeu de société',
          'jeu de plateau',
          'puzzle',
          'carte',
          'dé',
          'stratégie',
          // Chinois
          '桌游',
          '棋盘游戏',
          '拼图',
          '卡牌',
          '骰子',
          '策略游戏',
        ],
      },
      // Jeux vidéo
      video_games: {
        id: 'video-games-id',
        keywords: [
          // Français
          'jeu vidéo',
          'console',
          'manette',
          'accessoire gaming',
          'playstation',
          'xbox',
          'nintendo',
          // Chinois
          '电子游戏',
          '游戏机',
          '手柄',
          '游戏配件',
          '索尼',
          '微软',
          '任天堂',
        ],
      },
      // Jouets éducatifs
      educational: {
        id: 'educational-id',
        keywords: [
          // Français
          'éducatif',
          'apprentissage',
          'science',
          'expérience',
          'robotique',
          'programmation',
          // Chinois
          '教育玩具',
          '学习玩具',
          '科学玩具',
          '实验玩具',
          '机器人',
          '编程',
        ],
      },
      // Jouets d'extérieur
      outdoor_toys: {
        id: 'outdoor-toys-id',
        keywords: [
          // Français
          'jouet extérieur',
          'plein air',
          'ballon',
          'vélo',
          'trottinette',
          'piscine',
          'toboggan',
          // Chinois
          '户外玩具',
          '室外玩具',
          '球',
          '自行车',
          '滑板车',
          '游泳池',
          '滑梯',
        ],
      },
    },
  },

  // Catégorie par défaut
  default: {
    id: 'default-category-id', // À remplacer par l'ID réel de la catégorie par défaut
    keywords: [],
  },
};

/**
 * Détecte la catégorie et sous-catégorie d'un produit en fonction du mot-clé de recherche et du titre
 * @param {string} keyword - Mot-clé de recherche (peut être en chinois ou en français)
 * @param {string} title - Titre du produit (peut être en chinois)
 * @returns {Object} - Objet contenant l'ID de la catégorie principale et de la sous-catégorie détectées
 */
exports.detectCategory = (keyword = '', title = '') => {
  // Texte à analyser (combinaison du mot-clé et du titre)
  const textToAnalyze = `${keyword} ${title}`.toLowerCase();

  // Résultats de la détection
  const result = {
    mainCategoryId: null,
    subCategoryId: null,
    mainCategory: null,
    subCategory: null,
  };

  // Tableau pour stocker les correspondances de catégories principales
  const mainCategoryMatches = [];

  // Tableau pour stocker les correspondances de sous-catégories
  const subCategoryMatches = [];

  // 1. Détection des catégories principales
  for (const [categoryName, categoryData] of Object.entries(categoryKeywords)) {
    if (categoryName === 'default') continue;

    let mainCategoryScore = 0;
    let mainCategoryMatchedKeywords = [];

    // Vérifier les mots-clés de la catégorie principale
    for (const keyword of categoryData.keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        mainCategoryScore += 2; // Score plus élevé pour les catégories principales
        mainCategoryMatchedKeywords.push(keyword);
      }
    }

    // Si au moins un mot-clé correspond, ajouter cette catégorie aux correspondances
    if (mainCategoryScore > 0) {
      mainCategoryMatches.push({
        category: categoryName,
        categoryId: categoryData.id,
        score: mainCategoryScore,
        matchedKeywords: mainCategoryMatchedKeywords,
      });
    }

    // 2. Détection des sous-catégories
    if (categoryData.subcategories) {
      for (const [subCategoryName, subCategoryData] of Object.entries(categoryData.subcategories)) {
        let subCategoryScore = 0;
        let subCategoryMatchedKeywords = [];

        // Vérifier les mots-clés de la sous-catégorie
        for (const keyword of subCategoryData.keywords) {
          if (textToAnalyze.includes(keyword.toLowerCase())) {
            subCategoryScore += 1;
            subCategoryMatchedKeywords.push(keyword);
          }
        }

        // Si au moins un mot-clé correspond, ajouter cette sous-catégorie aux correspondances
        if (subCategoryScore > 0) {
          subCategoryMatches.push({
            mainCategory: categoryName,
            mainCategoryId: categoryData.id,
            subCategory: subCategoryName,
            subCategoryId: subCategoryData.id,
            score: subCategoryScore,
            matchedKeywords: subCategoryMatchedKeywords,
          });
        }
      }
    }
  }

  // 3. Déterminer la catégorie principale
  if (mainCategoryMatches.length > 0) {
    // Trier par score décroissant
    mainCategoryMatches.sort((a, b) => b.score - a.score);
    const bestMainCategory = mainCategoryMatches[0];

    result.mainCategoryId = bestMainCategory.categoryId;
    result.mainCategory = bestMainCategory.category;

    // console.log(`Catégorie principale détectée pour "${keyword} ${title}": ${bestMainCategory.category} (score: ${bestMainCategory.score}, mots-clés: ${bestMainCategory.matchedKeywords.join(', ')})`);
  } else {
    // Si aucune catégorie principale n'est détectée, utiliser la catégorie par défaut
    result.mainCategoryId = categoryKeywords.default.id;
    result.mainCategory = 'default';

    // console.log(`Aucune catégorie principale détectée pour "${keyword} ${title}", utilisation de la catégorie par défaut`);
  }

  // 4. Déterminer la sous-catégorie
  // Filtrer les sous-catégories qui appartiennent à la catégorie principale détectée
  const relevantSubCategories = subCategoryMatches.filter(match => match.mainCategory === result.mainCategory);

  if (relevantSubCategories.length > 0) {
    // Trier par score décroissant
    relevantSubCategories.sort((a, b) => b.score - a.score);
    const bestSubCategory = relevantSubCategories[0];

    result.subCategoryId = bestSubCategory.subCategoryId;
    result.subCategory = bestSubCategory.subCategory;

    // console.log(`Sous-catégorie détectée: ${bestSubCategory.subCategory} (score: ${bestSubCategory.score}, mots-clés: ${bestSubCategory.matchedKeywords.join(', ')})`);
  } else if (subCategoryMatches.length > 0) {
    // Si aucune sous-catégorie de la catégorie principale n'est détectée, prendre la meilleure sous-catégorie globale
    subCategoryMatches.sort((a, b) => b.score - a.score);
    const bestSubCategory = subCategoryMatches[0];

    // Si la sous-catégorie a un score élevé, remplacer la catégorie principale
    if (bestSubCategory.score >= 3) {
      result.mainCategoryId = bestSubCategory.mainCategoryId;
      result.mainCategory = bestSubCategory.mainCategory;
      result.subCategoryId = bestSubCategory.subCategoryId;
      result.subCategory = bestSubCategory.subCategory;

      // console.log(`Catégorie principale remplacée par: ${bestSubCategory.mainCategory} en raison d'une forte correspondance avec la sous-catégorie: ${bestSubCategory.subCategory}`);
    }
  }

  // Retourner l'ID de la catégorie principale (pour compatibilité avec le code existant)
  // Mais aussi stocker la sous-catégorie dans les métadonnées du produit
  return result.mainCategoryId;
};

/**
 * Détecte la catégorie et sous-catégorie d'un produit et retourne les informations complètes
 * @param {string} keyword - Mot-clé de recherche (peut être en chinois ou en français)
 * @param {string} title - Titre du produit (peut être en chinois)
 * @returns {Object} - Objet contenant toutes les informations de catégorisation
 */
exports.detectCategoryFull = (keyword = '', title = '') => {
  // Texte à analyser (combinaison du mot-clé et du titre)
  const textToAnalyze = `${keyword} ${title}`.toLowerCase();

  // Résultats de la détection
  const result = {
    mainCategoryId: null,
    subCategoryId: null,
    mainCategory: null,
    subCategory: null,
  };

  // Tableau pour stocker les correspondances de catégories principales
  const mainCategoryMatches = [];

  // Tableau pour stocker les correspondances de sous-catégories
  const subCategoryMatches = [];

  // 1. Détection des catégories principales
  for (const [categoryName, categoryData] of Object.entries(categoryKeywords)) {
    if (categoryName === 'default') continue;

    let mainCategoryScore = 0;
    let mainCategoryMatchedKeywords = [];

    // Vérifier les mots-clés de la catégorie principale
    for (const keyword of categoryData.keywords) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        mainCategoryScore += 2; // Score plus élevé pour les catégories principales
        mainCategoryMatchedKeywords.push(keyword);
      }
    }

    // Si au moins un mot-clé correspond, ajouter cette catégorie aux correspondances
    if (mainCategoryScore > 0) {
      mainCategoryMatches.push({
        category: categoryName,
        categoryId: categoryData.id,
        score: mainCategoryScore,
        matchedKeywords: mainCategoryMatchedKeywords,
      });
    }

    // 2. Détection des sous-catégories
    if (categoryData.subcategories) {
      for (const [subCategoryName, subCategoryData] of Object.entries(categoryData.subcategories)) {
        let subCategoryScore = 0;
        let subCategoryMatchedKeywords = [];

        // Vérifier les mots-clés de la sous-catégorie
        for (const keyword of subCategoryData.keywords) {
          if (textToAnalyze.includes(keyword.toLowerCase())) {
            subCategoryScore += 1;
            subCategoryMatchedKeywords.push(keyword);
          }
        }

        // Si au moins un mot-clé correspond, ajouter cette sous-catégorie aux correspondances
        if (subCategoryScore > 0) {
          subCategoryMatches.push({
            mainCategory: categoryName,
            mainCategoryId: categoryData.id,
            subCategory: subCategoryName,
            subCategoryId: subCategoryData.id,
            score: subCategoryScore,
            matchedKeywords: subCategoryMatchedKeywords,
          });
        }
      }
    }
  }

  // 3. Déterminer la catégorie principale
  if (mainCategoryMatches.length > 0) {
    // Trier par score décroissant
    mainCategoryMatches.sort((a, b) => b.score - a.score);
    const bestMainCategory = mainCategoryMatches[0];

    result.mainCategoryId = bestMainCategory.categoryId;
    result.mainCategory = bestMainCategory.category;

    // console.log(`Catégorie principale détectée pour "${keyword} ${title}": ${bestMainCategory.category} (score: ${bestMainCategory.score}, mots-clés: ${bestMainCategory.matchedKeywords.join(', ')})`);
  } else {
    // Si aucune catégorie principale n'est détectée, utiliser la catégorie par défaut
    result.mainCategoryId = categoryKeywords.default.id;
    result.mainCategory = 'default';

    // console.log(`Aucune catégorie principale détectée pour "${keyword} ${title}", utilisation de la catégorie par défaut`);
  }

  // 4. Déterminer la sous-catégorie
  // Filtrer les sous-catégories qui appartiennent à la catégorie principale détectée
  const relevantSubCategories = subCategoryMatches.filter(match => match.mainCategory === result.mainCategory);

  if (relevantSubCategories.length > 0) {
    // Trier par score décroissant
    relevantSubCategories.sort((a, b) => b.score - a.score);
    const bestSubCategory = relevantSubCategories[0];

    result.subCategoryId = bestSubCategory.subCategoryId;
    result.subCategory = bestSubCategory.subCategory;

    // console.log(`Sous-catégorie détectée: ${bestSubCategory.subCategory} (score: ${bestSubCategory.score}, mots-clés: ${bestSubCategory.matchedKeywords.join(', ')})`);
  } else if (subCategoryMatches.length > 0) {
    // Si aucune sous-catégorie de la catégorie principale n'est détectée, prendre la meilleure sous-catégorie globale
    subCategoryMatches.sort((a, b) => b.score - a.score);
    const bestSubCategory = subCategoryMatches[0];

    // Si la sous-catégorie a un score élevé, remplacer la catégorie principale
    if (bestSubCategory.score >= 3) {
      result.mainCategoryId = bestSubCategory.mainCategoryId;
      result.mainCategory = bestSubCategory.mainCategory;
      result.subCategoryId = bestSubCategory.subCategoryId;
      result.subCategory = bestSubCategory.subCategory;

      // console.log(`Catégorie principale remplacée par: ${bestSubCategory.mainCategory} en raison d'une forte correspondance avec la sous-catégorie: ${bestSubCategory.subCategory}`);
    }
  }

  return result;
};

/**
 * Récupère les IDs de toutes les catégories disponibles
 * @returns {Object} - Objet contenant les IDs de catégories par nom
 */
exports.getAllCategoryIds = () => {
  const categoryIds = {};

  for (const [category, data] of Object.entries(categoryKeywords)) {
    categoryIds[category] = data.id;
  }

  return categoryIds;
};
