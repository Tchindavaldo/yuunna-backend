const { db } = require('../../config/firebase');

/**
 * Service pour récupérer un produit par son ID
 * @param {string} productId - ID du produit à récupérer
 * @returns {Object} - Résultat de l'opération avec statut et données
 */
exports.getProductByIdService = async (productId) => {
  try {
    if (!productId) {
      return { success: false, message: 'ID du produit non fourni' };
    }

    const productDoc = await db.collection('products').doc(productId).get();
    
    if (!productDoc.exists) {
      return { success: false, message: 'Produit non trouvé', found: false };
    }
    
    const productData = { id: productDoc.id, ...productDoc.data() };
    
    return { success: true, data: productData, found: true };
  } catch (error) {
    console.error('Erreur dans getProductByIdService:', error);
    return { success: false, message: error.message || 'Une erreur est survenue' };
  }
};

/**
 * Service pour récupérer tous les produits ou filtrer par catégorie/utilisateur
 * @param {Object} filters - Filtres à appliquer (categoryId, userId, status)
 * @returns {Object} - Résultat de l'opération avec statut et données
 */
exports.getProductsService = async (filters = {}) => {
  try {
    let query = db.collection('products');
    
    // Application des filtres
    if (filters.categoryId) {
      query = query.where('categoryId', '==', filters.categoryId);
    }
    
    if (filters.userId) {
      query = query.where('userId', '==', filters.userId);
    }
    
    if (filters.status) {
      query = query.where('status', '==', filters.status);
    }
    
    // Tri par date de création (du plus récent au plus ancien)
    query = query.orderBy('createdAt', 'desc');
    
    // Limitation du nombre de résultats si spécifié
    if (filters.limit && !isNaN(parseInt(filters.limit))) {
      query = query.limit(parseInt(filters.limit));
    }
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      return { success: true, data: [], message: 'Aucun produit trouvé' };
    }
    
    const products = [];
    snapshot.forEach(doc => {
      products.push({ id: doc.id, ...doc.data() });
    });
    
    return { success: true, data: products };
  } catch (error) {
    console.error('Erreur dans getProductsService:', error);
    return { success: false, message: error.message || 'Une erreur est survenue' };
  }
};
