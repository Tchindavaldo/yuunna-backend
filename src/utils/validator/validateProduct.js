/**
 * Valide les données d'un produit e-commerce
 * @param {Object} data - Données du produit à valider
 * @returns {Array} - Liste des erreurs ou tableau vide si aucune erreur
 */
exports.validateProduct = (data) => {
  const errors = [];

  if (!data) {
    errors.push('Aucune donnée de produit fournie');
    return errors;
  }

  // Vérification des champs obligatoires
  if (!data.titre) errors.push('Le titre du produit est requis');
  if (!data.prix) errors.push('Le prix du produit est requis');
  if (!data.imageUrl) errors.push('L\'URL de l\'image est requise');
  if (!data.lien) errors.push('Le lien du produit est requis');
  // L'identifiant de l'utilisateur est maintenant optionnel
  // La catégorie est maintenant optionnelle car elle peut être détectée automatiquement

  return errors;
};
