# Star Wars Fan Site Character API

This is a FastAPI backend for the Star Wars Fan Site Character Searcher. It
provides endpoints to list and retrieve Star Wars character profiles, for use in
a Lit + Vanilla JS frontend.

## Quickstart

1. **Install dependencies** (Python 3.8+ recommended):

   ```bash
   pip install -r requirements.txt
   ```

2. **Seed SQLite database and run server**:

   ```bash
   python main.py
   ```

   The server will automatically create the SQLite DB and seed it with several
   Star Wars characters on first run.

3. **API is available at**: `http://localhost:8000`

---

## Running on macOS / Linux

```bash
# 1) Go to the backend directory
cd backend

# 2) (Optional) Create a virtual environment if you don't have one yet
python3 -m venv venv

# 3) Activate the virtual environment
source venv/bin/activate

# 4) Install dependencies
pip install -r requirements.txt

# 5) Run the server (this will auto-create + seed the SQLite DB on first run)
python main.py

# API will be available at: http://localhost:8000
```

---

## API Endpoints

### `GET /characters`

- Retrieve all available characters.
- Optional search parameter:
  - `/characters?search=luke` → Filters by name containing (case-insensitive)
- **Response**:
  ```json
  [
    {
      "id": 1,
      "name": "Luke Skywalker",
      "birth_year": "19BBY",
      "faction": "rebel"
    },
    {
      "id": 2,
      "name": "Leia Organa",
      "birth_year": "19BBY",
      "faction": "rebel"
    }
  ]
  ```

### `GET /characters/{id}`

- Retrieve a character's full profile by ID.
- **Response**:
  ```json
  {
    "id": 1,
    "name": "Luke Skywalker",
    "birth_year": "19BBY",
    "description": "Jedi Knight and hero of the Rebellion. Son of Anakin Skywalker.",
    "faction": "rebel"
  }
  ```

---

## Project Structure

- `main.py` — FastAPI application and DB models
- `requirements.txt` — required Python dependencies
- `starwars.db` — (auto-created SQLite database)

---

## Notes

- CORS is enabled for all origins (development only).
- The database auto-seeds with sample Star Wars characters from the original
  trilogy.
