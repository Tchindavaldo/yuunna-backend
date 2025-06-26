const { Builder, By } = require('selenium-webdriver');
// const firefox = require('selenium-webdriver/firefox'); // Commenté car on utilise Chrome
const chrome = require('selenium-webdriver/chrome');
const fs = require('fs').promises;
const path = require('path');
const proxy = require('selenium-webdriver/proxy');
const os = require('os');

/**
 * Service de scraping Taobao avec support de pagination
 * @param {string} keyword - Mot-clé de recherche
 * @param {number} limit - Nombre maximum de produits à récupérer
 * @param {number} page - Numéro de page Taobao (commence à 1)
 * @returns {Array} - Liste des produits scrapés
 */
async function scrapeTaobaoService(keyword = 'montre', limit = null, page = 1) {
  // Chemin vers chromedriver, adapte si besoin
  const service = new chrome.ServiceBuilder('/usr/bin/chromedriver');

  const options = new chrome.Options();
  // Mode graphique pour voir le navigateur pendant le scraping
  options.addArguments('--headless'); // Commenté pour permettre le mode graphique

  // Options pour optimiser l'exécution en mode graphique
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');
  options.addArguments('--start-maximized'); // Maximiser la fenêtre pour une meilleure visibilité

  // Ne pas désactiver le GPU en mode graphique pour de meilleures performances
  // options.addArguments('--disable-gpu');
  options.addArguments('--disable-features=NetworkService');
  options.addArguments('--dns-prefetch-disable');

  // Augmenter les timeouts pour les connexions réseau
  options.addArguments('--host-resolver-timeout=5000');
  options.addArguments('--dns-resolver-timeout=5000');

  // Chemin vers l'extension VPN (si nécessaire)
  // const chemin_crx = path.join(__dirname, 'veepn.crx');
  // options.addExtensions([chemin_crx]);

  // ID de l'extension VeePN (si nécessaire)
  // const extension_id = "majdfhpaihoncoakbjgbdhglocklcgno";

  // Configuration pour simuler une localisation en Chine
  // Définir la langue et la région pour simuler un utilisateur chinois
  options.addArguments('--lang=zh-CN');

  // Définir le fuseau horaire pour la Chine (Asia/Shanghai)
  options.addArguments('--timezone=Asia/Shanghai');

  // Modifier l'User-Agent pour simuler un navigateur chinois
  options.addArguments('--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36 (CN)');

  // Créer une configuration de proxy pour la Chine (optionnel - à activer si vous avez un proxy chinois)
  // Remplacez ces valeurs par un proxy chinois valide si disponible
  // const proxyConfig = proxy.manual({
  //   http: 'http://proxy.example.com:8080',
  //   https: 'https://proxy.example.com:8080'
  // });

  // Construire le driver avec ou sans proxy
  let builder = new Builder().forBrowser('chrome').setChromeService(service).setChromeOptions(options);

  // Si vous avez un proxy valide, décommentez la ligne suivante
  // builder = builder.setProxy(proxyConfig);

  const driver = await builder.build();

  try {
    // 1. Charger la page d'accueil (utiliser l'URL complète avec www)
    console.log('Tentative de connexion à Taobao...');
    await driver.get('https://www.taobao.com/');
    await driver.sleep(5000); // Augmenter le temps d'attente pour le chargement initial

    // Exécuter un script JavaScript pour modifier la géolocalisation
    try {
      await driver.executeScript(`
        // Remplacer les coordonnées par celles d'une ville chinoise (Beijing)
        const beijing = {
          latitude: 39.9042,
          longitude: 116.4074,
          accuracy: 100
        };

        // Surcharger la méthode de géolocalisation du navigateur
        navigator.geolocation.getCurrentPosition = function(success) {
          success({ coords: beijing, timestamp: Date.now() });
        };
      `);
      console.log('Géolocalisation simulée pour la Chine (Beijing)');
    } catch (error) {
      console.warn('Impossible de modifier la géolocalisation:', error.message);
    }

    // 2. Charger et injecter les cookies
    // const cookiesRaw = await fs.readFile('taobao-cookies.json', 'utf8');
    // ...
    const cookiesRaw = await fs.readFile(path.join(__dirname, 'taobao-cookies.json'), 'utf8');

    const cookies = JSON.parse(cookiesRaw);

    for (const cookie of cookies) {
      if (cookie.sameSite) delete cookie.sameSite;
      if (cookie.expiry) {
        cookie.expires = cookie.expiry;
        delete cookie.expiry;
      }

      try {
        await driver.manage().addCookie(cookie);
      } catch (err) {
        console.warn('Erreur cookie :', err.message);
      }
    }

    // 3. Recharger la recherche avec cookies et pagination
    // Assurer que le format de l'URL est cohérent avec ce que Taobao attend
    // Format standard: https://s.taobao.com/search?page=X&q=KEYWORD
    // Utiliser l'URL avec www pour éviter les problèmes de résolution DNS
    const searchUrl = `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`;
    console.log(`Accès à l'URL de recherche Taobao initiale: ${searchUrl}`);

    // Définir un timeout pour la navigation
    try {
      await driver.manage().setTimeouts({ pageLoad: 300000 }); // 30 secondes de timeout
      await driver.get(searchUrl);
      await driver.sleep(15000); // Attendre le chargement initial

      // Si nous devons aller à une page autre que la première
      if (page > 1) {
        console.log(`Navigation vers la page ${page} en utilisant la pagination JavaScript...`);

        // Différentes approches pour naviguer vers la page souhaitée
        try {
          // Approche 1: Utiliser les boutons de pagination s'ils existent
          const paginationButtons = await driver.findElements(By.css('.pagination a'));
          if (paginationButtons.length > 0) {
            // Trouver le bouton correspondant à la page souhaitée
            let pageButtonFound = false;
            for (const button of paginationButtons) {
              const buttonText = await button.getText();
              if (buttonText === String(page)) {
                console.log(`Bouton de pagination trouvé pour la page ${page}, clic en cours...`);
                await button.click();
                pageButtonFound = true;
                await driver.sleep(15000); // Attendre le chargement après clic
                break;
              }
            }

            // Si le bouton n'a pas été trouvé, essayer l'approche suivante
            if (!pageButtonFound) {
              console.log(`Bouton pour la page ${page} non trouvé, essai de l'approche suivante...`);
            }
          }
        } catch (paginationError) {
          console.warn(`Erreur lors de la navigation par boutons de pagination: ${paginationError.message}`);
        }

        // Approche 2: Modifier l'URL directement et forcer la navigation
        try {
          const pageUrl = `https://s.taobao.com/search?page=${page}&q=${encodeURIComponent(keyword)}`;
          console.log(`Navigation directe vers l'URL de la page ${page}: ${pageUrl}`);
          await driver.get(pageUrl);
          await driver.sleep(15000); // Attendre le chargement après navigation
        } catch (directNavError) {
          console.warn(`Erreur lors de la navigation directe vers la page ${page}: ${directNavError.message}`);
        }

        // Approche 3: Utiliser JavaScript pour modifier l'URL et recharger
        try {
          const jsScript = `
            // Modifier l'URL pour inclure le paramètre de page
            const url = new URL(window.location.href);
            url.searchParams.set('page', '${page}');
            window.location.href = url.toString();
          `;
          console.log(`Tentative de modification de l'URL via JavaScript pour aller à la page ${page}...`);
          await driver.executeScript(jsScript);
          await driver.sleep(15000); // Attendre le chargement après exécution du script
        } catch (jsError) {
          console.warn(`Erreur lors de la modification de l'URL via JavaScript: ${jsError.message}`);
        }
      }
    } catch (navError) {
      console.warn(`Erreur de navigation vers la page de recherche: ${navError.message}`);
    }

    // Vérifier si nous sommes sur la bonne page et confirmer la page actuelle
    try {
      const currentUrl = await driver.getCurrentUrl();
      console.log(`URL actuelle après chargement: ${currentUrl}`);

      // Vérifier si l'URL contient le paramètre de page correct
      const urlObj = new URL(currentUrl);
      const urlPage = urlObj.searchParams.get('page');

      if (urlPage) {
        console.log(`Page détectée dans l'URL: ${urlPage}, page demandée: ${page}`);
        if (urlPage != page) {
          console.warn(`ATTENTION: La page dans l'URL (${urlPage}) ne correspond pas à la page demandée (${page})`);
        }
      } else {
        console.warn(`ATTENTION: Aucun paramètre de page détecté dans l'URL, nous sommes probablement sur la page 1`);
      }

      // Vérifier les éléments de pagination pour confirmer la page actuelle
      try {
        // Rechercher les éléments de pagination qui pourraient indiquer la page actuelle
        const paginationElements = await driver.findElements(By.css('.pagination *'));
        let pageConfirmed = false;

        for (const elem of paginationElements) {
          try {
            const elemClass = await elem.getAttribute('class');
            const elemText = await elem.getText();

            // Vérifier si c'est un élément actif/sélectionné dans la pagination
            if (elemClass && elemClass.includes('active') && elemText) {
              console.log(`Page actuelle détectée dans la pagination: ${elemText}`);
              pageConfirmed = true;

              if (elemText != String(page)) {
                console.warn(`ATTENTION: La page active dans la pagination (${elemText}) ne correspond pas à la page demandée (${page})`);
              }
              break;
            }
          } catch (elemError) {
            // Ignorer les erreurs pour les éléments individuels
          }
        }

        if (!pageConfirmed) {
          console.log(`Impossible de confirmer la page actuelle via les éléments de pagination`);
        }
      } catch (paginationError) {
        console.warn(`Erreur lors de la vérification des éléments de pagination: ${paginationError.message}`);
      }
    } catch (err) {
      console.warn("Impossible de récupérer l'URL actuelle:", err.message);
    }

    // 4. Récupérer les produits avec plusieurs sélecteurs pour plus de robustesse
    console.log(`Tentative de récupération des produits pour la page ${page}...`);

    // Utiliser plusieurs sélecteurs CSS pour trouver les produits (Taobao peut changer la structure selon les pages)
    const selectors = [
      "div[class*='search-content-col'] > a", // Sélecteur original
      '.item.J_MouserOnverReq', // Sélecteur alternatif 1
      '.items > .item', // Sélecteur alternatif 2
      'div[data-index]', // Sélecteur alternatif 3
      'div.grid-item', // Sélecteur alternatif 4
    ];

    let products = [];
    let selectorUsed = '';

    // Essayer chaque sélecteur jusqu'à trouver des produits
    for (const selector of selectors) {
      try {
        const foundProducts = await driver.findElements(By.css(selector));
        if (foundProducts.length > 0) {
          products = foundProducts;
          selectorUsed = selector;
          console.log(`Produits trouvés avec le sélecteur: ${selector} (${products.length} produits)`);
          break;
        }
      } catch (selectorError) {
        console.warn(`Erreur avec le sélecteur ${selector}: ${selectorError.message}`);
      }
    }

    // Si aucun produit n'est trouvé avec les sélecteurs spécifiques, essayer de capturer une capture d'écran pour débogage
    if (products.length === 0) {
      console.warn(`Aucun produit trouvé avec les sélecteurs standards pour la page ${page}!`);
      try {
        // Prendre une capture d'écran pour débogage
        const screenshot = await driver.takeScreenshot();
        const screenshotPath = path.join(__dirname, `taobao_page_${page}_debug_${Date.now()}.png`);
        await fs.writeFile(screenshotPath, screenshot, 'base64');
        console.log(`Capture d'écran enregistrée pour débogage: ${screenshotPath}`);

        // Dernier recours: essayer de récupérer tous les liens de la page
        products = await driver.findElements(By.css('a[href*="item.taobao"]'));
        if (products.length > 0) {
          console.log(`Trouvé ${products.length} liens vers des produits comme dernier recours`);
          selectorUsed = 'a[href*="item.taobao"]';
        }
      } catch (screenshotError) {
        console.error(`Impossible de prendre une capture d'écran: ${screenshotError.message}`);
      }
    }

    let results = [];

    // Si limit est null ou non défini, récupérer tous les produits de la page
    const maxProducts = limit ? Math.min(limit, products.length) : products.length;
    console.log(`Récupération de ${maxProducts} produits sur ${products.length} disponibles (sélecteur: ${selectorUsed})`);

    for (let i = 0; i < maxProducts; i++) {
      const p = products[i];
      let titre = '',
        prix = '',
        imageUrl = '',
        vendeur = '',
        lien = '',
        localisation = '',
        ventes = '';

      try {
        titre = await p.findElement(By.css('.title--qJ7Xg_90')).getText();
      } catch {}

      try {
        const prixInt = await p.findElement(By.css('.priceInt--yqqZMJ5a')).getText();
        const prixFloat = await p.findElement(By.css('.priceFloat--XpixvyQ1')).getText();
        prix = `¥${prixInt}${prixFloat}`;
      } catch {}

      // Récupération de l'image avec plusieurs méthodes
      try {
        // Essayer d'abord avec le sélecteur spécifique
        try {
          imageUrl = await p.findElement(By.css('img.mainPic--Ds3X7I8z')).getAttribute('src');

          // Vérifier si l'URL est valide
          if (!imageUrl || imageUrl.includes('blank.gif') || imageUrl.length < 20) {
            // Essayer data-src si src n'est pas valide
            const dataSrc = await p.findElement(By.css('img.mainPic--Ds3X7I8z')).getAttribute('data-src');
            if (dataSrc && dataSrc.length > 20) {
              imageUrl = dataSrc;
            }
          }
        } catch (e) {
          // Le sélecteur spécifique a échoué, essayer avec d'autres sélecteurs
          // console.log(`Sélecteur spécifique échoué pour l'image: ${e.message}`);

          // Essayer avec un sélecteur plus général pour les images
          try {
            const imgElement = await p.findElement(By.css('img[class*="pic"]'));
            imageUrl = await imgElement.getAttribute('src');

            if (!imageUrl || imageUrl.includes('blank.gif') || imageUrl.length < 20) {
              imageUrl = await imgElement.getAttribute('data-src');
            }
          } catch (e2) {
            // console.log(`Sélecteur général échoué pour l'image: ${e2.message}`);

            // Dernier recours: chercher toutes les images et prendre la première qui semble valide
            try {
              const allImages = await p.findElements(By.css('img'));
              for (const img of allImages) {
                const src = await img.getAttribute('src');
                if (src && src.length > 20 && !src.includes('blank.gif')) {
                  imageUrl = src;
                  break;
                }

                const dataSrc = await img.getAttribute('data-src');
                if (dataSrc && dataSrc.length > 20) {
                  imageUrl = dataSrc;
                  break;
                }
              }
            } catch (e3) {
              console.log(`Recherche de toutes les images échouée: ${e3.message}`);
            }
          }
        }

        // Ajouter le préfixe https: si nécessaire
        if (imageUrl && imageUrl.startsWith('//')) {
          imageUrl = 'https:' + imageUrl;
        }

        // Si aucune image n'est trouvée, laisser imageUrl vide pour que la validation échoue
        if (!imageUrl || imageUrl.length < 20 || imageUrl.includes('blank.gif')) {
          imageUrl = '';
          console.log('Aucune image valide trouvée pour ce produit');
        }
      } catch (error) {
        console.log(`Erreur générale lors de la récupération de l'image: ${error.message}`);
        imageUrl = '';
      }

      try {
        vendeur = await p.findElement(By.css('.shopNameText--DmtlsDKm')).getText();
      } catch {}

      try {
        lien = await p.getAttribute('href');
        if (lien && lien.startsWith('//')) lien = 'https:' + lien;
      } catch {}

      try {
        const locElements = await p.findElements(By.css('.procity--wlcT2xH9 span'));
        let locTexts = [];
        for (const loc of locElements) {
          locTexts.push(await loc.getText());
        }
        localisation = locTexts.join(' / ');
      } catch {}

      try {
        ventes = await p.findElement(By.css('.realSales--XZJiepmt')).getText();
      } catch {}

      results.push({
        titre,
        prix,
        imageUrl,
        lien,
        vendeur,
        localisation,
        ventes,
      });
    }

    return results;
  } finally {
    await driver.quit();
  }
}

module.exports = { scrapeTaobaoService };
