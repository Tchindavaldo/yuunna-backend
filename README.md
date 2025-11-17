# 🚀 Yuunna Backend

**Une plateforme backend complète et modulaire pour la gestion de produits, scraping Taobao, notifications temps réel et bien plus.**

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Stack Technique](#stack-technique)
- [Architecture du Projet](#architecture-du-projet)
- [Installation](#installation)
- [Configuration](#configuration)
- [Démarrage](#démarrage)
- [Endpoints API](#endpoints-api)
- [Modules et Services](#modules-et-services)
- [Fonctionnalités Principales](#fonctionnalités-principales)
- [Structure des Fichiers](#structure-des-fichiers)
- [Variables d'Environnement](#variables-denvironnement)
- [Contribution](#contribution)
- [Licence](#licence)

---

## 🎯 Vue d'ensemble

**Yuunna Backend** est une application backend robuste et scalable construite avec **Node.js** et **Express.js**. Elle fournit une API complète pour :

✅ **Gestion des utilisateurs** - Authentification, profils, gestion des comptes  
✅ **Scraping Taobao** - Récupération automatique de produits avec pagination et cache  
✅ **Gestion des produits** - CRUD complet avec catégorisation automatique  
✅ **Notifications temps réel** - Système de notifications via Socket.io  
✅ **Gestion des images** - Upload et stockage via Firebase Storage  
✅ **Système de bonus** - Gestion des récompenses et bonus utilisateurs  
✅ **Transactions** - Suivi des transactions utilisateurs  
✅ **Intégration SMS** - Envoi de SMS via Twilio  

---

## 🛠️ Stack Technique

| Composant | Technologie | Version |
|-----------|-------------|---------|
| **Runtime** | Node.js | - |
| **Framework Web** | Express.js | 5.1.0 |
| **Base de Données** | Firebase (Firestore) | 13.2.0 |
| **Stockage Fichiers** | Firebase Storage | 13.2.0 |
| **Web Scraping** | Selenium WebDriver | 4.33.0 |
| **Web Scraping** | Puppeteer | 24.9.0 |
| **Parsing HTML** | Cheerio | 1.0.0 |
| **Communication Temps Réel** | Socket.io | 4.8.1 |
| **Upload Fichiers** | Multer | 1.4.5-lts.2 |
| **HTTP Client** | Axios | 1.9.0 |
| **SMS** | Twilio | 5.5.2 |
| **Authentification** | JWT (jsonwebtoken) | - |
| **CORS** | cors | 2.8.5 |
| **Variables d'Env** | dotenv | 16.5.0 |
| **Compression ZIP** | adm-zip | 0.5.16 |

### Outils de Développement

- **ESLint** - Linting du code
- **Prettier** - Formatage du code
- **Nodemon** - Rechargement automatique en développement

---

## 🏗️ Architecture du Projet

L'application suit une architecture **modulaire en couches** :

```
┌─────────────────────────────────────────────┐
│         Routes (Express Router)             │
├─────────────────────────────────────────────┤
│      Controllers (Gestion des requêtes)     │
├─────────────────────────────────────────────┤
│    Services (Logique métier & Scraping)     │
├─────────────────────────────────────────────┤
│  Config (Firebase, Multer, etc.)            │
├─────────────────────────────────────────────┤
│  Utils (Helpers, Validateurs, Traduction)   │
├─────────────────────────────────────────────┤
│  Socket.io (Communication temps réel)       │
└─────────────────────────────────────────────┘
```

**Principes architecturaux :**
- **Séparation des responsabilités** - Chaque couche a un rôle spécifique
- **Modularité** - Chaque module est indépendant et réutilisable
- **Scalabilité** - Structure permettant l'ajout facile de nouvelles fonctionnalités
- **Maintenabilité** - Code organisé et facile à comprendre

---

## 📦 Installation

### Prérequis

- **Node.js** (v14 ou supérieur)
- **npm** ou **yarn**
- **Compte Firebase** avec Firestore activé
- **Compte Twilio** (optionnel, pour SMS)

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone <repository-url>
cd yuunna-backend
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**
```bash
cp .env.example .env
# Éditer le fichier .env avec vos configurations
```

4. **Configurer Firebase**
- Placer votre fichier `serviceAccountKey.json` dans le dossier `src/config/`
- Ou configurer les variables d'environnement Firebase

---

## ⚙️ Configuration

### Variables d'Environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# Serveur
PORT=3000
NODE_ENV=development

# Firebase
FB_PROJECT_ID=your-project-id
FB_PRIVATE_KEY_ID=your-private-key-id
FB_PRIVATE_KEY=your-private-key
FB_CLIENT_EMAIL=your-client-email
FB_CLIENT_ID=your-client-id
FB_AUTH_URI=https://accounts.google.com/o/oauth2/auth
FB_TOKEN_URI=https://oauth2.googleapis.com/token
FB_AUTH_PROVIDER_X509_CERT_URL=https://www.googleapis.com/oauth2/v1/certs
FB_CLIENT_X509_CERT_URL=your-cert-url
FB_UNIVERSE_DOMAIN=googleapis.com

# Twilio (optionnel)
TWILIO_ACCOUNT_SID=your-account-sid
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_PHONE_NUMBER=your-phone-number

# JWT
JWT_SECRET=your-jwt-secret

# Scraping
TAOBAO_TIMEOUT=30000
TAOBAO_HEADLESS=true
```

### Configuration Firebase

Le fichier `src/config/firebase.js` initialise Firebase Admin SDK :

```javascript
const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.js');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: `${process.env.FB_PROJECT_ID}.appspot.com`,
  universeDomain: process.env.FB_UNIVERSE_DOMAIN,
});
```

### Configuration Multer

Le fichier `src/config/multer.js` configure l'upload de fichiers :
- Dossier de destination : `uploads/`
- Taille maximale : 50MB
- Types acceptés : images, documents

---

## 🚀 Démarrage

### Mode Production

```bash
npm start
```

Le serveur démarre sur `http://localhost:3000` (ou le port défini dans `.env`)

### Mode Développement

```bash
npm run start:dev
```

Utilise **Nodemon** pour recharger automatiquement le serveur lors de modifications.

### Vérifier que le serveur fonctionne

```bash
curl http://localhost:3000/health
```

---

## 📡 Endpoints API

### 🔐 Authentification (`/auth`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/auth/signUp` | Inscription d'un nouvel utilisateur |
| `POST` | `/auth/login` | Connexion utilisateur |

**Exemple - Inscription :**
```bash
curl -X POST http://localhost:3000/auth/signUp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123",
    "name": "John Doe"
  }'
```

---

### 👤 Utilisateurs (`/user` ou `/users`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/user/:id` | Récupérer un utilisateur |
| `PUT` | `/user/:id` | Mettre à jour un utilisateur |
| `DELETE` | `/user/:id` | Supprimer un utilisateur |

---

### 📦 Produits (`/products`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/products` | Récupérer tous les produits (avec pagination) |
| `GET` | `/products/:id` | Récupérer un produit spécifique |
| `POST` | `/products` | Créer un nouveau produit |
| `PUT` | `/products/:id` | Mettre à jour un produit |
| `DELETE` | `/products/:id` | Supprimer un produit |

**Paramètres de pagination :**
```
GET /products?page=1&limit=20&sort=date_desc&search=keyword&category=electronics
```

- `page` - Numéro de page (défaut: 1)
- `limit` - Produits par page (défaut: 20)
- `sort` - Tri (date_asc, date_desc, price_asc, price_desc, title_asc, title_desc)
- `search` - Recherche textuelle
- `category` - Filtrer par catégorie
- `userId` - Filtrer par utilisateur
- `status` - Filtrer par statut

---

### 🛒 Taobao (`/taobao` et `/taobao-products`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/taobao/scrape` | Scraper des produits Taobao |
| `GET` | `/taobao-products` | Récupérer les produits Taobao avec pagination |
| `POST` | `/taobao-products/add` | Ajouter des produits Taobao à la base |

**Exemple - Scraper Taobao :**
```bash
curl -X POST http://localhost:3000/taobao/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "laptop",
    "limit": 50,
    "userId": "user123",
    "categoryId": "electronics"
  }'
```

---

### 🖼️ Images (`/image`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/image/upload` | Uploader une image |
| `GET` | `/image/:id` | Récupérer une image |
| `DELETE` | `/image/:id` | Supprimer une image |

---

### 💰 Bonus (`/bonus`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/bonus/:userId` | Récupérer les bonus d'un utilisateur |
| `POST` | `/bonus` | Créer un bonus |
| `PUT` | `/bonus/:id` | Mettre à jour un bonus |

---

### 📋 Demandes de Bonus (`/bonusRequest`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/bonusRequest` | Récupérer toutes les demandes |
| `POST` | `/bonusRequest` | Créer une demande de bonus |
| `PUT` | `/bonusRequest/:id` | Mettre à jour une demande |

---

### 💳 Transactions (`/transaction`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/transaction` | Récupérer toutes les transactions |
| `POST` | `/transaction` | Créer une transaction |
| `GET` | `/transaction/:id` | Récupérer une transaction |

---

### 🔔 Notifications (`/notification`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/notification/:userId` | Récupérer les notifications |
| `POST` | `/notification` | Créer une notification |
| `PUT` | `/notification/:id/read` | Marquer comme lue |

**Socket.io Events :**
```javascript
// Rejoindre une room utilisateur
socket.emit('join_user', userId);

// Recevoir les notifications
socket.on('notification', (data) => {
  console.log('Nouvelle notification:', data);
});
```

---

### 📱 SMS (`/sms`)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `POST` | `/sms/send` | Envoyer un SMS via Twilio |

**Exemple :**
```bash
curl -X POST http://localhost:3000/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+33612345678",
    "message": "Votre code de vérification est: 123456"
  }'
```

---

## 🔧 Modules et Services

### 1. **Module Authentification** (`src/services/auth/`)

Gère l'inscription, la connexion et la validation des utilisateurs.

**Fichiers clés :**
- `register.controller.js` - Contrôleur d'inscription
- Services d'authentification

**Fonctionnalités :**
- Inscription avec validation email
- Connexion avec JWT
- Gestion des sessions

---

### 2. **Module Produits** (`src/services/product/`)

Gère la création, lecture, mise à jour et suppression de produits.

**Services :**
- `getProduct.service.js` - Récupération des produits
- `postProduct.service.js` - Création de produits
- `getTaobaoProducts.service.js` - Récupération depuis Taobao

**Fonctionnalités :**
- Pagination avancée
- Tri flexible (date, prix, titre)
- Recherche textuelle
- Filtrage par catégorie, utilisateur, statut
- Cache des résultats

---

### 3. **Module Scraping Taobao** (`src/services/scraping/taobao selenium/`)

Service de scraping avancé pour récupérer les produits de Taobao.

**Fichiers clés :**
- `scrapeTaobaoService.js` - Service principal de scraping
- `extensions/` - Extensions VPN pour Selenium
- `firefox-profiles/` - Profils Firefox configurés

**Fonctionnalités :**
- Scraping avec Selenium WebDriver
- Support Chrome et Firefox
- Gestion des cookies
- Récupération des images produits
- Détection anti-scraping
- Fallback automatique en cas d'erreur
- Pagination intelligente

**Configuration :**
```javascript
const { scrapeTaobaoService } = require('./scrapeTaobaoService');

const products = await scrapeTaobaoService({
  keyword: 'laptop',
  limit: 50,
  page: 1,
  headless: true
});
```

---

### 4. **Module Utilisateurs** (`src/services/user/`)

Gère les profils, les préférences et les données utilisateurs.

**Fonctionnalités :**
- Création et mise à jour de profils
- Gestion des préférences
- Récupération des données utilisateur

---

### 5. **Module Notifications** (`src/services/notification/`)

Système de notifications temps réel avec Socket.io.

**Fichiers clés :**
- `socket/notificationHandler.js` - Gestionnaire Socket.io
- Services de notification Firebase

**Fonctionnalités :**
- Notifications temps réel
- Persistance dans Firebase
- Marquage comme lu
- Filtrage par utilisateur

---

### 6. **Module Bonus** (`src/services/bonus/`)

Gestion du système de bonus et récompenses.

**Fonctionnalités :**
- Création et gestion des bonus
- Demandes de bonus
- Suivi des récompenses

---

### 7. **Module Transactions** (`src/services/transaction/`)

Suivi et gestion des transactions utilisateurs.

**Fonctionnalités :**
- Enregistrement des transactions
- Historique des transactions
- Filtrage par utilisateur et date

---

### 8. **Module Images** (`src/services/images/`)

Gestion de l'upload et du stockage d'images via Firebase.

**Fonctionnalités :**
- Upload d'images
- Stockage Firebase
- Génération d'URLs publiques
- Suppression d'images

---

### 9. **Module Bonus Requests** (`src/services/bonusRequest/`)

Gestion des demandes de bonus.

**Fonctionnalités :**
- Création de demandes
- Approbation/rejet
- Suivi du statut

---

## ✨ Fonctionnalités Principales

### 🕷️ Scraping Taobao Avancé

**Caractéristiques :**
- ✅ Scraping avec Selenium WebDriver (Chrome/Firefox)
- ✅ Gestion des cookies et sessions
- ✅ Récupération des images produits
- ✅ Détection et contournement des protections anti-scraping
- ✅ Pagination intelligente avec cache
- ✅ Fallback automatique en cas d'erreur
- ✅ Support des extensions VPN
- ✅ Timeouts configurables

**Exemple d'utilisation :**
```javascript
const { scrapeTaobaoService } = require('./services/scraping/taobao selenium/scrapeTaobaoService');

const products = await scrapeTaobaoService({
  keyword: 'smartphone',
  limit: 100,
  page: 1,
  headless: false // Mode graphique pour déboguer
});

console.log(`${products.length} produits récupérés`);
```

---

### 🤖 Détection Automatique de Catégories

Le système détecte automatiquement la catégorie d'un produit basée sur son titre et sa description.

**Catégories supportées :**
- Électronique
- Vêtements
- Maison & Jardin
- Sports & Loisirs
- Beauté & Santé
- Livres & Médias
- Jouets & Jeux
- Alimentation

**Utilisation :**
```javascript
const { detectCategoryFull } = require('./utils/helpers/categoryDetection');

const category = detectCategoryFull('iPhone 15 Pro Max Smartphone');
// Retourne: 'Électronique'
```

---

### 🌍 Traduction du Chinois

Traduction automatique des titres et descriptions en chinois.

**Utilisation :**
```javascript
const { translateFromChinese } = require('./utils/helpers/translationHelper');

const translated = await translateFromChinese('智能手机');
// Retourne: 'Smartphone intelligent'
```

---

### 🔔 Notifications Temps Réel

Système de notifications en temps réel avec Socket.io.

**Client-side :**
```javascript
const socket = io('http://localhost:3000');

socket.emit('join_user', userId);

socket.on('notification', (data) => {
  console.log('Nouvelle notification:', data);
});
```

**Server-side :**
```javascript
const io = require('./socket').getIO();

io.to(userId).emit('notification', {
  title: 'Nouveau produit',
  message: 'Un nouveau produit correspond à vos critères',
  data: productData
});
```

---

### 💾 Gestion Firebase Complète

Intégration complète avec Firebase pour :
- **Firestore** - Base de données NoSQL
- **Storage** - Stockage d'images et fichiers
- **Authentication** - Authentification utilisateurs

---

### 📊 Pagination Avancée

Système de pagination flexible avec :
- Numéro de page
- Limite d'éléments par page
- Curseur pour pagination infinie
- Indicateur `hasMore`
- Total d'éléments

**Réponse type :**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "hasMore": true
  }
}
```

---

## 📁 Structure des Fichiers

```
yuunna-backend/
├── src/
│   ├── app.js                          # Configuration Express
│   ├── server.js                       # Point d'entrée serveur
│   ├── socket.js                       # Configuration Socket.io
│   │
│   ├── config/
│   │   ├── firebase.js                 # Configuration Firebase
│   │   ├── multer.js                   # Configuration upload
│   │   └── serviceAccountKey.js        # Clés Firebase
│   │
│   ├── controllers/                    # Contrôleurs HTTP
│   │   ├── auth/
│   │   ├── bonus/
│   │   ├── bonusRequest/
│   │   ├── images/
│   │   ├── notifications/
│   │   ├── product.controller.js
│   │   ├── taobao/
│   │   ├── taobaoController.js
│   │   ├── taobaoProducts.controller.js
│   │   ├── transaction/
│   │   └── user/
│   │
│   ├── services/                       # Services métier
│   │   ├── auth/
│   │   ├── bonus/
│   │   ├── bonusRequest/
│   │   ├── database/
│   │   ├── firebase/
│   │   ├── images/
│   │   ├── notification/
│   │   ├── product/
│   │   │   ├── getProduct.service.js
│   │   │   ├── getTaobaoProducts.service.js
│   │   │   └── postProduct.service.js
│   │   ├── scraping/
│   │   │   └── taobao selenium/
│   │   │       ├── scrapeTaobaoService.js
│   │   │       ├── extensions/
│   │   │       └── firefox-profiles/
│   │   ├── transaction/
│   │   └── user/
│   │
│   ├── routes/                         # Définition des routes
│   │   ├── authRoutes.js
│   │   ├── bonusRequestRoute.js
│   │   ├── bonusRoute.js
│   │   ├── imageRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── productRoutes.js
│   │   ├── smsRoutes.js
│   │   ├── taobaoProductsRoutes.js
│   │   ├── taobaoRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── utils/                          # Utilitaires
│   │   ├── helpers/
│   │   │   ├── categoryDetection.js
│   │   │   └── translationHelper.js
│   │   ├── validator/
│   │   └── flattenNotifications.js
│   │
│   ├── middlewares/                    # Middlewares Express
│   ├── interface/                      # Interfaces/Types
│   └── scripts/                        # Scripts utilitaires
│
├── cookies/                            # Cookies Taobao
├── uploads/                            # Fichiers uploadés
├── node_modules/                       # Dépendances
├── .env                                # Variables d'environnement
├── .env.example                        # Exemple de .env
├── .eslintrc                           # Configuration ESLint
├── .prettierrc.js                      # Configuration Prettier
├── .gitignore                          # Fichiers ignorés Git
├── package.json                        # Dépendances et scripts
├── package-lock.json                   # Versions verrouillées
└── README.md                           # Ce fichier
```

---

## 🔐 Variables d'Environnement

### Configuration Serveur

| Variable | Description | Exemple |
|----------|-------------|---------|
| `PORT` | Port du serveur | `3000` |
| `NODE_ENV` | Environnement (development/production) | `development` |

### Configuration Firebase

| Variable | Description |
|----------|-------------|
| `FB_PROJECT_ID` | ID du projet Firebase |
| `FB_PRIVATE_KEY_ID` | ID de la clé privée |
| `FB_PRIVATE_KEY` | Clé privée Firebase |
| `FB_CLIENT_EMAIL` | Email du compte service |
| `FB_CLIENT_ID` | ID du client |
| `FB_AUTH_URI` | URI d'authentification |
| `FB_TOKEN_URI` | URI du token |
| `FB_AUTH_PROVIDER_X509_CERT_URL` | URL du certificat |
| `FB_CLIENT_X509_CERT_URL` | URL du certificat client |
| `FB_UNIVERSE_DOMAIN` | Domaine univers |

### Configuration Twilio (SMS)

| Variable | Description |
|----------|-------------|
| `TWILIO_ACCOUNT_SID` | SID du compte Twilio |
| `TWILIO_AUTH_TOKEN` | Token d'authentification |
| `TWILIO_PHONE_NUMBER` | Numéro de téléphone Twilio |

### Configuration Scraping

| Variable | Description | Défaut |
|----------|-------------|--------|
| `TAOBAO_TIMEOUT` | Timeout Taobao (ms) | `30000` |
| `TAOBAO_HEADLESS` | Mode headless Selenium | `true` |

---

## 🧪 Tests

### Exécuter les tests

```bash
npm test
```

**Note :** Les tests ne sont pas encore configurés. À implémenter avec Jest ou Mocha.

---

## 🐛 Debugging

### Activer les logs détaillés

```bash
DEBUG=* npm start
```

### Mode développement avec Nodemon

```bash
npm run start:dev
```

### Déboguer le scraping Taobao

Modifier `scrapeTaobaoService.js` pour activer le mode graphique :

```javascript
const options = {
  headless: false, // Voir le navigateur
  // ... autres options
};
```

---

## 📚 Exemples d'Utilisation

### Scraper et ajouter des produits Taobao

```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "laptop gaming",
    "limit": 50,
    "categoryId": "electronics",
    "userId": "user123"
  }'
```

### Récupérer les produits avec pagination

```bash
curl "http://localhost:3000/products?page=1&limit=20&sort=price_asc&search=laptop"
```

### Uploader une image

```bash
curl -X POST http://localhost:3000/image/upload \
  -F "file=@/path/to/image.jpg" \
  -F "userId=user123"
```

### Envoyer une notification

```bash
curl -X POST http://localhost:3000/notification \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user123",
    "title": "Nouvelle offre",
    "message": "Un produit correspond à vos critères",
    "type": "product_match"
  }'
```

### Envoyer un SMS

```bash
curl -X POST http://localhost:3000/sms/send \
  -H "Content-Type: application/json" \
  -d '{
    "to": "+33612345678",
    "message": "Votre code de vérification est: 123456"
  }'
```

---

## 🚀 Déploiement

### Préparation pour la production

1. **Définir les variables d'environnement**
```bash
NODE_ENV=production
```

2. **Optimiser les dépendances**
```bash
npm ci --only=production
```

3. **Vérifier les logs**
```bash
npm start
```

### Déploiement sur Heroku

```bash
heroku create yuunna-backend
heroku config:set NODE_ENV=production
git push heroku main
```

### Déploiement sur AWS/DigitalOcean

1. Configurer les variables d'environnement
2. Installer les dépendances
3. Lancer le serveur avec PM2 :

```bash
npm install -g pm2
pm2 start src/server.js --name "yuunna-backend"
pm2 save
```

---

## 🤝 Contribution

Les contributions sont bienvenues ! Pour contribuer :

1. **Fork le repository**
2. **Créer une branche feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit les changements** (`git commit -m 'Add some AmazingFeature'`)
4. **Push vers la branche** (`git push origin feature/AmazingFeature`)
5. **Ouvrir une Pull Request**

### Standards de code

- Utiliser **ESLint** pour le linting
- Utiliser **Prettier** pour le formatage
- Suivre la structure modulaire existante
- Ajouter des commentaires pour les fonctions complexes

---

## 📝 Licence

Ce projet est sous licence **ISC**.

---

## 📞 Support

Pour toute question ou problème :

- 📧 Email : support@yuunna.com
- 🐛 Issues : [GitHub Issues](https://github.com/yuunna/backend/issues)
- 💬 Discussions : [GitHub Discussions](https://github.com/yuunna/backend/discussions)

---

## 🎉 Remerciements

Merci à tous les contributeurs et à la communauté open-source pour les excellentes bibliothèques utilisées dans ce projet.

---

**Dernière mise à jour :** Novembre 2025  
**Version :** 1.0.0  
**Statut :** ✅ Production Ready
