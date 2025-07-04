// Variables globales
let questions = [];
let currentQuestionIndex = 0;
let selectedLanguage = '';
let userAnswers = [];
let competencyScores = {
    grammar: { correct: 0, total: 0 },
    vocabulary: { correct: 0, total: 0 },
    reading: { correct: 0, total: 0 }
};
let levelScores = {
    A1: { correct: 0, total: 0 },
    A2: { correct: 0, total: 0 },
    B1: { correct: 0, total: 0 },
    B2: { correct: 0, total: 0 },
    C1: { correct: 0, total: 0 },
    C2: { correct: 0, total: 0 }
};

// Variables pour le timer
let timerInterval;
let timerSeconds = 0;
let timerMinutes = 0;

// Éléments DOM - Déclaration des variables
let screens;
let languageBtns;
let startTestBtn;
let questionText;
let optionsContainer;
let currentQuestionEl;
let totalQuestionsEl;
let competencyBadge;
let contactForm;
let restartTestBtn;
let menuToggle;
let navLinks;
let startBtn;
let quizNavbar;
let quizTimer;

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    // Initialisation des éléments DOM après le chargement du document
    screens = document.querySelectorAll('.screen');
    languageBtns = document.querySelectorAll('.language-btn');
    startTestBtn = document.getElementById('start-test');
    questionText = document.getElementById('question-text');
    optionsContainer = document.getElementById('options');
    currentQuestionEl = document.getElementById('current-question');
    totalQuestionsEl = document.getElementById('total-questions');
    competencyBadge = document.getElementById('current-competency');
    contactForm = document.getElementById('contact-form');
    restartTestBtn = document.getElementById('restart-test');
    menuToggle = document.querySelector('.menu-toggle');
    navLinks = document.querySelector('.nav-links');
    startBtn = document.querySelector('.start-btn');
    quizNavbar = document.getElementById('quiz-navbar');
    quizTimer = document.getElementById('quiz-timer');
    
    // Gestionnaires d'événements
    languageBtns.forEach(btn => {
        btn.addEventListener('click', async () => {
            selectedLanguage = btn.getAttribute('data-lang');
            // Charger les questions spécifiques à la langue sélectionnée
            await fetchQuestions();
            // Démarrer le quiz après le chargement des questions
            startQuiz();
            updateUILanguage(selectedLanguage);
        });
    });
    
    startBtn.addEventListener('click', () => {
        showScreen('language-selection');
    });
    
    contactForm.addEventListener('submit', handleFormSubmit);
    
    restartTestBtn.addEventListener('click', restartQuiz);
});

// Fonctions
async function fetchQuestions() {
    console.log('Tentative de chargement des questions...');
    try {
        // Déterminer le fichier JSON à charger en fonction de la langue sélectionnée
        let jsonFile = 'english_level_test.json'; // Par défaut
        
        if (selectedLanguage) {
            // Mapper les codes de langue aux fichiers JSON correspondants
            const languageFiles = {
                'en': 'english_level_test.json',
                'fr': 'french_level_test.json',
                'es': 'spanish_level_test.json',
                'de': 'german_level_test.json'
            };
            
            jsonFile = languageFiles[selectedLanguage] || jsonFile;
        }
        
        console.log('Chemin du fichier JSON:', jsonFile);
        const response = await fetch(jsonFile);
        
        if (!response.ok) {
            throw new Error(`Erreur HTTP: ${response.status} - ${response.statusText}`);
        }
        
        console.log('Réponse reçue:', response);
        const data = await response.json();
        console.log('Données JSON parsées:', data);
        
        if (!data.questions || !Array.isArray(data.questions) || data.questions.length === 0) {
            throw new Error('Format de données invalide ou aucune question trouvée');
        }
        
        questions = data.questions;
        totalQuestionsEl.textContent = questions.length;
        console.log('Questions chargées avec succès:', questions);
    } catch (error) {
        console.error('Erreur détaillée lors du chargement des questions:', error);
        alert(`Erreur lors du chargement des questions: ${error.message}. Veuillez vérifier la console pour plus de détails.`);
    }
}

