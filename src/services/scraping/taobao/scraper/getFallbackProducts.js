// src/services/scraping/taobao/scraper/getFallbackProducts.js

/**
 * Récupère des produits de secours depuis l'API Fake Store
 * @param {string} keyword - Mot-clé de recherche
 * @param {number} limit - Nombre maximum de produits à récupérer
 * @returns {Promise<Array>} - Liste des produits
 */
async function getFallbackProducts(keyword, limit) {
  return new Promise((resolve, reject) => {
    // Utiliser fetch pour récupérer les produits de l'API Fake Store
    fetch('https://fakestoreapi.com/products')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        return response.json();
      })
      .then(products => {
        // Filtre les produits par mot-clé si spécifié
        const filteredProducts = keyword
          ? products.filter(product => 
              product.title.toLowerCase().includes(keyword.toLowerCase()) ||
              product.description.toLowerCase().includes(keyword.toLowerCase()) ||
              product.category.toLowerCase().includes(keyword.toLowerCase())
            )
          : products;
        
        // Transforme les données pour simuler des produits Taobao
        const formattedProducts = filteredProducts.slice(0, limit).map(product => ({
          id: product.id,
          title: product.title,
          price: `¥${Math.round(product.price * 7.2)}`, // Conversion approximative en Yuan
          originalPrice: product.price,
          imageUrl: product.image,
          productUrl: `https://taobao.com/product/${product.id}`, // URL fictive
          description: product.description,
          category: product.category,
          rating: product.rating,
          source: 'taobao (fallback)',
          scrapedAt: new Date().toISOString()
        }));
        
        console.log(`${formattedProducts.length} produits trouvés (solution de secours)${keyword ? ` pour "${keyword}"` : ''}`);
        
        resolve(formattedProducts);
      })
      .catch(error => {
        console.error('Erreur lors de la récupération des produits de secours:', error);
        
        // En cas d'erreur, renvoyer des produits fictifs pour la démonstration
        const demoProducts = [
          {
            id: 1,
            title: 'fictif',
            price: '¥1440',
            originalPrice: 199.99,
            description: 'fictif',
            category: 'fictif',
            imageUrl: 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg',
            productUrl: 'https://taobao.com/product/demo1',
            rating: { rate: 4.5, count: 120 },
            source: 'taobao (fallback)',
            scrapedAt: new Date().toISOString()
          }
        ];
        
        resolve(demoProducts.slice(0, limit));
      });
  });
}

module.exports = getFallbackProducts;
