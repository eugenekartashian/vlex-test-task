# Star Wars Fan Site — Frontend (Lit + Vanilla JS)

A lightweight frontend built with **Lit** web components to search and view Star
Wars character profiles served by the FastAPI backend.

---

## Quick Start

> Prereqs:
>
> - Backend running at **http://localhost:8000** (see backend README).
> - Any static server **with SPA fallback** (History API).  
>   Deep-links like `/character/1` must return `index.html`.

### Option A — Node “serve” (recommended)

```bash
cd frontend
# one-time
npm i -g serve
# start with SPA fallback on http://localhost:5173
serve -l 5173 -s .
```

### Option B — http-server (Node)

```bash
cd frontend
npm i -g http-server
# --spa ensures any path serves index.html
http-server -p 5173 --spa
```

### Option C — tiny Express server (copy/paste)

```bash
# server.mjs
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const root = path.join(__dirname, '.');
app.use(express.static(root));
app.get('*', (_, res) => res.sendFile(path.join(root, 'index.html')));
app.listen(5173, () => console.log('http://localhost:5173'));
```

```bash
node server.mjs
```

> Python’s `http.server` **does not** handle SPA fallback; refreshing on
> `/character/1` will 404. Prefer one of the options above.

---

## Configuration

- API base URL is read from `import.meta.env?.VITE_API_BASE` with a safe
  default:
  - **Default**: `http://localhost:8000`
  - File: `lib/http.js`
- To point to a different backend at runtime with a bundler (e.g., Vite),
  define:
  - `VITE_API_BASE="https://your-api.example.com"`

---

## Routing (History API — not hash)

- Client-side router uses **HTML5 History API** (`pushState` / `popstate`).
- File: `router.js`, wired in `app-root.js`.
- Supported paths:
  - `/` — search/home (hero shows until user starts typing)
  - `/character/:id` — character detail
  - `/about` — simple static route
- Programmatic navigation from `app-root.js`:
  - `this.router.navigate('/')`
  - `this.router.navigate('/character/123')`
- **Deep links** and **page refresh** require SPA fallback from the server (see
  Quick Start).

---

## What’s Implemented

- **Lit Web Components**

  - `app-root` — app shell, mounts header, sidebar, and content, wires
    router/state.
  - `header-bar` — logo/brand, tagline, and debounced search input (300 ms).
  - `feature-sidebar` — featured characters card (click/keyboard select).
  - `character-list` — search results (icon + name + meta + desc) with
    skeletons.
  - `character-profile` — detailed view (main article + sticky side card).
  - `search-bar` — generic search input (used in earlier iteration; `header-bar`
    currently emits `search`).
  - `icons` — inline SVG emblem set via `iconTemplateFor`.

- **Accessibility (A11y)**

  - Roles: `listbox` / `option`, proper `aria-selected`.
  - Keyboard: **Enter/Space** to activate items.
  - Focus management: detail title gets focus on route change; search input
    regains focus when returning home.
  - Live regions and `aria-busy` / `role="status"` for async states.

- **Networking & Caching**

  - `lib/http.js` → `fetchJSON(path, { timeoutMs })` with AbortController +
    timeout + error normalization.
  - `lib/cache.js` → `cachedJSON(key, fetcher, { ttl })` simple in-memory cache
    (e.g., 30–60s).
  - `character-list` and `character-profile` cancel in-flight requests on prop
    changes/unmount to avoid race conditions.

- **UX Details**
  - Search hint (“Type at least 2 characters”) before threshold.
  - Loading skeletons for list rows.
  - Empty and error states.
  - Pixel-perfect spacing, shadows, and rounded corners per mock.

---

## API Contract (consumed)

- `GET /characters?search=<query>` → list items for results.
- `GET /characters/:id` → detail payload (name, birth_year, description,
  faction).

Frontend degrades gracefully on empty, network, or server errors.

---

## Project Structure (key files)

```
frontend/
├─ index.html
├─ app.js                       # defines/loads <app-root>
├─ app-root.js                  # router, layout, state, focus mgmt
├─ router.js                    # History API router (pushState/popstate)
├─ components/
│  ├─ header/header-bar.js
│  ├─ sidebar/feature-sidebar.js
│  └─ character/
│     ├─ character-list.js
│     └─ character-profile.js
├─ icons/
│  └─ icons.js                  # iconTemplateFor(...)
└─ lib/
   ├─ http.js                   # fetchJSON + timeouts
   └─ cache.js                  # cachedJSON (TTL)
```

---

## Development Tips

- **SPA fallback** is mandatory for deep links and refresh. Use `serve -s` or
  `http-server --spa`.
- **Search threshold**: list fetch triggers at ≥ 2 characters (see
  `character-list`).
- **Abort on rapid input**: both list/profile cancel previous requests; keep
  this pattern for new fetchers.
- **Focus management**: update selectors in `app-root.js` if IDs change
  (`#profile-title`, `#search-inp`).
- **Styling tokens**: sidebar and cards use `--sf-*` CSS variables; extend them
  for theming.

---

## Roadmap (optional)

- Roving tabindex for up/down arrow navigation in the list.
- Extract shared design tokens to a global stylesheet (light/dark modes).
- Unit tests with Web Test Runner / Vitest.
- Production bundling with Vite (env injection for `VITE_API_BASE`,
  minification, cache-busting).
