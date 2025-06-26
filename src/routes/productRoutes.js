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
 * @desc    Récupère tous les produits avec filtres optionnels
 * @access  Public
 * @query   {string} categoryId - Filtre par catégorie (optionnel)
 * @query   {string} userId - Filtre par utilisateur (optionnel)
 * @query   {string} status - Filtre par statut (optionnel)
 * @query   {number} limit - Limite le nombre de résultats (optionnel)
 */
router.get('/', getProducts);

module.exports = router;
