const { postProductService, addSingleProductService } = require('../services/product/postProduct.service');
const { getProductByIdService, getProductsService } = require('../services/product/getProduct.service');

/**
 * Contrôleur pour récupérer et ajouter des produits depuis Taobao
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 */
exports.scrapeAndAddProducts = async (req, res) => {
  try {
    const { keyword, limit, categoryId, userId } = req.body;

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez fournir le mot-clé de recherche',
      });
    }

    const result = await postProductService({
      keyword,
      limit: limit ? parseInt(limit) : null, // Si limit n'est pas fourni, passer null pour récupérer tous les produits
      categoryId,
      userId,
    });

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur dans le contrôleur scrapeAndAddProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des produits',
    });
  }
};

/**
 * Contrôleur pour ajouter un produit unique
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 */
exports.addProduct = async (req, res) => {
  try {
    const productData = req.body;

    if (!productData || !productData.titre || !productData.prix || !productData.userId || !productData.categoryId) {
      return res.status(400).json({
        success: false,
        message: 'Données de produit incomplètes',
      });
    }

    const result = await addSingleProductService(productData);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(201).json(result);
  } catch (error) {
    console.error('Erreur dans le contrôleur addProduct:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur serveur lors de l'ajout du produit",
    });
  }
};

/**
 * Contrôleur pour récupérer un produit par son ID
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 */
exports.getProductById = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'ID du produit non fourni',
      });
    }

    const result = await getProductByIdService(productId);

    if (!result.success) {
      return res.status(404).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur dans le contrôleur getProductById:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération du produit',
    });
  }
};

/**
 * Contrôleur pour récupérer tous les produits avec pagination, tri et filtres
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 */
exports.getProducts = async (req, res) => {
  console.log('get de donne par un client');

  try {
    // Récupération des paramètres de requête
    const {
      limit, // Nombre d'éléments par page
      sort, // Critère de tri (ex: "price_asc", "date_desc")
      category, // Filtrage par catégorie
      search, // Recherche textuelle
      userId, // Filtrage par utilisateur
      status, // Filtrage par statut
      categoryId, // Support de l'ancien paramètre pour compatibilité
      cursor, // Nouveau paramètre pour la pagination basée sur le curseur
      lastDocId, // ID du dernier document pour la pagination (compatibilité)
      lastDocData, // Données du dernier document pour la pagination (compatibilité)
    } = req.query;

    console.log('queryy recu ', req.query);

    // Préparation des options pour le service
    const options = {
      limit: parseInt(limit) || 20, // Utilisation de 20 comme valeur par défaut pour être cohérent
      cursor: cursor ? parseInt(cursor) : 0,
      sort: sort || 'date_desc',
      category: category || categoryId, // Support des deux formats
      search: search || '',
      userId: userId || '',
      status: status || 'active',
    };

    // Ajout des paramètres de pagination par lastDoc si présents
    if (lastDocId) {
      // Ajouter toujours lastDocId s'il est présent
      options.lastDocId = lastDocId;
      
      // Si lastDocData est également présent, l'ajouter aussi
      if (lastDocData) {
        try {
          // Parse les données du dernier document si elles sont fournies en string JSON
          options.lastDocData = typeof lastDocData === 'string' ? JSON.parse(lastDocData) : lastDocData;
        } catch (parseError) {
          console.error('Erreur lors du parsing de lastDocData:', parseError);
          // Continue avec seulement lastDocId si le parsing échoue
        }
      } else {
        // Même sans lastDocData, on peut utiliser lastDocId seul
        console.log(`lastDocId fourni sans lastDocData: ${lastDocId}`);
      }
    }

    console.log(`Appel du service getProductsService avec options:`, JSON.stringify(options));

    // Appel du service avec les options
    const result = await getProductsService(options);

    if (!result.success) {
      return res.status(400).json(result);
    }

    // Vérifier que les informations de pagination sont présentes
    if (!result.pagination) {
      console.error(`ERREUR: Le service n'a pas renvoyé d'informations de pagination!`);
      result.pagination = {
        cursor: options.cursor || 0,
        nextCursor: null,
        limit: options.limit || 20,
        hasMore: false,
        totalAvailable: result.items ? result.items.length : 0,
      };
    }

    console.log(`Réponse du service reçue avec succès - ${result.items.length} produits, pagination:`, JSON.stringify(result.pagination));

    // Préparer la réponse finale
    const response = {
      success: true,
      items: result.items,
      pagination: result.pagination,
      // Conserver les informations de lastDoc pour compatibilité avec le code existant
      lastDoc: result.lastDoc
        ? {
            id: result.lastDoc.id,
            lastDocId: result.lastDoc.id,
            lastDocData: JSON.stringify(result.lastDoc.data),
          }
        : null,
      // Ajouter des instructions claires pour la pagination
      nextPageParams:
        result.lastDoc && result.pagination.hasMore
          ? {
              cursor: result.pagination.nextCursor,
              lastDocId: result.lastDoc.id,
              limit: result.pagination.limit,
              // Conserver les autres paramètres de filtrage
              sort: options.sort,
              category: options.category,
              search: options.search,
              userId: options.userId,
              status: options.status,
            }
          : null,
      source: 'firebase',
    };

    // Log des paramètres pour la page suivante
    if (response.nextPageParams) {
      console.log('Paramètres pour la page suivante:', response.nextPageParams);
    }

    console.log(`Envoi de la réponse au client avec ${response.items.length} produits`);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Erreur dans le contrôleur getProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des produits',
      items: [],
      pagination: {
        cursor: req.query.cursor ? parseInt(req.query.cursor) : 0,
        nextCursor: null,
        limit: parseInt(req.query.limit) || 20,
        hasMore: false,
        totalAvailable: 0,
      },
      lastDoc: null,
      source: 'firebase',
    });
  }
};
