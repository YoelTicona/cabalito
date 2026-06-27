import random
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Event, MarketProduct, PriceHistory, Region, EventType, CitizenReport
from app.schemas import EventCreate, EventOut, EventPage, ReportRequest, ForceTriggerRequest
from app.auth import verify_token
from app import ai_service
from typing import List, Optional

router = APIRouter(tags=["events"])

PRICE_COEFFICIENTS = {"LOW": 1.05, "MEDIUM": 1.12, "HIGH": 1.20}
STATUS_BY_SEVERITY = {"LOW": "YELLOW", "MEDIUM": "YELLOW", "HIGH": "RED"}


def _activate_event_and_reprice(event: Event, db: Session):
    event.status = "ACTIVE"
    region = db.query(Region).filter(Region.id == event.region_id).first()
    etype = db.query(EventType).filter(EventType.id == event.event_type_id).first()
    region_name = region.name if region else "La Paz"
    etype_name = etype.name if etype else "Evento"
    event.ai_explanation = ai_service.explain_event(event.description or "", region_name, etype_name)

    coeff = PRICE_COEFFICIENTS.get(event.severity, 1.10)
    new_status = STATUS_BY_SEVERITY.get(event.severity, "YELLOW")

    market_products = (
        db.query(MarketProduct)
        .filter(
            MarketProduct.region_id == event.region_id,
            MarketProduct.status == "ACTIVE",
        )
        .all()
    )

    for mp in market_products:
        noise = 1 + (random.random() * 0.06 - 0.03)
        new_price = round(float(mp.current_price) * coeff * noise, 2)
        mp.current_price = new_price
        mp.market_status = new_status
        ph = PriceHistory(
            market_product_id=mp.id,
            price=new_price,
            recorded_date=date.today(),
            event_id=event.id,
        )
        db.add(ph)

    db.commit()


# ==== Público ====
@router.get("/api/v1/events/active", response_model=List[EventOut])
def list_active_events(db: Session = Depends(get_db)):
    return (
        db.query(Event)
        .options(joinedload(Event.region), joinedload(Event.event_type))
        .filter(Event.status.in_(["ACTIVE", "PENDING"]))
        .order_by(Event.id.desc())
        .all()
    )


@router.post("/api/v1/events/report")
def report_event(body: ReportRequest, db: Session = Depends(get_db)):
    if not body.event_id and not body.region_id and not body.market_product_id:
        raise HTTPException(status_code=422, detail="Debe proveer event_id, region_id o market_product_id")

    event = None
    if body.event_id:
        event = db.query(Event).filter(Event.id == body.event_id).first()
        if not event:
            raise HTTPException(status_code=404, detail="Evento no encontrado")

    # Validar precio si se provee junto a un market_product
    if body.reported_price and body.market_product_id:
        mp = db.query(MarketProduct).filter(MarketProduct.id == body.market_product_id).first()
        if mp:
            history = db.query(PriceHistory).filter(
                PriceHistory.market_product_id == body.market_product_id,
                PriceHistory.status == "ACTIVE",
            ).all()
            if history:
                avg = sum(float(h.price) for h in history) / len(history)
                result = ai_service.validate_price(body.reported_price, avg)
                if result == "INVALID":
                    citizen_report = CitizenReport(
                        event_id=body.event_id,
                        region_id=body.region_id,
                        market_product_id=body.market_product_id,
                        reported_price=body.reported_price,
                        reported_unit=body.reported_unit,
                        market_place_reference=body.market_place_reference,
                        description=body.description,
                        latitude=body.latitude,
                        longitude=body.longitude,
                        status="REJECTED",
                    )
                    db.add(citizen_report)
                    db.commit()
                    db.refresh(citizen_report)
                    return {
                        "message": "Precio reportado fuera de rango",
                        "status": "REJECTED",
                        "report_id": citizen_report.id,
                    }

    citizen_report = CitizenReport(
        event_id=body.event_id,
        region_id=body.region_id,
        market_product_id=body.market_product_id,
        reported_price=body.reported_price,
        reported_unit=body.reported_unit,
        market_place_reference=body.market_place_reference,
        description=body.description,
        latitude=body.latitude,
        longitude=body.longitude,
        status="VALIDATED" if body.reported_price else "PENDING",
    )
    db.add(citizen_report)

    if event:
        event.report_count += 1
        if event.report_count >= 2 and event.status == "PENDING":
            _activate_event_and_reprice(event, db)
        else:
            db.commit()
        db.refresh(event)

    db.commit()
    db.refresh(citizen_report)

    return {
        "message": "Reporte recibido correctamente",
        "status": citizen_report.status,
        "report_id": citizen_report.id,
        "event_status": event.status if event else None,
        "report_count": event.report_count if event else None,
    }


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
