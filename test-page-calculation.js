// Script de test pour la logique de calcul de page Taobao
const TAOBAO_PRODUCTS_PER_PAGE = 48;

/**
 * Calcule le numéro de page Taobao à partir d'une position de curseur
 * @param {number} cursor - Position du curseur
 * @returns {number} - Numéro de page Taobao (commence à 1)
 */
function calculateTaobaoPage(cursor) {
  // Pour s'assurer que le cursor 0 correspond à la page 1
  if (cursor === 0) return 1;
  
  // Sinon, calculer la page en fonction du cursor
  // cursor=48 -> page 2, cursor=96 -> page 3, etc.
  return Math.ceil(cursor / TAOBAO_PRODUCTS_PER_PAGE);
}

// Ancienne fonction pour comparaison
function oldCalculateTaobaoPage(cursor) {
  return Math.floor(cursor / TAOBAO_PRODUCTS_PER_PAGE) + 1;
}

// Tests
console.log('=== Tests de calcul de page Taobao ===');
console.log('Nouvelle fonction:');
console.log('Pour cursor=0, page =', calculateTaobaoPage(0));
console.log('Pour cursor=1, page =', calculateTaobaoPage(1));
console.log('Pour cursor=47, page =', calculateTaobaoPage(47));
console.log('Pour cursor=48, page =', calculateTaobaoPage(48));
console.log('Pour cursor=90, page =', calculateTaobaoPage(90));
console.log('Pour cursor=96, page =', calculateTaobaoPage(96));

console.log('\nAncienne fonction:');
console.log('Pour cursor=0, page =', oldCalculateTaobaoPage(0));
console.log('Pour cursor=1, page =', oldCalculateTaobaoPage(1));
console.log('Pour cursor=47, page =', oldCalculateTaobaoPage(47));
console.log('Pour cursor=48, page =', oldCalculateTaobaoPage(48));
console.log('Pour cursor=90, page =', oldCalculateTaobaoPage(90));
console.log('Pour cursor=96, page =', oldCalculateTaobaoPage(96));
