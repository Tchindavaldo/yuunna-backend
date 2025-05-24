// src/services/scraping/taobao/scraper/index.js
require('dotenv').config();
const taobaoAuthService = require('../auth');

// Importation des fonctions
const searchProducts = require('./searchProducts');
const getPopularProducts = require('./getPopularProducts');
const searchProductsByKeyword = require('./searchProductsByKeyword');

/**
 * Service pour scraper les produits de Taobao
 */
class TaobaoScraperService {
  constructor() {
    // Lier les méthodes au contexte de l'instance
    this.searchProducts = searchProducts.bind(this);
    this.getPopularProducts = getPopularProducts.bind(this);
    this.searchProductsByKeyword = searchProductsByKeyword.bind(this);
  }
}

module.exports = new TaobaoScraperService();
