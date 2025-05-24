// src/services/scraping/taobao/auth/close.js

/**
 * Ferme le navigateur
 */
async function close() {
  if (this.browser) {
    await this.browser.close();
    this.browser = null;
    this.page = null;
  }
}

module.exports = close;
