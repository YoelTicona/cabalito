import random
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Event, Product, PriceHistory, Region, EventType
from app.schemas import EventCreate, EventOut, EventPage, ReportRequest, ForceTriggerRequest
from app.auth import verify_token
from app import ai_service
from typing import Optional

router = APIRouter(tags=["events"])

PRICE_COEFFICIENTS = {"LOW": 1.05, "MEDIUM": 1.12, "HIGH": 1.20}


def _activate_event_and_reprice(event: Event, db: Session):
    event.status = "ACTIVE"
    region = db.query(Region).filter(Region.id == event.region_id).first()
    etype = db.query(EventType).filter(EventType.id == event.event_type_id).first()
    region_name = region.name if region else "La Paz"
    etype_name = etype.name if etype else "Evento"
    event.ai_explanation = ai_service.explain_event(event.description or "", region_name, etype_name)
    coeff = PRICE_COEFFICIENTS.get(event.severity, 1.10)
    products = db.query(Product).filter(Product.status == "ACTIVE").all()
    for p in products:
        noise = 1 + (random.random() * 0.06 - 0.03)
        new_price = float(p.current_price) * coeff * noise
        p.current_price = round(new_price, 2)
        if coeff >= 1.20:
            p.market_status = "RED"
        elif coeff >= 1.10:
            p.market_status = "YELLOW"
        ph = PriceHistory(product_id=p.id, price=p.current_price, recorded_date=date.today(), event_id=event.id)
        db.add(ph)
    db.commit()


# ==== Público ====
@router.post("/api/v1/events/report")
def report_event(body: ReportRequest, db: Session = Depends(get_db)):
    event = db.query(Event).filter(Event.id == body.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")

    if body.reported_price and body.product_id:
        product = db.query(Product).filter(Product.id == body.product_id).first()
        if product:
            history = db.query(PriceHistory).filter(
                PriceHistory.product_id == body.product_id,
                PriceHistory.status == "ACTIVE"
            ).all()
            if history:
                avg = sum(float(h.price) for h in history) / len(history)
                result = ai_service.validate_price(body.reported_price, avg)
                if result == "INVALID":
                    return {"status": "rejected", "reason": "Precio reportado inválido según IA"}

    event.report_count += 1
    if event.report_count >= 2 and event.status == "PENDING":
        _activate_event_and_reprice(event, db)
    else:
        db.commit()

    db.refresh(event)
    return {"status": "accepted", "event_status": event.status, "report_count": event.report_count}


# ==== Admin ====
@router.post("/api/v1/admin/events/trigger-force")
def force_trigger(body: ForceTriggerRequest, db: Session = Depends(get_db), _=Depends(verify_token)):
    event = db.query(Event).filter(Event.id == body.event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    _activate_event_and_reprice(event, db)
    db.refresh(event)
    return {"status": "triggered", "ai_explanation": event.ai_explanation}


@router.get("/api/v1/admin/events", response_model=EventPage)
def list_events(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    size: int = 10,
    db: Session = Depends(get_db),
    _=Depends(verify_token),
):
    q = db.query(Event).options(joinedload(Event.region), joinedload(Event.event_type))
    if search:
        q = q.filter(Event.description.ilike(f"%{search}%"))
    if status:
        q = q.filter(Event.status == status.upper())
    total = q.count()
    items = q.offset((page - 1) * size).limit(size).all()
    return EventPage(total=total, items=items)


@router.get("/api/v1/admin/events/{event_id}", response_model=EventOut)
def get_event(event_id: int, db: Session = Depends(get_db), _=Depends(verify_token)):
    event = db.query(Event).options(
        joinedload(Event.region), joinedload(Event.event_type)
    ).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    return event


@router.post("/api/v1/admin/events", response_model=EventOut, status_code=201)
def create_event(body: EventCreate, db: Session = Depends(get_db), _=Depends(verify_token)):
    event = Event(**body.model_dump())
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.patch("/api/v1/admin/events/{event_id}/status", response_model=EventOut)
def patch_event_status(event_id: int, db: Session = Depends(get_db), _=Depends(verify_token)):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Evento no encontrado")
    event.status = "INACTIVE" if event.status == "ACTIVE" else "ACTIVE"
    db.commit()
    db.refresh(event)
    return event
