// src/services/scraping/taobao/auth/initialize.js
const puppeteer = require('puppeteer');

/**
 * Initialise le navigateur et la page
 */
async function initialize() {
  if (this.browser) return;

  this.browser = await puppeteer.launch({
    headless: 'new', // Mode headless pour le serveur
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    defaultViewport: { width: 1366, height: 768 }
  });

  this.page = await this.browser.newPage();
  
  // Configuration pour simuler un utilisateur réel
  await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  
  // Désactiver les requêtes interceptées pour éviter les problèmes
  // await this.page.setRequestInterception(true);
  // this.page.on('request', (request) => {
  //   // Bloquer les ressources non essentielles pour accélérer le chargement
  //   const resourceType = request.resourceType();
  //   if (['image', 'media', 'font'].includes(resourceType)) {
  //     request.abort();
  //   } else {
  //     request.continue();
  //   }
  // });

  // Essayer de charger les cookies existants
  try {
    await this.loadCookies();
    this.isAuthenticated = true; // Supposer que les cookies sont valides
    console.log('Cookies chargés, supposant que l\'utilisateur est authentifié.');
  } catch (error) {
    console.log('Aucun cookie existant trouvé, une authentification sera nécessaire.');
    this.isAuthenticated = false;
  }
}

module.exports = initialize;
