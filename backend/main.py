"""
main.py
FastAPI backend for the Star Wars Fan Site Character Searcher.

What's here:
- SQLAlchemy 2.x-friendly imports (no deprecated ext.declarative)
- Character model now has `faction` column (nullable TEXT)
- Pydantic response models include `faction`
- Modern FastAPI lifespan (no on_event deprecation)
- Safe seeding (only when table is empty)
- Simple search by name (case-insensitive LIKE for SQLite)
"""

from __future__ import annotations

from contextlib import asynccontextmanager
import os
from typing import Optional, List

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from sqlalchemy import create_engine, Column, Integer, String, select, func
from sqlalchemy.orm import declarative_base, sessionmaker, Session


# ---------------------------------------------------------------------
# Database setup
# ---------------------------------------------------------------------

# Allow overriding via env var; default to local SQLite file.
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./starwars.db")

# Use the non-deprecated location in SQLAlchemy 2.x
Base = declarative_base()


class Character(Base):
    """SQLAlchemy ORM model for a character row."""
    __tablename__ = "characters"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    birth_year = Column(String)
    description = Column(String)          # long text / markdown allowed
    faction = Column(String, nullable=True)  # "rebel" | "empire" | NULL

# SQLite requires `check_same_thread=False` for use across threads in dev.
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False)


# ---------------------------------------------------------------------
# Pydantic response models (explicit API shapes)
# ---------------------------------------------------------------------

class CharacterListItem(BaseModel):
    id: int
    name: str
    birth_year: Optional[str] = None
    description: Optional[str] = None
    faction: Optional[str] = None


class CharacterDetail(BaseModel):
    id: int
    name: str
    birth_year: Optional[str] = None
    description: Optional[str] = None
    faction: Optional[str] = None


# ---------------------------------------------------------------------
# App init with modern lifespan handler
# ---------------------------------------------------------------------

@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan:
    - Ensure tables exist.
    - Seed demo data *once* if the table is empty.
    NOTE: create_all() will NOT drop existing columns; it just ensures presence.
    """
    Base.metadata.create_all(bind=engine)
    seed_db()
    yield  # shutdown work (none needed)


app = FastAPI(
    title="Star Wars Fan Site Character API",
    version="1.1.0",
    lifespan=lifespan,
)

# Open CORS for development; tighten for production (specific origins).
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],       # NOTE: restrict in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------
# Dependency: DB session per-request
# ---------------------------------------------------------------------

def get_db() -> Session:
    """Provide a transactional SQLAlchemy session."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# ---------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------

@app.get("/health")
def health_check():
    """Simple liveness probe."""
    return {"ok": True}


@app.get(
    "/characters",
    response_model=List[CharacterListItem],
    summary="List characters (optionally filter by name)",
)
def list_characters(
    search: Optional[str] = Query(
        default=None,
        description="Case-insensitive substring match on character name.",
        max_length=100,
    ),
    db: Session = Depends(get_db),
):
    """
    Return all characters or only those whose name matches `search`.
    Uses ILIKE (on SQLite, LIKE is case-insensitive by default).
    """
    stmt = select(Character)
    if search:
        stmt = stmt.filter(Character.name.ilike(f"%{search}%"))

    rows = db.scalars(stmt).all()
    return [
        CharacterListItem(
            id=r.id,
            name=r.name,
            birth_year=r.birth_year,
            description=r.description,
            faction=r.faction,
        )
        for r in rows
    ]


@app.get(
    "/characters/{char_id}",
    response_model=CharacterDetail,
    summary="Get full character profile by ID",
)
def get_character(char_id: int, db: Session = Depends(get_db)):
    """Retrieve a character by ID, including description and faction."""
    stmt = select(Character).where(Character.id == char_id)
    obj = db.scalar(stmt)
    if not obj:
        raise HTTPException(status_code=404, detail="Character not found")
    return CharacterDetail(
        id=obj.id,
        name=obj.name,
        birth_year=obj.birth_year,
        description=obj.description,
        faction=obj.faction,
    )


# ---------------------------------------------------------------------
# Seed DB (idempotent)
# ---------------------------------------------------------------------

def seed_db() -> None:
    """
    Seed the SQLite DB with a small set of well-known characters
    if (and only if) the table is currently empty.

    NOTE: we don't set `faction` here because your DB is already filled
    by the one-off filler; leaving None is also fine for old DBs.
    """
    with SessionLocal() as db:
        count = db.scalar(select(func.count()).select_from(Character))
        if count and count > 0:
            return  # already seeded

        db.bulk_save_objects(
            [
                Character(
                    name="Luke Skywalker",
                    birth_year="19BBY",
                    description=(
                        "Jedi Knight and hero of the Rebellion. "
                        "Son of Anakin Skywalker."
                    ),
                    faction="rebel",
                ),
                Character(
                    name="Leia Organa",
                    birth_year="19BBY",
                    description="Princess, senator, and Rebel leader.",
                    faction="rebel",
                ),
                Character(
                    name="Darth Vader",
                    birth_year="41.9BBY",
                    description="Former Jedi Knight turned Sith Lord.",
                    faction="empire",
                ),
                Character(
                    name="Han Solo",
                    birth_year="29BBY",
                    description="Smuggler, pilot of the Millennium Falcon.",
                    faction="rebel",
                ),
                Character(
                    name="Yoda",
                    birth_year="896BBY",
                    description="Grand Master of the Jedi Order.",
                    faction="rebel",
                ),
                Character(
                    name="Obi-Wan Kenobi",
                    birth_year="57BBY",
                    description="Jedi Master, mentor to Anakin and Luke.",
                    faction="rebel",
                ),
            ]
        )
        db.commit()


# ---------------------------------------------------------------------
# Script entry (optional, for local dev)
# ---------------------------------------------------------------------

if __name__ == "__main__":
    # Tip: run as `python main.py` during local development.
    import uvicorn

    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
