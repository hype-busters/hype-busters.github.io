// Word Intensity Survey - JavaScript Module
// Professional survey implementation with Google Sheets integration

// Survey Configuration will be loaded from config.js

// Function to detect attention check questions by specific word combinations
function checkIfAttentionCheck(words) {
    // Define the exact attention check combinations for each survey
    const attentionCheckSets = [
        // Survey 1 - ATTITUDE & IMPORTANCE
        ['boring', 'tedious', 'dull', 'amazing'],
        ['trivial', 'minor', 'irrelevant', 'essential'],
        ['optional', 'unimportant', 'helpful', 'crucial'],
        
        // Survey 2 - QUALITY & PROBLEM  
        ['expert', 'incompetent', 'skilled', 'professional'],
        ['adequate', 'mediocre', 'average', 'outstanding'],
        ['catastrophic', 'devastating', 'severe', 'trivial'],
        
        // Survey 3 - NOVELTY & RIGOUR
        ['ordinary', 'common', 'standard', 'groundbreaking'],
        ['cutting-edge', 'pioneering', 'innovative', 'outdated'],
        ['sloppy', 'careless', 'adequate', 'meticulous'],
        ['flawless', 'perfect', 'precise', 'unreliable'],
        
        // Survey 4 - SCALE
        ['small', 'limited', 'tiny', 'enormous'],
        ['enormous', 'gigantic', 'colossal', 'minimal'],
        
        // Survey 5 - UTILITY
        ['useless', 'ineffective', 'impractical', 'transformative'],
        ['perfect', 'excellent', 'outstanding', 'useless']
    ];
    
    // Check if the current word set matches any attention check set exactly
    return attentionCheckSets.some(checkSet => {
        return checkSet.length === words.length && 
               checkSet.every(word => words.includes(word));
    });
}
// This file is not committed to version control for security

// Survey Data - will be loaded from external file
let wordSets = [];

// Global State
let currentQuestion = 0;
let responses = {};
let participantData = {};
let surveyStarted = false;
let selectedSurvey = null;
// Google API variables removed - using simple Apps Script approach

// Survey Initialization
async function initializeSurvey() {
    // Load configuration from external file  
    loadConfiguration();
    
    // Load questions from external file
    try {
        await loadQuestions();
    } catch (error) {
        console.error('❌ Failed to load questions:', error);
        
        // Fallback to hardcoded questions if loading fails
        console.log('🔄 Using fallback questions...');
        wordSets = [
            {
                meaning: "degree of brightness",
                words: ["dim", "bright", "brilliant", "radiant"]
            },
            {
                meaning: "speed of movement",
                words: ["slow", "moderate", "fast", "rapid"]
            },
            {
                meaning: "emotional intensity",
                words: ["calm", "excited", "thrilled", "ecstatic"]
            },
            {
                meaning: "level of difficulty",
                words: ["easy", "moderate", "challenging", "impossible"]
            },
            {
                meaning: "temperature sensation",
                words: ["cool", "warm", "hot", "scorching"]
            },
            {
                meaning: "volume of sound",
                words: ["quiet", "audible", "loud", "deafening"]
            },
            {
                meaning: "physical strength",
                words: ["weak", "average", "strong", "powerful"]
            },
            {
                meaning: "level of happiness",
                words: ["sad", "content", "happy", "ecstatic"]
            },
            {
                meaning: "size of object",
                words: ["tiny", "small", "large", "enormous"]
            },
            {
                meaning: "quality of taste",
                words: ["bland", "mild", "flavorful", "intense"]
            }
        ];
        
        alert('Unable to load questions from external files. Using sample questions for demonstration.\n\nTo fix this:\n• Run a local server (see scripts/start-server.bat)\n• Or deploy to a web server\n• Files are located in src/data/ folder');
    }
    
    showInstructionsPage();
    setupEventListeners();
}

// CSV Parser utility function
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        if (values.length >= 5) { // meaning + 4 words
            data.push({
                meaning: values[0],
                words: [values[1], values[2], values[3], values[4]]
            });
        }
    }
    
    return data;
}

// Load questions from external JSON or CSV file (fallback for initial load)
async function loadQuestions() {
    // Load default questions (survey1) for fallback
    try {
        await loadQuestionsFromSurvey('1');
    } catch (error) {
        console.error('❌ Failed to load default questions:', error);
        
        // Fallback to hardcoded questions if loading fails
        console.log('🔄 Using fallback questions...');
        wordSets = [
            {
                meaning: "degree of brightness",
                words: ["dim", "bright", "brilliant", "radiant"]
            },
            {
                meaning: "speed of movement",
                words: ["slow", "moderate", "fast", "rapid"]
            },
            {
                meaning: "emotional intensity",
                words: ["calm", "excited", "thrilled", "ecstatic"]
            }
        ];
        
        throw error;
    }
}

// Load questions from a specific survey CSV file
async function loadQuestionsFromSurvey(surveyNumber) {
    let questions = [];
    let loadedFrom = '';
    
    try {
        console.log(`📚 Loading questions from survey${surveyNumber}.csv...`);
        const csvResponse = await fetch(`src/data/survey${surveyNumber}.csv?v=` + Date.now());
        
        if (csvResponse.ok) {
            const csvText = await csvResponse.text();
            questions = parseCSV(csvText);
            loadedFrom = `Survey ${surveyNumber} CSV`;
        } else {
            throw new Error(`Survey ${surveyNumber} CSV file not found or inaccessible`);
        }
        
    } catch (csvError) {
        console.log('CSV loading failed:', csvError.message);
        throw new Error(`Failed to load survey ${surveyNumber}`);
    }
    
    // Validate questions format
    if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error('No questions found or invalid format');
    }
    
    // Validate each question
    for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        if (!q.meaning || !Array.isArray(q.words) || q.words.length !== 4) {
            throw new Error(`Question ${i + 1} has invalid format. Each question must have a 'meaning' and exactly 4 'words'.`);
        }
    }
    
    wordSets = questions;
    console.log(`✅ Successfully loaded ${wordSets.length} questions from ${loadedFrom}`);
}

