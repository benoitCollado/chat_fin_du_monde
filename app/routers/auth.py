""" Routes d'authentification : /auth/register, /auth/login, /users/me."""
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from datetime import timedelta
from ..schemas import UserCreate, TokenResponse
from ..models import User
from ..database import get_db
from ..auth import get_password_hash, verify_password, create_access_token
from ..config import ACCESS_TOKEN_EXPIRE_MINUTES
from ..deps import get_user_by_username, get_current_user


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", status_code=201)
def register_user(payload: UserCreate, db: Session = Depends(get_db)) -> dict:
    """ Crée un nouvel utilisateur avec un mot de passe haché."""
    if get_user_by_username(db, payload.username):
        raise HTTPException(status_code=409, detail="Nom d'utilisateur déjà utilisé")
    user = User(username=payload.username, password_hash=get_password_hash(payload.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"id": user.id, "username": user.username, "created_at": user.created_at}


@router.post("/login", response_model=TokenResponse)
def login_user(payload: UserCreate, db: Session = Depends(get_db)) -> TokenResponse:
    """ Authentifie un utilisateur et délivre un JWT."""
    user = get_user_by_username(db, payload.username)
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Identifiants invalides")
    token = create_access_token(subject=user.username, user_token_version=getattr(user, "token_version", 0))
    return TokenResponse(access_token=token, expires_in=ACCESS_TOKEN_EXPIRE_MINUTES)

@router.get("/me")
def read_me(current: User = Depends(get_current_user)) -> dict:
    """ Retourne un résumé du compte courant (sans données sensibles)."""
    return {"id": current.id, "username": current.username, "created_at": current.created_at}