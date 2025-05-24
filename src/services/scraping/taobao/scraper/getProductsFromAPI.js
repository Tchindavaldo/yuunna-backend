// src/services/scraping/taobao/scraper/getProductsFromAPI.js

/**
 * Récupère des produits depuis l'API Fake Store
 * @param {number} limit - Nombre maximum de produits à récupérer
 * @returns {Promise<Array>} - Liste des produits
 */
async function getProductsFromAPI(limit) {
  return new Promise((resolve, reject) => {
    fetch('https://fakestoreapi.com/products')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(products => {
        // Limiter le nombre de produits
        const limitedProducts = products.slice(0, limit);
        resolve(limitedProducts);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des produits depuis l\'API:', error);
        
        // En cas d'erreur, renvoyer des produits fictifs pour la démonstration
        const demoProducts = [
          {
            id: 1,
            title: 'fictif',
            price: 199.99,
            description: 'fictif',
            category: 'fictif',
            image: 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg',
            rating: { rate: 4.5, count: 120 }
          }
        ];
        resolve(demoProducts.slice(0, limit));
      });
  });
}

module.exports = getProductsFromAPI;
