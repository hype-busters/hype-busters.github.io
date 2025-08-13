# Google Apps Script Setup Guide

## Overview
This guide explains how to set up the Google Apps Script to handle survey data submissions from your Word Intensity Survey web application.

## Prerequisites
- Google account
- Access to Google Apps Script (script.google.com)
- Google Sheets where you want to store the survey data

## Step-by-Step Setup

### 1. Create a Google Spreadsheet
1. Go to Google Sheets (sheets.google.com)
2. Create a new spreadsheet
3. Name it "Word Intensity Survey Data" (or any name you prefer)
4. Copy the spreadsheet ID from the URL (the long string between `/d/` and `/edit`)
   - Example: `https://docs.google.com/spreadsheets/d/1ABC123xyz456.../edit`
   - The ID is: `1ABC123xyz456...`

### 2. Create the Apps Script Project
1. Go to Google Apps Script (script.google.com)
2. Click "New Project"
3. Delete the default `myFunction()` code
4. Copy and paste the entire contents of `apps-script-code.gs` into the editor
5. Replace `YOUR_SPREADSHEET_ID_HERE` with your actual spreadsheet ID from step 1

### 3. Configure the Script
1. In the Apps Script editor, update the configuration at the top:
   ```javascript
   const SPREADSHEET_ID = 'your-actual-spreadsheet-id-here';
   const SHEET_NAME = 'Survey Responses'; // You can change this name if desired
   ```

### 4. Test the Setup
1. In the Apps Script editor, select the `testSetup` function from the dropdown
2. Click the "Run" button (▶️)
3. Grant necessary permissions when prompted
4. Check the execution log - you should see "Setup test completed successfully!"
5. Check your Google Sheet - it should now have headers and one test row

### 5. Deploy as Web App
1. Click "Deploy" → "New deployment"
2. Click the gear icon next to "Type" and select "Web app"
3. Set the following:
   - **Description**: "Word Intensity Survey Data Handler"
   - **Execute as**: "Me"
   - **Who has access**: "Anyone" (this allows your survey to submit data)
4. Click "Deploy"
5. Copy the Web App URL (it will look like: `https://script.google.com/macros/s/ABC123.../exec`)

### 6. Update Your Survey Code
1. Open `survey.js` in your project
2. Find line 338 where `GOOGLE_APPS_SCRIPT_URL` is defined
3. Replace the existing URL with your new Web App URL from step 5

### 7. Test the Complete Flow
1. Open your survey web application
2. Complete a test survey submission
3. Check your Google Sheet - the data should appear automatically
4. Check the Apps Script execution log for any errors

## Troubleshooting

### Common Issues

**Error: "Cannot read properties of undefined (reading 'parameter')"**
- This means the Apps Script isn't receiving data properly
- Check that the Web App URL is correct in `survey.js`
- Ensure the deployment has "Anyone" access

**Error: "Exception: Requested entity was not found"**
- The spreadsheet ID is incorrect or the sheet doesn't exist
- Double-check the spreadsheet ID in the Apps Script configuration

**Error: "Script function not found: doPost"**
- Make sure you copied the entire Apps Script code
- Ensure the function is named exactly `doPost`

**Data not appearing in sheet**
- Check the Apps Script execution log for errors
- Verify the sheet name matches the `SHEET_NAME` constant
- Try running the `testSetup` function manually

### Viewing Execution Logs
1. In Apps Script editor, click "Executions" in the left sidebar
2. Click on any execution to see detailed logs
3. Look for error messages or success confirmations

### Testing Individual Functions
- Run `testSetup()` to verify basic functionality
- Run `clearSheetData()` to remove test data (keeps headers)

## Security Notes
- The Web App is set to "Anyone" access to allow anonymous survey submissions
- Data is stored in your personal Google Sheet
- No authentication is required for survey submissions
- Consider the privacy implications for your specific use case

## Data Format
The script creates a Google Sheet with the following columns:
- Timestamp
- Participant Name
- Age
- Gender
- Country
- First Language
- Question Number
- Meaning
- Most Intense Word
- Least Intense Word
- All Words

Each survey response creates multiple rows (one per question).

## Updating the Script
If you need to modify the script later:
1. Make changes in the Apps Script editor
2. Save the project (Ctrl+S)
3. Create a new deployment if you changed the core functionality
4. Update the URL in `survey.js` if you created a new deployment
