// Configuration Template
// Copy this file to config.js and fill in your actual values
// DO NOT commit config.js to version control

const SURVEY_CONFIG = {
    google: {
        apiKey: 'YOUR_API_KEY_HERAIzaSyCH9nThfI04nI0jmDCtjkLyUyJvoqoypboE',
        clientId: 'YOUR_CLIENT_ID_HERE', 
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        spreadsheetId: 'YOUR_SPREADSHEET_ID_HERE'
    }
};

// Export for use in survey.js
window.SURVEY_CONFIG = SURVEY_CONFIG;
