from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Region
from app.schemas import RegionCreate, RegionUpdate, RegionOut
from app.auth import verify_token
from typing import List, Optional

router = APIRouter(tags=["regions"])


# Endpoint público para el modal de reportes ciudadanos
@router.get("/api/v1/regions", response_model=List[RegionOut])
def list_regions_public(db: Session = Depends(get_db)):
    return db.query(Region).filter(Region.status == "ACTIVE").order_by(Region.name).all()


@router.get("/api/v1/admin/regions", response_model=List[RegionOut])
def list_regions(search: Optional[str] = None, db: Session = Depends(get_db), _=Depends(verify_token)):
    q = db.query(Region)
    if search:
        q = q.filter(Region.name.ilike(f"%{search}%"))
    return q.all()


@router.post("/api/v1/admin/regions", response_model=RegionOut, status_code=201)
def create_region(body: RegionCreate, db: Session = Depends(get_db), _=Depends(verify_token)):
    region = Region(**body.model_dump())
    db.add(region)
    db.commit()
    db.refresh(region)
    return region


@router.put("/api/v1/admin/regions/{region_id}", response_model=RegionOut)
def update_region(region_id: int, body: RegionUpdate, db: Session = Depends(get_db), _=Depends(verify_token)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Región no encontrada")
    for k, v in body.model_dump().items():
        setattr(region, k, v)
    db.commit()
    db.refresh(region)
    return region


@router.patch("/api/v1/admin/regions/{region_id}/status", response_model=RegionOut)
def patch_region_status(region_id: int, db: Session = Depends(get_db), _=Depends(verify_token)):
    region = db.query(Region).filter(Region.id == region_id).first()
    if not region:
        raise HTTPException(status_code=404, detail="Región no encontrada")
    region.status = "INACTIVE" if region.status == "ACTIVE" else "ACTIVE"
    db.commit()
    db.refresh(region)
    return region
