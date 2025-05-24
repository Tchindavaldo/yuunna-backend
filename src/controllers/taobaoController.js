// src/controllers/taobaoController.js
const { scraperService } = require('../services/scraping/taobao');

/**
 * Contrôleur pour les opérations liées à Taobao
 */
const taobaoController = {
  /**
   * Recherche des produits sur Taobao
   * @param {Object} req - Requête Express
   * @param {Object} res - Réponse Express
   */
  searchProducts: async (req, res) => {
    try {
      const { keyword, limit } = req.query;
      
      // Le mot-clé est optionnel - s'il n'est pas fourni, on récupère les produits de la page d'accueil
      const limitNumber = limit ? parseInt(limit, 10) : 10;
      
      console.log(`Début de la recherche de produits${keyword ? ` pour le mot-clé: ${keyword}` : ' sur la page populaire'}`);
      
      // Appel au service de scraping
      const products = await scraperService.searchProducts(keyword, limitNumber);
      
      // Logger les produits pour vérification
      console.log(`${products.length} produits trouvés:`);
      products.forEach((product, index) => {
        console.log(`Produit ${index + 1}:`);
        console.log(`  - Titre: ${product.title}`);
        console.log(`  - Prix: ${product.price}`);
        console.log(`  - Image: ${product.imageUrl ? 'Oui' : 'Non'}`);
        console.log(`  - URL: ${product.productUrl || 'Non disponible'}`);
        console.log(`  - Source: ${product.source}`);
      });
      
      return res.status(200).json({
        success: true,
        count: products.length,
        products
      });
    } catch (error) {
      console.error('Erreur dans le contrôleur Taobao:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche de produits sur Taobao',
        error: error.message
      });
    }
  }
};

module.exports = taobaoController;
