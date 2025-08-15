# Hype Busters: Unveiling "Hype" in Biomedical Research

This project analyzes "hype" in biomedical research using a combination of linguistics and artificial intelligence. We aim to identify promotional language in scientific texts, understand its origins, and develop tools to detect it automatically. Our goal is to promote greater transparency and objectivity in scientific communication.

## Project Goals

*   **Identify Hype Trends**: Track the rise of promotional language in research abstracts and grant applications.
*   **Analyze Influences**: Investigate how funding announcements and institutional guidelines contribute to hype.
*   **Develop Detection Tools**: Create machine learning models to automatically identify hype in scientific writing.

## Pages

- **Home**: Project overview and key findings.
- **About**: Detailed project description and goals.
- **Previous Works**: A curated list of our publications and related research.
- **People**: Information about our team members.
- **Word Intensity Survey**: Interactive survey for collecting word intensity judgments.

## Project Structure

The project is organized into logical folders for better maintainability:

```
├── src/                    # Source code
│   ├── js/                 # JavaScript files
│   ├── data/               # Question data files  
│   └── config/             # Configuration files
├── assets/                 # Static assets (CSS, images)
├── docs/                   # Documentation
├── scripts/                # Build/deployment scripts
└── *.html                  # HTML pages (root level for GitHub Pages)
```

For detailed information about the project structure, see [docs/PROJECT_STRUCTURE.md](docs/PROJECT_STRUCTURE.md).

## Survey Management

The Word Intensity Survey supports loading questions from external files to easily manage large datasets (400+ questions). See [docs/QUESTIONS_MANAGEMENT.md](docs/QUESTIONS_MANAGEMENT.md) for detailed instructions on:

- Adding questions via JSON or CSV files
- Managing large question datasets
- Data validation and error handling

## Quick Start

To run the survey locally and load external question files:

1. **Windows**: Double-click `scripts/start-server.bat`
2. **Mac/Linux**: Run `bash scripts/start-server.sh`
3. Open `http://localhost:8000/intensity-scaling.html`

For detailed setup instructions, see [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md).

## Documentation

- [Deployment Guide](docs/DEPLOYMENT_GUIDE.md) - How to run locally and deploy the survey
- [Project Structure](docs/PROJECT_STRUCTURE.md) - Detailed explanation of the organized file structure
- [Questions Management](docs/QUESTIONS_MANAGEMENT.md) - How to manage survey questions
- [Apps Script Setup](docs/APPS_SCRIPT_SETUP.md) - Google Apps Script integration guide
