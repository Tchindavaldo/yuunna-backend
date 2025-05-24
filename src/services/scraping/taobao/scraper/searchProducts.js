// src/services/scraping/taobao/scraper/searchProducts.js

/**
 * Recherche des produits sur Taobao
 * @param {string} keyword - Mot-clé de recherche (optionnel)
 * @param {number} limit - Nombre maximum de produits à récupérer
 * @returns {Promise<Array>} - Liste des produits trouvés
 */
async function searchProducts(keyword, limit = 20) {
  console.log(`Recherche de produits Taobao${keyword ? ` pour: ${keyword}` : ' (page populaire)'}`);

  try {
    // Scraper les produits Taobao
    const products = keyword ? await this.searchProductsByKeyword(keyword, limit) : await this.getPopularProducts(limit);

    console.log(`${products.length} produits trouvés sur Taobao${keyword ? ` pour "${keyword}"` : ' (page populaire)'}`);

    return products;
  } catch (error) {
    console.error('Erreur lors du scraping de Taobao:', error);
    // Retourner un tableau vide en cas d'erreur
    return [];
  }
}

module.exports = searchProducts;
