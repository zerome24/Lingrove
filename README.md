# LINGROVE — Lingala Bamboo Products at CMRTC
> **Official Tagline:** Learn. Create. Sell. Grow Together.  
> **Official Subtitle:** Lingala Bamboo Products at CMRTC  
> **Mission:** Multilingual Bamboo Craftsmanship Learning and Sustainable E-Commerce Platform empowering rural artisans.

---

## 1. Project Overview

**LINGROVE** is an initiative connecting the rural bamboo heritage of **Lingala Village** with modern digital commerce, incubated in collaboration with **CMRTC (CMR Technical Campus)**. The application serves two core purposes:

1. **LEARN BAMBOO CRAFTSMANSHIP**: A complete learning portal providing structured tutorials on bamboo cutting, slicing, splitting, weaving, furniture manufacturing, finishing, and machine operation awareness with industrial safety protocols.
2. **SELL BAMBOO PRODUCTS**: An artisan e-commerce marketplace empowering rural craftspeople to register, list handmade bamboo creations, track incoming orders, receive recorded earnings, and trade sustainably with consumers nationwide.

---

## 2. Recent Major Upgrades & Bug Fixes

### 1. Learning Center & YouTube Video System Fixed
- **Root Cause of Previous Bug:** The initial database seeder (`seed.py`) had a hardcoded placeholder pointing to Rick Astley's music video (`dQw4w9WgXcQ`), and other modules had empty string URLs. In addition, the video player iframe parser used a naive string split that failed on short YouTube URLs and had no external fallback.
- **Fix Implemented:** 
  - Integrated **YouTube Data API v3** in `backend/app/routers/learning.py` at `/api/learning/videos` to dynamically search educational bamboo processing and craftsmanship videos with local caching (12-hour TTL).
  - Seeded verified educational YouTube demonstrations across cutting, splitting, slicing, basket weaving, joinery, and boron finishing.
  - Added multi-video module switcher in `Learn.tsx` with external "Open on YouTube" buttons and fallback when embedding is restricted.

### 2. Whole-Website Multilingual Support (English, Telugu, Hindi)
- Upgraded `frontend/src/i18n/locales/en.json`, `te.json`, and `hi.json` with comprehensive translation coverage.
- Translated navbar, footer, categories, learning modules, machine directory, marketplace filters, real photo gallery, modals, cart, checkout, and assistant controls.
- Automatic language persistence in browser `localStorage`.
- Proper Telugu Unicode rendering with responsive typography.

### 3. Google Gemini AI & Multilingual Voice Assistant
- Integrated Google Gemini AI (`gemini-1.5-flash`) in `backend/app/routers/assistant.py` with structured system instructions and village-friendly conversational tone.
- Automatic script detection for **Telugu** (`\u0C00-\u0C7F`) and **Devanagari/Hindi** (`\u0900-\u097F`).
- Interactive navigational actions (e.g. `/learn`, `/products`, `/gallery`, `/cart`, `/orders`, `/register?role=artisan`, `OPEN_CALCULATOR`, `OPEN_BULK`).
- Browser speech recognition with dynamic language code (`te-IN`, `hi-IN`, `en-IN`).
- Browser speech synthesis with voice-selection matcher and graceful fallback.

### 4. Real Photographs Activities Gallery (`/gallery`)
- Dedicated `/gallery` page showcasing 5 original photographs taken in Lingala village and CMRTC workshops:
  - `bamboo-machine-demonstration.jpg`: Workshop machinery cross-cutting & splitting demonstration.
  - `village-outreach-meeting.jpg`: Village hall community awareness session with villagers.
  - `community-awareness-session.jpg`: Mandal Parishad leadership coordination meeting.
  - `hands-on-training-01.jpg`: Practical machinery training around bamboo processing equipment.
  - `bamboo-processing-workshop.jpg`: Villagers actively participating in craftsmanship seminar.
- Filterable by Category (Machinery, Training, Community).
- Interactive Lightbox with keyboard navigation (Escape, Left, Right arrows) and multilingual captions.
- Homepage preview section linking directly to the full gallery.

### 5. Expanded Bamboo Marketplace (Categories A through F)
- Structured catalogue across 6 categories with 22+ realistic demonstration products:
  - **Category A:** Interior Design & Home Décor (pendant lamps, floor lamps, wall art panels, planters, mirror frames).
  - **Category B:** Traditional Village-Made Products (harvest baskets, winnowing trays/cheta, hand fans/visanakarra, floor mats).
  - **Category C:** Bamboo Furniture (lounge stools, coffee tables, 4-tier storage shelves).
  - **Category D:** Kitchen & Household (cutlery organizers, serving trays, coasters).
  - **Category E:** Raw Bamboo & Structural Materials (pandiri ceremonial canopy poles, raw Dendrocalamus culms, weaving strips, flat laths).
  - **Category F:** Thin Bamboo Sticks & Craft Material (precision thin craft sticks, raw incense sticks, festival decoration craft bundles).
- Search, price range slider, category pills, and sorting.

### 6. Redesigned Lingrove Brand Logo
- Brand Colors: Forest Green (`#24452D`), Leaf Green (`#65834C`), Bamboo Beige (`#F3E9D5`), Warm Cream (`#FAF8F1`), Harvest Amber (`#E8A64A`).
- Emblem: Modern stylized L-shaped bamboo culm with golden nodes and balanced sprouting leaves.
- Reusable SVG logo component in `LingroveLogo.tsx` with horizontal, icon-only, and light/dark modes.
- Updated browser favicon (`favicon.svg`) and brand assets (`logo.svg`).

---

