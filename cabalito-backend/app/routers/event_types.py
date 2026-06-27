from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import EventType
from app.schemas import EventTypeCreate, EventTypeOut
from app.auth import verify_token
from typing import List, Optional

router = APIRouter(prefix="/api/v1/admin/event-types", tags=["event-types"])


@router.get("", response_model=List[EventTypeOut])
def list_event_types(search: Optional[str] = None, db: Session = Depends(get_db), _=Depends(verify_token)):
    q = db.query(EventType)
    if search:
        q = q.filter(EventType.name.ilike(f"%{search}%"))
    return q.all()


@router.post("", response_model=EventTypeOut, status_code=201)
def create_event_type(body: EventTypeCreate, db: Session = Depends(get_db), _=Depends(verify_token)):
    et = EventType(**body.model_dump())
    db.add(et)
    db.commit()
    db.refresh(et)
    return et


@router.patch("/{et_id}/status", response_model=EventTypeOut)
def patch_event_type_status(et_id: int, db: Session = Depends(get_db), _=Depends(verify_token)):
    et = db.query(EventType).filter(EventType.id == et_id).first()
    if not et:
        raise HTTPException(status_code=404, detail="Tipo de evento no encontrado")
    et.status = "INACTIVE" if et.status == "ACTIVE" else "ACTIVE"
    db.commit()
    db.refresh(et)
    return et
