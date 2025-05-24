const { Builder, By } = require('selenium-webdriver');
const firefox = require('selenium-webdriver/firefox');
const fs = require('fs').promises;
const path = require('path');

async function scrapeTaobaoService(keyword = 'montre', limit = null) {
  // Chemin vers geckodriver, adapte si besoin
  const service = new firefox.ServiceBuilder('/usr/local/bin/geckodriver');

  const options = new firefox.Options();
  // Forcer le mode headless pour éviter que le navigateur ne s'affiche
  options.headless = true;
  // Ajouter d'autres options pour optimiser l'exécution headless
  options.addArguments('--disable-gpu');
  options.addArguments('--no-sandbox');
  options.addArguments('--disable-dev-shm-usage');

  const driver = await new Builder().forBrowser('firefox').setFirefoxService(service).setFirefoxOptions(options).build();

  try {
    // 1. Charger la page d'accueil
    await driver.get('https://s.taobao.com/');
    await driver.sleep(3000);

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

    // 3. Recharger la recherche avec cookies
    const searchUrl = `https://s.taobao.com/search?q=${encodeURIComponent(keyword)}`;
    await driver.get(searchUrl);
    await driver.sleep(8000);

    // 4. Récupérer les produits
    let products = await driver.findElements(By.css("div[class*='search-content-col'] > a"));
    let results = [];

    // Si limit est null ou non défini, récupérer tous les produits de la page
    const maxProducts = limit ? Math.min(limit, products.length) : products.length;
    console.log(`Récupération de ${maxProducts} produits sur ${products.length} disponibles`);

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

      try {
        imageUrl = await p.findElement(By.css('img.mainPic--Ds3X7I8z')).getAttribute('src');
      } catch {}

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
