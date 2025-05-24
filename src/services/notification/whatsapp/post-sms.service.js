// Load environment variables from .env file
require('dotenv').config();

// Use environment variables for sensitive credentials
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

exports.postSmsWhatsapp = async () => {
  try {
    // const message = await client.messages.create({
    //   from: 'whatsapp:+14155238886',
    //   contentSid: 'HXa4cfad6397f61da08f1c82ab6b944ac7',
    //   // contentVariables: '{"1":"12/1","2":"3pm"}',
    //   to: 'whatsapp:+237698087460',

    // });
    // console.log('Message SID:', message.sid);

    const message = await client.messages.create({
      body: 'Hello, ceci est un SMS envoyé via Twilio !', // Contenu du message
      from: '+15677495753', // Ton numéro Twilio (ex: +14155552671)
      to: '+237698087460', // Le numéro du destinataire (en format international)
    });
    // console.log('Message SID:', message.sid); // Affiche le SID du message
    return message;
  } catch (error) {
    console.error('Erreur d'envoi WhatsApp :', error);
    throw error;
  }
};
