// src/services/scraping/taobao/taobao-auth.service.js
require('dotenv').config();
const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');

/**
 * Service pour gérer l'authentification sur Taobao
 */
class TaobaoAuthService {
  constructor() {
    this.cookiesPath = path.join(__dirname, '../../../../cookies/taobao-cookies.json');
    this.isAuthenticated = false;
    this.browser = null;
    this.page = null;
  }

  /**
   * Initialise le navigateur et la page
   */
  async initialize() {
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

  /**
   * Charge les cookies existants
   */
  async loadCookies() {
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

  /**
   * Sauvegarde les cookies actuels
   */
  async saveCookies() {
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

  /**
   * Vérifie si l'utilisateur est authentifié sur Taobao
   */
  async checkAuthentication() {
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

  /**
   * Authentifie l'utilisateur sur Taobao en utilisant les cookies existants
   */
  async authenticate() {
    try {
      await this.initialize();
      
      // Si nous avons déjà chargé les cookies avec succès, nous supposons que l'utilisateur est authentifié
      if (this.isAuthenticated) {
        console.log('Utilisateur authentifié sur Taobao.');
        return true;
      }
      
      // Essayer de charger les cookies à nouveau
      const cookiesLoaded = await this.loadCookies();
      if (cookiesLoaded) {
        console.log('Cookies chargés avec succès, utilisateur authentifié.');
        this.isAuthenticated = true;
        return true;
      }
      
      // Si nous n'avons pas de cookies valides, nous ne pouvons pas authentifier l'utilisateur
      console.log('Impossible d\'authentifier l\'utilisateur sans cookies valides.');
      return false;
    } catch (error) {
      console.error('Erreur lors de l\'authentification:', error);
      return false;
    }
  }

  /**
   * Obtient une page authentifiée pour le scraping
   */
  async getAuthenticatedPage() {
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

  /**
   * Ferme le navigateur
   */
  async close() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
    }
  }
}

module.exports = new TaobaoAuthService();
