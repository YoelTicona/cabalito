from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import MarketProduct
from app.schemas import MarketProductCreate, MarketProductUpdate, MarketProductOut, MarketProductPage
from app.auth import verify_token
from typing import Optional

router = APIRouter(tags=["market_products"])


@router.get("/api/v1/admin/market-products", response_model=MarketProductPage)
def list_market_products(
    search: Optional[str] = None,
    region_id: Optional[int] = None,
    status: Optional[str] = None,
    page: int = 1,
    size: int = 20,
    db: Session = Depends(get_db),
    _=Depends(verify_token),
):
    q = db.query(MarketProduct).options(
        joinedload(MarketProduct.product),
        joinedload(MarketProduct.region),
    )
    if search:
        from app.models import Product as _Product
        q = q.join(MarketProduct.product).filter(_Product.name.ilike(f"%{search}%"))
    if region_id:
        q = q.filter(MarketProduct.region_id == region_id)
    if status:
        q = q.filter(MarketProduct.status == status.upper())
    total = q.count()
    items = q.offset((page - 1) * size).limit(size).all()
    return MarketProductPage(total=total, items=items)


@router.post("/api/v1/admin/market-products", response_model=MarketProductOut, status_code=201)
def create_market_product(
    body: MarketProductCreate,
    db: Session = Depends(get_db),
    _=Depends(verify_token),
):
    mp = MarketProduct(**body.model_dump())
    db.add(mp)
    db.commit()
    db.refresh(mp)
    mp = db.query(MarketProduct).options(
        joinedload(MarketProduct.product),
        joinedload(MarketProduct.region),
    ).filter(MarketProduct.id == mp.id).first()
    return mp


@router.put("/api/v1/admin/market-products/{mp_id}", response_model=MarketProductOut)
def update_market_product(
    mp_id: int,
    body: MarketProductUpdate,
    db: Session = Depends(get_db),
    _=Depends(verify_token),
):
    mp = db.query(MarketProduct).filter(MarketProduct.id == mp_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Producto de mercado no encontrado")
    for k, v in body.model_dump().items():
        setattr(mp, k, v)
    db.commit()
    db.refresh(mp)
    mp = db.query(MarketProduct).options(
        joinedload(MarketProduct.product),
        joinedload(MarketProduct.region),
    ).filter(MarketProduct.id == mp_id).first()
    return mp


@router.patch("/api/v1/admin/market-products/{mp_id}/status", response_model=MarketProductOut)
def patch_market_product_status(
    mp_id: int,
    db: Session = Depends(get_db),
    _=Depends(verify_token),
):
    mp = db.query(MarketProduct).filter(MarketProduct.id == mp_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Producto de mercado no encontrado")
    mp.status = "INACTIVE" if mp.status == "ACTIVE" else "ACTIVE"
    db.commit()
    db.refresh(mp)
    mp = db.query(MarketProduct).options(
        joinedload(MarketProduct.product),
        joinedload(MarketProduct.region),
    ).filter(MarketProduct.id == mp_id).first()
    return mp
