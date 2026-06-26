from pydantic import BaseModel
from typing import Optional, List
from datetime import date
from decimal import Decimal


# ── Auth ──────────────────────────────────────────────────────
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    message: str


# ── Region ────────────────────────────────────────────────────
class RegionBase(BaseModel):
    name: str
    weather_api_location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class RegionCreate(RegionBase):
    pass

class RegionUpdate(RegionBase):
    pass

class RegionOut(RegionBase):
    id: int
    status: str
    class Config:
        from_attributes = True


# ── EventType ─────────────────────────────────────────────────
class EventTypeBase(BaseModel):
    name: str

class EventTypeCreate(EventTypeBase):
    pass

class EventTypeOut(EventTypeBase):
    id: int
    status: str
    class Config:
        from_attributes = True


# ── Event ─────────────────────────────────────────────────────
class EventBase(BaseModel):
    region_id: int
    event_type_id: int
    description: Optional[str] = None
    severity: str = "MEDIUM"

class EventCreate(EventBase):
    pass

class EventOut(EventBase):
    id: int
    report_count: int
    ai_explanation: Optional[str]
    status: str
    region: Optional[RegionOut] = None
    event_type: Optional[EventTypeOut] = None
    class Config:
        from_attributes = True

class EventPage(BaseModel):
    total: int
    items: List[EventOut]


# ── Product ───────────────────────────────────────────────────
class ProductBase(BaseModel):
    name: str
    origin_region_id: int
    current_price: Decimal
    market_status: str = "GREEN"

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    status: str
    origin_region: Optional[RegionOut] = None
    class Config:
        from_attributes = True

class ProductPage(BaseModel):
    total: int
    items: List[ProductOut]

class RadarProduct(BaseModel):
    id: int
    name: str
    current_price: Decimal
    market_status: str
    latitude: Optional[float]
    longitude: Optional[float]
    region_name: Optional[str]


# ── PriceHistory ──────────────────────────────────────────────
class PriceHistoryOut(BaseModel):
    id: int
    price: Decimal
    recorded_date: date
    event_id: Optional[int]
    status: str
    class Config:
        from_attributes = True


# ── Reports ───────────────────────────────────────────────────
class ReportRequest(BaseModel):
    event_id: int
    reported_price: Optional[float] = None
    product_id: Optional[int] = None

class ForceTriggerRequest(BaseModel):
    event_id: int


# ── Chat ──────────────────────────────────────────────────────
class ChatRequest(BaseModel):
    productId: int
    userMessage: str

class ChatResponse(BaseModel):
    reply: str
