from sqlalchemy import Column, Integer, String, Text, Numeric, Date, ForeignKey, Double
from sqlalchemy.orm import relationship
from app.database import Base


class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    weather_api_location = Column(String(150))
    latitude = Column(Double)
    longitude = Column(Double)
    status = Column(String(20), default="ACTIVE")

    products = relationship("Product", back_populates="origin_region", foreign_keys="Product.origin_region_id")
    events = relationship("Event", back_populates="region")


class EventType(Base):
    __tablename__ = "event_types"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    status = Column(String(20), default="ACTIVE")

    events = relationship("Event", back_populates="event_type")


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"))
    event_type_id = Column(Integer, ForeignKey("event_types.id"))
    description = Column(Text)
    severity = Column(String(10), default="MEDIUM")
    report_count = Column(Integer, default=0)
    ai_explanation = Column(Text, nullable=True)
    status = Column(String(20), default="PENDING")

    region = relationship("Region", back_populates="events")
    event_type = relationship("EventType", back_populates="events")
    price_history = relationship("PriceHistory", back_populates="event")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    origin_region_id = Column(Integer, ForeignKey("regions.id"))
    current_price = Column(Numeric(10, 2), nullable=False)
    market_status = Column(String(10), default="GREEN")
    status = Column(String(20), default="ACTIVE")

    origin_region = relationship("Region", back_populates="products", foreign_keys=[origin_region_id])
    price_history = relationship("PriceHistory", back_populates="product")


class PriceHistory(Base):
    __tablename__ = "price_history"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"))
    price = Column(Numeric(10, 2), nullable=False)
    recorded_date = Column(Date, nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    status = Column(String(20), default="ACTIVE")

    product = relationship("Product", back_populates="price_history")
    event = relationship("Event", back_populates="price_history")
