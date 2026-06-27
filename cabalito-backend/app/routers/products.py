from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from app.database import get_db
from app.models import Product, PriceHistory, Region
from app.schemas import ProductCreate, ProductUpdate, ProductOut, ProductPage, RadarProduct, PriceHistoryOut
from app.auth import verify_token
from typing import List, Optional

router = APIRouter(tags=["products"])


# ==== Público ====
@router.get("/api/v1/products/radar", response_model=List[RadarProduct])
def get_radar(db: Session = Depends(get_db)):
    products = db.query(Product).options(joinedload(Product.origin_region)).filter(Product.status == "ACTIVE").all()
    result = []
    for p in products:
        result.append(RadarProduct(
            id=p.id,
            name=p.name,
            current_price=p.current_price,
            market_status=p.market_status,
            latitude=p.origin_region.latitude if p.origin_region else None,
            longitude=p.origin_region.longitude if p.origin_region else None,
            region_name=p.origin_region.name if p.origin_region else None,
        ))
    return result


@router.get("/api/v1/products/{product_id}/history", response_model=List[PriceHistoryOut])
def get_history(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")
    history = db.query(PriceHistory).filter(
        PriceHistory.product_id == product_id,
        PriceHistory.status == "ACTIVE"
    ).order_by(PriceHistory.recorded_date.asc()).all()
    return history


# ==== Admin ====
@router.get("/api/v1/admin/products", response_model=ProductPage)
def list_products(
    search: Optional[str] = None,
    status: Optional[str] = None,
    page: int = 1,
    size: int = 10,
    db: Session = Depends(get_db),
    _=Depends(verify_token),
):
    q = db.query(Product).options(joinedload(Product.origin_region))
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
