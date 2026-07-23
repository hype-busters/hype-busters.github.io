function doPost(e) {
  try {
    let data;

    if (e.parameter && e.parameter.data) {
      data = JSON.parse(e.parameter.data);
    } else if (e.postData && e.postData.contents) {
      let contents = e.postData.contents;
      if (contents.indexOf('data=') === 0) {
        contents = decodeURIComponent(contents.substring(5));
      }
      data = JSON.parse(contents);
    } else {
      throw new Error('No data found in request');
    }

    // Spreadsheet ID for epistemic-stance responses.
    const spreadsheetId = '1NFtTKVG53mdqAwIf8-lmEewRwQ52C8yCwtI8hLryMb0';
    const spreadsheet = SpreadsheetApp.openById(spreadsheetId);

    const expectedHeaders = [
      'Timestamp',
      'Study',
      'Method',
      'Response Format Version',
      'Survey Number',
      'Form ID',
      'Block ID',
      'Name',
      'Age',
      'Gender',
      'Highest Education',
      'Country',
      'First Language',
      'Question #',
      'Meaning',
      'Most Intense',
      'Least Intense',
      'Is Attention Check',
      'Chunk Number',
      'Total Chunks'
    ];

    let sheet = spreadsheet.getSheetByName('Epistemic Stance Responses');
    if (!sheet) {
      sheet = spreadsheet.insertSheet('Epistemic Stance Responses');
    }

    // Keep headers synchronized even if the sheet existed with an older schema.
    const headerRange = sheet.getRange(1, 1, 1, expectedHeaders.length);
    const currentHeaders = headerRange.getValues()[0];
    const needsHeaderUpdate = expectedHeaders.some(function (h, i) {
      return currentHeaders[i] !== h;
    });
    if (needsHeaderUpdate) {
      headerRange.setValues([expectedHeaders]);
    }

    const surveyNumber = data.selectedSurvey || '';
    const study = data.study || 'epistemic-stance';
    const method = data.method || 'bws_maxdiff';
    const responseFormatVersion = data.responseFormatVersion || '1.0';
    const formId = data.formId || '';
    const chunkNumber = data.chunkInfo && data.chunkInfo.chunkNumber ? data.chunkInfo.chunkNumber : '';
    const totalChunks = data.chunkInfo && data.chunkInfo.totalChunks ? data.chunkInfo.totalChunks : '';

    let rowsAdded = 0;
    if (data.responses && Array.isArray(data.responses)) {
      data.responses.forEach((response) => {
        sheet.appendRow([
          data.timestamp || new Date().toISOString(),
          study,
          method,
          responseFormatVersion,
          surveyNumber,
          response.formId || formId,
          response.blockId || '',
          data.participant ? data.participant.name : '',
          data.participant ? data.participant.age : '',
          data.participant ? data.participant.gender : '',
          data.participant ? data.participant.highestEducation : '',
          data.participant ? data.participant.country : '',
          data.participant ? data.participant.firstLanguage : '',
          response.questionNumber || '',
          response.meaning || '',
          response.mostIntense || '',
          response.leastIntense || '',
          response.isExample ? 'Yes' : 'No',
          chunkNumber,
          totalChunks
        ]);
        rowsAdded++;
      });
    }

    return ContentService
      .createTextOutput(JSON.stringify({
        success: true,
        rowsAdded: rowsAdded,
        surveyNumber: surveyNumber,
        study: study,
        method: method,
        timestamp: new Date().toISOString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
