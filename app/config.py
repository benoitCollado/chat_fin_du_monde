from __future__ import annotations
import os

# Clé secrète pour signer les JWT ( remplacez en production)
SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_MIN", "15"))

# Chaîne de connexion DB (SQLite local par défaut)
DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./offcom.db")

# CORS (en dev on autorise tout, à restreindre en prod)
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")
