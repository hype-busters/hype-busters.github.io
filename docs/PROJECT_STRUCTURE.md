# Project Structure Documentation

This document explains the organized file structure of the Word Intensity Survey project.

## Overview

The project has been reorganized into logical folders to improve maintainability and scalability as the codebase grows. This structure follows modern web development best practices and separates concerns appropriately.

## Directory Structure

```
hype-busters.github.io/
├── 📁 src/                     # Source code
│   ├── 📁 js/                  # JavaScript files
│   │   └── survey.js           # Main survey logic
│   ├── 📁 data/                # Question data files
│   │   ├── questions.json      # Questions in JSON format
│   │   └── questions.csv       # Questions in CSV format
│   └── 📁 config/              # Configuration files
│       ├── config.js           # Main configuration
│       ├── config.example.js   # Configuration template
│       └── env-config.js       # Environment-specific config
├── 📁 assets/                  # Static assets
│   ├── 📁 css/                 # Stylesheets
│   │   └── style.scss          # Main stylesheet
│   └── 📁 images/              # Image files
│       ├── bojan.jpeg
│       ├── budgell.jpeg
│       ├── dipesh.png
│       ├── erica.jpeg
│       ├── neil.jpeg
│       └── ryosuke.jpg
├── 📁 docs/                    # Documentation
│   ├── APPS_SCRIPT_SETUP.md    # Google Apps Script setup guide
│   ├── QUESTIONS_MANAGEMENT.md # How to manage survey questions
│   └── PROJECT_STRUCTURE.md    # This file
├── 📁 scripts/                 # Build and deployment scripts
│   └── updated-apps-script.gs  # Google Apps Script code
├── 📁 responses/               # Survey response storage
├── 📄 *.html                   # HTML pages (kept at root for GitHub Pages)
│   ├── index.html              # Main landing page
│   ├── intensity-scaling.html  # Survey interface
│   ├── about.html              # About page
│   ├── people.html             # Team page
│   └── resources.html          # Resources page
└── 📄 README.md                # Project overview
```

## Folder Purposes

### `/src/` - Source Code
Main source code directory containing all application logic and configuration.

#### `/src/js/` - JavaScript Files
- **`survey.js`**: Core survey functionality including question loading, user interface, data validation, and Google Sheets integration
- Future JavaScript modules will be added here as the project grows

#### `/src/data/` - Question Data
- **`questions.json`**: Survey questions in JSON format (recommended for 400+ questions)
- **`questions.csv`**: Survey questions in CSV format (Excel-friendly alternative)
- Add your large question datasets here

#### `/src/config/` - Configuration
- **`config.js`**: Active configuration file (not committed to version control)
- **`config.example.js`**: Configuration template showing required settings
- **`env-config.js`**: Environment-specific configurations

### `/assets/` - Static Assets
Static files that don't change during application execution.

#### `/assets/css/` - Stylesheets
- **`style.scss`**: Main SCSS stylesheet for the website

#### `/assets/images/` - Images
- Profile photos and other image assets
- Keep images organized by type or purpose

### `/docs/` - Documentation
Project documentation and setup guides.

- **`APPS_SCRIPT_SETUP.md`**: How to set up Google Apps Script integration
- **`QUESTIONS_MANAGEMENT.md`**: Guide for managing survey questions
- **`PROJECT_STRUCTURE.md`**: This documentation file

### `/scripts/` - Build and Deployment
Scripts for building, testing, and deploying the application.

- **`updated-apps-script.gs`**: Google Apps Script code for data collection
- Future build scripts and automation tools

### `/responses/` - Data Storage
Directory for storing survey responses (if using local storage).

### Root Level - HTML Pages
HTML files are kept at the root level for GitHub Pages compatibility.

- **`index.html`**: Main landing page
- **`intensity-scaling.html`**: Survey interface
- **`about.html`**: About page
- **`people.html`**: Team page  
- **`resources.html`**: Resources page

## Benefits of This Structure

### 🎯 **Better Organization**
- Related files are grouped together
- Easy to locate specific functionality
- Clear separation of concerns

### 📈 **Scalability**
- Easy to add new JavaScript modules in `/src/js/`
- Configuration is centralized in `/src/config/`
- Data files are organized in `/src/data/`

### 🔧 **Maintainability**
- Developers can quickly understand the project layout
- Documentation is centralized in `/docs/`
- Build scripts are separated in `/scripts/`

### 👥 **Team Collaboration**
- Clear file organization reduces conflicts
- Documentation guides new contributors
- Consistent structure across the project

## Adding New Files

### JavaScript Files
Add new `.js` files to `/src/js/` and update HTML references:
```html
<script src="src/js/your-new-file.js"></script>
```

### Question Data
Add new question files to `/src/data/`:
- Use `.json` for structured data
- Use `.csv` for Excel-friendly editing

### Configuration
Add new config files to `/src/config/` and follow the naming pattern:
- `feature-config.js` for feature-specific settings
- `env-config.js` for environment variables

### Documentation
Add new documentation to `/docs/` with descriptive names:
- `FEATURE_GUIDE.md` for feature documentation
- `SETUP_GUIDE.md` for setup instructions

### Build Scripts
Add automation scripts to `/scripts/`:
- `build.js` for build processes
- `deploy.js` for deployment automation

## File Path Updates

Due to the reorganization, file references have been updated:

### HTML Files
```html
<!-- Old -->
<script src="config.js"></script>
<script src="survey.js"></script>

<!-- New -->
<script src="src/config/config.js"></script>
<script src="src/js/survey.js"></script>
```

### JavaScript Data Loading
```javascript
// Old
fetch('questions.json')
fetch('questions.csv')

// New  
fetch('src/data/questions.json')
fetch('src/data/questions.csv')
```

## Development Workflow

1. **Source Code**: Edit files in `/src/` directories
2. **Documentation**: Update guides in `/docs/` 
3. **Data**: Manage questions in `/src/data/`
4. **Assets**: Add images/styles to `/assets/`
5. **Scripts**: Add automation to `/scripts/`

## GitHub Pages Compatibility

The structure maintains GitHub Pages compatibility by keeping HTML files at the root level while organizing source code in subdirectories.

## Future Enhancements

This structure supports future additions:
- Module bundling (webpack, rollup)
- Testing framework integration
- CI/CD pipeline setup
- Multi-language support
- Component-based architecture

## Migration Notes

If you have local modifications:
1. Update any hardcoded file paths
2. Check HTML script references
3. Verify data file locations
4. Test the survey functionality

The survey will automatically load questions from the new data file locations.
