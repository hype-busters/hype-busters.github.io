// Google Apps Script code with CORS support for local testing
// Deploy this as a Web App in Google Apps Script

function doPost(e) {
  try {
    // Parse the incoming JSON data
    const data = JSON.parse(e.postData.contents);
    
    // Get or create the spreadsheet
    const spreadsheetId = '1AvF7VpnQDNlFtQ1H6mPAeN2oMAFAuaMv4vuzGpVTI-w';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Get the sheet (create if doesn't exist)
    let sheet = spreadsheet.getSheetByName('Survey Responses');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Survey Responses');
      
      // Add headers
      sheet.getRange(1, 1, 1, 10).setValues([[
        'Timestamp', 'Name', 'Age', 'Gender', 'Country', 'First Language',
        'Question #', 'Meaning', 'Most Intense', 'Least Intense'
      ]]);
      
      // Format headers
      sheet.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#e6e6e6');
    }
    
    // Prepare rows to add
    const rows = [];
    
    data.responses.forEach(response => {
      rows.push([
        data.timestamp,
        data.participant.name,
        data.participant.age,
        data.participant.gender,
        data.participant.country,
        data.participant.firstLanguage,
        response.questionNumber,
        response.meaning,
        response.mostIntense,
        response.leastIntense
      ]);
    });
    
    // Add the data to the sheet
    if (rows.length > 0) {
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow + 1, 1, rows.length, 10).setValues(rows);
    }
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        message: 'Data saved successfully',
        rowsAdded: rows.length,
        participantName: data.participant.name
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response
    Logger.log('Error: ' + error.toString());
    
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle OPTIONS requests for CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput()
    .setMimeType(ContentService.MimeType.TEXT);
}

// Alternative: Handle GET requests too
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({
      message: "Survey data collection endpoint is working",
      timestamp: new Date().toISOString()
    }))
    .setMimeType(ContentService.MimeType.JSON);
}