// Load configuration from config.js or env-config.js
function loadConfiguration() {
    // Check if config is already loaded
    if (window.SURVEY_CONFIG) {
        // Check if we have Google Apps Script URL (for deployed environment)
        if (window.SURVEY_CONFIG.googleAppsScript && window.SURVEY_CONFIG.googleAppsScript.url) {
            console.log('Configuration loaded successfully (using Google Apps Script)');
        }
        // Check if we have Google API credentials (for local development)
        else if (window.SURVEY_CONFIG.google && window.SURVEY_CONFIG.google.apiKey) {
            console.log('Configuration loaded successfully (using Google Sheets API)');
        }
        else {
            console.warn('Configuration found but missing required credentials.');
        }
    } else {
        console.warn('Configuration not found. Please ensure config.js is loaded and contains valid configuration.');
        // Fallback configuration for development
        window.SURVEY_CONFIG = {
            google: {
                apiKey: '',
                clientId: '',
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                spreadsheetId: ''
            }
        };
    }
}

// Event Listeners Setup
function setupEventListeners() {
    document.getElementById('demographicsForm').addEventListener('submit', function(e) {
        e.preventDefault();
        startSurveyWithDemographics();
    });
}

// Google Apps Script Integration (no API/OAuth needed)
// Data is sent directly to Apps Script web app URL

// Navigation Functions
function showInstructionsPage() {
    hideAllContainers();
    document.getElementById('instructionsContainer').style.display = 'block';
}

function showAnimatedExample() {
    hideAllContainers();
    document.getElementById('animatedExampleContainer').style.display = 'block';
    
    // Start the instructions animation
    setTimeout(() => {
        startInstructionsAnimation();
    }, 500);
}

function showDemographicsForm() {
    hideAllContainers();
    document.getElementById('demographicsContainer').style.display = 'block';
}

function showSurveySelection() {
    hideAllContainers();
    document.getElementById('surveySelectionContainer').style.display = 'block';
    setupSurveySelection();
}

function showQuestionContainer() {
    hideAllContainers();
    document.getElementById('questionContainer').style.display = 'block';
    // Removed animated example from survey questions - only show the intensity labels
    document.getElementById('intensityPanel').style.display = 'block';
}

function showCompletionScreen() {
    hideAllContainers();
    document.getElementById('completionContainer').style.display = 'block';
    
    // Reset the completion button state
    resetCompletionButton();
}

function resetCompletionButton() {
    const completeBtn = document.getElementById('completeSurveyBtn');
    if (completeBtn) {
        completeBtn.disabled = false;
        completeBtn.textContent = 'Complete Survey';
        completeBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        completeBtn.style.opacity = '1';
        completeBtn.style.cursor = 'pointer';
    }
}

function showSuccessScreen() {
    hideAllContainers();
    document.getElementById('successContainer').style.display = 'block';
}

function showResultsContainer() {
    hideAllContainers();
    document.getElementById('resultsContainer').style.display = 'block';
}

function hideAllContainers() {
    const containers = [
        'demographicsContainer',
        'surveySelectionContainer',
        'questionContainer', 
        'completionContainer',
        'successContainer',
        'instructionsContainer',
        'animatedExampleContainer',
        'resultsContainer',
        'intensityPanel'
    ];
    
    containers.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.style.display = 'none';
        }
    });
}

// Survey Flow Functions
function startSurveyWithDemographics() {
    // Collect demographic data
    participantData = {
        name: document.getElementById('participantName').value,
        age: document.getElementById('participantAge').value,
        gender: document.getElementById('participantGender').value,
        country: document.getElementById('participantCountry').value,
        firstLanguage: document.getElementById('participantLanguage').value,
        timestamp: new Date().toISOString()
    };

    // After demographics, show survey selection
    showSurveySelection();
}

function startNewSurvey() {
    // Reset all data for new participant
    responses = {};
    participantData = {};
    currentQuestion = 0;
    surveyStarted = false;
    selectedSurvey = null;
    
    // Clear demographic form
    document.getElementById('demographicsForm').reset();
    
    // Show demographics form to start fresh
    showDemographicsForm();
}

// Survey Selection Functions
function setupSurveySelection() {
    const surveyOptions = document.querySelectorAll('.survey-option');
    const startBtn = document.getElementById('startSelectedSurveyBtn');
    
    // Remove any existing event listeners and setup new ones
    surveyOptions.forEach(option => {
        option.onclick = function() {
            // Remove selected class from all options
            surveyOptions.forEach(opt => opt.classList.remove('selected'));
            
            // Add selected class to clicked option
            this.classList.add('selected');
            
            // Store selected survey
            selectedSurvey = this.dataset.survey;
            
            // Enable start button
            startBtn.disabled = false;
            startBtn.style.opacity = '1';
            startBtn.style.cursor = 'pointer';
        };
    });
}

async function startSelectedSurvey() {
    if (!selectedSurvey) {
        alert('Please select a survey first.');
        return;
    }
    
    // Show instructions modal before starting survey
    showInstructionsModal(selectedSurvey);
}

