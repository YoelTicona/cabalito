import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import auth, regions, event_types, events, products, chat
from app.routers import market_products

app = FastAPI(title="Cabalito API", version="2.0.0")

origins = os.getenv("CORS_ORIGINS", "http://localhost").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(regions.router)
app.include_router(event_types.router)
app.include_router(events.router)
app.include_router(products.router)
app.include_router(market_products.router)
app.include_router(chat.router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "cabalito-backend"}
