// Charger les variables d'environnement
require('dotenv').config();

// Importer directement la configuration Firebase existante
const { db } = require('../config/firebase');

console.log('Connexion à Firebase établie avec succès');

async function deleteProductsWithDefaultImage() {
  try {
    // URL de l'image par défaut à rechercher
    const defaultImageUrl = 'https://img.alicdn.com/imgextra/i3/O1CN01m3E6kP1WV71NJz2cO_!!6000000002786-0-tps-200-200.jpg';
    
    // Rechercher tous les produits avec l'image par défaut
    const productsRef = db.collection('products');
    const snapshot = await productsRef.where('imageUrl', '==', defaultImageUrl).get();
    
    if (snapshot.empty) {
      console.log('Aucun produit trouvé avec l\'image par défaut.');
      return;
    }
    
    // Supprimer chaque produit trouvé
    const batch = db.batch();
    let count = 0;
    
    snapshot.forEach(doc => {
      console.log(`Suppression du produit: ${doc.id} - ${doc.data().titre}`);
      batch.delete(productsRef.doc(doc.id));
      count++;
    });
    
    // Exécuter le batch de suppression
    await batch.commit();
    console.log(`${count} produits avec l'image par défaut ont été supprimés avec succès.`);
    
  } catch (error) {
    console.error('Erreur lors de la suppression des produits:', error);
  }
}

// Exécuter la fonction
deleteProductsWithDefaultImage()
  .then(() => {
    console.log('Opération terminée.');
    process.exit(0);
  })
  .catch(error => {
    console.error('Erreur:', error);
    process.exit(1);
  });
