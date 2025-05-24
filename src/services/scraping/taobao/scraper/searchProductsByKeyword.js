// src/services/scraping/taobao/scraper/searchProductsByKeyword.js
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const taobaoAuthService = require('../auth');

/**
 * Recherche des produits sur Taobao avec un mot-clé
 * @param {string} keyword - Mot-clé de recherche
 * @param {number} limit - Nombre maximum de produits à récupérer
 * @returns {Promise<Array>} - Liste des produits
 */
async function searchProductsByKeyword(keyword, limit) {
  try {
    // Essayer d'obtenir une page authentifiée via le service d'authentification
    let page;
    let browser;
    
    try {
      page = await taobaoAuthService.getAuthenticatedPage();
    } catch (authError) {
      console.log('Impossible d\'obtenir une page authentifiée, utilisation d\'une page non authentifiée');
      
      // Si l'authentification échoue, créer une nouvelle page non authentifiée
      browser = await puppeteer.launch({
        headless: 'new',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
      });
      
      page = await browser.newPage();
      await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
      await page.setViewport({ width: 1366, height: 768 });
    }
    
    // Accède à la page de recherche Taobao
    const searchUrl = `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`;
    console.log(`Accès à l'URL de recherche: ${searchUrl}`);
    
    await page.goto(searchUrl, { waitUntil: 'domcontentloaded', timeout: 60000 });
    
    // Pause plus longue pour laisser la page se charger complètement (y compris le contenu dynamique)
    console.log('Attente du chargement complet de la page...');
    await new Promise(resolve => setTimeout(resolve, 10000));
    
    // Capturer une capture d'écran pour débogage
    await page.screenshot({ path: 'taobao-search.png' });
    
    // Récupère le contenu HTML de la page
    const content = await page.content();
    
    // Utilise cheerio pour analyser le HTML
    const $ = cheerio.load(content);
    
    // Tableau pour stocker les produits
    const products = [];
    
    // Utiliser les nouveaux sélecteurs CSS fournis
    console.log('Extraction des produits avec les nouveaux sélecteurs...');
    
    // Sélecteur principal pour les produits
    const productElements = $('div[class*="search-content-col"] > a');
    console.log(`Nombre d'éléments de produits trouvés: ${productElements.length}`);
    
    productElements.each((index, element) => {
      if (products.length >= limit) return false;
      
      try {
        // Extraire le titre
        let title = '';
        const titleElement = $(element).find('.title--qJ7Xg_90');
        if (titleElement.length) {
          title = titleElement.text().trim();
        } else {
          // Essayer d'autres sélecteurs de titre courants
          const altTitleSelectors = ['.title', 'h4', '.item-name', '.productTitle'];
          for (const selector of altTitleSelectors) {
            const altTitle = $(element).find(selector).text().trim();
            if (altTitle) {
              title = altTitle;
              break;
            }
          }
        }
        
        // Extraire le prix
        let price = '';
        try {
          const priceInt = $(element).find('.priceInt--yqqZMJ5a').text().trim();
          const priceFloat = $(element).find('.priceFloat--XpixvyQ1').text().trim();
          price = `¥${priceInt}${priceFloat}`;
        } catch (error) {
          // Si l'extraction du prix échoue, laisser le prix vide
          price = '';
        }
        
        // Extraire l'URL de l'image
        let imageUrl = '';
        const mainImageElement = $(element).find('img.mainPic--Ds3X7I8z');
        
        if (mainImageElement.length) {
          imageUrl = mainImageElement.attr('src');
        } else {
          // Essayer d'autres sélecteurs d'image courants
          const imgElement = $(element).find('img').first();
          if (imgElement.length) {
            imageUrl = imgElement.attr('src') || imgElement.attr('data-src') || imgElement.attr('data-ks-lazyload');
          }
        }
        
        // Extraire le vendeur
        let vendeur = '';
        const vendeurElement = $(element).find('.shopNameText--DmtlsDKm');
        if (vendeurElement.length) {
          vendeur = vendeurElement.text().trim();
        }
        
        // Extraire l'URL du produit
        let productUrl = $(element).attr('href');
        
        // Extraire la localisation
        let localisation = '';
        const locElements = $(element).find('.procity--wlcT2xH9 span');
        if (locElements.length) {
          localisation = [];
          locElements.each((i, el) => {
            localisation.push($(el).text().trim());
          });
          localisation = localisation.join(' / ');
        }
        
        // Extraire les ventes
        let ventes = '';
        const ventesElement = $(element).find('.realSales--XZJiepmt');
        if (ventesElement.length) {
          ventes = ventesElement.text().trim();
        }
        
        // Nettoyer les URLs
        const cleanImageUrl = imageUrl ? (imageUrl.startsWith('//') ? `https:${imageUrl}` : imageUrl) : null;
        const cleanProductUrl = productUrl ? (productUrl.startsWith('//') ? `https:${productUrl}` : productUrl) : null;
        
        // Si nous avons au moins un titre ou une image, ajouter le produit
        if (title || cleanImageUrl) {
          products.push({
            id: `taobao-${Date.now()}-${index}`,
            title: title || 'Produit Taobao',
            price: price || '¥???',
            imageUrl: cleanImageUrl,
            productUrl: cleanProductUrl,
            vendeur: vendeur,
            localisation: localisation,
            ventes: ventes,
            source: 'taobao',
            scrapedAt: new Date().toISOString()
          });
        }
      } catch (error) {
        console.error(`Erreur lors de l'extraction du produit ${index}:`, error);
      }
    });
    
    // Si aucun produit n'a été trouvé avec les nouveaux sélecteurs, essayer les anciens sélecteurs
    if (products.length === 0) {
      console.log('Aucun produit trouvé avec les nouveaux sélecteurs, essai des sélecteurs alternatifs...');
      
      // Sélecteurs alternatifs pour les produits
      const selectors = [
        '.m-itemlist .items .item',
        '.J_MouserOnverReq',
        '.J_ItemList .item',
        '.product-iWrap',
        '.item.J_MouserOnverReq'
      ];
      
      // Parcours tous les sélecteurs et extrait les produits
      for (const selector of selectors) {
        $(selector).each((index, element) => {
          if (products.length >= limit) return false;
          
          try {
            const title = $(element).find('.title a, .J_ClickStat, .productTitle').text().trim() || 'Produit Taobao';
            const price = $(element).find('.price strong, .productPrice, .price').text().trim() || '¥???';
            
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
    }
    
    // Si aucun produit n'a été trouvé, essayons une approche plus générale
    if (products.length === 0) {
      console.log('Aucun produit trouvé avec les sélecteurs spécifiques, essai d\'une approche plus générale...');
      
      // Recherche générale d'images qui pourraient être des produits
      $('a').each((index, element) => {
        if (products.length >= limit) return false;
        
        try {
          // Vérifier si le lien contient une image (probablement un produit)
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
    
    // Fermer le navigateur si nous en avons créé un nouveau
    if (browser) {
      await browser.close();
    }
    
    return products;
  } catch (error) {
    console.error('Erreur lors de la recherche de produits par mot-clé:', error);
    throw error;
  }
}

module.exports = searchProductsByKeyword;
