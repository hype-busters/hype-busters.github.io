# Questions Management Guide

This guide explains how to manage large numbers of questions (up to 400+) for the Word Intensity Survey instead of hardcoding them in JavaScript.

## Overview

The survey now supports loading questions from external files instead of hardcoding them in `survey.js`. This makes it much easier to manage large datasets and allows non-programmers to edit questions.

## Supported Formats

### 1. JSON Format (Recommended)

**File**: `questions.json`

**Advantages**: 
- Structured data format
- Easy to validate
- Supports complex data structures
- Can be generated from spreadsheets

**Example**:
```json
[
    {
        "meaning": "degree of brightness",
        "words": ["dim", "bright", "brilliant", "radiant"]
    },
    {
        "meaning": "speed of movement",
        "words": ["slow", "moderate", "fast", "rapid"]
    }
]
```

### 2. CSV Format (Excel-Friendly)

**File**: `questions.csv`

**Advantages**:
- Easy to edit in Excel or Google Sheets
- Familiar format for researchers
- Can be exported directly from spreadsheet software

**Example**:
```csv
meaning,word1,word2,word3,word4
degree of brightness,dim,bright,brilliant,radiant
speed of movement,slow,moderate,fast,rapid
```

## How to Add Your 400 Questions

### Method 1: Using JSON (Best for Programmers)

1. Create/edit `src/data/questions.json`
2. Follow this exact format:
```json
[
    {
        "meaning": "your meaning here",
        "words": ["word1", "word2", "word3", "word4"]
    },
    {
        "meaning": "another meaning",
        "words": ["wordA", "wordB", "wordC", "wordD"]
    }
]
```
3. Each question must have exactly 4 words
4. Save the file and reload the survey

### Method 2: Using CSV (Best for Non-Programmers)

1. Open Excel or Google Sheets
2. Create columns: `meaning`, `word1`, `word2`, `word3`, `word4`
3. Add your questions row by row:
   ```
   meaning              | word1 | word2    | word3        | word4
   degree of brightness | dim   | bright   | brilliant    | radiant
   speed of movement    | slow  | moderate | fast         | rapid
   ```
4. Export/Save as CSV file named `questions.csv`
5. Place the file in the `src/data/` folder

### Method 3: Converting from Existing Data

If you have questions in another format:

**From Excel/Google Sheets**:
1. Organize data with columns: meaning, word1, word2, word3, word4
2. Export as CSV
3. Name the file `questions.csv` and place it in `src/data/`

**From JSON generator** (if you have programming help):
```javascript
// Example script to convert array of objects
const questions = [
    // your existing question data
];

const jsonString = JSON.stringify(questions, null, 2);
// Save this to questions.json
```

## File Loading Priority

The survey tries to load questions in this order:
1. `src/data/questions.json` (first priority)
2. `src/data/questions.csv` (fallback)
3. Hardcoded questions (last resort)

## Validation Rules

Every question must:
- Have a `meaning` field (string)
- Have exactly 4 words in the `words` array
- All fields must be non-empty

Invalid questions will cause an error and fallback to sample data.

## Large Dataset Tips

For 400+ questions:

### Performance
- JSON is faster to parse than CSV
- Use cache-busting (already implemented)
- Consider breaking into multiple files if needed

### Organization
```json
[
    {"meaning": "brightness_1", "words": ["dim", "bright", "brilliant", "radiant"]},
    {"meaning": "brightness_2", "words": ["dark", "light", "shining", "blazing"]},
    {"meaning": "speed_1", "words": ["slow", "moderate", "fast", "rapid"]},
    {"meaning": "speed_2", "words": ["crawling", "walking", "running", "sprinting"]}
]
```

### Quality Control
- Use consistent naming conventions
- Check for duplicates
- Validate word spellings
- Test with a small subset first

## Troubleshooting

### Common Issues

1. **"Unable to load questions" error**
   - Check file exists in correct location
   - Verify file format (JSON/CSV syntax)
   - Check browser console for specific errors

2. **Questions not updating**
   - Clear browser cache
   - Hard refresh (Ctrl+F5)
   - Check file was saved properly

3. **Some questions missing**
   - Verify all questions have exactly 4 words
   - Check for empty rows in CSV
   - Validate JSON syntax

### Debugging

Open browser Developer Tools (F12) and check the Console for:
- `✅ Successfully loaded X questions from JSON/CSV file`
- Any error messages about loading or parsing

## Example Files

The repository includes:
- `src/data/questions.json` - Example with 10 questions
- `src/data/questions.csv` - Same 10 questions in CSV format

You can use these as templates for your 400 questions.

## Technical Implementation

The survey automatically:
- Tries to load questions on page load
- Validates question format
- Falls back gracefully if files are missing
- Provides detailed console logging for debugging

No changes needed to HTML or other files - just add your question file and it will work automatically.
