// src/services/scraping/taobao/auth/checkAuthentication.js

/**
 * Vérifie si l'utilisateur est authentifié sur Taobao
 */
async function checkAuthentication() {
  try {
    await this.initialize();
    
    // Accéder à la page d'accueil de Taobao
    await this.page.goto('https://www.taobao.com/', { 
      waitUntil: 'domcontentloaded', 
      timeout: 60000 
    });
    
    // Attendre que la page se charge
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Vérifier si l'utilisateur est connecté (recherche d'éléments spécifiques)
    const isLoggedIn = await this.page.evaluate(() => {
      // Recherche d'éléments qui indiquent une connexion
      const userNameElement = document.querySelector('.site-nav-user');
      const loginButton = document.querySelector('.site-nav-login-info-nick');
      
      return !!userNameElement || !!loginButton;
    });
    
    this.isAuthenticated = isLoggedIn;
    
    if (isLoggedIn) {
      console.log('Utilisateur authentifié sur Taobao.');
      await this.saveCookies();
    } else {
      console.log('Utilisateur non authentifié sur Taobao.');
    }
    
    return isLoggedIn;
  } catch (error) {
    console.error('Erreur lors de la vérification de l\'authentification:', error);
    return false;
  }
}

module.exports = checkAuthentication;
