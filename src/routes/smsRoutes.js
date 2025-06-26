const express = require('express');
const { postWhatsappMessageController } = require('../controllers/notifications/whatsapp/whatsapp-message.controller');

const router = express.Router();

router.post('/whatsapp', postWhatsappMessageController);

module.exports = router;
