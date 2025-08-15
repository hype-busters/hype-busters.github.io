#!/bin/bash

echo "Starting local development server..."
echo ""
echo "The survey will be available at: http://localhost:8000"
echo "Press Ctrl+C to stop the server"
echo ""

# Check if Python is available
if command -v python3 &> /dev/null; then
    echo "Using Python 3 HTTP server..."
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "Using Python HTTP server..."
    python -m http.server 8000
elif command -v node &> /dev/null; then
    echo "Using Node.js HTTP server..."
    npx http-server -p 8000 --cors
else
    echo ""
    echo "ERROR: Neither Python nor Node.js found!"
    echo "Please install one of the following:"
    echo "- Python: https://python.org/downloads/"
    echo "- Node.js: https://nodejs.org/"
    echo ""
    echo "Or use the embedded questions option."
fi
