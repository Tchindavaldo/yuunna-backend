const express = require('express');
const { getTaobaoProducts } = require('../controllers/taobaoProducts.controller');

const router = express.Router();

/**
 * @route GET /taobao-products
 * @desc Récupérer les produits directement depuis Taobao
 * @access Public
 */
router.get('/', getTaobaoProducts);

module.exports = router;
