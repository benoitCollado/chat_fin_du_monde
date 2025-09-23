# Routes utilitaires autour des utilisateurs (annuaire)
from __future__ import annotations
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List
from ..database import get_db
from ..models import User
from ..schemas import UserPublic
from ..deps import get_current_user

router = APIRouter(tags=["users"])  # prefix sera ajouté dans main.py si besoin

@router.get("/users", response_model=List[UserPublic])
def list_users(
    q: str | None = Query(None, description="Filtre par fragment de nom"),
    limit: int = 20,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> List[UserPublic]:
    """ Liste les utilisateurs (exclut l'utilisateur courant)."""
    query = db.query(User).filter(User.id != current.id)
    if q:
        query = query.filter(User.username.ilike(f"%{q}%"))
    rows = query.order_by(User.username.asc()).limit(max(1, min(limit, 100))).all()
    return [UserPublic.model_validate(u) for u in rows]
