// Word Intensity Survey - JavaScript Module
// Professional survey implementation with Google Sheets integration

// Survey Configuration will be loaded from config.js
// This file is not committed to version control for security
let SURVEY_CONFIG = null;

// Survey Data
const wordSets = [
    {
        meaning: "level of spiciness in food",
        words: ["mild", "medium", "hot", "spicy"],
        isExample: true,
        exampleMostIntense: "hot",
        exampleLeastIntense: "mild"
    },
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

// Global State
let currentQuestion = 0;
let responses = {};
let participantData = {};
let surveyStarted = false;
let isGoogleApiLoaded = false;
let isGoogleSignedIn = false;

// Survey Initialization
function initializeSurvey() {
    // Load configuration from external file
    loadConfiguration();
    initializeGoogleAPI();
    showInstructionsPage();
    setupEventListeners();
}

// Load configuration from config.js
function loadConfiguration() {
    // Check if config is already loaded from config.js
    if (window.SURVEY_CONFIG) {
        SURVEY_CONFIG = window.SURVEY_CONFIG;
        console.log('Configuration loaded successfully');
    } else {
        console.warn('Configuration not found. Please ensure config.js is loaded and contains valid configuration.');
        // Fallback configuration for development
        SURVEY_CONFIG = {
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

// Google API Integration
function initializeGoogleAPI() {
    if (typeof gapi !== 'undefined') {
        gapi.load('auth2:client', initGoogleAuth);
    } else {
        console.warn('Google API not loaded. Google Sheets functionality will be disabled.');
    }
}

function initGoogleAuth() {
    console.log('Initializing Google API with config:', SURVEY_CONFIG.google);
    gapi.client.init({
        apiKey: SURVEY_CONFIG.google.apiKey,
        clientId: SURVEY_CONFIG.google.clientId,
        discoveryDocs: SURVEY_CONFIG.google.discoveryDocs,
        scope: SURVEY_CONFIG.google.scope
    }).then(() => {
        isGoogleApiLoaded = true;
        const authInstance = gapi.auth2.getAuthInstance();
        isGoogleSignedIn = authInstance.isSignedIn.get();
        console.log('✅ Google API initialized successfully! Signed in:', isGoogleSignedIn);
    }).catch((error) => {
        console.error('Error initializing Google API:', error);
    });
}

function signIntoGoogle() {
    if (!isGoogleApiLoaded) {
        throw new Error('Google API is not loaded yet. Please try again in a moment.');
    }

    const authInstance = gapi.auth2.getAuthInstance();
    return authInstance.signIn().then(() => {
        isGoogleSignedIn = true;
        console.log('Successfully signed into Google');
    }).catch((error) => {
        console.error('Error signing into Google:', error);
        throw error;
    });
}

// Navigation Functions
function showInstructionsPage() {
    hideAllContainers();
    document.getElementById('instructionsContainer').style.display = 'block';
}

function showDemographicsForm() {
    hideAllContainers();
    document.getElementById('demographicsContainer').style.display = 'block';
}

function showQuestionContainer() {
    hideAllContainers();
    document.getElementById('questionContainer').style.display = 'block';
    document.getElementById('adminPanel').style.display = 'block';
}

function showCompletionScreen() {
    hideAllContainers();
    document.getElementById('completionContainer').style.display = 'block';
}

function showResultsContainer() {
    hideAllContainers();
    document.getElementById('resultsContainer').style.display = 'block';
}

function hideAllContainers() {
    const containers = [
        'demographicsContainer',
        'questionContainer', 
        'completionContainer',
        'instructionsContainer',
        'resultsContainer',
        'adminPanel'
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

    showQuestionContainer();
    surveyStarted = true;
    updateQuestion();
    updateProgress();
}

function startNewSurvey() {
    // Reset all data for new participant
    responses = {};
    participantData = {};
    currentQuestion = 0;
    surveyStarted = false;
    
    // Clear demographic form
    document.getElementById('demographicsForm').reset();
    
    // Show demographics form to start fresh
    showDemographicsForm();
}

// Question Management
function updateQuestion() {
    const currentSet = wordSets[currentQuestion];
    
    // Check if this is an example question
    if (currentSet.isExample) {
        document.getElementById('meaningText').innerHTML = 
            `<span style="color: #0d47a1; font-weight: bold;">EXAMPLE:</span> "${currentSet.meaning}"`;
    } else {
        document.getElementById('meaningText').textContent = `"${currentSet.meaning}"`;
    }
    
    const wordsGrid = document.getElementById('wordsGrid');
    wordsGrid.innerHTML = '';
    
    currentSet.words.forEach((word, index) => {
        const wordElement = document.createElement('div');
        wordElement.className = 'word-option';
        wordElement.textContent = word;
        
        // For example question, pre-fill the selections and disable clicking
        if (currentSet.isExample) {
            if (word === currentSet.exampleMostIntense) {
                wordElement.classList.add('most-intense');
            }
            if (word === currentSet.exampleLeastIntense) {
                wordElement.classList.add('least-intense');
            }
            wordElement.style.cursor = 'default';
            wordElement.onclick = null; // Disable clicking for example
        } else {
            wordElement.onclick = () => selectWord(word, wordElement);
        }
        
        wordsGrid.appendChild(wordElement);
    });
    
    // Restore previous selections for non-example questions
    if (!currentSet.isExample && responses[currentQuestion]) {
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
    const currentSet = wordSets[currentQuestion];
    
    if (currentSet.isExample) {
        document.getElementById('questionCounter').textContent = 'Example Question - Practice';
    } else {
        // Adjust numbering to account for example question
        const actualQuestionNumber = currentQuestion;
        const totalActualQuestions = wordSets.length - 1; // Subtract 1 for example
        document.getElementById('questionCounter').textContent = 
            `Question ${actualQuestionNumber} of ${totalActualQuestions}`;
    }
}

function updateNavigationButtons() {
    const currentSet = wordSets[currentQuestion];
    
    document.getElementById('prevBtn').disabled = currentQuestion === 0;
    
    // Update next button text and behavior
    const nextBtn = document.getElementById('nextBtn');
    if (currentSet.isExample) {
        nextBtn.textContent = 'Start Survey';
        nextBtn.disabled = false;
    } else if (currentQuestion === wordSets.length - 1) {
        nextBtn.textContent = 'Finish';
        nextBtn.disabled = false;
    } else {
        nextBtn.textContent = 'Next';
        nextBtn.disabled = false;
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
}

function nextQuestion() {
    if (currentQuestion < wordSets.length - 1) {
        currentQuestion++;
        updateQuestion();
        updateProgress();
    } else {
        // Last question completed, show completion screen
        showCompletionScreen();
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
    
    // Don't count example question in progress calculation
    const totalActualQuestions = wordSets.length - 1; // Subtract 1 for example
    const progress = (completedQuestions / totalActualQuestions) * 100;
    document.getElementById('progressFill').style.width = progress + '%';
}

// Survey Completion
async function completeSurvey() {
    try {
        // Try to save to Google Sheets first
        await saveToGoogleSheets();
        alert('Thank you for completing the survey! Your responses have been saved to Google Sheets.');
    } catch (error) {
        console.error('Failed to save to Google Sheets:', error);
        // Fallback to Excel export
        exportToExcel();
        alert('Thank you for completing the survey! Your Excel file has been downloaded to your Downloads folder. (Google Sheets save failed)');
    }
    // Show instructions page for next participant
    showInstructionsPage();
}

// Data Export Functions
async function saveToGoogleSheets() {
    // Check if signed in, if not, sign in first
    if (!isGoogleSignedIn) {
        await signIntoGoogle();
    }

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
        spreadsheetId: SURVEY_CONFIG.google.spreadsheetId,
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
    showQuestionContainer();
}

function resetSurvey() {
    if (confirm('Are you sure you want to reset all responses and start over?')) {
        responses = {};
        participantData = {};
        currentQuestion = 0;
        surveyStarted = false;
        
        // Clear demographic form
        document.getElementById('demographicsForm').reset();
        
        // Show demographics form again
        showDemographicsForm();
        updateProgress();
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', initializeSurvey);