function showInstructionsModal(surveyNumber) {
    const instructionsContent = document.getElementById('instructionsContent');
    const modal = document.getElementById('instructionsModal');
    
    // Define instructions for each category
    const categoryInstructions = {
        'IMPORTANCE': {
            meaning: 'These words make the research sound important or urgent',
            examples: 'Early diagnosis is <strong>essential</strong> for improving patient survival rates.<br>Reducing hospital infections is a <strong>priority</strong> for public health.<br>Funding for vaccine research is <strong>crucial</strong> to prevent future outbreaks.',
            rating: 'Judge how strongly the word makes the research sound important or urgent.'
        },
        'NOVELTY': {
            meaning: 'These words make the research sound new or different from anything done before.',
            examples: 'The team developed a <strong>new</strong> method for detecting rare cancers.<br>This study offers an <strong>unprecedented</strong> view of brain activity during sleep.<br>The drug uses an <strong>innovative</strong> delivery system to target specific cells.',
            rating: 'Judge how strongly the word makes the research seem original or different from existing work.'
        },
        'RIGOUR': {
            meaning: 'These words make the research sound careful, precise, and done to a high standard.',
            examples: 'The trial was conducted in a <strong>controlled</strong> setting to ensure accurate results.<br>Data were analysed using <strong>careful</strong> statistical methods.<br>The researchers followed a <strong>strict</strong> protocol throughout the experiment.',
            rating: 'Judge how strongly the word promotes the idea that the research was carried out with high standards and precision.'
        },
        'SCALE': {
            meaning: 'These words make the research sound big in size, scope, or range.',
            examples: 'The study included a <strong>large-scale</strong> survey of hospital patients.<br>The outbreak affected a <strong>vast</strong> area of the country.<br>The database contains a <strong>huge</strong> amount of genetic information.',
            rating: 'Judge how strongly the word makes the research seem large in scope, reach, or amount.'
        },
        'UTILITY': {
            meaning: 'These words make the research sound useful, practical, and/or benefits.',
            examples: 'The new tool is <strong>useful</strong> for monitoring blood sugar levels at home.<br>This app provides <strong>practical</strong> guidance for managing symptoms.<br>The treatment has been shown to be <strong>effective</strong> in reducing pain.',
            rating: 'Judge how strongly the word makes the research or method sound helpful, beneficial, or applicable in practice.'
        },
        'QUALITY': {
            meaning: 'These words make the people or environment involved in the research sound skilled, capable, or well regarded.',
            examples: 'The hospital is known for its <strong>skilled</strong> surgical team.<br>The lab is equipped with <strong>dedicated</strong> scanning technology.<br>The team works in a <strong>renowned</strong> research institute.',
            rating: 'Judge how strongly the word suggests that the people, facilities, or organisation involved are of high standing or ability.'
        },
        'ATTITUDE': {
            meaning: 'These words show a positive reaction or strong approval of the research.',
            examples: 'The results are <strong>exciting</strong> for the future of cancer treatment.<br>This finding is <strong>remarkable</strong> and may change clinical practice.<br>The study offers an <strong>inspiring</strong> example of patient-led research.',
            rating: 'Judge how strongly the word shows enthusiasm, approval, or a positive emotional response to the research.'
        },
        'PROBLEM': {
            meaning: 'These words make an issue sound serious or in need of urgent attention.',
            examples: 'Antibiotic resistance is an <strong>alarming</strong> global health threat.<br>Shortages of medical staff are a <strong>serious</strong> concern for rural clinics.<br>The rise in obesity is a <strong>pressing</strong> public health issue.',
            rating: 'Judge how strongly the word makes the problem seem severe, urgent, or demanding immediate action.'
        }
    };
    
    // Define which categories are in each survey
    const surveyCategories = {
        '1': ['ATTITUDE', 'IMPORTANCE'],
        '2': ['QUALITY', 'PROBLEM'],
        '3': ['NOVELTY', 'RIGOUR'],
        '4': ['SCALE'],
        '5': ['UTILITY']
    };
    
    // Get categories for selected survey
    const categories = surveyCategories[surveyNumber] || [];
    
    // Build instructions HTML
    let html = '';
    categories.forEach(category => {
        const instruction = categoryInstructions[category];
        if (instruction) {
            html += `
                <div class="category-instruction">
                    <div class="category-title">${category}</div>
                    <div class="category-meaning">
                        <strong>Meaning:</strong> ${instruction.meaning}
                    </div>
                    <div class="category-examples">
                        ${instruction.examples}
                    </div>
                    <div class="category-rating">
                        <strong>How to rate:</strong> ${instruction.rating}
                    </div>
                </div>
            `;
        }
    });
    
    instructionsContent.innerHTML = html;
    modal.style.display = 'flex';
}

async function closeInstructionsAndStartSurvey() {
    // Hide the instructions modal
    document.getElementById('instructionsModal').style.display = 'none';
    
    try {
        // Load questions from the selected survey CSV file
        await loadQuestionsFromSurvey(selectedSurvey);
        
        // Start the actual survey
        showQuestionContainer();
        surveyStarted = true;
        updateQuestion();
        updateProgress();
        
    } catch (error) {
        console.error('Failed to load survey questions:', error);
        alert('Error loading survey questions. Please try again or select a different survey.');
    }
}

