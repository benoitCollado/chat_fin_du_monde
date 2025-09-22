from __future__ import annotations
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from typing import Generator
from .config import DATABASE_URL

# Création du moteur SQLAlchemy (avec option spéciale pour SQLite)
engine = create_engine(
    DATABASE_URL,
    future=True,
    echo=False,
    connect_args={"check_same_thread": False} if DATABASE_URL.startswith("sqlite") else {},
)

# Fabrique de sessions (une par requête HTTP)
SessionLocal = sessionmaker(bind=engine, expire_on_commit=False, autoflush=False)

class Base(DeclarativeBase):
    """Base déclarative dont héritent tous les modèles ORM."""
    pass

def get_db() -> Generator:
    """ Dépendance FastAPI : ouvre une session DB par requête et la referme proprement."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()