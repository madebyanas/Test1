# Application de Test de Niveau de Langue

Cette application web responsive permet de réaliser un test de niveau de langue sous forme de quiz interactif. Elle évalue les compétences en grammaire, vocabulaire et compréhension, puis détermine un niveau global (A1, A2, B1, B2, C1, C2) en fonction des réponses.

## Fonctionnalités

- Interface responsive adaptée à tous les appareils (mobile, tablette, desktop)
- Sélection de la langue de l'interface (français, anglais)
- Quiz interactif avec 30 questions à choix multiples
- Calcul automatique des scores par compétence et du niveau global
- Formulaire de contact pour collecter les informations de l'utilisateur
- Envoi automatique des résultats vers une Google Sheet
- Design moderne avec animations et transitions fluides

## Structure des fichiers

- `index.html` : Structure HTML de l'application
- `styles.css` : Styles CSS pour le design responsive
- `script.js` : Logique JavaScript de l'application
- `english_level_test.json` : Fichier JSON contenant les questions du test
- `logo.svg` : Logo de l'application
- `en-flag.svg` : Drapeau anglais pour la sélection de langue
- `fr-flag.svg` : Drapeau français pour la sélection de langue
- `google_apps_script.js` : Script pour Google Apps Script

## Installation et configuration

### 1. Configuration locale

1. Téléchargez tous les fichiers dans un dossier sur votre ordinateur
2. Ouvrez le fichier `index.html` dans un navigateur web pour tester l'application localement

### 2. Configuration de Google Sheets pour recevoir les données

1. Créez une nouvelle Google Sheet à l'adresse [sheets.google.com](https://sheets.google.com)
2. Allez dans le menu `Extensions > Apps Script`
3. Copiez-collez le contenu du fichier `google_apps_script.js` dans l'éditeur de script
4. Modifiez la constante `SPREADSHEET_ID` dans le script avec l'ID de votre feuille de calcul (visible dans l'URL)
5. Enregistrez le projet (icône de disquette ou Ctrl+S)
6. Déployez le script en tant qu'application web :
   - Cliquez sur `Déployer > Nouvelle déploiement`
   - Sélectionnez `Application web` comme type
   - Définissez `Exécuter en tant que` sur `Moi`
   - Définissez `Qui a accès` sur `Tout le monde`
   - Cliquez sur `Déployer`
7. Copiez l'URL de l'application web générée
8. Ouvrez le fichier `script.js` et remplacez la valeur de la variable `scriptURL` (ligne 283 environ) par l'URL que vous venez de copier

### 3. Déploiement sur un serveur web

Pour rendre l'application accessible en ligne, vous devez la déployer sur un serveur web :

1. Téléchargez tous les fichiers sur votre serveur web via FTP ou tout autre moyen de déploiement
2. Assurez-vous que le fichier `english_level_test.json` est accessible depuis le même répertoire que `index.html`

## Personnalisation

### Modification des questions

Vous pouvez modifier les questions du test en éditant le fichier `english_level_test.json`. Chaque question doit suivre ce format :

```json
{
  "id": 1,
  "level": "A1",
  "competency": "vocabulary",
  "question": "Votre question ici",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "answer": "Option correcte"
}
```

### Modification du design

Vous pouvez personnaliser l'apparence de l'application en modifiant les variables CSS dans le fichier `styles.css`. Les couleurs principales sont définies au début du fichier dans la section `:root`.

### Ajout d'autres langues

Pour ajouter d'autres langues d'interface, modifiez la section de sélection de langue dans `index.html` et ajoutez les traductions correspondantes dans la fonction `updateUILanguage` du fichier `script.js`.

## Remarques importantes

- L'application nécessite une connexion Internet pour envoyer les données vers Google Sheets
- Assurez-vous que les utilisateurs autorisent JavaScript dans leur navigateur
- Pour des raisons de sécurité, n'oubliez pas d'informer les utilisateurs que leurs données seront collectées et stockées

## Support et contribution

Pour toute question ou suggestion d'amélioration, n'hésitez pas à ouvrir une issue ou à proposer une pull request sur le dépôt GitHub de ce projet.