const { db } = require('../../config/firebase');

/**
 * Service pour récupérer un produit par son ID
 * @param {string} productId - ID du produit à récupérer
 * @returns {Object} - Résultat de l'opération avec statut et données
 */
exports.getProductByIdService = async productId => {
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
 * Service pour récupérer tous les produits avec pagination, tri et filtres
 * @param {Object} options - Options de pagination et filtrage
 * @param {number} options.page - Numéro de la page (commence à 1)
 * @param {number} options.limit - Nombre d'éléments par page
 * @param {string} options.sort - Critère de tri (ex: "price_asc", "date_desc")
 * @param {string} options.category - Filtrage par catégorie (ID de catégorie)
 * @param {string} options.search - Recherche textuelle
 * @param {string} options.userId - Filtrage par utilisateur
 * @param {string} options.status - Filtrage par statut
 * @param {string} options.lastDocId - ID du dernier document pour la pagination
 * @param {Object} options.lastDocData - Données du dernier document pour la pagination
 * @returns {Object} - Résultat de l'opération avec statut et données
 */
exports.getProductsService = async (options = {}) => {
  try {
    // Log des paramètres reçus
    console.log('=== DÉBUT getProductsService ===');
    console.log('Paramètres reçus:', {
      limit: options.limit,
      cursor: options.cursor,
      sort: options.sort,
      category: options.category,
      search: options.search,
      userId: options.userId,
      status: options.status,
      lastDocId: options.lastDocId,
      lastDocData: options.lastDocData ? 'présent' : 'absent',
    });
    // Paramètres de pagination
    const limit = parseInt(options.limit) || 20; // Limite par défaut de 20 éléments par page comme dans getTaobaoProductsService
    const cursor = options.cursor ? parseInt(options.cursor) : 0;

    // Utiliser la limite passée en paramètre comme limite maximale
    // Création de la requête de base avec la limite spécifiée
    let query = db.collection('products').limit(limit);

    // Application des filtres
    if (options.category) {
      query = query.where('categoryId', '==', options.category);
    }

    if (options.userId) {
      query = query.where('userId', '==', options.userId);
    }

    if (options.status) {
      query = query.where('status', '==', options.status);
    }

    // Gestion du tri
    let sortField = 'createdAt';
    let sortDirection = 'desc'; // desc = du plus récent au plus ancien par défaut

    if (options.sort) {
      const [field, direction] = options.sort.split('_');

      // Champs de tri valides
      const validSortFields = ['date', 'price', 'title'];
      const fieldMapping = {
        date: 'createdAt',
        price: 'prix',
        title: 'titreTraduit',
      };

      if (validSortFields.includes(field) && (direction === 'asc' || direction === 'desc')) {
        sortField = fieldMapping[field];
        sortDirection = direction;
      }
    }

    query = query.orderBy(sortField, sortDirection);

    // Exécution de la requête pour obtenir le nombre total de documents (pour totalAvailable)
    // Note: Cette approche peut être coûteuse pour de grandes collections
    // Une alternative serait de stocker ce nombre dans un document de métadonnées
    let totalAvailable = 0;
    try {
      // Utiliser la même requête de base avec la limite spécifiée
      // pour obtenir un compte des produits correspondant aux filtres
      let countQuery = db.collection('products').limit(limit);

      // Appliquer les mêmes filtres que la requête principale
      if (options.category) {
        countQuery = countQuery.where('categoryId', '==', options.category);
      }

      if (options.userId) {
        countQuery = countQuery.where('userId', '==', options.userId);
      }

      if (options.status) {
        countQuery = countQuery.where('status', '==', options.status);
      }

      const countSnapshot = await countQuery.get();
      totalAvailable = countSnapshot.size;
    } catch (error) {
      console.warn('Impossible de récupérer le nombre total de produits:', error);
    }

    // Gestion de la pagination
    if (options.cursor && options.cursor > 0) {
      // Si c'est une requête de pagination (cursor > 0), lastDocId est obligatoire
      if (!options.lastDocId) {
        console.error('Erreur: lastDocId est obligatoire pour la pagination');
        throw new Error('lastDocId est obligatoire pour la pagination avec cursor > 0');
      }

      try {
        console.log(`Pagination avec lastDocId: ${options.lastDocId}`);
        // Récupérer le document de référence pour startAfter
        const lastDocRef = await db.collection('products').doc(options.lastDocId).get();

        if (lastDocRef.exists) {
          console.log(`Document de référence trouvé, application de startAfter`);
          // Utiliser le document complet comme point de départ pour la pagination
          query = query.startAfter(lastDocRef);
        } else {
          console.warn(`Document de référence NON TROUVÉ pour la pagination: ${options.lastDocId}`);
          throw new Error(`Document de référence non trouvé: ${options.lastDocId}`);
        }
      } catch (error) {
        console.error('Erreur lors de la pagination:', error);
        throw error; // Propager l'erreur pour arrêter l'exécution
      }
    } else {
      console.log('Première page (pas de pagination)');
    }

    // Limiter le nombre de résultats
    query = query.limit(limit + 1); // +1 pour vérifier s'il y a plus de résultats

    // Exécution de la requête
    const snapshot = await query.get();

    if (snapshot.empty) {
      return {
        success: true,
        items: [],
        pagination: {
          cursor: cursor,
          nextCursor: null,
          limit: limit,
          hasMore: false,
          totalAvailable: 0,
        },
        message: 'Aucun produit trouvé',
        lastDoc: null,
      };
    }

    const products = [];
    let lastDoc = null;
    let hasMore = false;
    let nextCursor = null;

    // Si nous avons plus de résultats que la limite, il y a plus de pages
    if (snapshot.docs.length > limit) {
      hasMore = true;
      snapshot.docs.pop(); // Enlever le document supplémentaire
    }

    // Traitement des résultats
    snapshot.forEach(doc => {
      const data = doc.data();

      // Si recherche textuelle, filtrer côté serveur
      if (options.search && options.search.trim() !== '') {
        const searchTerm = options.search.toLowerCase();
        const searchableFields = [data.titreOriginal || '', data.titreTraduit || '', data.mainCategory || '', data.subCategory || '', data.vendeur || ''];
        const searchableText = searchableFields.join(' ').toLowerCase();

        if (searchableText.includes(searchTerm)) {
          products.push({ id: doc.id, ...data });
        }
      } else {
        products.push({ id: doc.id, ...data });
      }

      // Garder une référence au dernier document pour la pagination
      lastDoc = {
        id: doc.id,
        data: data,
      };
    });

    // Si recherche textuelle, ajuster hasMore en fonction des résultats filtrés
    if (options.search && options.search.trim() !== '') {
      hasMore = products.length > limit;
      if (hasMore) {
        products.pop(); // Enlever le document supplémentaire
      }
    }

    // Calculer le prochain curseur pour la pagination
    if (hasMore) {
      nextCursor = cursor + products.length;
    }

    // Créer une structure fixe avec des groupes de 18 produits comme dans le service de scraping
    const PRODUCTS_PER_GROUP = 18;

    // Créer le tableau d'items qui contiendra les objets avec id et products
    const itemsArray = [];

    // Générer un timestamp unique pour tous les IDs
    const timestamp = Date.now();
    const categoryPart = options.category ? options.category.substring(0, 8) : 'all';

    // Créer au moins un groupe, même s'il n'y a pas de produits
    // Chaque groupe aura exactement 18 produits (ou null si pas assez de produits)
    const randomPart1 = Math.random().toString(36).substring(2, 10);
    const groupItem1 = {
      id: `firebase_${categoryPart}_${timestamp}_${randomPart1}`,
      products: [],
    };

    // Remplir le premier groupe avec jusqu'à 18 produits
    for (let i = 0; i < PRODUCTS_PER_GROUP; i++) {
      if (i < products.length) {
        groupItem1.products.push(products[i]);
      } else {
        // Ajouter null pour compléter le groupe si nous n'avons pas assez de produits
        groupItem1.products.push(null);
      }
    }

    // Ajouter le premier groupe au tableau des items
    itemsArray.push(groupItem1);

    console.log(`Création d'un groupe de ${PRODUCTS_PER_GROUP} produits avec l'id ${groupItem1.id}`);

    // Si nous avons plus de 18 produits, créer un deuxième groupe
    if (products.length > PRODUCTS_PER_GROUP) {
      const randomPart2 = Math.random().toString(36).substring(2, 10);
      const groupItem2 = {
        id: `firebase_${categoryPart}_${timestamp}_${randomPart2}`,
        products: [],
      };

      // Remplir le deuxième groupe avec les produits restants
      for (let i = 0; i < PRODUCTS_PER_GROUP; i++) {
        const index = PRODUCTS_PER_GROUP + i;
        if (index < products.length) {
          groupItem2.products.push(products[index]);
        } else {
          // Ajouter null pour compléter le groupe
          groupItem2.products.push(null);
        }
      }

      // Ajouter le deuxième groupe au tableau des items
      itemsArray.push(groupItem2);
      console.log(`Création d'un deuxième groupe de ${PRODUCTS_PER_GROUP} produits avec l'id ${groupItem2.id}`);
    }

    // Log des résultats avant de retourner
    console.log(`Résultats: ${products.length} produits trouvés`);
    console.log('Pagination:', {
      cursor,
      nextCursor,
      hasMore,
      totalAvailable,
    });
    console.log(
      'lastDoc:',
      lastDoc
        ? {
            id: lastDoc.id,
            dataKeys: lastDoc.data ? Object.keys(lastDoc.data) : 'null',
          }
        : 'null'
    );
    console.log('=== FIN getProductsService ===');

    return {
      success: true,
      items: itemsArray,
      pagination: {
        cursor: cursor,
        nextCursor: nextCursor,
        limit: limit,
        hasMore: hasMore,
        totalAvailable: totalAvailable,
      },
      message: products.length > 0 ? `${products.length} produits trouvés` : 'Aucun produit trouvé',
      lastDoc: lastDoc, // Conservé pour compatibilité avec le code existant
    };
  } catch (error) {
    console.error('Erreur dans getProductsService:', error);
    console.log('=== FIN getProductsService (avec erreur) ===');
    return {
      success: false,
      message: error.message || 'Une erreur est survenue',
      items: [],
      pagination: {
        cursor: options.cursor ? parseInt(options.cursor) : 0,
        nextCursor: null,
        limit: parseInt(options.limit) || 20,
        hasMore: false,
        totalAvailable: 0,
      },
      lastDoc: null,
    };
  }
};
