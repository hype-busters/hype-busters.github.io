// Updated Google Apps Script to handle form submissions (CORS-free)
// Replace your existing doPost function with this

function doPost(e) {
  try {
    let data;
    
    // Handle both JSON and form data submissions
    if (e.postData && e.postData.contents) {
      // Direct JSON submission
      data = JSON.parse(e.postData.contents);
    } else if (e.parameter && e.parameter.data) {
      // Form submission
      data = JSON.parse(e.parameter.data);
    } else {
      throw new Error('No data received');
    }
    
    // Your spreadsheet ID (already configured)
    const spreadsheetId = '1AvF7VpnQDNlFtQ1H6mPAeN2oMAFAuaMv4vuzGpVTI-w';
    
    // Open the spreadsheet
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    
    // Get or create the survey responses sheet
    let sheet = spreadsheet.getSheetByName('Survey Responses');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Survey Responses');
      // Add headers
      sheet.appendRow(['Timestamp', 'Name', 'Age', 'Gender', 'Country', 'First Language', 'Question #', 'Meaning', 'Most Intense', 'Least Intense']);
    }
    
    // Add each survey response as a row
    if (data.responses && Array.isArray(data.responses)) {
      data.responses.forEach(response => {
        sheet.appendRow([
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
    }
    
    // Return success message
    return ContentService
      .createTextOutput(JSON.stringify({success: true, message: 'Data saved!', rowsAdded: data.responses ? data.responses.length : 0}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error for debugging
    console.error('Error in doPost:', error);
    
    // Return error message
    return ContentService
      .createTextOutput(JSON.stringify({success: false, error: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Keep your existing test functions
function testSurvey() {
  const testData = {
    timestamp: new Date().toISOString(),
    participant: { name: "Test User", age: "25", gender: "Female", country: "Canada", firstLanguage: "English" },
    responses: [{ questionNumber: 1, meaning: "test", mostIntense: "very", leastIntense: "not" }]
  };
  
  const mockEvent = { postData: { contents: JSON.stringify(testData) } };
  const result = doPost(mockEvent);
  console.log(result.getContent());
}

function testWithRealData() {
  const testData = {
    timestamp: new Date().toISOString(),
    participant: {
      name: "Test Participant",
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
        leastIntense: "mild"
      }
    ]
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
  
  // Also try opening the spreadsheet directly
  const spreadsheet = SpreadsheetApp.openById('1AvF7VpnQDNlFtQ1H6mPAeN2oMAFAuaMv4vuzGpVTI-w');
  console.log('Spreadsheet name:', spreadsheet.getName());
  console.log('Sheets:', spreadsheet.getSheets().map(s => s.getName()));
}
