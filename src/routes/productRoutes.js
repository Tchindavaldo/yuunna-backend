// src/routes/productRoutes.js
const express = require('express');
const router = express.Router();
const { scrapeAndAddProducts, addProduct, getProductById, getProducts } = require('../controllers/product.controller');

/**
 * @route   POST /products/scrape
 * @desc    Récupère des produits depuis Taobao et les ajoute à Firebase
 * @access  Private
 * @body    {string} keyword - Mot-clé de recherche
 * @body    {number} limit - Nombre maximum de produits à récupérer (optionnel, défaut: 10)
 * @body    {string} categoryId - ID de la catégorie pour les produits
 * @body    {string} userId - ID de l'utilisateur qui ajoute les produits
 */
router.post('/scrape', scrapeAndAddProducts);

/**
 * @route   POST /products
 * @desc    Ajoute un produit unique à Firebase
 * @access  Private
 * @body    {Object} productData - Données complètes du produit
 */
router.post('/', addProduct);

/**
 * @route   GET /products/:productId
 * @desc    Récupère un produit par son ID
 * @access  Public
 * @param   {string} productId - ID du produit à récupérer
 */
router.get('/:productId', getProductById);

/**
 * @route   GET /products
 * @desc    Récupère tous les produits avec pagination, tri et filtres
 * @access  Public
 * @query   {number} page - Numéro de page (commence à 1, défaut: 1)
 * @query   {number} limit - Nombre d'éléments par page (défaut: 10)
 * @query   {string} sort - Critère de tri (ex: "price_asc", "date_desc", "title_asc", défaut: "date_desc")
 * @query   {string} category - Filtre par catégorie (optionnel)
 * @query   {string} categoryId - Alias pour category (support de l'ancien paramètre)
 * @query   {string} search - Recherche textuelle dans les titres, catégories et vendeurs (optionnel)
 * @query   {string} userId - Filtre par utilisateur (optionnel)
 * @query   {string} status - Filtre par statut (défaut: "active")
 * @returns {Object} - { success, items, total, hasMore, page, limit }
 */
router.get('/', getProducts);

module.exports = router;
