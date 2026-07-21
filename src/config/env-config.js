// Environment-based configuration for deployed environments
// This provides configuration when config.js is not available (e.g., on GitHub Pages)

function loadEnvironmentConfig() {
    // Configuration for deployed environment (using Google Apps Script)
    return {
        googleAppsScript: {
            url: 'https://script.google.com/macros/s/AKfycbxFG53hdkB0s4FkVM0gAe9N6cST04KPDfG8kQbzSAxVzhTZ1zQDNQt4cQsw8sIip07p7g/exec'
        },
        epistemicStance: {
            // Set this to the dedicated Apps Script endpoint for /epistemic-stance.
            googleAppsScript: {
                url: 'https://script.google.com/macros/s/AKfycbybmVtZVAq31qZ4VXiy9Jjyiwm2_WBmmTOZl4DPEsSv3vzY-8JpwoU8K7tp7Rh9zQGa/exec'
            }
        },
        // Note: When using Google Apps Script, we don't need Google Sheets API credentials
        // The Apps Script handles the authentication server-side
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
