# Hyplex Project Page - Setup Complete

## ✅ What's Been Created

The Hyplex project page has been successfully created at `/hyplex/` with all content from your LREC 2026 paper.

### Structure
```
hyplex/
├── index.html                 ✅ Complete with all paper details
├── README.md                  ✅ Updated with project info
└── static/
    ├── css/                   ✅ All CSS dependencies downloaded
    │   ├── bulma.min.css
    │   ├── bulma-carousel.min.css
    │   ├── bulma-slider.min.css
    │   ├── fontawesome.all.min.css
    │   └── index.css
    ├── js/                    ✅ All JavaScript dependencies downloaded
    │   ├── bulma-carousel.min.js
    │   ├── bulma-slider.min.js
    │   ├── fontawesome.all.min.js
    │   └── index.js
    ├── images/                ⚠️  Needs images (see below)
    └── videos/                N/A (not used)
```

## 📄 Page Content

### Header
- **Title**: "Best-Worst Scaling of Hype in Biomedical Research: Building an Intensity Lexicon of Promotional Adjectives"
- **Authors**: Neil Millar, Dipesh Satav, Bojan Batalo, Erica K. Shimomoto, Ryosuke L. Ohniwa
- **Affiliations**: University of Tsukuba, AIST
- **Conference**: LREC 2026

### Sections
1. **Abstract** - Full abstract from the paper
2. **Method Overview** - BWS methodology explanation
3. **Key Results** - Reliability, distributions, VAD correlations
4. **Applications** - Research use cases

### Links
- Paper PDF (placeholder - add your link)
- BWS Platform: https://www.hype-busters.com/bws/
- Lexicon Data: https://www.hype-busters.com/hyplex.html

### Citation
- BibTeX citation included and ready

## ⚠️  What You Need to Add

### Images Required
Add these images to `hyplex/static/images/`:

1. **teaser.png** - Overview of categories and examples
   - Suggestion: Use Figure 3 from paper (distribution boxplots)
   
2. **method.png** - BWS annotation process
   - Suggestion: Use Figure 2 from paper (annotation interface)
   
3. **results.png** - Key findings visualization
   - Suggestion: Use Figure 3 or Figure 4 from paper
   
4. **banner.png** (optional) - Social media preview (1200x630px)

See `hyplex/static/images/IMAGES_NEEDED.md` for detailed guidance.

## 🚀 Next Steps

1. **Add images** to `hyplex/static/images/`
   - Export figures from your paper as PNG files
   - Name them as specified above

2. **Update paper link** in index.html
   - Find the "Paper" button link (currently `#`)
   - Replace with actual PDF URL when available

3. **Test locally** (optional)
   - Open `index.html` in a browser to preview
   - Or use: `python3 -m http.server` in the hyplex directory

4. **Commit and push** to GitHub
   ```bash
   cd /Users/satav/Desktop/hype-busters.github.io
   git add hyplex/
   git commit -m "Add Hyplex project page"
   git push
   ```

5. **Verify deployment**
   - Page will be live at: https://hype-busters.github.io/hyplex/

## 📊 Content Summary

- **303 adjectives** across 8 categories
- **Split-half reliability**: r = 0.87
- **Categories**: IMPORTANCE, NOVELTY, SCALE, RIGOUR, UTILITY, QUALITIES, ATTITUDE, PROBLEM
- **Methodology**: Best-Worst Scaling with 10 annotators
- **Validation**: Comparison with NRC VAD Lexicon

---

All content is ready to deploy once you add the images!