function showScreen(screenId) {
    screens.forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
    
    // Afficher ou masquer la barre de navigation du quiz
    if (screenId === 'quiz') {
        quizNavbar.style.display = 'flex';
    } else {
        quizNavbar.style.display = 'none';
    }
    
    // Réinitialiser le texte du bouton lorsqu'on retourne à la page d'accueil
    if (screenId === 'language-selection') {
        startBtn.textContent = 'Commencez le test';
        
        // Ajouter une animation pour guider l'utilisateur à sélectionner une langue
        const languageOptions = document.querySelector('.language-options');
        if (languageOptions) {
            languageOptions.classList.add('highlight-options');
            setTimeout(() => {
                languageOptions.classList.remove('highlight-options');
            }, 2000);
        }
    }
}

function startQuiz() {
    currentQuestionIndex = 0;
    userAnswers = [];
    resetScores();
    showScreen('quiz');
    console.log('Démarrage du quiz, nombre de questions:', questions.length);
    loadQuestion();
    
    // Changer le texte du bouton "commencez le test" en "Recommencer le Test"
    startBtn.textContent = 'Recommencer le Test';
    startBtn.removeEventListener('click', () => showScreen('language-selection'));
    startBtn.addEventListener('click', () => showScreen('language-selection'));
    
    // Démarrer le timer
    startTimer();
}

function loadQuestion() {
    console.log('Chargement de la question', currentQuestionIndex + 1);
    const question = questions[currentQuestionIndex];
    
    if (!question) {
        console.error('Question non trouvée à l\'index', currentQuestionIndex);
        alert('Erreur lors du chargement de la question. Veuillez réessayer.');
        return;
    }
    
    console.log('Question actuelle:', question);
    questionText.textContent = question.question;
    
    // Mettre à jour le compteur de questions
    currentQuestionEl.textContent = currentQuestionIndex + 1;
    
    // Mettre à jour les variables CSS pour la barre de progression dans la navbar
    document.documentElement.style.setProperty('--current-question', currentQuestionIndex + 1);
    document.documentElement.style.setProperty('--total-questions', questions.length);
    
    // Mettre à jour le badge de compétence
    updateCompetencyBadge(question.competency);
    
    // Générer les options
    optionsContainer.innerHTML = '';
    question.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.classList.add('option');
        optionElement.textContent = option;
        optionElement.addEventListener('click', () => selectOption(index, question.answer));
        optionsContainer.appendChild(optionElement);
    });
    console.log('Options générées:', question.options);
}

function resetScores() {
    competencyScores = {
        grammar: { correct: 0, total: 0 },
        vocabulary: { correct: 0, total: 0 },
        reading: { correct: 0, total: 0 }
    };
    
    levelScores = {
        A1: { correct: 0, total: 0 },
        A2: { correct: 0, total: 0 },
        B1: { correct: 0, total: 0 },
        B2: { correct: 0, total: 0 },
        C1: { correct: 0, total: 0 },
        C2: { correct: 0, total: 0 }
    };
}

function updateCompetencyBadge(competency) {
    competencyBadge.textContent = capitalizeFirstLetter(competency);
    
    // Changer la couleur du badge en fonction de la compétence
    competencyBadge.style.backgroundColor = '';
    if (competency === 'grammar') {
        competencyBadge.style.backgroundColor = 'var(--grammar-color)';
    } else if (competency === 'vocabulary') {
        competencyBadge.style.backgroundColor = 'var(--vocabulary-color)';
    } else if (competency === 'reading') {
        competencyBadge.style.backgroundColor = 'var(--reading-color)';
    }
}

