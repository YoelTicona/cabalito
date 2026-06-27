from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Product, MarketProduct, PriceHistory
from app.schemas import (
    ProductCreate, ProductUpdate, ProductOut, ProductPage,
    RadarProduct, PriceHistoryOut,
)
from app.auth import verify_token
from typing import List, Optional

router = APIRouter(tags=["products"])


# ==== Público ====
@router.get("/api/v1/products/radar", response_model=List[RadarProduct])
def get_radar(db: Session = Depends(get_db)):
    mps = (
        db.query(MarketProduct)
        .options(joinedload(MarketProduct.product), joinedload(MarketProduct.region))
        .filter(MarketProduct.status == "ACTIVE")
        .all()
    )
    result = []
    for mp in mps:
        result.append(RadarProduct(
            market_product_id=mp.id,
            product_id=mp.product_id,
            product_name=mp.product.name if mp.product else "",
            unit=mp.product.unit if mp.product else "kg",
            region_id=mp.region_id,
            region_name=mp.region.name if mp.region else None,
            latitude=mp.region.latitude if mp.region else None,
            longitude=mp.region.longitude if mp.region else None,
            current_price=mp.current_price,
            market_status=mp.market_status,
            status=mp.status,
            last_updated=mp.last_updated,
        ))
    return result


@router.get("/api/v1/market-products/{market_product_id}/history", response_model=List[PriceHistoryOut])
def get_market_product_history(market_product_id: int, db: Session = Depends(get_db)):
    mp = db.query(MarketProduct).filter(MarketProduct.id == market_product_id).first()
    if not mp:
        raise HTTPException(status_code=404, detail="Producto de mercado no encontrado")
    history = (
        db.query(PriceHistory)
        .options(joinedload(PriceHistory.event))
        .filter(
            PriceHistory.market_product_id == market_product_id,
            PriceHistory.status == "ACTIVE",
        )
        .order_by(PriceHistory.recorded_date.asc())
        .all()
    )
    result = []
    for h in history:
        result.append(PriceHistoryOut(
            id=h.id,
            market_product_id=h.market_product_id,
            price=h.price,
            recorded_date=h.recorded_date,
            event_id=h.event_id,
            event_description=h.event.description if h.event else None,
            status=h.status,
        ))
    return result


# Compatibilidad: historial por product_id + region_id opcional
@router.get("/api/v1/products/{product_id}/history", response_model=List[PriceHistoryOut])
def get_product_history_compat(
    product_id: int,
    region_id: Optional[int] = None,
    db: Session = Depends(get_db),
):
    q = (
        db.query(MarketProduct)
        .filter(MarketProduct.product_id == product_id, MarketProduct.status == "ACTIVE")
    )
    if region_id:
        q = q.filter(MarketProduct.region_id == region_id)
    mp = q.first()
    if not mp:
        raise HTTPException(status_code=404, detail="Producto no encontrado en mercado")
    history = (
        db.query(PriceHistory)
        .options(joinedload(PriceHistory.event))
        .filter(
            PriceHistory.market_product_id == mp.id,
            PriceHistory.status == "ACTIVE",
        )
        .order_by(PriceHistory.recorded_date.asc())
        .all()
    )
    result = []
    for h in history:
        result.append(PriceHistoryOut(
            id=h.id,
            market_product_id=h.market_product_id,
            price=h.price,
            recorded_date=h.recorded_date,
            event_id=h.event_id,
            event_description=h.event.description if h.event else None,
            status=h.status,
        ))
    return result


# ==== Admin: Productos (catálogo) ====
@router.get("/api/v1/admin/products", response_model=ProductPage)
def list_products(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    size: int = 10,
    db: Session = Depends(get_db),
    _=Depends(verify_token),
):
    q = db.query(Product)
    if search:
        q = q.filter(Product.name.ilike(f"%{search}%"))
    if status:
        q = q.filter(Product.status == status.upper())
    total = q.count()
    items = q.offset((page - 1) * size).limit(size).all()
    return ProductPage(total=total, items=items)


@router.post("/api/v1/admin/products", response_model=ProductOut, status_code=201)
def create_product(body: ProductCreate, db: Session = Depends(get_db), _=Depends(verify_token)):
    product = Product(**body.model_dump())
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


@router.put("/api/v1/admin/products/{product_id}", response_model=ProductOut)
def update_product(product_id: int, body: ProductUpdate, db: Session = Depends(get_db), _=Depends(verify_token)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    for k, v in body.model_dump().items():
        setattr(product, k, v)
    db.commit()
    db.refresh(product)
    return product


@router.patch("/api/v1/admin/products/{product_id}/status", response_model=ProductOut)
def patch_product_status(product_id: int, db: Session = Depends(get_db), _=Depends(verify_token)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    product.status = "INACTIVE" if product.status == "ACTIVE" else "ACTIVE"
    db.commit()
    db.refresh(product)
    return product
