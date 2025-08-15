# Deployment and Local Testing Guide

This guide explains how to properly run and deploy the Word Intensity Survey to avoid file loading issues.

## 🚨 **Common Issue: "Unable to load questions from external files"**

When you open `intensity-scaling.html` directly in your browser (double-clicking the file), you'll see this error. This happens because **modern browsers block local file access** for security reasons when using the `file://` protocol.

## ✅ **Solutions**

### **Solution 1: Local Development Server (Recommended)**

The easiest way to test locally is to run a simple web server.

#### **Option A: Using the Provided Scripts**

1. **Windows**: Double-click `scripts/start-server.bat`
2. **Mac/Linux**: Run `bash scripts/start-server.sh` in terminal

The script will:
- Automatically detect if you have Python or Node.js installed
- Start a local server on port 8000
- Open your browser to `http://localhost:8000`

#### **Option B: Manual Server Setup**

**If you have Python installed:**
```bash
# Navigate to project folder
cd path/to/hype-busters.github.io

# Python 3
python -m http.server 8000

# Python 2 (older systems)
python -m SimpleHTTPServer 8000
```

**If you have Node.js installed:**
```bash
# One-time install
npm install -g http-server

# Run server
http-server -p 8000 --cors
```

**If you have PHP installed:**
```bash
php -S localhost:8000
```

Then open: `http://localhost:8000/intensity-scaling.html`

### **Solution 2: Use a Code Editor with Live Server**

Many code editors have built-in web servers:

#### **Visual Studio Code**
1. Install "Live Server" extension
2. Right-click `intensity-scaling.html`
3. Select "Open with Live Server"

#### **Other Editors**
- **Atom**: Install "atom-live-server" package
- **Sublime Text**: Install "LiveReload" package
- **WebStorm**: Built-in server (right-click → "Open in Browser")

### **Solution 3: Deploy to Web Hosting**

For production use, deploy to any web hosting service:

#### **GitHub Pages (Free)**
1. Push your code to a GitHub repository
2. Go to Settings → Pages
3. Enable GitHub Pages from main branch
4. Your survey will be at: `https://username.github.io/repository-name/intensity-scaling.html`

#### **Other Free Options**
- **Netlify**: Drag and drop your project folder
- **Vercel**: Connect your GitHub repository
- **Firebase Hosting**: `firebase deploy`

### **Solution 4: Embedded Questions (Fallback)**

The survey now includes embedded fallback questions, so it will work even without external files, showing 10 sample questions for testing.

## 🔧 **How to Test Your Setup**

1. **Start your server** using any method above
2. **Open the survey** in your browser
3. **Check the browser console** (F12 → Console tab)
4. **Look for these messages:**
   - ✅ `Successfully loaded X questions from JSON file` (Success!)
   - ❌ `Unable to load questions from external files` (Need to use server)

## 📁 **File Structure for Deployment**

When deploying, ensure this structure is maintained:

```
your-website/
├── intensity-scaling.html
├── src/
│   ├── js/survey.js
│   ├── config/config.js
│   └── data/
│       ├── questions.json
│       └── questions.csv
└── assets/
    └── (other files)
```

## 🛠️ **For Development**

### **Adding Your 400 Questions**

1. **Use the local server** (any solution above)
2. **Edit questions** in `src/data/questions.json` or `src/data/questions.csv`
3. **Refresh** the browser to see changes
4. **Check console** for any validation errors

### **Testing Large Datasets**

- Start with a small subset (10-20 questions) to test
- Gradually increase to full dataset
- Monitor browser performance with 400+ questions
- Use browser dev tools to check loading times

## 🌐 **CORS (Cross-Origin) Issues**

If you still see loading issues even with a server:

1. **Ensure server supports CORS** (the provided scripts include this)
2. **Check browser console** for CORS errors
3. **Try a different browser** (Chrome, Firefox, Safari)
4. **Disable browser security** temporarily (not recommended for production):
   ```bash
   # Chrome with disabled security (Windows)
   chrome.exe --user-data-dir=/tmp/chrome_dev_test --disable-web-security
   ```

## 📝 **Quick Start Checklist**

1. ✅ Download/clone the project
2. ✅ Ensure `src/data/questions.json` exists
3. ✅ Run `scripts/start-server.bat` (Windows) or `scripts/start-server.sh` (Mac/Linux)
4. ✅ Open `http://localhost:8000/intensity-scaling.html`
5. ✅ Verify questions load in browser console
6. ✅ Test the survey functionality

## 🚨 **Troubleshooting**

### **"Server script doesn't work"**
- Install Python: https://python.org/downloads/
- Or install Node.js: https://nodejs.org/
- Or use a code editor with live server

### **"Questions still don't load"**
- Check file paths in browser console
- Verify `src/data/questions.json` exists
- Try clearing browser cache (Ctrl+F5)

### **"Survey is slow with 400 questions"**
- Consider breaking into multiple survey sessions
- Use pagination or question sets
- Test performance in different browsers

## 🎯 **Production Deployment**

For your final survey with 400 questions:

1. **Test thoroughly** with local server
2. **Deploy to GitHub Pages** or hosting service
3. **Share the web URL** (not file paths)
4. **Monitor responses** via Google Sheets integration

The organized file structure makes deployment straightforward and ensures your 400 questions load properly!
