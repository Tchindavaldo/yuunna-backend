const { scrapeTaobaoService } = require('../../services/scraping/taobao selenium/scrapeTaobaoService');

const taobaoController = {
  searchProducts: async (req, res) => {
    try {
      // Récupérer les paramètres de la query
      const { keyword = 'montre', limit = 10 } = req.query;

      // Appeler le service en passant le mot clé et la limite
      const results = await scrapeTaobaoService(keyword, parseInt(limit));

      res.json({ success: true, data: results });
    } catch (error) {
      console.error('Erreur dans searchProducts:', error);
      res.status(500).json({ success: false, message: 'Erreur serveur' });
    }
  },
};

module.exports = taobaoController;
