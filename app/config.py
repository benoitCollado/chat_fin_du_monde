from __future__ import annotations
import os

# Clé secrète pour signer les JWT ( remplacez en production)
SECRET_KEY: str = os.getenv("SECRET_KEY", "dev-secret-change-me")
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_MIN", "15"))

# 🇫🇷 Dossier "data" au même niveau que "app"
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_DIR = os.path.join(BASE_DIR, "data")
os.makedirs(DATA_DIR, exist_ok=True)  # crée le dossier si inexistant

# 🇫🇷 Fichier SQLite placé dans ./data/offcom.db
DATABASE_URL: str = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(DATA_DIR, 'offcom.db')}")

# CORS (en dev on autorise tout, à restreindre en prod)
CORS_ALLOW_ORIGINS = os.getenv("CORS_ALLOW_ORIGINS", "*").split(",")

#  Mode doux : on NE supprime PAS globalement après lecture
DELETE_AFTER_READ_FOR_ALL: bool = os.getenv("DELETE_AFTER_READ_FOR_ALL", "false").lower() == "true"

# Délai d'affichage d'un message dans la conversation (minutes)
# Passé ce délai, l'API ne renverra plus le message (mais il reste stocké chiffré).
HIDE_AFTER_MIN: int = int(os.getenv("HIDE_AFTER_MIN", "10"))

# TTL global des messages en base (en minutes) — 10 jours = 10*24*60 = 14400
GLOBAL_MESSAGE_TTL_MIN: int = int(os.getenv("GLOBAL_MESSAGE_TTL_MIN", "14400"))

# Fichier où est stockée la clé de chiffrement des messages
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_ROOT = os.path.abspath(os.path.join(BASE_DIR, ".."))
DATA_DIR = os.path.join(PROJECT_ROOT, "data")
os.makedirs(DATA_DIR, exist_ok=True)
MESSAGE_KEY_FILE = os.getenv("MESSAGE_KEY_FILE", os.path.join(DATA_DIR, "message_key.key"))
