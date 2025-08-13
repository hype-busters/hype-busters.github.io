// Google Apps Script code for receiving survey data
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
    
    // Return success response
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

// Test function to verify the script works
function testScript() {
  const testData = {
    timestamp: new Date().toISOString(),
    participant: {
      name: "Test User",
      age: "25",
      gender: "Female",
      country: "Canada",
      firstLanguage: "English"
    },
    responses: [
      {
        questionNumber: 1,
        meaning: "level of spiciness in food",
        mostIntense: "hot",
        leastIntense: "mild",
        words: ["mild", "medium", "hot", "spicy"]
      }
    ]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  Logger.log(result.getContent());
}