// Question Management
function updateQuestion() {
    const currentSet = wordSets[currentQuestion];
    
    // Display the meaning
    document.getElementById('meaningText').textContent = `"${currentSet.meaning}"`;
    
    const wordsGrid = document.getElementById('wordsGrid');
    wordsGrid.innerHTML = '';
    
    currentSet.words.forEach((word, index) => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-option';
        wordElement.textContent = word;
        wordElement.onclick = () => selectWord(word, wordElement);
        wordsGrid.appendChild(wordElement);
    });
    
    // Restore previous selections if they exist
    if (responses[currentQuestion]) {
        const response = responses[currentQuestion];
        const wordElements = wordsGrid.children;
        for (let elem of wordElements) {
            if (elem.textContent === response.mostIntense) {
                elem.classList.add('most-intense');
            }
            if (elem.textContent === response.leastIntense) {
                elem.classList.add('least-intense');
            }
        }
    }
    
    updateQuestionCounter();
    updateNavigationButtons();
}

function updateQuestionCounter() {
    // All questions are now real questions (no examples)
    const actualQuestionNumber = currentQuestion + 1; // +1 because arrays are 0-indexed
    const totalActualQuestions = wordSets.length;
    document.getElementById('questionCounter').textContent = 
        `Question ${actualQuestionNumber} of ${totalActualQuestions}`;
}

function updateNavigationButtons() {
    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    
    // Update next button text and behavior
    const nextBtn = document.getElementById('nextBtn');
    const currentResponse = responses[currentQuestion];
    const isCurrentQuestionComplete = currentResponse && currentResponse.mostIntense && currentResponse.leastIntense;
    
    if (currentQuestion === wordSets.length - 1) {
        nextBtn.textContent = 'Finish';
        nextBtn.disabled = !isCurrentQuestionComplete;
    } else {
        nextBtn.textContent = 'Next';
        nextBtn.disabled = !isCurrentQuestionComplete;
    }
    
    // Add visual feedback for disabled state
    if (nextBtn.disabled) {
        nextBtn.style.opacity = '0.5';
        nextBtn.style.cursor = 'not-allowed';
    } else {
        nextBtn.style.opacity = '1';
        nextBtn.style.cursor = 'pointer';
    }
}

function selectWord(word, element) {
    const wordsGrid = document.getElementById('wordsGrid');
    const wordElements = wordsGrid.children;
    
    if (element.classList.contains('most-intense')) {
        element.classList.remove('most-intense');
        if (responses[currentQuestion]) {
            delete responses[currentQuestion].mostIntense;
        }
    } else if (element.classList.contains('least-intense')) {
        element.classList.remove('least-intense');
        if (responses[currentQuestion]) {
            delete responses[currentQuestion].leastIntense;
        }
    } else {
        // Check if this would create a conflict
        const currentResponse = responses[currentQuestion] || {};
        
        if (currentResponse.mostIntense === word || currentResponse.leastIntense === word) {
            return; // Word already selected
        }
        
        if (!currentResponse.mostIntense) {
            // Select as most intense
            for (let elem of wordElements) {
                elem.classList.remove('most-intense');
            }
            element.classList.add('most-intense');
            
            if (!responses[currentQuestion]) {
                responses[currentQuestion] = {};
            }
            responses[currentQuestion].mostIntense = word;
            responses[currentQuestion].meaning = wordSets[currentQuestion].meaning;
        } else if (!currentResponse.leastIntense) {
            // Select as least intense
            for (let elem of wordElements) {
                elem.classList.remove('least-intense');
            }
            element.classList.add('least-intense');
            
            responses[currentQuestion].leastIntense = word;
        }
    }
    
    updateProgress();
    updateNavigationButtons(); // Update button state when selections change
}

function nextQuestion() {
    // Check if both most and least intense are selected
    const currentResponse = responses[currentQuestion];
    
    if (!currentResponse || !currentResponse.mostIntense || !currentResponse.leastIntense) {
        alert('Please select both a MOST INTENSE and LEAST INTENSE word before continuing.');
        return; // Don't proceed to next question
    }
    
    if (currentQuestion < wordSets.length - 1) {
        currentQuestion++;
        updateQuestion();
        updateProgress();
    } else {
        // Last question completed, check if all required questions are answered
        if (validateAllResponses()) {
            showCompletionScreen();
        } else {
            alert('Please complete all questions before finishing the survey.');
        }
    }
}

function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        updateQuestion();
        updateProgress();
    }
}

