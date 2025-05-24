// src/services/scraping/taobao/taobao-scraper.service.js
require('dotenv').config();
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const taobaoAuthService = require('./taobao-auth.service');

/**
 * Service pour scraper les produits de Taobao
 */
class TaobaoScraperService {
  /**
   * Recherche des produits sur Taobao
   * @param {string} keyword - Mot-clé de recherche (optionnel)
   * @param {number} limit - Nombre maximum de produits à récupérer
   * @returns {Promise<Array>} - Liste des produits trouvés
   */
  async searchProducts(keyword, limit = 20) {
    console.log(`Recherche de produits Taobao${keyword ? ` pour: ${keyword}` : ' (page populaire)'}`);
    
    try {
      // Essayer d'abord de scraper les vrais produits Taobao
      const products = keyword
        ? await this.searchProductsByKeyword(keyword, limit)
        : await this.getPopularProducts(limit);
      
      console.log(`${products.length} produits trouvés sur Taobao${keyword ? ` pour "${keyword}"` : ' (page populaire)'}`);
      
      return products;
    } catch (error) {
      console.error('Erreur lors du scraping de Taobao:', error);
      
      // En cas d'erreur, utiliser l'API Fake Store comme solution de secours
      console.log('Utilisation de l\'API Fake Store comme solution de secours...');
      return this.getFallbackProducts(keyword, limit);
    }
  }
  
