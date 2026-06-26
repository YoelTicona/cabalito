from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import Product
from app.schemas import ChatRequest, ChatResponse
from app import ai_service

router = APIRouter(prefix="/api/v1/chat", tags=["chat"])


@router.post("/casera", response_model=ChatResponse)
def casera_chat(body: ChatRequest, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == body.productId).first()
    if not product:
        raise HTTPException(status_code=404, detail="Producto no encontrado")

    green_products = db.query(Product).filter(
        Product.market_status == "GREEN",
        Product.status == "ACTIVE"
    ).all()
    green_names = [p.name for p in green_products]

    reply = ai_service.casera_chat(
        user_message=body.userMessage,
        green_products=green_names,
        product_name=product.name,
    )
    return ChatResponse(reply=reply)