function selectOption(optionIndex, correctAnswer) {
    // Vérifier si l'utilisateur a déjà répondu à cette question
    if (userAnswers.length > currentQuestionIndex) {
        return; // Ne rien faire si déjà répondu
    }
    
    const options = document.querySelectorAll('.option');
    const selectedOption = options[optionIndex];
    const question = questions[currentQuestionIndex];
    const isCorrect = question.options[optionIndex] === correctAnswer;
    
    // Enregistrer la réponse
    userAnswers.push({
        questionId: question.id,
        selectedOption: question.options[optionIndex],
        isCorrect: isCorrect,
        competency: question.competency,
        level: question.level
    });
    
    // Mettre à jour les scores
    updateScores(isCorrect, question.competency, question.level);
    
    // Mettre en évidence la réponse sélectionnée
    options.forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect');
        option.style.backgroundColor = '';
        option.style.color = '';
        option.style.pointerEvents = 'none'; // Désactiver les clics sur toutes les options
    });
    
    // Appliquer un style bleu pour toutes les réponses sélectionnées, qu'elles soient correctes ou non
    selectedOption.classList.add('selected');
    selectedOption.style.backgroundColor = '#4a7bff'; // Couleur bleue
    selectedOption.style.color = 'white';
    selectedOption.style.borderColor = '#3a5fcc';
    
    // Passer automatiquement à la question suivante après un court délai
    setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
            currentQuestionIndex++;
            loadQuestion();
        } else {
            // Si toutes les questions ont été répondues, afficher le formulaire
            showScreen('user-form');
        }
    }, 1000); // Délai de 1 seconde avant de passer à la question suivante
}

function updateScores(isCorrect, competency, level) {
    // Mettre à jour les scores par compétence
    competencyScores[competency].total++;
    if (isCorrect) {
        competencyScores[competency].correct++;
    }
    
    // Mettre à jour les scores par niveau
    levelScores[level].total++;
    if (isCorrect) {
        levelScores[level].correct++;
    }
}

function restartQuiz() {
    // Réinitialiser les variables
    currentQuestionIndex = 0;
    userAnswers = [];
    resetScores();
    
    // Revenir à l'écran de sélection de langue
    showScreen('language-selection');
    
    // Réinitialiser les éléments visuels
    document.documentElement.style.setProperty('--current-question', 0);
    document.querySelectorAll('.option').forEach(option => {
        option.classList.remove('selected', 'correct', 'incorrect', 'disabled');
        option.style.backgroundColor = '';
        option.style.color = '';
        option.style.borderColor = '';
        option.style.pointerEvents = 'auto';
    });
    
    // Réinitialiser le texte du bouton "commencez le test"
    startBtn.textContent = 'Commencez le test';
    
    // Arrêter et réinitialiser le timer
    stopTimer();
    timerSeconds = 0;
    timerMinutes = 0;
    updateTimerDisplay();
}

async function handleFormSubmit(e) {
    e.preventDefault();
    console.log('Envoi des données au serveur...');
    
    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    
    // Valider le format du numéro de téléphone
    const phoneRegex = /^(\+\d{1,3}\s?)?(\d{2}\s?){5}|(\+\d{1,3}\s?)?\d{10}$/;
    if (!phoneRegex.test(phone)) {
        alert('Veuillez entrer un numéro de téléphone valide (ex: 06 12 13 14 15 ou +212612131415)');
        return;
    }
    
    // Calculer les scores finaux
    const finalScores = calculateFinalScores();
    
    // Afficher les résultats
    displayResults(finalScores);
    
    // Afficher l'écran de résultats
    showScreen('results');
    
    // Désactiver le bouton de soumission pendant l'envoi
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.textContent = 'Envoi en cours...';
    }
    
    // Envoyer les données à Google Sheets
    const result = await sendDataToGoogleSheets(name, phone, finalScores);
    console.log('Résultat de l\'envoi:', result);
    
    // Réactiver le bouton de soumission
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Envoyer';
    }
    
    // Afficher la popup après un court délai, que l'envoi ait réussi ou non
    setTimeout(() => {
        showPopup('school-popup');
    }, 1500);
}

function calculateFinalScores() {
    // Calculer les pourcentages par compétence
    const grammarPercentage = Math.round((competencyScores.grammar.correct / competencyScores.grammar.total) * 100) || 0;
    const vocabularyPercentage = Math.round((competencyScores.vocabulary.correct / competencyScores.vocabulary.total) * 100) || 0;
    const readingPercentage = Math.round((competencyScores.reading.correct / competencyScores.reading.total) * 100) || 0;
    
    // Calculer les pourcentages par niveau
    const levelPercentages = {};
    for (const level in levelScores) {
        levelPercentages[level] = Math.round((levelScores[level].correct / levelScores[level].total) * 100) || 0;
    }
    
    // Déterminer le niveau global
    const overallLevel = determineOverallLevel(levelPercentages);
    
    return {
        competencies: {
            grammar: grammarPercentage,
            vocabulary: vocabularyPercentage,
            reading: readingPercentage
        },
        levels: levelPercentages,
        overallLevel: overallLevel
    };
}

