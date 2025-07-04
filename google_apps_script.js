/**
 * Script Google Apps Script pour recevoir les données du test de langue
 * et les enregistrer dans une Google Sheet.
 * 
 * Instructions d'utilisation :
 * 1. Créez une nouvelle Google Sheet
 * 2. Allez dans Extensions > Apps Script
 * 3. Copiez-collez ce code dans l'éditeur de script
 * 4. Enregistrez le projet
 * 5. Déployez le script en tant qu'application web :
 *    - Cliquez sur "Déployer" > "Nouvelle déploiement"
 *    - Sélectionnez "Application web" comme type
 *    - Définissez "Exécuter en tant que" sur "Moi"
 *    - Définissez "Qui a accès" sur "Tout le monde"
 *    - Cliquez sur "Déployer"
 * 6. Copiez l'URL de l'application web générée
 * 7. Remplacez l'URL dans le fichier script.js de votre application web
 *    (recherchez la variable scriptURL)
 */

// ID de la feuille de calcul (remplacez par l'ID de votre propre feuille)
// L'ID se trouve dans l'URL de votre feuille : https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit
const SPREADSHEET_ID = 'VOTRE_SPREADSHEET_ID';

// Nom de la feuille où les données seront stockées
const SHEET_NAME = 'Résultats';

/**
 * Point d'entrée pour les requêtes POST
 */
function doPost(e) {
  try {
    // Vérifier si des données ont été reçues
    let data;
    
    // Vérifier si les données sont envoyées via postData (JSON) ou via formulaire
    if (e.postData && e.postData.contents) {
      // Données envoyées via JSON
      try {
        data = JSON.parse(e.postData.contents);
      } catch (error) {
        return sendResponse(false, 'Erreur lors de l\'analyse des données JSON: ' + error.message);
      }
    } else if (e.parameter && e.parameter.data) {
      // Données envoyées via formulaire avec un champ 'data' contenant du JSON
      try {
        data = JSON.parse(e.parameter.data);
      } catch (error) {
        return sendResponse(false, 'Erreur lors de l\'analyse des données du formulaire: ' + error.message);
      }
    } else {
      return sendResponse(false, 'Aucune donnée reçue ou format non reconnu');
    }
    
    // Vérifier les données requises
    if (!data.name || !data.phone || !data.overallLevel) {
      return sendResponse(false, 'Données incomplètes: nom, téléphone et niveau requis');
    }
    
    // Enregistrer les données dans la feuille de calcul
    const result = saveToSheet(data);
    
    // Renvoyer une réponse de succès
    return sendResponse(true, 'Données enregistrées avec succès', result);
    
  } catch (error) {
    // Gérer les erreurs
    console.error('Erreur dans doPost:', error);
    return sendResponse(false, 'Erreur: ' + error.message);
  }
}

/**
 * Enregistre les données dans la feuille de calcul
 */
function saveToSheet(data) {
  try {
    // Ouvrir la feuille de calcul
    const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
    let sheet = spreadsheet.getSheetByName(SHEET_NAME);
    
    // Créer la feuille si elle n'existe pas
    if (!sheet) {
      sheet = spreadsheet.insertSheet(SHEET_NAME);
      // Ajouter les en-têtes
      sheet.appendRow([
        'Date', 'Nom', 'Téléphone', 'Langue', 'Niveau Global', 
        'Grammaire (%)', 'Vocabulaire (%)', 'Lecture (%)'
      ]);
      
      // Formater les en-têtes
      sheet.getRange(1, 1, 1, 8).setFontWeight('bold');
    }
    
    // Formater la date
    const timestamp = new Date(data.timestamp);
    const formattedDate = Utilities.formatDate(timestamp, 'Europe/Paris', 'dd/MM/yyyy HH:mm:ss');
    
    // Obtenir le nom complet de la langue à partir du code
    const languageNames = {
      'en': 'Anglais',
      'fr': 'Français',
      'es': 'Espagnol',
      'de': 'Allemand'
    };
    const languageName = languageNames[data.selectedLanguage] || data.selectedLanguage;
    
    // Ajouter les données à la feuille
    sheet.appendRow([
      formattedDate,
      data.name,
      data.phone,
      languageName,
      data.overallLevel,
      data.grammarPercentage,
      data.vocabularyPercentage,
      data.readingPercentage
    ]);
    
    // Retourner les informations sur l'enregistrement
    return {
      rowNumber: sheet.getLastRow(),
      timestamp: formattedDate
    };
  } catch (error) {
    console.error('Erreur lors de l\'enregistrement dans la feuille:', error);
    throw new Error('Erreur lors de l\'enregistrement des données: ' + error.message);
  }
}

/**
 * Crée une réponse JSON standardisée avec les en-têtes CORS
 */
function sendResponse(success, message, data = null) {
  const response = {
    success: success,
    message: message
  };
  
  if (data) {
    response.data = data;
  }
  
  return ContentService.createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

/**
 * Point d'entrée pour les requêtes GET (pour tester si le script fonctionne)
 * Supporte également le callback JSONP pour contourner les restrictions CORS
 */
function doGet(e) {
  const response = {
    success: true,
    message: 'Le script est opérationnel. Utilisez des requêtes POST pour envoyer des données.'
  };
  
  // Vérifier si un callback JSONP est demandé
  if (e && e.parameter && e.parameter.callback) {
    // Retourner une réponse JSONP avec le callback
    return ContentService.createTextOutput(e.parameter.callback + '(' + JSON.stringify(response) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  } else {
    // Retourner une réponse JSON standard
    return ContentService.createTextOutput(JSON.stringify(response))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeader('Access-Control-Allow-Origin', '*')
      .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
      .setHeader('Access-Control-Allow-Headers', 'Content-Type');
  }
}

/**
 * Point d'entrée pour les requêtes OPTIONS (preflight CORS)
 */
function doOptions() {
  return ContentService.createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT)
    .setHeader('Access-Control-Allow-Origin', '*')
    .setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
    .setHeader('Access-Control-Allow-Headers', 'Content-Type')
    .setHeader('Access-Control-Max-Age', '3600');
}