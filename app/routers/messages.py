""" Routes de messages par room : POST/GET /rooms/{room_id}/messages."""
from __future__ import annotations
from typing import List, Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime, timezone
from ..schemas import MessageIn, MessageOut
from ..models import Message, User
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/rooms", tags=["messages"])

@router.post("/{room_id}/messages", response_model=MessageOut, status_code=201)
def post_message(
    room_id: str,
    payload: MessageIn,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> MessageOut:
    """✉ Crée un message dans une room au nom de l'utilisateur courant."""
    msg = Message(room_id=room_id, sender_id=current.id, content=payload.content)
    db.add(msg)
    db.commit()
    db.refresh(msg)
    return MessageOut(id=msg.id, room_id=msg.room_id, sender=current.username, content=msg.content, created_at=msg.created_at)

@router.get("/{room_id}/messages", response_model=List[MessageOut])
def list_messages(
    room_id: str,
    since_ms: Optional[int] = None,
    limit: int = 100,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> List[MessageOut]:
    """ Liste les messages d'une room, triés par date croissante."""
    q = db.query(Message).filter(Message.room_id == room_id)
    if since_ms is not None:
        dt = datetime.fromtimestamp(since_ms / 1000.0, tz=timezone.utc)
        q = q.filter(Message.created_at > dt)
        q = q.order_by(Message.created_at.asc()).limit(max(1, min(limit, 1000)))
        out: List[MessageOut] = []
    for m in q.all():
        out.append(MessageOut(id=m.id, room_id=m.room_id, sender=m.sender.username if m.sender else str(m.sender_id), content=m.content, created_at=m.created_at))
    return out