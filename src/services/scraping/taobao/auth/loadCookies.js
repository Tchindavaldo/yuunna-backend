// src/services/scraping/taobao/auth/loadCookies.js
const fs = require('fs').promises;

/**
 * Charge les cookies existants
 */
async function loadCookies() {
  try {
    const cookiesString = await fs.readFile(this.cookiesPath, 'utf8');
    const cookies = JSON.parse(cookiesString);
    
    if (cookies.length > 0) {
      await this.page.setCookie(...cookies);
      console.log('Cookies chargés avec succès.');
      return true;
    }
  } catch (error) {
    console.error('Erreur lors du chargement des cookies:', error.message);
    return false;
  }
}

module.exports = loadCookies;
