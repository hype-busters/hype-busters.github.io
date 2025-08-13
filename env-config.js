// Environment-based configuration for GitHub Pages
// This approach uses URL parameters or prompts for credentials

function loadEnvironmentConfig() {
    // Try to get config from URL parameters (for testing)
    const urlParams = new URLSearchParams(window.location.search);
    
    if (urlParams.has('apikey')) {
        return {
            google: {
                apiKey: urlParams.get('apikey'),
                clientId: urlParams.get('clientid') || '',
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                spreadsheetId: urlParams.get('sheetid') || ''
            }
        };
    }
    
    // Prompt user for credentials (development mode)
    const apiKey = prompt('Enter your Google API Key:');
    const clientId = prompt('Enter your Google Client ID:');
    const spreadsheetId = prompt('Enter your Google Spreadsheet ID:');
    
    if (apiKey && clientId && spreadsheetId) {
        return {
            google: {
                apiKey: apiKey,
                clientId: clientId,
                discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
                scope: 'https://www.googleapis.com/auth/spreadsheets',
                spreadsheetId: spreadsheetId
            }
        };
    }
    
    // Return empty config if no credentials provided
    return {
        google: {
            apiKey: '',
            clientId: '',
            discoveryDocs: ['https://sheets.googleapis.com/$discovery/rest?version=v4'],
            scope: 'https://www.googleapis.com/auth/spreadsheets',
            spreadsheetId: ''
        }
    };
}

// Only set config if not already defined (avoid redeclaration)
if (typeof window.SURVEY_CONFIG === 'undefined') {
    window.SURVEY_CONFIG = loadEnvironmentConfig();
    console.log('Configuration loaded from env-config.js');
} else {
    console.log('Configuration already exists, skipping env-config.js');
}
