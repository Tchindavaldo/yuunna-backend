const { scrapeTaobaoService } = require('../scraping/taobao selenium/scrapeTaobaoService');
const { detectCategoryFull } = require('../../utils/helpers/categoryDetection');
const { translateFromChinese, containsChineseCharacters } = require('../../utils/helpers/translationHelper');

// Cache global pour stocker les résultats de scraping et éviter de refaire des requêtes inutiles
// Format: { 'keyword1': { products: [...], lastPage: 1, lastUpdated: Date }, 'keyword2': { ... } }
let scrapingCache = {};

// Nombre maximum de produits par page sur Taobao (estimé)
const TAOBAO_PRODUCTS_PER_PAGE = 48;

// Fonction pour nettoyer le cache des entrées trop anciennes (plus de 30 minutes)
function cleanupCache() {
  const now = new Date();
  Object.keys(scrapingCache).forEach(key => {
    if (scrapingCache[key].lastUpdated && now - scrapingCache[key].lastUpdated > 30 * 60 * 1000) {
      console.log(`Nettoyage du cache pour la clé ${key} (données trop anciennes)`);
      delete scrapingCache[key];
    }
  });
}

// Nettoyer le cache périodiquement
setInterval(cleanupCache, 10 * 60 * 1000); // Toutes les 10 minutes

/**
 * Calcule le numéro de page Taobao à partir d'une position de curseur
 * @param {number} cursor - Position du curseur
 * @param {number} limit - Nombre d'éléments par page
 * @returns {number} - Numéro de page Taobao (commence à 1)
 */
function calculateTaobaoPage(cursor, limit) {
  // Taobao a environ 48 produits par page
  // Calcul précis: diviser le cursor par le nombre de produits par page et arrondir au supérieur
  // Pour s'assurer que le cursor 0 correspond à la page 1
  if (cursor === 0) return 1;
  
  // Sinon, calculer la page en fonction du cursor
  // cursor=48 -> page 2, cursor=96 -> page 3, etc.
  return Math.ceil(cursor / TAOBAO_PRODUCTS_PER_PAGE);
}

/**
 * Service pour récupérer les produits directement depuis Taobao sans les stocker dans Firebase
 * @param {Object} options - Options de recherche et pagination
 * @param {string} options.keyword - Mot-clé de recherche sur Taobao
 * @param {number} options.limit - Nombre d'éléments à récupérer
 * @param {string} options.sort - Critère de tri (non utilisé directement avec Taobao)
 * @param {string} options.userId - ID de l'utilisateur pour attribution
 * @param {string} options.cursor - Curseur pour la pagination (position du dernier élément)
 * @returns {Object} - Résultat de l'opération avec statut et données au format attendu par le frontend
 */
