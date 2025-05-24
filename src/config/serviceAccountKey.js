// src/config/serviceAccountKey.js

module.exports = 

{
    type: process.env.FB_TYPE,
  project_id: process.env.FB_PROJECT_ID,
  private_key: process.env.FB_PRIVATE_KEY.replace(/\\n/g, '\n'), // Gestion des sauts de ligne dans la clé
  client_email: process.env.FB_CLIENT_EMAIL,
  client_id: process.env.FB_CLIENT_ID,
  auth_uri: process.env.FB_AUTH_URI,
  token_uri: process.env.FB_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FB_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FB_CLIENT_X509_CERT_URL,
};
