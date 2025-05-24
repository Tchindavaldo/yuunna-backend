// src/services/database/firebase/product.service.js
const admin = require('firebase-admin');
const { v4: uuidv4 } = require('uuid');

/**
 * Service pour gérer les produits dans Firebase
 */
class ProductService {
  constructor() {
    // Vérifier si Firebase est déjà initialisé
    if (!admin.apps.length) {
      try {
        // Initialisation de Firebase Admin avec les variables d'environnement
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
          }),
          databaseURL: process.env.FIREBASE_DATABASE_URL
        });
      } catch (error) {
        console.error('Erreur lors de l\'initialisation de Firebase:', error);
      }
    }
    
    // Référence à la collection des produits
    this.productsCollection = admin.firestore().collection('products');
  }

  /**
   * Ajoute un produit à Firebase
   * @param {Object} product - Produit à ajouter
   * @returns {Promise<string>} - ID du produit ajouté
   */
  async addProduct(product) {
    try {
      // Générer un ID unique si non fourni
      const productId = product.id || `product-${uuidv4()}`;
      
      // Ajouter un timestamp si non présent
      const productWithTimestamp = {
        ...product,
        createdAt: product.createdAt || admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      // Ajouter le produit à Firestore
      await this.productsCollection.doc(productId).set(productWithTimestamp);
      
      console.log(`Produit ajouté à Firebase avec l'ID: ${productId}`);
      return productId;
    } catch (error) {
      console.error('Erreur lors de l\'ajout du produit à Firebase:', error);
      throw error;
    }
  }

  /**
   * Ajoute plusieurs produits à Firebase
   * @param {Array} products - Liste des produits à ajouter
   * @returns {Promise<Array>} - Liste des IDs des produits ajoutés
   */
  async addProducts(products) {
    try {
      const batch = admin.firestore().batch();
      const productIds = [];
      
      // Traiter chaque produit
      products.forEach(product => {
        const productId = product.id || `product-${uuidv4()}`;
        productIds.push(productId);
        
        const productRef = this.productsCollection.doc(productId);
        
        // Ajouter des timestamps
        const productWithTimestamp = {
          ...product,
          createdAt: product.createdAt || admin.firestore.FieldValue.serverTimestamp(),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        batch.set(productRef, productWithTimestamp);
      });
      
      // Exécuter le batch
      await batch.commit();
      
      console.log(`${products.length} produits ajoutés à Firebase`);
      return productIds;
    } catch (error) {
      console.error('Erreur lors de l\'ajout des produits à Firebase:', error);
      throw error;
    }
  }

  /**
   * Récupère un produit par son ID
   * @param {string} productId - ID du produit
   * @returns {Promise<Object|null>} - Produit ou null si non trouvé
   */
  async getProductById(productId) {
    try {
      const productDoc = await this.productsCollection.doc(productId).get();
      
      if (!productDoc.exists) {
        console.log(`Produit avec l'ID ${productId} non trouvé`);
        return null;
      }
      
      return { id: productDoc.id, ...productDoc.data() };
    } catch (error) {
      console.error('Erreur lors de la récupération du produit:', error);
      throw error;
    }
  }

  /**
   * Récupère tous les produits
   * @param {number} limit - Nombre maximum de produits à récupérer
   * @returns {Promise<Array>} - Liste des produits
   */
  async getAllProducts(limit = 100) {
    try {
      const snapshot = await this.productsCollection
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();
      
      const products = [];
      snapshot.forEach(doc => {
        products.push({ id: doc.id, ...doc.data() });
      });
      
      return products;
    } catch (error) {
      console.error('Erreur lors de la récupération des produits:', error);
      throw error;
    }
  }

  /**
   * Recherche des produits par mot-clé
   * @param {string} keyword - Mot-clé de recherche
   * @param {number} limit - Nombre maximum de produits à récupérer
   * @returns {Promise<Array>} - Liste des produits correspondants
   */
  async searchProducts(keyword, limit = 20) {
    try {
      // Convertir le mot-clé en minuscules pour une recherche insensible à la casse
      const keywordLower = keyword.toLowerCase();
      
      // Récupérer tous les produits (limité à une valeur raisonnable)
      const allProducts = await this.getAllProducts(100);
      
      // Filtrer les produits qui contiennent le mot-clé
      const filteredProducts = allProducts.filter(product => {
        const title = (product.title || '').toLowerCase();
        const description = (product.description || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        
        return title.includes(keywordLower) || 
               description.includes(keywordLower) || 
               category.includes(keywordLower);
      });
      
      // Limiter les résultats
      return filteredProducts.slice(0, limit);
    } catch (error) {
      console.error('Erreur lors de la recherche de produits:', error);
      throw error;
    }
  }

  /**
   * Met à jour un produit
   * @param {string} productId - ID du produit à mettre à jour
   * @param {Object} productData - Nouvelles données du produit
   * @returns {Promise<void>}
   */
  async updateProduct(productId, productData) {
    try {
      // Ajouter un timestamp de mise à jour
      const updatedData = {
        ...productData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      };
      
      await this.productsCollection.doc(productId).update(updatedData);
      console.log(`Produit ${productId} mis à jour avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la mise à jour du produit ${productId}:`, error);
      throw error;
    }
  }

  /**
   * Supprime un produit
   * @param {string} productId - ID du produit à supprimer
   * @returns {Promise<void>}
   */
  async deleteProduct(productId) {
    try {
      await this.productsCollection.doc(productId).delete();
      console.log(`Produit ${productId} supprimé avec succès`);
    } catch (error) {
      console.error(`Erreur lors de la suppression du produit ${productId}:`, error);
      throw error;
    }
  }
}

module.exports = new ProductService();
