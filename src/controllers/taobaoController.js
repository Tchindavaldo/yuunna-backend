// src/controllers/taobaoController.js
const { scrapeTaobaoService } = require('../services/scraping/taobao selenium/scrapeTaobaoService');

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
      const { keyword = 'montre', limit = 10 } = req.query;

      // Convertir la limite en nombre
      const limitNumber = parseInt(limit, 10);

      console.log(`Début de la recherche de produits pour le mot-clé: ${keyword}`);

      // Appel au service de scraping
      const products = await scrapeTaobaoService(keyword, limitNumber);

      // Logger les produits pour vérification
      console.log(`${products.length} produits trouvés:`);
      products.forEach((product, index) => {
        console.log(`Produit ${index + 1}:`);
        console.log(`  - Titre: ${product.titre}`);
        console.log(`  - Prix: ${product.prix}`);
        console.log(`  - Image: ${product.imageUrl ? 'Oui' : 'Non'}`);
        console.log(`  - URL: ${product.lien || 'Non disponible'}`);
        console.log(`  - Vendeur: ${product.vendeur || 'Non disponible'}`);
      });

      return res.status(200).json({
        success: true,
        count: products.length,
        data: products,
      });
    } catch (error) {
      console.error('Erreur dans le contrôleur Taobao:', error);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la recherche de produits sur Taobao',
        error: error.message,
      });
    }
  },
};

module.exports = taobaoController;