function determineOverallLevel(levelPercentages) {
    // Algorithme pour déterminer le niveau global
    // Nous considérons qu'un niveau est atteint si le score est d'au moins 60%
    // et que tous les niveaux inférieurs ont également un score d'au moins 60%
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    let highestLevel = '';
    
    for (let i = 0; i < levels.length; i++) {
        const currentLevel = levels[i];
        const currentPercentage = levelPercentages[currentLevel];
        
        // Vérifier si le niveau actuel a un score suffisant
        if (currentPercentage >= 60) {
            // Vérifier si tous les niveaux inférieurs ont également un score suffisant
            let allPreviousLevelsPassed = true;
            for (let j = 0; j < i; j++) {
                if (levelPercentages[levels[j]] < 60) {
                    allPreviousLevelsPassed = false;
                    break;
                }
            }
            
            if (allPreviousLevelsPassed) {
                highestLevel = currentLevel;
            } else {
                break;
            }
        } else {
            break;
        }
    }
    
    // Si aucun niveau n'est atteint, retourner A1 par défaut
    return highestLevel || 'A1';
}

function displayResults(scores) {
    // Afficher le niveau global
    const overallLevelEl = document.getElementById('overall-level');
    overallLevelEl.textContent = scores.overallLevel;
    overallLevelEl.style.backgroundColor = `var(--${scores.overallLevel.toLowerCase()}-color)`;
    
    // Afficher les pourcentages par compétence
    updatePercentageCircle('grammar', scores.competencies.grammar);
    updatePercentageCircle('vocabulary', scores.competencies.vocabulary);
    updatePercentageCircle('reading', scores.competencies.reading);
    
    // Animation des cercles de pourcentage
    setTimeout(() => {
        document.querySelectorAll('.percentage-circle circle:nth-child(2)').forEach(circle => {
            circle.style.transition = 'stroke-dashoffset 1.5s ease';
        });
    }, 100);
}

function updatePercentageCircle(competency, percentage) {
    const circle = document.getElementById(`${competency}-circle`);
    const percentageEl = document.getElementById(`${competency}-percentage`);
    
    // Mettre à jour le texte du pourcentage
    percentageEl.textContent = `${percentage}%`;
    
    // Calculer la valeur de stroke-dashoffset
    // La circonférence du cercle est de 220 (basée sur le stroke-dasharray)
    const offset = 220 - (220 * percentage / 100);
    circle.style.strokeDashoffset = offset;
}

async function sendDataToGoogleSheets(name, phone, scores) {
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) loadingIndicator.style.display = 'flex';

    console.log('Connexion au script : test de connexion désactivé');

    const data = {
        name: name,
        phone: phone,
        overallLevel: scores.overallLevel,
        grammarPercentage: scores.competencies.grammar,
        vocabularyPercentage: scores.competencies.vocabulary,
        readingPercentage: scores.competencies.reading,
        selectedLanguage: selectedLanguage,
        timestamp: new Date().toISOString()
    };

    // 🟢 METS TON URL ICI ⬇️
    const scriptURL = 'https://script.google.com/macros/s/AKfycbxlbjVe8MIm2Lapukw0mSaB--d45iqCZiagw96WhVo3QJpY7yYpslymcnWmidaSs3TxWA/exec';

    return new Promise((resolve) => {
        try {
            const form = document.createElement('form');
            form.method = 'POST';
            form.action = scriptURL;
            form.target = 'hidden-iframe';
            form.style.display = 'none';

            let iframe = document.getElementById('hidden-iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.name = 'hidden-iframe';
                iframe.id = 'hidden-iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }

            const dataInput = document.createElement('input');
            dataInput.type = 'hidden';
            dataInput.name = 'data';
            dataInput.value = JSON.stringify(data);
            form.appendChild(dataInput);

            document.body.appendChild(form);

            const timeoutId = setTimeout(() => {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                showNotification('L\'envoi des données a pris trop de temps. Veuillez réessayer.', 'error');
                resolve(false);
            }, 15000);

            iframe.onload = function () {
                clearTimeout(timeoutId);
                if (form.parentNode) form.parentNode.removeChild(form);
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                showNotification('Vos résultats ont été enregistrés avec succès !', 'success');
                resolve(true);
            };

            iframe.onerror = function () {
                clearTimeout(timeoutId);
                if (form.parentNode) form.parentNode.removeChild(form);
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                showNotification('Erreur lors de l\'envoi des données.', 'error');
                resolve(false);
            };

            form.submit();
            console.log('Formulaire soumis');
        } catch (error) {
            if (loadingIndicator) loadingIndicator.style.display = 'none';
            showNotification('Une erreur est survenue.', 'error');
            resolve(false);
        }
    });
}