function updateProgress() {
    const completedQuestions = Object.keys(responses).filter(key => {
        const response = responses[key];
        return response.mostIntense && response.leastIntense;
    }).length;
    
    // All questions are now real questions
    const totalActualQuestions = wordSets.length;
    const progress = (completedQuestions / totalActualQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Validation function to check if all questions are completed
function validateAllResponses() {
    for (let i = 0; i < wordSets.length; i++) {
        const response = responses[i];
        if (!response || !response.mostIntense || !response.leastIntense) {
            console.log(`Question ${i + 1} is incomplete:`, response);
            return false;
        }
    }
    return true;
}

// Survey Completion
async function completeSurvey() {
    // Final validation before submission
    if (!validateAllResponses()) {
        alert('Please complete all survey questions before submitting. You must select both a MOST INTENSE and LEAST INTENSE word for each question.');
        showQuestionContainer(); // Go back to questions
        return;
    }
    
    const completeBtn = document.getElementById('completeSurveyBtn');
    const originalText = completeBtn.textContent;
    
    try {
        // Show loading state
        completeBtn.disabled = true;
        completeBtn.textContent = 'Submitting...';
        completeBtn.style.background = 'linear-gradient(135deg, #888 0%, #666 100%)';
        
        console.log('🚀 Starting survey submission...');
        
        // Check if we have a large dataset that needs chunking
        const responseCount = Object.keys(responses).length;
        console.log(`📊 Total responses to submit: ${responseCount}`);
        
        if (responseCount > 50) {
            console.log('📦 Large dataset detected, using chunked submission...');
            completeBtn.textContent = 'Submitting (Large Dataset)...';
            await saveToGoogleSheetsChunked();
        } else {
            // Use regular submission for smaller datasets
            await saveToGoogleSheets();
        }
        
        console.log('✅ Survey submitted successfully!');
        
        // Show success screen only after successful submission
        showSuccessScreen();
        
    } catch (error) {
        console.error('❌ Failed to save to Google Sheets:', error);
        
        // Reset button state
        completeBtn.disabled = false;
        completeBtn.textContent = originalText;
        completeBtn.style.background = 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)';
        
        // Show error message and fallback options
        const userChoice = confirm(
            'Unable to save to Google Sheets. Would you like to:\n\n' +
            '✓ OK - Download Excel backup and try again later\n' +
            '✗ Cancel - Stay on this page and retry submission'
        );
        
        if (userChoice) {
            try {
                // Fallback to Excel export
                exportToExcel();
                alert('Excel backup downloaded! Please contact the researcher to ensure your data is recorded.');
                showSuccessScreen(); // Show success even with fallback
            } catch (excelError) {
                console.error('Excel export also failed:', excelError);
                alert('Both Google Sheets and Excel export failed. Please contact the researcher immediately.');
            }
        }
        // If they chose Cancel, stay on the completion screen for retry
    }
}

// Data Export Functions

// Chunked submission for large datasets
async function saveToGoogleSheetsChunked() {
    const CHUNK_SIZE = 25; // Submit 25 responses at a time
    const responseEntries = Object.entries(responses);
    const totalChunks = Math.ceil(responseEntries.length / CHUNK_SIZE);
    
    console.log(`📦 Submitting ${responseEntries.length} responses in ${totalChunks} chunks of ${CHUNK_SIZE}`);
    
    const completeBtn = document.getElementById('completeSurveyBtn');
    
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const startIndex = chunkIndex * CHUNK_SIZE;
        const endIndex = Math.min(startIndex + CHUNK_SIZE, responseEntries.length);
        const chunk = responseEntries.slice(startIndex, endIndex);
        
        // Update progress
        completeBtn.textContent = `Submitting... (${chunkIndex + 1}/${totalChunks})`;
        console.log(`📤 Submitting chunk ${chunkIndex + 1}/${totalChunks} (responses ${startIndex + 1}-${endIndex})`);
        
        // Create chunk data
        const chunkResponses = {};
        chunk.forEach(([index, response]) => {
            chunkResponses[index] = response;
        });
        
        try {
            await saveResponseChunk(chunkResponses, chunkIndex + 1, totalChunks);
            console.log(`✅ Chunk ${chunkIndex + 1}/${totalChunks} submitted successfully`);
            
            // Small delay between chunks to prevent overwhelming the server
            if (chunkIndex < totalChunks - 1) {
                await new Promise(resolve => setTimeout(resolve, 1000)); // 1 second delay
            }
            
        } catch (error) {
            console.error(`❌ Failed to submit chunk ${chunkIndex + 1}:`, error);
            throw new Error(`Submission failed at chunk ${chunkIndex + 1} of ${totalChunks}. Some data may have been saved.`);
        }
    }
    
    console.log('✅ All chunks submitted successfully!');
}

async function saveResponseChunk(chunkResponses, chunkNumber, totalChunks) {
    // Get Google Apps Script URL from configuration
    const config = window.SURVEY_CONFIG;
    const GOOGLE_APPS_SCRIPT_URL = config.googleAppsScript?.url || 'https://script.google.com/macros/s/AKfycbxFG53hdkB0s4FkVM0gAe9N6cST04KPDfG8kQbzSAxVzhTZ1zQDNQt4cQsw8sIip07p7g/exec';
    
    // Prepare chunk data
    const surveyData = {
        timestamp: new Date().toISOString(),
        selectedSurvey: selectedSurvey,
        chunkInfo: {
            chunkNumber: chunkNumber,
            totalChunks: totalChunks,
            isChunked: true
        },
        participant: {
            name: participantData.name,
            age: participantData.age,
            gender: participantData.gender,
            country: participantData.country,
            firstLanguage: participantData.firstLanguage
        },
        responses: []
    };

    // Add chunk responses
    Object.entries(chunkResponses).forEach(([index, response]) => {
        const questionIndex = parseInt(index);
        const wordSet = wordSets[questionIndex];
        
        if (response.mostIntense && response.leastIntense && wordSet) {
            // Check if this is an attention check question (specific combinations)
            const words = wordSet.words;
            const isAttentionCheck = checkIfAttentionCheck(words);
            
            surveyData.responses.push({
                questionNumber: questionIndex + 1,
                meaning: wordSet.meaning,
                mostIntense: response.mostIntense,
                leastIntense: response.leastIntense,
                words: wordSet.words,
                isExample: isAttentionCheck // Mark attention checks as examples for easy identification
            });
        }
    });

    console.log(`📊 Chunk ${chunkNumber} contains ${surveyData.responses.length} responses`);

    // Submit chunk using same method as regular submission but with shorter timeout
    return new Promise((resolve, reject) => {
        const iframe = document.createElement('iframe');
        iframe.style.display = 'none';
        iframe.name = `chunkFrame${chunkNumber}`;
        document.body.appendChild(iframe);
        
        const form = document.createElement('form');
        form.target = iframe.name;
        form.method = 'POST';
        form.action = GOOGLE_APPS_SCRIPT_URL;
        
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = 'data';
        input.value = JSON.stringify(surveyData);
        form.appendChild(input);
        
        // Shorter timeout for chunks
        const timeoutId = setTimeout(() => {
            console.log(`⏰ Chunk ${chunkNumber} timeout after 30 seconds`);
            try {
                document.body.removeChild(iframe);
                document.body.removeChild(form);
            } catch (e) {}
            reject(new Error(`Chunk ${chunkNumber} submission timeout`));
        }, 30000);
        
        iframe.onload = function() {
            setTimeout(() => {
                try {
                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    const responseText = iframeDoc.body ? iframeDoc.body.textContent : 'No response body';
                    console.log(`📄 Chunk ${chunkNumber} response:`, responseText);
                    
                    if (responseText.includes('error') || responseText.includes('false')) {
                        throw new Error(`Chunk ${chunkNumber} server error: ${responseText}`);
                    }
                } catch (readError) {
                    console.log(`⚠️ Could not read chunk ${chunkNumber} response - assuming success`);
                }
                
                clearTimeout(timeoutId);
                document.body.removeChild(iframe);
                document.body.removeChild(form);
                resolve(true);
            }, 2000);
        };
        
        iframe.onerror = function() {
            console.error(`❌ Chunk ${chunkNumber} submission failed`);
            clearTimeout(timeoutId);
            document.body.removeChild(iframe);
            document.body.removeChild(form);
            reject(new Error(`Chunk ${chunkNumber} form submission failed`));
        };
        
        document.body.appendChild(form);
        form.submit();
    });
}

