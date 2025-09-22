""" Point d'entrée FastAPI : instancie l'app, branche les routeurs, crée les tables.

Lancer en dev :
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
"""
from __future__ import annotations
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database import engine, Base
from .config import CORS_ALLOW_ORIGINS
from .routers import auth as auth_router
from .routers import messages as messages_router
from .routers import connections as connections_router

app = FastAPI(title="OffCom Backend", version="0.1.0", description="Backend minimal (offline-first) pour utilisateurs, messages et connexions")

# CORS permissif pour le dev ( restreindre en prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inclusion des routeurs
app.include_router(auth_router.router)
app.include_router(messages_router.router)
app.include_router(connections_router.router)

@app.on_event("startup")
def on_startup() -> None:
    """ Au démarrage : créer les tables si nécessaire."""
    Base.metadata.create_all(bind=engine)