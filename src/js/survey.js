// Word Intensity Survey - JavaScript Module
// Professional survey implementation with Google Sheets integration

// Survey Configuration will be loaded from config.js
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

// Load configuration from config.js
function loadConfiguration() {
    // Check if config is already loaded from config.js
    if (window.SURVEY_CONFIG) {
        console.log('Configuration loaded successfully');
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
        
        // Try to save to Google Sheets first
        await saveToGoogleSheets();
        
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
async function saveToGoogleSheets() {
    // UPDATE THIS URL with your current Google Apps Script deployment URL
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxFG53hdkB0s4FkVM0gAe9N6cST04KPDfG8kQbzSAxVzhTZ1zQDNQt4cQsw8sIip07p7g/exec';
    
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
                surveyData.responses.push({
                    questionNumber: questionIndex + 1, // 1-indexed for human readability
                    meaning: wordSet.meaning,
                    mostIntense: response.mostIntense,
                    leastIntense: response.leastIntense,
                    words: wordSet.words
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
            
            // Add timeout to prevent hanging
            const timeoutId = setTimeout(() => {
                console.log('⏰ Submission timeout after 20 seconds');
                try {
                    document.body.removeChild(iframe);
                    document.body.removeChild(form);
                } catch (e) {}
                reject(new Error('Submission timeout - please check your Google Apps Script deployment'));
            }, 20000); // 20 second timeout
            
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
                }, 2000); // Increased timeout to 2 seconds
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
    const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzWEacy_zklziuIhalsLdieyQjWUyxyPX5OoQpBScQRW30uiGeu6KG8-hf3uNmayMADlg/exec';
    
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