async function saveToGoogleSheets() {
    // Get Google Apps Script URL from configuration
    const config = window.SURVEY_CONFIG;
    const GOOGLE_APPS_SCRIPT_URL = config.googleAppsScript?.url || 'https://script.google.com/macros/s/AKfycbxFG53hdkB0s4FkVM0gAe9N6cST04KPDfG8kQbzSAxVzhTZ1zQDNQt4cQsw8sIip07p7g/exec';
    
    try {
        // Prepare data in the exact format you want in the spreadsheet
        const surveyData = {
            timestamp: new Date().toISOString(),
            selectedSurvey: selectedSurvey,
            participant: {
                name: participantData.name,
                age: participantData.age,
                gender: participantData.gender,
                country: participantData.country,
                firstLanguage: participantData.firstLanguage
            },
            responses: []
        };

        // Debug logging to check if selectedSurvey is being sent
        console.log('🔍 Survey data being prepared for submission:');
        console.log('selectedSurvey value:', selectedSurvey);
        console.log('Full surveyData object:', JSON.stringify(surveyData, null, 2));

        // Add each response as a separate row
        Object.entries(responses).forEach(([index, response]) => {
            const questionIndex = parseInt(index);
            const wordSet = wordSets[questionIndex];
            
            if (response.mostIntense && response.leastIntense && wordSet) {
                // Check if this is an attention check question (specific combinations)
                const words = wordSet.words;
                const isAttentionCheck = checkIfAttentionCheck(words);
                
                surveyData.responses.push({
                    questionNumber: questionIndex + 1, // 1-indexed for human readability
                    meaning: wordSet.meaning,
                    mostIntense: response.mostIntense,
                    leastIntense: response.leastIntense,
                    words: wordSet.words,
                    isExample: isAttentionCheck // Mark attention checks as examples for easy identification
                });
            }
        });

        console.log('📊 Submitting to Google Sheets via form method...');
        console.log('🔍 Survey data being sent:', JSON.stringify(surveyData, null, 2));
        console.log('🔗 Target URL:', GOOGLE_APPS_SCRIPT_URL);

        // CORS-free method: Create a hidden form and submit it
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'googleSheetFrame';
            document.body.appendChild(iframe);
            
            const form = document.createElement('form');
            form.target = 'googleSheetFrame';
            form.method = 'POST';
            form.action = GOOGLE_APPS_SCRIPT_URL;
            
            // Create form data input
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'data';
            input.value = JSON.stringify(surveyData);
            form.appendChild(input);
            
            // Add timeout to prevent hanging (increased for large datasets)
            const timeoutId = setTimeout(() => {
                console.log('⏰ Submission timeout after 60 seconds');
                try {
                    document.body.removeChild(iframe);
                    document.body.removeChild(form);
                } catch (e) {}
                reject(new Error('Submission timeout - please check your Google Apps Script deployment'));
            }, 60000); // 60 second timeout for large surveys
            
            // Handle response
            iframe.onload = function() {
                console.log('📥 Iframe loaded, checking response...');
                setTimeout(() => {
                    try {
                        // Try to read response from iframe
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const responseText = iframeDoc.body ? iframeDoc.body.textContent : 'No response body';
                        console.log('📄 Response from Google Apps Script:', responseText);
                        
                        // Check if response indicates success
                        if (responseText.includes('success') || responseText.includes('true')) {
                            console.log('✅ Data submitted to Google Sheets successfully!');
                        } else if (responseText.includes('error') || responseText.includes('false')) {
                            console.log('❌ Google Apps Script returned error:', responseText);
                            throw new Error('Server returned error: ' + responseText);
                        } else {
                            console.log('✅ Form submitted (response unclear, assuming success)');
                        }
                    } catch (readError) {
                        console.log('⚠️ Could not read iframe response (CORS protection) - assuming success');
                        console.log('✅ Data submitted to Google Sheets successfully!');
                    }
                    
                    clearTimeout(timeoutId); // Clear the timeout
                    document.body.removeChild(iframe);
                    document.body.removeChild(form);
                    resolve(true);
                }, 5000); // Increased timeout to 5 seconds for large data processing
            };
            
            iframe.onerror = function() {
                console.error('❌ Failed to submit to Google Sheets');
                clearTimeout(timeoutId); // Clear the timeout
                document.body.removeChild(iframe);
                document.body.removeChild(form);
                reject(new Error('Form submission failed'));
            };
            
            // Submit the form
            document.body.appendChild(form);
            form.submit();
        });
        
    } catch (error) {
        console.error('❌ Failed to save to Google Sheets:', error);
        console.log('🔄 Falling back to alternative storage methods...');
        
        // Fallback to localStorage and show user message
        saveToLocalStorage();
        alert('Data temporarily saved locally. Please contact the researcher to ensure your responses are recorded.');
        
        // Still throw error to trigger Excel download as backup
        throw error;
    }
}