exports.getTaobaoProductsService = async (options = {}) => {
  try {
    // Paramètres de recherche et pagination
    const keyword = options.keyword || 'montre';
    const limit = parseInt(options.limit) || 10;
    const userId = options.userId || '';
    const cursor = options.cursor ? parseInt(options.cursor) : 0;

    // Clé de cache unique pour cette recherche - utiliser uniquement le mot-clé
    // car c'est le seul paramètre qui affecte les résultats du scraping
    const cacheKey = keyword.trim().toLowerCase();

    // Calculer la page Taobao correspondant au curseur
    // Si le curseur dépasse le nombre de produits en cache, nous passons à la page suivante
    let taobaoPage = calculateTaobaoPage(cursor, limit);

    // Si nous avons déjà scrapé cette page et que nous sommes à la fin des résultats,
    // nous pouvons essayer de passer à la page suivante
    if (scrapingCache[cacheKey] && taobaoPage <= scrapingCache[cacheKey].lastPage && cursor >= scrapingCache[cacheKey].products.length) {
      taobaoPage = scrapingCache[cacheKey].lastPage + 1;
      console.log(`Passage à la page suivante de Taobao: ${taobaoPage}`);
    }

    console.log(`Recherche pour le mot-clé "${cacheKey}" avec cursor=${cursor}, limit=${limit}, page Taobao=${taobaoPage}`);

    // Vérifier si nous avons déjà des résultats en cache pour cette recherche
    let allScrapedProducts = [];
    let lastPageScraped = 0;

    if (scrapingCache[cacheKey] && Array.isArray(scrapingCache[cacheKey].products)) {
      allScrapedProducts = scrapingCache[cacheKey].products;
      lastPageScraped = scrapingCache[cacheKey].lastPage || 0;
      console.log(`Utilisation du cache pour "${cacheKey}", ${allScrapedProducts.length} produits disponibles, dernière page scrapée: ${lastPageScraped}`);
    }

    // Si nous n'avons pas assez de produits en cache ou si nous devons accéder à une nouvelle page,
    // effectuer une nouvelle requête de scraping
    // Nous vérifions également si nous avons atteint la fin du cache pour passer à la page suivante
    if (allScrapedProducts.length <= cursor + limit || taobaoPage > lastPageScraped) {
      try {
        console.log(`Scraping Taobao pour "${cacheKey}" page ${taobaoPage} (curseur: ${cursor}, limite: ${limit})`);

        // Récupérer les produits de la page Taobao correspondante
        const newProducts = await scrapeTaobaoService(keyword, null, taobaoPage);

        // Vérifier que nous avons bien reçu des produits
        if (Array.isArray(newProducts)) {
          console.log(`${newProducts.length} nouveaux produits récupérés de la page ${taobaoPage} de Taobao`);

          // Si c'est une nouvelle page, ajouter les produits à la fin
          // Sinon, remplacer les produits de cette page dans le cache
          if (taobaoPage > lastPageScraped) {
            // Nouvelle page, ajouter à la fin
            allScrapedProducts = [...allScrapedProducts, ...newProducts];
            console.log(`Ajout de ${newProducts.length} nouveaux produits au cache (nouvelle page ${taobaoPage})`);
          } else if (taobaoPage === 1) {
            // Première page, remplacer tout le cache
            allScrapedProducts = newProducts;
            console.log(`Remplacement complet du cache avec ${newProducts.length} produits (page 1)`);
          } else {
            // Page intermédiaire, remplacer cette section
            const startIndex = (taobaoPage - 1) * TAOBAO_PRODUCTS_PER_PAGE;
            const endIndex = startIndex + TAOBAO_PRODUCTS_PER_PAGE;

            // Créer un nouveau tableau avec les produits mis à jour
            const updatedProducts = [...allScrapedProducts];

            // Remplacer ou ajouter les produits de cette page
            if (startIndex < updatedProducts.length) {
              // Remplacer les produits existants
              for (let i = 0; i < newProducts.length; i++) {
                if (startIndex + i < updatedProducts.length) {
                  updatedProducts[startIndex + i] = newProducts[i];
                } else {
                  updatedProducts.push(newProducts[i]);
                }
              }
            } else {
              // Ajouter à la fin si le startIndex est au-delà de la fin actuelle
              updatedProducts.push(...newProducts);
            }

            allScrapedProducts = updatedProducts;
            console.log(`Mise à jour des produits dans le cache pour la page ${taobaoPage}`);
          }

          // Mettre à jour le cache avec la dernière page scrapée
          scrapingCache[cacheKey] = {
            products: allScrapedProducts,
            lastPage: Math.max(taobaoPage, lastPageScraped),
            lastUpdated: new Date(),
          };

          console.log(`Cache mis à jour pour "${cacheKey}", maintenant ${allScrapedProducts.length} produits disponibles, dernière page: ${scrapingCache[cacheKey].lastPage}`);
        } else {
          console.error(`Erreur: scrapeTaobaoService n'a pas retourné un tableau pour "${cacheKey}" page ${taobaoPage}`);
        }
      } catch (error) {
        console.error(`Erreur lors du scraping pour "${cacheKey}" page ${taobaoPage}: ${error.message}`);
        // Si nous avons une erreur mais que nous avons déjà des produits en cache, continuons avec ce que nous avons
        if (allScrapedProducts.length === 0) {
          throw error; // Propager l'erreur si nous n'avons aucun produit
        }
      }
    }

    // Prendre la tranche correspondant à la position du curseur
    const scrapedProducts = allScrapedProducts.slice(cursor, cursor + limit);

    console.log(`Début de la tranche: ${cursor}, fin: ${cursor + limit}, nombre de produits récupérés: ${scrapedProducts.length}`);

    if (!scrapedProducts || scrapedProducts.length === 0) {
      console.log(`Aucun produit trouvé pour "${cacheKey}" avec cursor=${cursor}, limit=${limit}`);
      return {
        success: true,
        items: [],
        pagination: {
          cursor: cursor,
          nextCursor: null,
          limit: limit,
          hasMore: false,
          totalAvailable: allScrapedProducts.length,
        },
        message: 'Aucun produit trouvé sur Taobao',
        lastDoc: null,
      };
    }

    // Traitement des produits pour les adapter au format attendu
    let products = [];
    let lastDoc = null;

    console.log(`Traitement de ${scrapedProducts.length} produits Taobao pour les adapter au format attendu`);

    // Traiter tous les produits disponibles
    const allFormattedProducts = [];

    // D'abord, formater tous les produits disponibles
    for (let i = 0; i < scrapedProducts.length; i++) {
      const product = scrapedProducts[i];

      // Traitement du titre (traduction si nécessaire)
      let titreOriginal = product.titre || '';
      let titreTraduit = titreOriginal;

      if (containsChineseCharacters(titreOriginal)) {
        try {
          titreTraduit = await translateFromChinese(titreOriginal);
        } catch (error) {
          console.error('Erreur de traduction:', error);
        }
      }

      // Traitement du prix (suppression du symbole ¥ et conversion en nombre)
      let prix = product.prix || '';
      prix = prix.replace('¥', '');
      prix = parseFloat(prix) || 0;

      // Détection de catégorie
      const categoryInfo = detectCategoryFull('', titreOriginal + ' ' + titreTraduit);

      // Création de l'objet produit formaté
      const formattedProduct = {
        id: `taobao_${Date.now()}_${Math.floor(Math.random() * 1000)}`, // ID temporaire
        titreOriginal,
        titreTraduit,
        prix,
        imageUrl: product.imageUrl || '',
        lienOriginal: product.lien || '',
        vendeur: product.vendeur || '',
        localisation: product.localisation || '',
        ventes: product.ventes || '',
        categoryId: categoryInfo.mainCategoryId,
        subCategoryId: categoryInfo.subCategoryId,
        mainCategory: categoryInfo.mainCategory,
        subCategory: categoryInfo.subCategory,
        userId: userId,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      allFormattedProducts.push(formattedProduct);

      // Garder une référence au dernier produit pour la pagination
      lastDoc = {
        id: formattedProduct.id,
        data: formattedProduct,
      };
    }

    // Créer une structure fixe avec des groupes de 18 produits
    const PRODUCTS_PER_GROUP = 18;

    // Créer le tableau d'items qui contiendra les objets avec id et products
    const itemsArray = [];

    // Générer un timestamp unique pour tous les IDs
    const timestamp = Date.now();
    const keywordPart = cacheKey.replace(/[^a-z0-9]/g, '').substring(0, 8);

    // Créer au moins un groupe, même s'il n'y a pas de produits
    // Chaque groupe aura exactement 18 produits (ou null si pas assez de produits)
    const randomPart1 = Math.random().toString(36).substring(2, 10);
    const groupItem1 = {
      id: `items_${keywordPart}_${timestamp}_${randomPart1}`,
      products: [],
    };

    // Remplir le premier groupe avec jusqu'à 18 produits
    for (let i = 0; i < PRODUCTS_PER_GROUP; i++) {
      if (i < allFormattedProducts.length) {
        groupItem1.products.push(allFormattedProducts[i]);
      } else {
        // Ajouter null pour compléter le groupe si nous n'avons pas assez de produits
        groupItem1.products.push(null);
      }
    }

    // Ajouter le premier groupe au tableau des items
    itemsArray.push(groupItem1);

    console.log(`Création d'un groupe de ${PRODUCTS_PER_GROUP} produits avec l'id ${groupItem1.id}`);

    // Si nous avons plus de 18 produits, créer un deuxième groupe
    if (allFormattedProducts.length > PRODUCTS_PER_GROUP) {
      const randomPart2 = Math.random().toString(36).substring(2, 10);
      const groupItem2 = {
        id: `items_${keywordPart}_${timestamp}_${randomPart2}`,
        products: [],
      };

      // Remplir le deuxième groupe avec les produits restants
      for (let i = 0; i < PRODUCTS_PER_GROUP; i++) {
        const index = PRODUCTS_PER_GROUP + i;
        if (index < allFormattedProducts.length) {
          groupItem2.products.push(allFormattedProducts[index]);
        } else {
          // Ajouter null pour compléter le groupe
          groupItem2.products.push(null);
        }
      }

      // Ajouter le deuxième groupe au tableau des items
      itemsArray.push(groupItem2);
      console.log(`Création d'un deuxième groupe de ${PRODUCTS_PER_GROUP} produits avec l'id ${groupItem2.id}`);
    }

    // Créer la structure finale comme demandée
    products = itemsArray;

    // Déterminer s'il y a plus de produits disponibles
    // Si nous avons atteint la fin des produits en cache mais que nous n'avons pas encore atteint
    // la dernière page de Taobao, nous considérons qu'il y a plus de produits disponibles
    const reachedEndOfCache = cursor + limit >= allScrapedProducts.length;
    const canFetchMorePages = lastPageScraped < Math.ceil(allScrapedProducts.length / TAOBAO_PRODUCTS_PER_PAGE) + 1;

    // hasMore est vrai si nous n'avons pas atteint la fin du cache OU si nous pouvons chercher plus de pages
    const hasMore = !reachedEndOfCache || canFetchMorePages;

    // Calculer le prochain curseur pour la pagination
    // Si nous sommes à la fin du cache mais pouvons chercher plus de pages, nous utilisons quand même
    // le prochain curseur pour forcer une nouvelle requête à la page suivante de Taobao
    const nextCursor = hasMore ? cursor + limit : null;

    console.log(`Génération de la réponse avec pagination: cursor=${cursor}, nextCursor=${nextCursor}, hasMore=${hasMore}`);

    // Préparer la réponse avec les informations de pagination
    const response = {
      success: true,
      items: products,
      pagination: {
        cursor: cursor,
        nextCursor: nextCursor,
        limit: limit,
        hasMore: hasMore,
        totalAvailable: allScrapedProducts.length,
      },
      lastDoc: lastDoc, // Pour compatibilité avec l'API existante
      source: 'taobao_direct', // Indicateur que les produits viennent directement de Taobao
    };

    console.log(`Réponse prête à être envoyée avec ${products.length} produits et pagination: `, JSON.stringify(response.pagination));

    return response;
  } catch (error) {
    console.error('Erreur dans getTaobaoProductsService:', error);
    return {
      success: false,
      message: error.message || 'Une erreur est survenue lors de la récupération des produits Taobao',
      items: [],
      hasMore: false,
      limit: 10,
      lastDoc: null,
    };
  }
};
