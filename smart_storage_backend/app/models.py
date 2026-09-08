"""
ORM models.

User              -> app account, holds the registered email used for alerts
Component         -> one inventory row (matches the tabulated fields you asked for)
CabinetSetting    -> customised temp/humidity setpoint currently applied to a cabinet/location
AlertLog          -> record of every alert sent, so we never spam duplicate emails
"""

import enum
from datetime import datetime, date

from sqlalchemy import (
    Column, Integer, String, Float, Date, DateTime, ForeignKey, Enum, Boolean, Text
)
from sqlalchemy.orm import relationship

from app.database import Base


class UserRole(str, enum.Enum):
    admin = "admin"
    technician = "technician"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    full_name = Column(String(120), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)  # alert emails go here
    hashed_password = Column(String(255), nullable=False)
    role = Column(Enum(UserRole), default=UserRole.technician, nullable=False)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    components = relationship("Component", back_populates="owner")


class Component(Base):
    __tablename__ = "components"

    id = Column(Integer, primary_key=True, index=True)

    # --- Tabulated inventory fields ---
    batch_id = Column(String(80), index=True, nullable=False)
    part_number = Column(String(120), index=True, nullable=False)
    manufacturer = Column(String(120), nullable=False)
    category = Column(String(80), nullable=False)          # e.g. Capacitor, IC, Sensor
    cabinet_location = Column(String(80), nullable=False)  # e.g. Cabinet-A / Shelf-2
    quantity = Column(Integer, nullable=False, default=0)
    stored_date = Column(Date, nullable=False, default=date.today)
    last_accessed_date = Column(Date, nullable=True)

    # --- Manufacturer storage requirements ---
    min_temperature_c = Column(Float, nullable=False)
    max_temperature_c = Column(Float, nullable=False)
    max_humidity_percent = Column(Float, nullable=False)
    shelf_life_days = Column(Integer, nullable=False)

    # --- Bookkeeping ---
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    owner_id = Column(Integer, ForeignKey("users.id"))
    owner = relationship("User", back_populates="components")

    alerts = relationship("AlertLog", back_populates="component", cascade="all, delete-orphan")


class CabinetSetting(Base):
    """
    Lets the user customise the ACTIVE temperature/humidity setpoint of a physical
    cabinet/location — separate from a component's manufacturer-required range,
    so the dashboard can show "current setpoint" vs "required range" and flag mismatches.
    """
    __tablename__ = "cabinet_settings"

    id = Column(Integer, primary_key=True, index=True)
    cabinet_location = Column(String(80), unique=True, index=True, nullable=False)

    target_temperature_c = Column(Float, nullable=False, default=25.0)
    target_humidity_percent = Column(Float, nullable=False, default=40.0)

    # last readings reported by the ESP32/sensor node (updated via /cabinet/{id}/telemetry)
    last_reported_temperature_c = Column(Float, nullable=True)
    last_reported_humidity_percent = Column(Float, nullable=True)
    last_reading_at = Column(DateTime, nullable=True)

    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class AlertType(str, enum.Enum):
    shelf_life_approaching = "shelf_life_approaching"
    shelf_life_exceeded = "shelf_life_exceeded"
    idle_stock = "idle_stock"
    condition_violation = "condition_violation"


class AlertLog(Base):
    __tablename__ = "alert_logs"

    id = Column(Integer, primary_key=True, index=True)
    component_id = Column(Integer, ForeignKey("components.id"))
    component = relationship("Component", back_populates="alerts")

    alert_type = Column(Enum(AlertType), nullable=False)
    message = Column(Text, nullable=False)
    sent_at = Column(DateTime, default=datetime.utcnow)
    email_sent_to = Column(String(255), nullable=False)
