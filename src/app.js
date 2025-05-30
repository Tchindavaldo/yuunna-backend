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

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const menuRoutes = require('./routes/menuRoutes');

const orderRoutes = require('./routes/orderRoutes');
const fastfoodRoutes = require('./routes/fastfoodRoutes');
const bonusRequest = require('./routes/bonusRequestRoute');
const transactionRoutes = require('./routes/transactionRoutes');
const notificationRoutes = require('./routes/notificationRoutes');

const app = express();

app.use(express.json());
app.use(cors({ origin: '*', methods: '*', allowedHeaders: '*', credentials: true }));

app.use('/sms', smsRoutes);

app.use('/auth', authRoutes);
app.use('/user', userRoutes);
app.use('/menu', menuRoutes);

app.use('/users', userRoutes);
app.use('/image', imageRoutes);
app.use('/bonus', bonusRoutes);

app.use('/order', orderRoutes);
app.use('/fastFood', fastfoodRoutes);
app.use('/bonusRequest', bonusRequest);
app.use('/transaction', transactionRoutes);
app.use('/notification', notificationRoutes);
app.use('/taobao', taobaoRoutes);
app.use('/products', productRoutes);

module.exports = app;
