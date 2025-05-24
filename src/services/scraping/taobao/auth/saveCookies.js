// src/services/scraping/taobao/auth/saveCookies.js
const fs = require('fs').promises;
const path = require('path');

/**
 * Sauvegarde les cookies actuels
 */
async function saveCookies() {
  try {
    const cookies = await this.page.cookies();
    await fs.mkdir(path.dirname(this.cookiesPath), { recursive: true });
    await fs.writeFile(this.cookiesPath, JSON.stringify(cookies, null, 2));
    console.log('Cookies sauvegardés avec succès.');
    return true;
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des cookies:', error.message);
    return false;
  }
}

module.exports = saveCookies;
