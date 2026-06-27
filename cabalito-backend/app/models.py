from sqlalchemy import Column, Integer, String, Text, Numeric, Date, DateTime, ForeignKey, Double
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base


class Region(Base):
    __tablename__ = "regions"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    weather_api_location = Column(String(150))
    latitude = Column(Double)
    longitude = Column(Double)
    status = Column(String(20), default="ACTIVE")

    market_products = relationship("MarketProduct", back_populates="region")
    events = relationship("Event", back_populates="region")
    citizen_reports = relationship("CitizenReport", back_populates="region")


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
    citizen_reports = relationship("CitizenReport", back_populates="event")


class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(150), nullable=False)
    unit = Column(String(50), default="kg")
    category = Column(String(100), nullable=True)
    status = Column(String(20), default="ACTIVE")

    market_products = relationship("MarketProduct", back_populates="product")


class MarketProduct(Base):
    __tablename__ = "market_products"
    id = Column(Integer, primary_key=True, index=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    current_price = Column(Numeric(10, 2), nullable=False)
    market_status = Column(String(10), default="GREEN")
    status = Column(String(20), default="ACTIVE")
    last_updated = Column(DateTime, server_default=func.now(), onupdate=func.now())

    region = relationship("Region", back_populates="market_products")
    product = relationship("Product", back_populates="market_products")
    price_history = relationship("PriceHistory", back_populates="market_product")
    citizen_reports = relationship("CitizenReport", back_populates="market_product")


class PriceHistory(Base):
    __tablename__ = "price_history"
    id = Column(Integer, primary_key=True, index=True)
    market_product_id = Column(Integer, ForeignKey("market_products.id"), nullable=False)
    price = Column(Numeric(10, 2), nullable=False)
    recorded_date = Column(Date, nullable=False)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    status = Column(String(20), default="ACTIVE")

    market_product = relationship("MarketProduct", back_populates="price_history")
    event = relationship("Event", back_populates="price_history")


class CitizenReport(Base):
    __tablename__ = "citizen_reports"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=True)
    region_id = Column(Integer, ForeignKey("regions.id"), nullable=True)
    market_product_id = Column(Integer, ForeignKey("market_products.id"), nullable=True)
    reported_price = Column(Numeric(10, 2), nullable=True)
    reported_unit = Column(String(50), nullable=True)
    market_place_reference = Column(String(255), nullable=True)
    description = Column(Text, nullable=True)
    latitude = Column(Double, nullable=True)
    longitude = Column(Double, nullable=True)
    status = Column(String(20), default="PENDING")
    created_at = Column(DateTime, server_default=func.now())

    event = relationship("Event", back_populates="citizen_reports")
    region = relationship("Region", back_populates="citizen_reports")
    market_product = relationship("MarketProduct", back_populates="citizen_reports")
