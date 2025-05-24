// src/services/scraping/taobao/index.js

// Exporter les services
const authService = require('./auth');
const scraperService = require('./scraper');

module.exports = {
  authService,
  scraperService
};
