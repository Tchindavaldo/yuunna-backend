// src/routes/taobaoRoutes.js
const express = require('express');
const router = express.Router();
const taobaoController = require('../controllers/taobaoController');
const { searchProducts } = require('../controllers/taobao/scrapeTaobao');

/**
 * @route   GET /taobao/search
 * @desc    Recherche des produits sur Taobao
 * @access  Public
 * @query   {string} keyword - Mot-clé de recherche (optionnel)
 * @query   {number} limit - Nombre maximum de produits à récupérer (optionnel, défaut: 10)
 */

// router.get('/search', taobaoController.searchProducts);

router.get('/search', searchProducts);

module.exports = router;