function updateUILanguage(lang) {
    // Cette fonction mettrait à jour tous les textes de l'interface en fonction de la langue sélectionnée
    // Pour simplifier, nous ne l'implémentons pas complètement ici
    console.log(`Langue sélectionnée: ${lang}`);
}

// Fonctions pour gérer le timer
function startTimer() {
    // Réinitialiser le timer
    stopTimer();
    timerSeconds = 0;
    timerMinutes = 0;
    updateTimerDisplay();
    
    // Démarrer le timer
    timerInterval = setInterval(updateTimer, 1000);
}

function updateTimer() {
    timerSeconds++;
    if (timerSeconds >= 60) {
        timerSeconds = 0;
        timerMinutes++;
    }
    updateTimerDisplay();
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function updateTimerDisplay() {
    const formattedMinutes = timerMinutes.toString().padStart(2, '0');
    const formattedSeconds = timerSeconds.toString().padStart(2, '0');
    quizTimer.textContent = `${formattedMinutes}:${formattedSeconds}`;
}

// Fonctions pour gérer les popups
function showPopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.add('active');
    
    // Ajouter les gestionnaires d'événements pour fermer la popup
    const closeBtn = popup.querySelector('.close-popup');
    closeBtn.addEventListener('click', () => closePopup(popupId));
    
    // Fermer la popup en cliquant en dehors du contenu
    popup.addEventListener('click', (e) => {
        if (e.target === popup) {
            closePopup(popupId);
        }
    });
    
    // Initialiser le bouton de partage
    const shareButton = document.getElementById('share-button');
    if (shareButton) {
        shareButton.addEventListener('click', shareWebsite);
    }
}

function closePopup(popupId) {
    const popup = document.getElementById(popupId);
    popup.classList.remove('active');
}

// Fonction pour partager le site
async function shareWebsite() {
    const shareData = {
        title: 'Test de Niveau de Langue',
        text: 'Découvrez votre niveau de langue avec ce test gratuit !',
        url: window.location.href
    };
    
    try {
        // Vérifier si l'API Web Share est disponible
        if (navigator.share) {
            await navigator.share(shareData);
            console.log('Contenu partagé avec succès');
        } else {
            // Fallback pour les navigateurs qui ne supportent pas l'API Web Share
            // Copier l'URL dans le presse-papier
            await navigator.clipboard.writeText(window.location.href);
            alert('URL copiée dans le presse-papier ! Vous pouvez maintenant la partager.');
        }
    } catch (error) {
        console.error('Erreur lors du partage:', error);
    }
}

// Fonctions utilitaires
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Fonction pour afficher des notifications
function showNotification(message, type = 'info') {
    // Créer l'élément de notification s'il n'existe pas déjà
    let notification = document.getElementById('notification');
    if (!notification) {
        notification = document.createElement('div');
        notification.id = 'notification';
        document.body.appendChild(notification);
        
        // Ajouter du style CSS pour la notification
        const style = document.createElement('style');
        style.textContent = `
            #notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                font-weight: bold;
                z-index: 1000;
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.3s, transform 0.3s;
                max-width: 300px;
                box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
            }
            #notification.show {
                opacity: 1;
                transform: translateY(0);
            }
            #notification.info {
                background-color: #3498db;
            }
            #notification.success {
                background-color: #2ecc71;
            }
            #notification.warning {
                background-color: #f39c12;
            }
            #notification.error {
                background-color: #e74c3c;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Définir le message et le type
    notification.textContent = message;
    notification.className = type;
    
    // Afficher la notification
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Masquer la notification après 5 secondes
    setTimeout(() => {
        notification.classList.remove('show');
    }, 5000);
}