// Alternative backend methods
async function saveToAlternativeBackend() {
    // Option 2: Simple webhook service (like Zapier, Make.com, or n8n)
    // Option 3: Firebase Firestore
    // Option 4: Airtable
    // Option 5: EmailJS (send data via email)
    
    try {
        // Example: EmailJS integration (sends data via email)
        return await sendDataViaEmail();
    } catch (error) {
        console.error('❌ All backend methods failed:', error);
        // Final fallback: store in localStorage for manual export
        saveToLocalStorage();
        throw new Error('Unable to save data automatically. Data stored locally.');
    }
}

async function sendDataViaEmail() {
    // Using EmailJS service (free tier available)
    // You'll need to set up an EmailJS account and get service/template IDs
    
    const emailData = {
        to_email: 'your-email@example.com', // Replace with your email
        participant_name: participantData.name,
        participant_data: JSON.stringify(participantData, null, 2),
        survey_responses: JSON.stringify(responses, null, 2),
        timestamp: new Date().toISOString()
    };
    
    // EmailJS send (requires EmailJS library and configuration)
    // emailjs.send('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', emailData);
    
    console.log('📧 Email method not configured - using localStorage fallback');
    throw new Error('Email service not configured');
}

function saveToLocalStorage() {
    const surveyData = {
        participant: participantData,
        responses: responses,
        timestamp: new Date().toISOString(),
        id: Date.now()
    };
    
    // Get existing data
    const existingData = JSON.parse(localStorage.getItem('surveyResponses') || '[]');
    existingData.push(surveyData);
    
    // Save back to localStorage
    localStorage.setItem('surveyResponses', JSON.stringify(existingData));
    
    console.log('💾 Data saved to browser localStorage. Access via browser dev tools.');
}

// Legacy Google Sheets API method (keeping for reference)
async function saveToGoogleSheetsAPI() {
    // This is the old method that requires OAuth
    // Prepare data for Google Sheets
    const values = [
        // Header row
        ['Timestamp', 'Name', 'Age', 'Gender', 'Country', 'First Language', 'Question #', 'Meaning', 'Most Intense', 'Least Intense']
    ];

    // Add participant data and responses
    Object.entries(responses).forEach(([index, response]) => {
        values.push([
            new Date(participantData.timestamp).toLocaleString(),
            participantData.name,
            participantData.age,
            participantData.gender,
            participantData.country,
            participantData.firstLanguage,
            parseInt(index) + 1,
            response.meaning || '',
            response.mostIntense || '',
            response.leastIntense || ''
        ]);
    });

    // Append to spreadsheet
    const response = await gapi.client.sheets.spreadsheets.values.append({
        spreadsheetId: window.SURVEY_CONFIG.google.spreadsheetId,
        range: 'Sheet1!A:J',
        valueInputOption: 'RAW',
        resource: {
            values: values
        }
    });

    console.log('Data saved to Google Sheets:', response);
    return response;
}

function exportToExcel() {
    // Prepare data for Excel export
    const worksheetData = [];
    
    // Add participant information header
    worksheetData.push(['Participant Information']);
    worksheetData.push(['Name', participantData.name]);
    worksheetData.push(['Age', participantData.age]);
    worksheetData.push(['Gender', participantData.gender]);
    worksheetData.push(['Country', participantData.country]);
    worksheetData.push(['First Language', participantData.firstLanguage]);
    worksheetData.push(['Completion Date', new Date(participantData.timestamp).toLocaleString()]);
    worksheetData.push([]); // Empty row
    
    // Add survey responses header
    worksheetData.push(['Survey Responses']);
    worksheetData.push(['Question #', 'Meaning', 'Most Intense', 'Least Intense']);
    
    // Add response data
    Object.entries(responses).forEach(([index, response]) => {
        worksheetData.push([
            parseInt(index) + 1,
            response.meaning || '',
            response.mostIntense || '',
            response.leastIntense || ''
        ]);
    });
    
    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);
    
    // Add the worksheet to workbook
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Survey Results');
    
    // Generate filename with participant name and timestamp
    const filename = `Word_Intensity_Survey_${participantData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.xlsx`;
    
    // Save the file - this will download to the user's default Downloads folder
    try {
        XLSX.writeFile(workbook, filename);
        console.log(`Excel file "${filename}" has been downloaded to your Downloads folder.`);
    } catch (error) {
        console.error('Error saving Excel file:', error);
        alert('There was an error saving the Excel file. Please try the manual export option.');
    }
}

// Admin Functions
async function exportResults() {
    if (Object.keys(participantData).length > 0) {
        try {
            // Try Google Sheets first
            await saveToGoogleSheets();
            alert('Results exported to Google Sheets successfully!');
        } catch (error) {
            console.error('Google Sheets export failed:', error);
            // Fallback to Excel
            exportToExcel();
        }
    } else {
        // Fallback to CSV export for admin use
        const csvContent = [
            ['Question', 'Meaning', 'Most Intense', 'Least Intense'],
            ...Object.entries(responses).map(([index, response]) => [
                parseInt(index) + 1,
                response.meaning || '',
                response.mostIntense || '',
                response.leastIntense || ''
            ])
        ].map(row => row.join(',')).join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'word_intensity_survey_results.csv';
        a.click();
        window.URL.revokeObjectURL(url);
    }
}

