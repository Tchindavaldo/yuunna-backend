const { admin, db } = require('../../config/firebase');
const { getIO } = require('../../socket');
const { validateProduct } = require('../../utils/validator/validateProduct');
const { scrapeTaobaoService } = require('../scraping/taobao selenium/scrapeTaobaoService');
const { detectCategory, detectCategoryFull } = require('../../utils/helpers/categoryDetection');
const { translateFromChinese, containsChineseCharacters } = require('../../utils/helpers/translationHelper');

/**
 * Service pour ajouter un produit dans Firebase après scraping de Taobao
 * @param {Object} data - Données de base du produit (keyword, categoryId, userId, etc.)
 * @returns {Object} - Résultat de l'opération avec statut et données
 */
exports.postProductService = async (data) => {
  try {
    const io = getIO();
    
    // Récupération des produits depuis Taobao
    // Si data.limit est null ou undefined, on passe null pour récupérer tous les produits
    const scrapedProducts = await scrapeTaobaoService(data.keyword, data.limit);
    
    if (!scrapedProducts || scrapedProducts.length === 0) {
      return { success: false, message: 'Aucun produit trouvé sur Taobao' };
    }
    
    // Traitement et ajout des produits à Firebase
    const savedProducts = [];
    const errors = [];
    
    for (const product of scrapedProducts) {
      // Vérifier si le titre contient des caractères chinois et le traduire si nécessaire
      let titreOriginal = product.titre;
      let titreTraduit = '';
      
      if (containsChineseCharacters(titreOriginal)) {
        titreTraduit = await translateFromChinese(titreOriginal);
      }
      
      // Détection complète de la catégorie (principale et sous-catégorie)
      const categoryInfo = detectCategoryFull(data.keyword, titreOriginal + ' ' + titreTraduit);
      const detectedCategoryId = data.categoryId || categoryInfo.mainCategoryId;
      
      // Préparation des données du produit
      const productData = {
        ...product,
        categoryId: detectedCategoryId,
        subCategoryId: categoryInfo.subCategoryId,
        mainCategory: categoryInfo.mainCategory,
        subCategory: categoryInfo.subCategory,
        titreOriginal: titreOriginal,
        titreTraduit: titreTraduit || titreOriginal, // Si pas de traduction, utiliser l'original
        searchKeyword: data.keyword, // Enregistrer le mot-clé de recherche utilisé
        status: 'active',
        createdAt: new Date().toISOString(),
        source: 'taobao'
      };
      
      // Ajouter l'userId s'il est fourni
      if (data.userId) {
        productData.userId = data.userId;
      }
      
      // Validation du produit
      const validationErrors = validateProduct(productData);
      if (validationErrors.length > 0) {
        errors.push({ product: product.titre, errors: validationErrors });
        continue;
      };
      
      // Ajout à Firebase
      try {
        const docRef = await db.collection('products').add(productData);
        const productAdded = { ...productData, id: docRef.id };
        savedProducts.push(productAdded);
        
        // Notification via socket.io
        io.emit('newProduct', { message: 'Nouveau produit', product: productAdded });
        
        // Notification à l'utilisateur spécifique si un userId est fourni
        if (data.userId) {
          io.to(data.userId).emit('newUserProduct', { message: 'Nouveau produit', product: productAdded });
        }
      } catch (error) {
        errors.push({ product: product.titre, error: error.message });
      }
    }
    
    // Préparation de la réponse
    if (savedProducts.length === 0) {
      return { 
        success: false, 
        message: 'Échec de l\'ajout des produits', 
        errors 
      };
    }
    
    return { 
      success: true, 
      data: savedProducts, 
      message: `${savedProducts.length} produits ajoutés avec succès`,
      errors: errors.length > 0 ? errors : undefined
    };
  } catch (error) {
    console.error('Erreur dans postProductService:', error);
    return { success: false, message: error.message || 'Une erreur est survenue' };
  }
};

/**
 * Service pour ajouter un produit unique dans Firebase
 * @param {Object} productData - Données complètes du produit
 * @returns {Object} - Résultat de l'opération avec statut et données
 */
exports.addSingleProductService = async (productData) => {
  try {
    const io = getIO();
    
    // Vérifier si le titre contient des caractères chinois et le traduire si nécessaire
    let titreOriginal = productData.titre;
    let titreTraduit = '';
    
    if (containsChineseCharacters(titreOriginal)) {
      titreTraduit = await translateFromChinese(titreOriginal);
      productData.titreOriginal = titreOriginal;
      productData.titreTraduit = titreTraduit;
    }
    
    // Détection complète de la catégorie (principale et sous-catégorie)
    if (!productData.categoryId) {
      const categoryInfo = detectCategoryFull('', titreOriginal + ' ' + titreTraduit);
      productData.categoryId = categoryInfo.mainCategoryId;
      productData.subCategoryId = categoryInfo.subCategoryId;
      productData.mainCategory = categoryInfo.mainCategory;
      productData.subCategory = categoryInfo.subCategory;
    }
    
    // Validation du produit
    const validationErrors = validateProduct(productData);
    if (validationErrors.length > 0) {
      return { success: false, message: validationErrors };
    }
    
    // Ajout des champs supplémentaires
    const completeProductData = {
      ...productData,
      searchKeyword: productData.searchKeyword || '', // Enregistrer le mot-clé de recherche s'il est fourni
      status: productData.status || 'active',
      createdAt: new Date().toISOString()
    };
    
    // Ajout à Firebase
    const docRef = await db.collection('products').add(completeProductData);
    const productAdded = { ...completeProductData, id: docRef.id };
    
    // Notification via socket.io
    io.emit('newProduct', { message: 'Nouveau produit', product: productAdded });
    io.to(productData.userId).emit('newUserProduct', { message: 'Nouveau produit', product: productAdded });
    
    return { 
      success: true, 
      data: productAdded, 
      message: 'Produit ajouté avec succès' 
    };
  } catch (error) {
    console.error('Erreur dans addSingleProductService:', error);
    return { success: false, message: error.message || 'Une erreur est survenue' };
  }
};
