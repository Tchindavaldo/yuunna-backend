// src/services/scraping/taobao/auth/getAuthenticatedPage.js

/**
 * Obtient une page authentifiée pour le scraping
 */
async function getAuthenticatedPage() {
  await this.initialize();
  
  // Vérifier si authentifié, sinon tenter l'authentification
  if (!this.isAuthenticated) {
    const authSuccess = await this.authenticate();
    if (!authSuccess) {
      throw new Error('Impossible d\'obtenir une page authentifiée.');
    }
  }
  
  return this.page;
}

module.exports = getAuthenticatedPage;
