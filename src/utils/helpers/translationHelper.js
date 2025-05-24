/**
 * Utilitaire pour la traduction de texte utilisant l'API Google Translate
 */
const axios = require('axios');
require('dotenv').config();

// Clé API Google Translate (stockez-la dans les variables d'environnement)
const GOOGLE_TRANSLATE_API_KEY = process.env.GOOGLE_TRANSLATE_API_KEY;

/**
 * Traduit un texte du chinois vers le français en utilisant l'API Google Translate
 * @param {string} text - Texte à traduire (en chinois)
 * @returns {Promise<string>} - Texte traduit (en français)
 */
exports.translateFromChinese = async text => {
  try {
    if (!text) return '';

    // Vérifier si la clé API est disponible
    if (!GOOGLE_TRANSLATE_API_KEY) {
      // console.warn('Clé API Google Translate non configurée. Utilisation de la simulation de traduction.');
      return simulateTranslation(text);
    }

    // Appel à l'API Google Translate
    const response = await axios.post(`https://translation.googleapis.com/language/translate/v2?key=${GOOGLE_TRANSLATE_API_KEY}`, {
      q: text,
      source: 'zh-CN', // Chinois simplifié
      target: 'fr', // Français
      format: 'text',
    });

    // Vérifier la réponse
    if (response.data && response.data.data && response.data.data.translations && response.data.data.translations.length > 0) {
      return response.data.data.translations[0].translatedText;
    }

    // En cas de réponse invalide, utiliser la simulation
    console.warn("Réponse invalide de l'API Google Translate. Utilisation de la simulation.");
    return simulateTranslation(text);
  } catch (error) {
    console.error('Erreur lors de la traduction avec Google Translate:', error);
    console.warn('Utilisation de la simulation de traduction comme solution de secours.');
    return simulateTranslation(text); // En cas d'erreur, utiliser la simulation
  }
};

/**
 * Simule une traduction basique du chinois vers le français
 * @param {string} text - Texte à traduire
 * @returns {string} - Texte "traduit"
 */
function simulateTranslation(text) {
  // Dictionnaire de traduction basique pour simulation
  const translations = {
    // Vêtements
    衣服: 'vêtement',
    裙子: 'robe',
    裤子: 'pantalon',
    衬衫: 'chemise',
    外套: 'manteau',
    夹克: 'veste',
    T恤: 't-shirt',
    毛衣: 'pull',
    帽子: 'chapeau',
    鞋: 'chaussure',

    // Électronique
    电子产品: 'produit électronique',
    手机: 'téléphone',
    电脑: 'ordinateur',
    笔记本电脑: 'ordinateur portable',
    耳机: 'écouteurs',
    音箱: 'enceinte',
    电视: 'télévision',
    相机: 'appareil photo',
    智能手表: 'montre intelligente',

    // Maison
    家居: 'article de maison',
    花园: 'jardin',
    厨房: 'cuisine',
    家具: 'meuble',
    装饰: 'décoration',
    床: 'lit',
    桌子: 'table',
    椅子: 'chaise',
    灯: 'lampe',
    地毯: 'tapis',
    窗帘: 'rideau',
    餐具: 'vaisselle',

    // Autres mots courants
    新: 'nouveau',
    热: 'chaud',
    款: 'modèle',
    男: 'homme',
    女: 'femme',
    儿童: 'enfant',
    大: 'grand',
    小: 'petit',
    中: 'moyen',
    高: 'haut',
    低: 'bas',
    质量: 'qualité',
    价格: 'prix',
    折扣: 'remise',
    促销: 'promotion',
    包邮: 'livraison gratuite',
    正品: 'authentique',
    品牌: 'marque',
  };

  // Remplacer les mots chinois connus par leur traduction
  let translatedText = text;

  for (const [chinese, french] of Object.entries(translations)) {
    translatedText = translatedText.replace(new RegExp(chinese, 'g'), french);
  }

  // Si la traduction n'a pas changé le texte, ajouter un préfixe pour indiquer que c'est non traduit
  if (translatedText === text && /[\u4e00-\u9fa5]/.test(text)) {
    return `[Non traduit] ${text}`;
  }

  return translatedText;
}

/**
 * Détecte si un texte contient des caractères chinois
 * @param {string} text - Texte à analyser
 * @returns {boolean} - True si le texte contient des caractères chinois
 */
exports.containsChineseCharacters = text => {
  if (!text) return false;
  // Plage Unicode pour les caractères chinois
  return /[\u4e00-\u9fa5]/.test(text);
};
