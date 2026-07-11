# Personal Shield Premium Calculator

A production-quality, mobile-first Progressive Web App (PWA) for calculating
insurance premiums based on Date of Birth and Treatment Limit, built with a
Flask + vanilla JS stack (no frontend frameworks).

## Tech Stack
- **Backend:** Python 3.14.6, Flask, openpyxl, reportlab
- **Frontend:** HTML5, CSS3, Vanilla JavaScript (ES6)
- **Data:** JSON rate card (`ratecard.json`)

## Folder Structure
```
PersonalShieldPremiumCalculator/
├── app.py                  # Flask backend entry point
├── requirements.txt        # Python dependencies
├── ratecard.json            # Age/Treatment Limit -> Premium lookup table
├── templates/
│   └── index.html           # Main application page
├── static/
│   ├── css/
│   │   └── style.css        # Professional, mobile-first styling
│   ├── js/
│   │   └── script.js        # Age calculation, premium lookup, exports, PWA
│   ├── images/               # Logos / illustrations
│   └── icons/                 # PWA icons (various sizes)
├── manifest.json            # PWA manifest
├── service-worker.js        # Offline caching / service worker
└── README.md
```

## Build Status — All Steps Complete ✅
1. ✅ Project structure
2. ✅ HTML (index.html) — navbar, hero, calculator card, result card, how-it-works, plans, footer
3. ✅ Professional CSS — mobile-first, glassmorphism, muted rose / slate gray / white / light green palette, dark mode, animations, print styles
4. ✅ Age calculation logic (client-side instant feedback in JS)
5. ✅ JSON rate card — full 9-age-band × 5-tier table, exactly as specified
6. ✅ Flask backend — page routes, static/manifest/service-worker serving
7. ✅ Premium lookup — server-side lookup from `ratecard.json` (never hardcoded in JS), driven by **Age Next Birthday + Treatment Limit**
8. ✅ PDF export — branded quotation PDF via `reportlab`
9. ✅ Excel export — styled `.xlsx` quotation via `openpyxl`
10. ✅ PWA — manifest, service worker (offline cache-first for assets, network-first for API), installable, icons for all required sizes + maskable icon

## Features
- Modern date picker (`YYYY-MM-DD`) with automatic Current Age / Age Next Birthday calculation
- Treatment Limit dropdown (Bronze/Silver/Gold/Platinum/Titanium) with annual limits shown
- Automatic premium lookup — single source of truth is `ratecard.json`, read only on the backend
- Reset button, Print quotation, Export to PDF, Export to Excel, Copy quotation to clipboard
- Toast notifications, form validation, loading animation
- Dark mode with system-preference detection + persisted choice
- Installable PWA with offline support (service worker + manifest)
- Fully responsive: mobile phones, tablets, laptops, desktops

## Running the app
```bash
cd PersonalShieldPremiumCalculator
pip install -r requirements.txt
python app.py
```
Then open **http://127.0.0.1:5000** in your browser.

### Testing PWA install / offline support
Browsers only enable full PWA install prompts and service worker registration
on **localhost** or over **HTTPS**. Running via `python app.py` on
`127.0.0.1` satisfies this for local testing. For a real deployment, serve
the app behind HTTPS (e.g. via a reverse proxy or a platform like Render/
Railway/PythonAnywhere) so `service-worker.js` can register in production.

## API Endpoints
| Method | Path                | Purpose                                    |
|--------|---------------------|---------------------------------------------|
| GET    | `/`                  | Renders the main application page          |
| GET    | `/api/ratecard`      | Returns treatment limit names + annual limits (for the dropdown) |
| POST   | `/api/calculate`     | Body: `{dob, treatment_limit}` → returns full quote JSON |
| POST   | `/api/export/pdf`    | Body: `{dob, treatment_limit}` → returns a downloadable PDF |
| POST   | `/api/export/excel`  | Body: `{dob, treatment_limit}` → returns a downloadable `.xlsx` |

## Notes on the "Age Next Birthday" convention
Age Next Birthday = Current Age + 1 (the age the applicant will turn on
their very next birthday). This is the standard actuarial convention and
is what drives the premium lookup against the age bands in `ratecard.json`.