function viewResults() {
    const resultsContent = document.getElementById('resultsContent');
    resultsContent.innerHTML = '';
    
    Object.entries(responses).forEach(([index, response]) => {
        const resultItem = document.createElement('div');
        resultItem.className = 'result-item';
        resultItem.innerHTML = `
            <strong>Q${parseInt(index) + 1}: ${response.meaning}</strong><br>
            Most Intense: ${response.mostIntense || 'Not selected'}<br>
            Least Intense: ${response.leastIntense || 'Not selected'}
        `;
        resultsContent.appendChild(resultItem);
    });
    
    showResultsContainer();
}

function backToSurvey() {
    // Reset completion button state before returning to survey
    resetCompletionButton();
    showQuestionContainer();
}

function resetSurvey() {
    if (confirm('Are you sure you want to reset all responses and start over?')) {
        responses = {};
        participantData = {};
        currentQuestion = 0;
        surveyStarted = false;
        selectedSurvey = null;
        
        // Clear demographic form
        document.getElementById('demographicsForm').reset();
        
        // Reset completion button state
        resetCompletionButton();
        
        // Show demographics form again
        showDemographicsForm();
        updateProgress();
    }
}

// Debugging function to test Google Apps Script connection
async function testGoogleAppsScriptConnection() {
    // Get Google Apps Script URL from configuration
    const config = window.SURVEY_CONFIG;
    const GOOGLE_APPS_SCRIPT_URL = config.googleAppsScript?.url || 'https://script.google.com/macros/s/AKfycbxFG53hdkB0s4FkVM0gAe9N6cST04KPDfG8kQbzSAxVzhTZ1zQDNQt4cQsw8sIip07p7g/exec';
    
    console.log('🧪 Testing Google Apps Script connection...');
    
    const testData = {
        timestamp: new Date().toISOString(),
        participant: {
            name: 'Test User',
            age: '25',
            gender: 'Test',
            country: 'Test Country',
            firstLanguage: 'English'
        },
        responses: [{
            questionNumber: 1,
            meaning: 'test meaning',
            mostIntense: 'very',
            leastIntense: 'slightly',
            words: ['slightly', 'somewhat', 'very', 'extremely']
        }]
    };
    
    try {
        // Test with fetch first (may be blocked by CORS)
        console.log('🔍 Trying fetch method...');
        const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        const result = await response.text();
        console.log('✅ Fetch response:', result);
        
    } catch (fetchError) {
        console.log('❌ Fetch failed (expected due to CORS):', fetchError.message);
        
        // Try form method
        console.log('🔍 Trying form method...');
        
        return new Promise((resolve, reject) => {
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.name = 'testFrame';
            document.body.appendChild(iframe);
            
            const form = document.createElement('form');
            form.target = 'testFrame';
            form.method = 'POST';
            form.action = GOOGLE_APPS_SCRIPT_URL;
            
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = 'data';
            input.value = JSON.stringify(testData);
            form.appendChild(input);
            
            iframe.onload = function() {
                setTimeout(() => {
                    try {
                        const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                        const responseText = iframeContent.body.textContent;
                        console.log('✅ Form submission response:', responseText);
                        
                        document.body.removeChild(iframe);
                        document.body.removeChild(form);
                        resolve(responseText);
                    } catch (e) {
                        console.log('⚠️ Could not read iframe response (normal for cross-origin)');
                        document.body.removeChild(iframe);
                        document.body.removeChild(form);
                        resolve('Form submitted - check Apps Script logs');
                    }
                }, 2000);
            };
            
            document.body.appendChild(form);
            form.submit();
            console.log('📤 Test form submitted');
        });
    }
}

// Add to window for console access
window.testGoogleAppsScriptConnection = testGoogleAppsScriptConnection;

// Example Animation Functions
function startExampleAnimation(prefix = 'example') {
    const exampleWords = document.querySelectorAll(`#${prefix}-mild, #${prefix}-medium, #${prefix}-hot, #${prefix}-spicy`);
    
    // Reset all words
    exampleWords.forEach(word => {
        word.classList.remove('example-most-intense', 'example-least-intense', 'animating');
    });
    
    // Animation sequence
    setTimeout(() => {
        // Step 1: Click on "hot" (most intense) - Dark Blue #0d47a1
        const hotWord = document.getElementById(`${prefix}-hot`);
        if (hotWord) {
            hotWord.classList.add('animating');
            setTimeout(() => {
                hotWord.classList.remove('animating');
                hotWord.classList.add('example-most-intense');
            }, 300);
        }
    }, 1000);
    
    setTimeout(() => {
        // Step 2: Click on "mild" (least intense) - Light Blue #87ceeb
        const mildWord = document.getElementById(`${prefix}-mild`);
        if (mildWord) {
            mildWord.classList.add('animating');
            setTimeout(() => {
                mildWord.classList.remove('animating');
                mildWord.classList.add('example-least-intense');
            }, 300);
        }
    }, 2500);
    
    setTimeout(() => {
        // Step 3: Reset and restart the animation
        startExampleAnimation(prefix);
    }, 5000);
}

// Start animation for instructions page
function startInstructionsAnimation() {
    startExampleAnimation('instructions-example');
}

// Updated to include animation start

// Initialize when page loads
document.addEventListener('DOMContentLoaded', async () => {
    await initializeSurvey();
});
