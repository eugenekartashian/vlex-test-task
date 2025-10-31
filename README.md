# StarFolk Wiki — Monorepo

StarFolk Wiki is a small **monorepo** with:

- A **FastAPI** backend (SQLite, auto-seeded) that exposes character data.
- A **Lit** (+ vanilla JS) frontend with a custom History-API router and
  accessible UI.

This root README links to the detailed READMEs for each part and gives you a
one-page quick start.

---

## Repository Structure

```
FAN-SITE-VLEX/
├─ backend/
│  ├─ main.py
│  ├─ requirements.txt
│  ├─ pyproject.toml
│  ├─ README.md                 # Backend docs
│  └─ starwars.db               # (auto-created)
├─ frontend/
│  ├─ src/app/
│  │  ├─ app-root.js
│  │  ├─ router.js
│  │  ├─ components/
│  │  │  ├─ character/
│  │  │  │  ├─ character-list.js
│  │  │  │  └─ character-profile.js
│  │  │  ├─ header/
│  │  │  │  ├─ header-bar.js
│  │  │  │  └─ search-bar.js
│  │  │  └─ sidebar/
│  │  │     └─ feature-sidebar.js
│  │  ├─ icons/icons.js
│  │  └─ lib/{http.js,cache.js}
│  ├─ index.html
│  ├─ vite.config.js
│  ├─ package.json
│  ├─ README.md                 # Frontend docs
│  └─ styles.css
└─ fe-backup/                   # (optional backup folder)
```

- Backend README: **[`backend/README.md`](./backend/README.md)**
- Frontend README: **[`frontend/README.md`](./frontend/README.md)**

---

## Quick Start (macOS / Linux)

### 1) Run the backend (FastAPI)

```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python main.py
# API available at: http://localhost:8000
```

### 2) Run the frontend (Lit + Vite)

```bash
cd frontend
# choose your package manager:
npm install        # or: pnpm install / yarn
npm run dev        # or: pnpm dev / yarn dev
# App available at: http://localhost:5173
```

> The frontend expects the API at `http://localhost:8000`.  
> To point elsewhere, set `VITE_API_BASE` (see “Configuration” below).

---

## What’s Inside (Summary)

### Backend (FastAPI + SQLite)

- Auto-creates and seeds `starwars.db` on first run.
- Endpoints:
  - `GET /characters?search=<query>` — list (case-insensitive name filter).
  - `GET /characters/{id}` — detailed profile.
- CORS enabled for development.
- See: **[`backend/README.md`](./backend/README.md)**

### Frontend (Lit + History API Router)

- Custom router with **HTML5 History API** (`pushState`/`popstate`):
  - `/` — hero + search; list appears when user types (≥ 2 characters).
  - `/character/:id` — detail page.
  - `/about` — static route.
- Accessible components (`role="listbox"/"option"`, live regions, focus mgmt).
- Debounced search (300ms), request aborting, lightweight cache (TTL).
- Pixel-perfect UI per mock (cards, shadows, rounded corners).
- See: **[`frontend/README.md`](./frontend/README.md)**

---

## Configuration

**Frontend → Backend URL**

- Source: `frontend/src/app/lib/http.js`
- Reads `import.meta.env?.VITE_API_BASE` with fallback to
  `http://localhost:8000`.

Set it at dev time:

```bash
# npm
VITE_API_BASE="http://localhost:8000" npm run dev

# pnpm
VITE_API_BASE="http://localhost:8000" pnpm dev
```

For production:

```bash
npm run build
npm run preview   # Serves the built app locally
```

> Because routing uses the History API (not hash), your production host must
> **fallback all routes to `index.html`** (Vite preview does this; configure the
> same on your CDN/server).

---

## Common Scripts

From `frontend/`:

- `dev` — run Vite dev server
- `build` — production build
- `preview` — preview the build locally

From `backend/`:

- `python main.py` — start FastAPI app (auto-seed DB on first run)

---

## Troubleshooting

- **Frontend refresh on deep link 404s** → Your static host needs **SPA
  fallback** (serve `index.html` for unknown routes).
- **CORS errors** → Ensure backend is running on `http://localhost:8000` (or
  update `VITE_API_BASE`).
- **No results while typing** → Searches fire at ≥ 2 characters by design.
- **Slow/duplicated requests** → Requests are debounced and aborted; if
  modifying fetch logic, keep `AbortController` patterns.
