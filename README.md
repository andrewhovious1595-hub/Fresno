# City of Fresno Public Utilities — Cycle Bill Portal (UI/UX Prototype)

Static HTML/CSS/JS prototype for the City of Fresno Department of Public Utilities (Utilities Billing & Collection Division) cycle bill viewing portal.

## Repository Structure

```text
fresno-utility-portal/
├── index.html                  # Modular entry point (links css/, js/, and assets/)
├── standalone-single-file.html # Self-contained single-file build (with base64-embedded bill image)
├── css/
│   └── styles.css              # Custom print and layout styles
├── js/
│   └── app.js                  # Statement data model, tab switching, Chart.js visuals, & rate simulator
├── assets/
│   └── cycle-bill-10-03-26.jpg # Scanned Cycle Bill statement (Account #656219-226730)
└── .gitignore
```

## Quick Start & GitHub Pages Deployment

1. **Local Preview**:
   Open `index.html` (or `standalone-single-file.html`) directly in any modern browser, or serve locally:
   ```bash
   python3 -m http.server 8000
   ```
2. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Fresno Public Utilities Cycle Bill portal prototype"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<your-repo>.git
   git push -u origin main
   ```
3. **Enable GitHub Pages**:
   In your GitHub repository, navigate to **Settings → Pages**, select **Deploy from a branch**, and choose `main` (`/root`).