## 3. Technology Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4, Lucide Icons, React Router v7.
- **Multilingual Support**: `i18next` and `react-i18next` covering **English**, **Telugu (తెలుగు)**, and **Hindi (हिन्दी)** with instant reactive switching.
- **Backend**: Python 3.14+, FastAPI, Pydantic v2, SQLAlchemy 2.0, PyMySQL, JWT authentication (`python-jose`).
- **Database**: MySQL 8.0 (with automated fallback to local SQLite `lingrove.db`).
- **External AI & Media APIs**:
  - **YouTube Data API v3**: For real-time educational bamboo tutorial discovery.
  - **Google Gemini AI**: For contextual multilingual conversational guidance.
- **Testing**: Automated backend test suite with `pytest`, end-to-end integration test suite.

---

## 4. Environment Configuration

Copy `backend/.env.example` to `backend/.env` (optional):

```bash
cp backend/.env.example backend/.env
```

### Environment Variables

| Variable | Description | Default / Example |
|---|---|---|
| `DATABASE_URL` | MySQL Connection string | `mysql+pymysql://root:password@localhost:3306/lingrove` (falls back to `sqlite:///./lingrove.db` if unavailable) |
| `JWT_SECRET` | Secret key for JWT auth tokens | `lingrove_cmrtc_bamboo_secure_production_secret_key_2026` |
| `YOUTUBE_API_KEY` | Google Cloud YouTube Data API v3 key | Obtain from [Google Cloud Console](https://console.cloud.google.com/) |
| `GEMINI_API_KEY` | Google Gemini API key | Obtain from [Google AI Studio](https://aistudio.google.com/) |
| `GEMINI_MODEL` | Gemini Model Identifier | `gemini-1.5-flash` |

*Note: If `YOUTUBE_API_KEY` or `GEMINI_API_KEY` are not configured or quota is exceeded, the application seamlessly runs on its verified educational bamboo video catalog and intelligent multilingual rule engine without breaking!*

---

## 5. How to Run the Application

### Running Backend (FastAPI)

```bash
# Activate virtual environment
.\backend\venv\Scripts\Activate.ps1   # Windows PowerShell
# source backend/venv/bin/activate    # Linux / macOS

# Start backend server
python -m uvicorn backend.app.main:app --host 127.0.0.1 --port 8000 --reload
```

Backend will be available at:
- **API Root**: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Health Check**: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)

### Running Frontend (React + Vite)

```bash
cd frontend
npm run dev
```

Frontend will be available at:
- **Web App**: [http://localhost:5173](http://localhost:5173)

---

## 6. How to Run Automated Tests

### 1. Pytest Unit Test Suite (11 Tests)
```bash
.\backend\venv\Scripts\python.exe -m pytest backend/tests/test_backend.py -v
```

### 2. Live End-to-End Integration Suite (11 E2E Checks)
```bash
.\backend\venv\Scripts\python.exe backend/tests/test_e2e_flow.py
```

### 3. Frontend TypeScript & Production Build
```bash
cd frontend
npm run build
```

---

## 7. Demo Accounts & Credentials

The database is pre-seeded with sample demonstration accounts (with one-click autofill on the login screen):

| Role | Email | Password | Details |
|---|---|---|---|
| **Customer** | `kavita@lingrove.org` | `customer123` | Active customer with previous order history |
| **Artisan** | `ramesh@lingrove.org` | `artisan123` | Ramesh Kumar (Master Basket Weaver, Lingala Village) |
| **Artisan** | `laxmi@lingrove.org` | `artisan123` | Laxmi Bai (Bamboo Lighting & Décor Artisan, Lingala) |
| **Admin** | `admin@lingrove.org` | `admin123` | CMRTC Platform Administrator |

---

## 8. Adding New Content

### Adding / Replacing Gallery Photographs
1. Save high-resolution photographs into `frontend/public/gallery/` with clean names (e.g. `bamboo-artisan-workshop.jpg`).
2. Add metadata item to `GALLERY_ITEMS` in `frontend/src/pages/Gallery.tsx`:
   ```typescript
   {
     id: 'unique-id',
     src: '/gallery/filename.jpg',
     title: { en: 'Title in EN', te: 'తెలుగు శీర్షిక', hi: 'हिन्दी शीर्षक' },
     caption: { en: 'Caption in EN', te: 'తెలుగు వివరణ', hi: 'हिन्दी विवरण' },
     category: 'Machinery' | 'Community' | 'Training',
     location: 'Lingala Village',
     date: '2026'
   }
   ```

### Adding New Learning Videos
1. In `backend/app/routers/learning.py`, add video entry to `CURATED_BAMBOO_VIDEOS`:
   ```python
   {
       "video_id": "YOUR_YOUTUBE_ID",
       "title": "Title of Tutorial",
       "channel_title": "Channel Name",
       "category": "Bamboo Cutting",  # Matching category
       "description": "Tutorial description",
       "thumbnail_url": "https://...",
       "watch_url": "https://www.youtube.com/watch?v=YOUR_YOUTUBE_ID",
       "embed_url": "https://www.youtube-nocookie.com/embed/YOUR_YOUTUBE_ID",
       "is_live_api": False
   }
   ```
2. When `YOUTUBE_API_KEY` is present, YouTube Data API v3 dynamically discovers matching tutorials as well.

---

## 9. Security & Safety Notes

- **API Keys**: All private credentials (`YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `JWT_SECRET`) reside exclusively on the backend and are never bundled into frontend assets.
- **Machinery Safety**: The Learning Center and Lingua AI assistant continually reinforce personal protective equipment (safety goggles, cut-resistant gloves, fitted clothing) and technician supervision.
- **E-Commerce Integrity**: Cart subtotal calculation, product prices, stock validation, and order states are enforced server-side.