  /**
   * Récupère les produits populaires sur Taobao
   * @param {number} limit - Nombre maximum de produits à récupérer
   * @returns {Promise<Array>} - Liste des produits
   */
  async getPopularProducts(limit) {
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
  
  /**
   * Recherche des produits sur Taobao avec un mot-clé
   * @param {string} keyword - Mot-clé de recherche
   * @param {number} limit - Nombre maximum de produits à récupérer
   * @returns {Promise<Array>} - Liste des produits
   */
  async searchProductsByKeyword(keyword, limit) {
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
          const priceIntElement = $(element).find('.priceInt--yqqZMJ5a');
          const priceFloatElement = $(element).find('.priceFloat--XpixvyQ1');
          
          if (priceIntElement.length && priceFloatElement.length) {
            const priceInt = priceIntElement.text().trim();
            const priceFloat = priceFloatElement.text().trim();
            price = `¥${priceInt}${priceFloat}`;
          } else {
            // Essayer d'autres sélecteurs de prix courants
            const altPriceSelectors = ['.price', '.price strong', '.productPrice', '.item-price'];
            for (const selector of altPriceSelectors) {
              const altPrice = $(element).find(selector).text().trim();
              if (altPrice) {
                // S'assurer que le prix a le symbole yuan
                price = altPrice.includes('¥') ? altPrice : `¥${altPrice}`;
                break;
              }
            }
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
  
  /**
   * Récupère des produits de secours depuis l'API Fake Store
   * @param {string} keyword - Mot-clé de recherche
   * @param {number} limit - Nombre maximum de produits à récupérer
   * @returns {Promise<Array>} - Liste des produits
   */
  async getFallbackProducts(keyword, limit) {
    return new Promise((resolve, reject) => {
      // Utiliser fetch pour récupérer les produits de l'API Fake Store
      fetch('https://fakestoreapi.com/products')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then(products => {
          // Filtre les produits par mot-clé si spécifié
          const filteredProducts = keyword
            ? products.filter(product => 
                product.title.toLowerCase().includes(keyword.toLowerCase()) ||
                product.description.toLowerCase().includes(keyword.toLowerCase()) ||
                product.category.toLowerCase().includes(keyword.toLowerCase())
              )
            : products;
          
          // Transforme les données pour simuler des produits Taobao
          const formattedProducts = filteredProducts.slice(0, limit).map(product => ({
            id: product.id,
            title: product.title,
            price: `¥${Math.round(product.price * 7.2)}`, // Conversion approximative en Yuan
            originalPrice: product.price,
            imageUrl: product.image,
            productUrl: `https://taobao.com/product/${product.id}`, // URL fictive
            description: product.description,
            category: product.category,
            rating: product.rating,
            source: 'taobao (fallback)',
            scrapedAt: new Date().toISOString()
          }));
          
          console.log(`${formattedProducts.length} produits trouvés (solution de secours)${keyword ? ` pour "${keyword}"` : ''}`);
          
          resolve(formattedProducts);
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des produits de secours:', error);
          
          // En cas d'erreur, renvoyer des produits fictifs pour la démonstration
          const demoProducts = [
            {
              id: 1,
              title: 'Smartphone Xiaomi Redmi Note 12',
              price: '¥1440',
              originalPrice: 199.99,
              description: 'Smartphone Android avec écran 6.67 pouces, 128GB de stockage',
              category: 'electronics',
              imageUrl: 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg',
              productUrl: 'https://taobao.com/product/demo1',
              rating: { rate: 4.5, count: 120 },
              source: 'taobao (fallback)',
              scrapedAt: new Date().toISOString()
            },
            {
              id: 2,
              title: 'T-shirt Homme Casual',
              price: '¥161',
              originalPrice: 22.3,
              description: 'T-shirt slim fit pour homme, 100% coton',
              category: 'clothing',
              imageUrl: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
              productUrl: 'https://taobao.com/product/demo2',
              rating: { rate: 4.1, count: 259 },
              source: 'taobao (fallback)',
              scrapedAt: new Date().toISOString()
            },
            {
              id: 3,
              title: 'Bracelet en Or',
              price: '¥5004',
              originalPrice: 695,
              description: 'Bracelet en or 18 carats, design élégant',
              category: 'jewelry',
              imageUrl: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
              productUrl: 'https://taobao.com/product/demo3',
              rating: { rate: 4.6, count: 400 },
              source: 'taobao (fallback)',
              scrapedAt: new Date().toISOString()
            },
            {
              id: 4,
              title: 'Disque SSD 1TB',
              price: '¥785',
              originalPrice: 109,
              description: 'Disque SSD 1TB, vitesse de lecture 550MB/s',
              category: 'electronics',
              imageUrl: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg',
              productUrl: 'https://taobao.com/product/demo4',
              rating: { rate: 4.8, count: 319 },
              source: 'taobao (fallback)',
              scrapedAt: new Date().toISOString()
            },
            {
              id: 5,
              title: 'Sac à main pour femme',
              price: '¥360',
              originalPrice: 49.99,
              description: 'Sac à main en cuir PU, design élégant, plusieurs compartiments',
              category: 'women\'s clothing',
              imageUrl: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
              productUrl: 'https://taobao.com/product/demo5',
              rating: { rate: 4.2, count: 144 },
              source: 'taobao (fallback)',
              scrapedAt: new Date().toISOString()
            }
          ];
          
          resolve(demoProducts.slice(0, limit));
        });
    });
  }
  /**
   * Récupère des produits depuis l'API Fake Store
   * @param {number} limit - Nombre maximum de produits à récupérer
   * @returns {Promise<Array>} - Liste des produits
   */
  getProductsFromAPI(limit) {
    return new Promise((resolve, reject) => {
      // Utiliser fetch au lieu de https.request pour plus de simplicité
      fetch('https://fakestoreapi.com/products')
        .then(response => {
          if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status}`);
          }
          return response.json();
        })
        .then(products => {
          resolve(products.slice(0, limit));
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des produits:', error);
          // En cas d'erreur, renvoyer des produits fictifs pour la démonstration
          const demoProducts = [
            {
              id: 1,
              title: 'Smartphone Xiaomi Redmi Note 12',
              price: 199.99,
              description: 'Smartphone Android avec écran 6.67 pouces, 128GB de stockage',
              category: 'electronics',
              image: 'https://fakestoreapi.com/img/81QpkIctqPL._AC_SX679_.jpg',
              rating: { rate: 4.5, count: 120 }
            },
            {
              id: 2,
              title: 'T-shirt Homme Casual',
              price: 22.3,
              description: 'T-shirt slim fit pour homme, 100% coton',
              category: 'clothing',
              image: 'https://fakestoreapi.com/img/71-3HjGNDUL._AC_SY879._SX._UX._SY._UY_.jpg',
              rating: { rate: 4.1, count: 259 }
            },
            {
              id: 3,
              title: 'Bracelet en Or',
              price: 695,
              description: 'Bracelet en or 18 carats, design élégant',
              category: 'jewelry',
              image: 'https://fakestoreapi.com/img/71pWzhdJNwL._AC_UL640_QL65_ML3_.jpg',
              rating: { rate: 4.6, count: 400 }
            },
            {
              id: 4,
              title: 'Disque SSD 1TB',
              price: 109,
              description: 'Disque SSD 1TB, vitesse de lecture 550MB/s',
              category: 'electronics',
              image: 'https://fakestoreapi.com/img/61U7T1koQqL._AC_SX679_.jpg',
              rating: { rate: 4.8, count: 319 }
            },
            {
              id: 5,
              title: 'Sac à main pour femme',
              price: 49.99,
              description: 'Sac à main en cuir PU, design élégant, plusieurs compartiments',
              category: 'women\'s clothing',
              image: 'https://fakestoreapi.com/img/81fPKd-2AYL._AC_SL1500_.jpg',
              rating: { rate: 4.2, count: 144 }
            }
          ];
          resolve(demoProducts.slice(0, limit));
        });
    });
  }

}

module.exports = new TaobaoScraperService();
