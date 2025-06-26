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
        message: "Veuillez fournir le mot-clé de recherche",
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
 * Contrôleur pour récupérer tous les produits avec filtres optionnels
 * @param {Object} req - Requête HTTP
 * @param {Object} res - Réponse HTTP
 */
exports.getProducts = async (req, res) => {
  try {
    const { categoryId, userId, status, limit } = req.query;

    const filters = {};
    if (categoryId) filters.categoryId = categoryId;
    if (userId) filters.userId = userId;
    if (status) filters.status = status;
    if (limit) filters.limit = limit;

    const result = await getProductsService(filters);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);
  } catch (error) {
    console.error('Erreur dans le contrôleur getProducts:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des produits',
    });
  }
};
