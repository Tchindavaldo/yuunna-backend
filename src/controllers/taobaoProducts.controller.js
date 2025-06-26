const { getTaobaoProductsService } = require('../services/product/getTaobaoProducts.service');

/**
 * Contrôleur pour récupérer les produits directement depuis Taobao
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 */
exports.getTaobaoProducts = async (req, res) => {
  try {
    // Récupération des paramètres de requête
    const {
      keyword, // Mot-clé de recherche
      cursor, // Position du curseur pour la pagination
      limit, // Nombre d'éléments par page
      sort, // Critère de tri (non utilisé directement avec Taobao)
      userId, // ID de l'utilisateur pour attribution
    } = req.query;

    const parsedCursor = cursor ? parseInt(cursor) : 0;
    const parsedLimit = parseInt(limit) || 10;

    console.log('controller du scrab taobao');

    console.log(`Récupération des produits Taobao demandée - keyword: "${keyword}", cursor: ${parsedCursor}, limit: ${parsedLimit}`);

    // Préparation des options pour le service
    const options = {
      keyword: keyword || 'montre',
      cursor: parsedCursor,
      limit: parsedLimit,
      sort: sort || 'date_desc',
      userId: userId || '',
    };

    console.log(`Appel du service getTaobaoProductsService avec options:`, JSON.stringify(options));

    // Appel du service avec les options
    const result = await getTaobaoProductsService(options);

    if (!result.success) {
      console.log(`Erreur retournée par le service:`, result.message);
      return res.status(400).json(result);
    }

    // Vérifier que les informations de pagination sont présentes
    if (!result.pagination) {
      console.error(`ERREUR: Le service n'a pas renvoyé d'informations de pagination!`);
      result.pagination = {
        cursor: parsedCursor,
        nextCursor: null,
        limit: parsedLimit,
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
      // Conserver les informations de lastDoc pour compatibilité
      lastDoc: result.lastDoc
        ? {
            id: result.lastDoc.id,
            data: result.lastDoc.data,
          }
        : null,
      source: result.source || 'taobao_direct',
    };

    console.log(`Envoi de la réponse au client avec ${response.items.length} produits`);
    return res.status(200).json(response);
  } catch (error) {
    console.error('Erreur dans le contrôleur getTaobaoProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des produits Taobao',
      items: [],
      hasMore: false,
      limit: 10,
      lastDoc: null,
    });
  }
};
