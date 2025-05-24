// src/services/scraping/taobao/auth/index.js
require('dotenv').config();
const path = require('path');

// Importation des fonctions
const initialize = require('./initialize');
const loadCookies = require('./loadCookies');
const saveCookies = require('./saveCookies');
const checkAuthentication = require('./checkAuthentication');
const authenticate = require('./authenticate');
const getAuthenticatedPage = require('./getAuthenticatedPage');
const close = require('./close');

/**
 * Service pour gérer l'authentification sur Taobao
 */
class TaobaoAuthService {
  constructor() {
    this.cookiesPath = path.join(__dirname, '../../../../../cookies/taobao-cookies.json');
    this.isAuthenticated = false;
    this.browser = null;
    this.page = null;
    
    // Lier les méthodes au contexte de l'instance
    this.initialize = initialize.bind(this);
    this.loadCookies = loadCookies.bind(this);
    this.saveCookies = saveCookies.bind(this);
    this.checkAuthentication = checkAuthentication.bind(this);
    this.authenticate = authenticate.bind(this);
    this.getAuthenticatedPage = getAuthenticatedPage.bind(this);
    this.close = close.bind(this);
  }
}

module.exports = new TaobaoAuthService();
