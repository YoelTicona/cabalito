from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime
from decimal import Decimal


# ==== Auth ====
class LoginRequest(BaseModel):
    username: str
    password: str

class LoginResponse(BaseModel):
    token: str
    message: str


# ==== Region ====
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


# ==== EventType ====
class EventTypeBase(BaseModel):
    name: str

class EventTypeCreate(EventTypeBase):
    pass

class EventTypeOut(EventTypeBase):
    id: int
    status: str
    class Config:
        from_attributes = True


# ==== Event ====
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


# ==== Product (catálogo general) ====
class ProductBase(BaseModel):
    name: str
    unit: str = "kg"
    category: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(ProductBase):
    pass

class ProductOut(ProductBase):
    id: int
    status: str
    class Config:
        from_attributes = True

class ProductPage(BaseModel):
    total: int
    items: List[ProductOut]


# ==== MarketProduct ====
class MarketProductBase(BaseModel):
    region_id: int
    product_id: int
    current_price: Decimal
    market_status: str = "GREEN"

class MarketProductCreate(MarketProductBase):
    pass

class MarketProductUpdate(MarketProductBase):
    pass

class MarketProductOut(MarketProductBase):
    id: int
    status: str
    last_updated: Optional[datetime] = None
    region: Optional[RegionOut] = None
    product: Optional[ProductOut] = None
    class Config:
        from_attributes = True

class MarketProductPage(BaseModel):
    total: int
    items: List[MarketProductOut]


# ==== Radar ====
class RadarProduct(BaseModel):
    market_product_id: int
    product_id: int
    product_name: str
    unit: str
    region_id: int
    region_name: Optional[str]
    latitude: Optional[float]
    longitude: Optional[float]
    current_price: Decimal
    market_status: str
    status: str
    last_updated: Optional[datetime] = None


# ==== PriceHistory ====
class PriceHistoryOut(BaseModel):
    id: int
    market_product_id: int
    price: Decimal
    recorded_date: date
    event_id: Optional[int]
    event_description: Optional[str] = None
    status: str
    class Config:
        from_attributes = True


# ==== Citizen Reports ====
class ReportRequest(BaseModel):
    event_id: Optional[int] = None
    region_id: Optional[int] = None
    market_product_id: Optional[int] = None
    reported_price: Optional[float] = None
    reported_unit: Optional[str] = None
    market_place_reference: Optional[str] = None
    description: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class CitizenReportOut(BaseModel):
    id: int
    event_id: Optional[int]
    region_id: Optional[int]
    market_product_id: Optional[int]
    reported_price: Optional[Decimal]
    reported_unit: Optional[str]
    market_place_reference: Optional[str]
    description: Optional[str]
    status: str
    created_at: Optional[datetime]
    class Config:
        from_attributes = True

class ForceTriggerRequest(BaseModel):
    event_id: int


# ==== Chat ====
class ChatRequest(BaseModel):
    productId: int
    userMessage: str

class ChatResponse(BaseModel):
    reply: str
