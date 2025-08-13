// Configuration File
// This file contains your actual API credentials
// DO NOT commit this file to version control

const SURVEY_CONFIG = {
    google: {
        apiKey: 'AIzaSyCH9nThfI04nI0jmDCtjkLyUyJvoqoypboE',
        clientId: '791849628610-adsrf3mca0u90fq3an19gabituelqciv.apps.googleusercontent.com', 
        discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
        scope: 'https://www.googleapis.com/auth/spreadsheets',
        spreadsheetId: '1AvF7VpnQDNlFtQ1H6mPAeN2oMAFAuaMv4vuzGpVTI-w'
    }
};

// Export for use in survey.js
window.SURVEY_CONFIG = SURVEY_CONFIG;
