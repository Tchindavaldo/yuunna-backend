// src/app.js
// Load environment variables from .env file
require('dotenv').config();

const cors = require('cors');
const express = require('express');

const smsRoutes = require('./routes/smsRoutes');
const bonusRoutes = require('./routes/bonusRoute');
const imageRoutes = require('./routes/imageRoutes');
const taobaoRoutes = require('./routes/taobaoRoutes');
const productRoutes = require('./routes/productRoutes');
const taobaoProductsRoutes = require('./routes/taobaoProductsRoutes');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const bonusRequest = require('./routes/bonusRequestRoute');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*', methods: '*', allowedHeaders: '*', credentials: true }));

app.use('/sms', smsRoutes);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);

app.use('/users', userRoutes);
app.use('/image', imageRoutes);
app.use('/bonus', bonusRoutes);

app.use('/bonusRequest', bonusRequest);
app.use('/transaction', transactionRoutes);
app.use('/notification', notificationRoutes);
app.use('/taobao', taobaoRoutes);
app.use('/products', productRoutes);
app.use('/taobao-products', taobaoProductsRoutes);

module.exports = app;
