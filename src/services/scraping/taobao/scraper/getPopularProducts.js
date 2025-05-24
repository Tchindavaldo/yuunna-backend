// src/services/scraping/taobao/scraper/getPopularProducts.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const taobaoAuthService = require('../auth');

/**
 * Récupère les produits populaires sur Taobao
 * @param {number} limit - Nombre maximum de produits à récupérer
 * @returns {Promise<Array>} - Liste des produits
 */
async function getPopularProducts(limit) {
  try {
    // Essayer d'obtenir une page authentifiée via le service d'authentification
    let page;
    try {
      page = await taobaoAuthService.getAuthenticatedPage();
    } catch (authError) {
      console.log('Impossible d\'obtenir une page authentifiée, utilisation d\'une page non authentifiée');
      
      // Si l'authentification échoue, créer une nouvelle page non authentifiée
      const browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
    }
    
    // Accès à une page populaire de Taobao qui affiche des produits
    // Utilisons la page des best-sellers qui est accessible sans authentification
    console.log('Accès à la page des produits populaires sur Taobao...');
    await page.goto('https://www.taobao.com/tbhot/hotItems.htm', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    // Pause pour laisser la page se charger complètement
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Capturer une capture d'écran pour débogage
    await page.screenshot({ path: 'taobao-popular.png' });
    
    // Récupère le contenu HTML de la page
    const content = await page.content();
    
    // Utilise cheerio pour analyser le HTML
    const $ = cheerio.load(content);
    
    // Tableau pour stocker les produits
    const products = [];
    
    // Sélecteurs pour les produits populaires
    const selectors = [
      '.hot-item', // Éléments de produits populaires
      '.item-box', // Boîtes d'articles
      '.product-card', // Cartes de produits
      '.item.J_MouserOnverReq' // Éléments de produits avec interaction
    ];
    
    // Parcours tous les sélecteurs et extrait les produits
    for (const selector of selectors) {
      $(selector).each((index, element) => {
        if (products.length >= limit) return false;
        
        try {
          // Extraire les informations du produit
          const title = $(element).find('.title, .name, .item-name, h4').first().text().trim() || 'Produit Taobao';
          
          // Recherche du prix
          const priceElement = $(element).find('.price, .item-price, .price-info');
          let price = priceElement.length ? priceElement.first().text().trim() : '¥???';
          
          // Nettoyer le prix (enlever les caractères non numériques sauf le symbole ¥)
          price = price.replace(/[^\d¥\.]/g, '');
          if (!price.includes('¥')) price = `¥${price}`;
          
          // Recherche d'image
          let imageUrl = null;
          const imgElement = $(element).find('img').first();
          if (imgElement.length) {
            imageUrl = imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-ks-lazyload');
          }
          
          // Recherche de lien
          let productUrl = null;
          const linkElement = $(element).find('a').first();
          if (linkElement.length) {
            productUrl = linkElement.attr('href');
          }
          
          // Nettoie l'URL de l'image si nécessaire
          const cleanImageUrl = imageUrl ? (imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl) : null;
          
          // Nettoie l'URL du produit si nécessaire
          const cleanProductUrl = productUrl ? (productUrl.startsWith('//') ? `https:${productUrl}` : productUrl) : null;
          
          // Vérifie si nous avons au moins un titre ou une image avant d'ajouter le produit
          if (title || cleanImageUrl) {
            products.push({
              id: `taobao-${Date.now()}-${index}`,
              title: title || 'Produit Taobao',
              price: price,
              imageUrl: cleanImageUrl,
              productUrl: cleanProductUrl,
              source: 'taobao',
              scrapedAt: new Date().toISOString()
            });
          }
        } catch (error) {
          console.error(`Erreur lors de l'extraction du produit ${index}:`, error);
        }
      });
      
      // Si nous avons trouvé des produits avec ce sélecteur, arrêtons la recherche
      if (products.length > 0) break;
    }
    
    // Si aucun produit n'a été trouvé avec les sélecteurs spécifiques,
    // essayons une approche plus générale
    if (products.length === 0) {
      console.log('Aucun produit trouvé avec les sélecteurs spécifiques, essai d\'une approche plus générale...');
      
      // Recherche générale d'images qui pourraient être des produits
      $('a').each((index, element) => {
        if (products.length >= limit) return false;
        
        try {
          // Vérifier si le lien contient une image et du texte (probablement un produit)
          const imgElement = $(element).find('img');
          if (!imgElement.length) return;
          
          const imageUrl = imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-ks-lazyload');
          if (!imageUrl) return;
          
          // Essayer de trouver un titre et un prix
          const title = $(element).text().trim() || 'Produit Taobao';
          const price = $(element).find('.price, .item-price').text().trim() || '¥???';
          
          // Nettoie les URLs
          const cleanImageUrl = imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl;
          const productUrl = $(element).attr('href');
          const cleanProductUrl = productUrl ? (productUrl.startsWith('//') ? `https:${productUrl}` : productUrl) : null;
          
          // Ajoute le produit
          products.push({
            id: `taobao-${Date.now()}-${index}`,
            title: title,
            price: price,
            imageUrl: cleanImageUrl,
            productUrl: cleanProductUrl,
            source: 'taobao',
            scrapedAt: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Erreur lors de l'extraction du produit générique ${index}:`, error);
        }
      });
    }
    
    return products;
  } catch (error) {
    console.error('Erreur lors de la récupération des produits populaires:', error);
    throw error;
  }
}

module.exports = getPopularProducts;
