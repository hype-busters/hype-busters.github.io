function doPost(e) {
  try {
    // Detailed logging
    console.log('=== NEW REQUEST ===');
    console.log('e.parameter:', JSON.stringify(e.parameter));
    console.log('e.postData:', JSON.stringify(e.postData));
    
    let data;
    
    // Try to get data from parameters first
    if (e.parameter && e.parameter.data) {
      console.log('Found data in e.parameter.data');
      console.log('Raw parameter data:', e.parameter.data);
      data = JSON.parse(e.parameter.data);
      console.log('Parsed data:', JSON.stringify(data));
    } 
    // If that doesn't work, try manual parsing
    else if (e.postData && e.postData.contents) {
      console.log('Trying to parse postData contents');
      let contents = e.postData.contents;
      console.log('Raw contents:', contents);
      
      // If it starts with 'data=', extract the JSON part
      if (contents.indexOf('data=') === 0) {
        contents = contents.substring(5); // Remove 'data='
        console.log('After removing data=:', contents);
        contents = decodeURIComponent(contents); // Decode URL encoding
        console.log('After decoding:', contents);
      }
      
      data = JSON.parse(contents);
      console.log('Final parsed data:', JSON.stringify(data));
    }
    else {
      throw new Error('No data found in request');
    }
    
    // Your spreadsheet ID
    const spreadsheetId = '1AvF7VpnQDNlFtQ1H6mPAeN2oMAFAuaMv4vuzGpVTI-w';
    console.log('Opening spreadsheet:', spreadsheetId);
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
    console.log('Spreadsheet opened successfully');
    
    // Get or create the survey responses sheet
    let sheet = spreadsheet.getSheetByName('Survey Responses');
    if (!sheet) {
      console.log('Creating new Survey Responses sheet');
      sheet = spreadsheet.insertSheet('Survey Responses');
      // Updated headers to include Survey Number column
      sheet.appendRow([
        'Timestamp', 
        'Survey Number',  // NEW COLUMN for survey selection
        'Name', 
        'Age', 
        'Gender', 
        'Country', 
        'First Language', 
        'Question #', 
        'Meaning', 
        'Most Intense', 
        'Least Intense',
        'Is Example'
      ]);
      console.log('Headers added to new sheet');
    } else {
      console.log('Found existing Survey Responses sheet');
    }
    
    // Extract survey number from data (with fallback to 1 if not provided)
    const surveyNumber = data.selectedSurvey || '1';
    console.log('🔍 SURVEY NUMBER DEBUG:');
    console.log('data.selectedSurvey:', data.selectedSurvey);
    console.log('surveyNumber (with fallback):', surveyNumber);
    console.log('Type of selectedSurvey:', typeof data.selectedSurvey);
    
    // Add each survey response as a row
    let rowsAdded = 0;
    if (data.responses && Array.isArray(data.responses)) {
      console.log('Processing', data.responses.length, 'responses');
      data.responses.forEach((response, index) => {
        console.log('Adding response', index + 1, ':', JSON.stringify(response));
        sheet.appendRow([
          data.timestamp,
          surveyNumber,  // NEW: Include the selected survey number
          data.participant.name,
          data.participant.age,
          data.participant.gender,
          data.participant.country,
          data.participant.firstLanguage,
          response.questionNumber, // Now correctly shows 0 for example, 1+ for actual questions
          response.meaning,
          response.mostIntense,
          response.leastIntense,
          response.isExample ? 'Yes' : 'No' // New column to clearly identify example vs real questions
        ]);
        rowsAdded++;
      });
    } else {
      console.log('No responses array found in data');
    }
    
    console.log('Successfully added', rowsAdded, 'rows');
    console.log('=== REQUEST COMPLETE ===');
    
    // Return success message
    return ContentService
      .createTextOutput(JSON.stringify({
        success: true, 
        message: 'Data saved successfully!',
        rowsAdded: rowsAdded,
        surveyNumber: surveyNumber,  // Include survey number in response
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('=== ERROR ===');
    console.error('Error details:', error.toString());
    console.error('Stack trace:', error.stack);
    
    // Return detailed error for debugging
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false, 
        error: error.toString(),
        receivedData: e.postData ? e.postData.contents : 'No postData',
        parameters: e.parameter || 'No parameters'
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  try {
    console.log('=== doGet called ===');
    console.log('GET parameters:', e.parameter);
    
    const response = {
      status: 'ready',
      message: 'Survey Data Collection API is running',
      timestamp: new Date().toISOString(),
      spreadsheetId: '1AvF7VpnQDNlFtQ1H6mPAeN2oMAFAuaMv4vuzGpVTI-w',
      version: '2.1'
    };
    
    return ContentService
      .createTextOutput(JSON.stringify(response, null, 2))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    console.error('Error in doGet:', error);
    
    return ContentService
      .createTextOutput(JSON.stringify({
        status: 'error',
        message: error.toString(),
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function testDirectly() {
  console.log('Starting direct test...');
  
  const testData = {
    timestamp: new Date().toISOString(),
    selectedSurvey: "3",  // NEW: Test with survey number 3
    participant: {
      name: "Manual Test",
      age: "30", 
      gender: "Other",
      country: "Test Country",
      firstLanguage: "Test Language"
    },
    responses: [
      {
        questionNumber: 0, // Example question
        meaning: "level of spiciness in food",
        mostIntense: "hot",
        leastIntense: "mild",
        isExample: true
      },
      {
        questionNumber: 1, // First real question
        meaning: "degree of wetness",  // From survey 3
        mostIntense: "soaked",
        leastIntense: "dry",
        isExample: false
      }
    ]
  };
  
  console.log('Test data prepared:', JSON.stringify(testData));
  
  // Create a proper mock event object
  const mockEvent = {
    parameter: {
      data: JSON.stringify(testData)
    },
    postData: {
      contents: 'data=' + encodeURIComponent(JSON.stringify(testData)),
      type: 'application/x-www-form-urlencoded'
    }
  };
  
  console.log('Calling doPost with mock event...');
  const result = doPost(mockEvent);
  console.log('Test result:', result.getContent());
  
  // Check spreadsheet
  console.log('Checking spreadsheet...');
  const spreadsheet = SpreadsheetApp.openById('1AvF7VpnQDNlFtQ1H6mPAeN2oMAFAuaMv4vuzGpVTI-w');
  console.log('Spreadsheet name:', spreadsheet.getName());
  
  const sheets = spreadsheet.getSheets();
  console.log('Available sheets:', sheets.map(s => s.getName()));
  
  // Check Survey Responses sheet
  const surveySheet = spreadsheet.getSheetByName('Survey Responses');
  if (surveySheet) {
    const lastRow = surveySheet.getLastRow();
    console.log('Survey sheet has', lastRow, 'rows');
    if (lastRow > 0) {
      const data = surveySheet.getDataRange().getValues();
      console.log('Latest data:', data[data.length - 1]);
    }
  } else {
    console.log('Survey Responses sheet not found');
  }
  
  console.log('Test completed!');
}
