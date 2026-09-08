"""
Cabinet endpoints — this is where the app lets the user customise the
temperature/humidity setpoint for a cabinet/location according to whatever
component is stored there, and where the ESP32 posts live sensor readings.
"""

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth
from app.services.email_service import send_email, build_condition_violation_email

router = APIRouter(prefix="/cabinet", tags=["Cabinet Control"])


def _condition_status(setting: models.CabinetSetting) -> str:
    if setting.last_reported_temperature_c is None or setting.last_reported_humidity_percent is None:
        return "NO_DATA"

    temp_ok = abs(setting.last_reported_temperature_c - setting.target_temperature_c) <= 2.0
    humidity_ok = setting.last_reported_humidity_percent <= setting.target_humidity_percent
    return "OK" if (temp_ok and humidity_ok) else "OUT_OF_RANGE"


@router.post("", response_model=schemas.CabinetSettingOut, status_code=201)
def create_or_get_cabinet(
    payload: schemas.CabinetSettingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    existing = (
        db.query(models.CabinetSetting)
        .filter(models.CabinetSetting.cabinet_location == payload.cabinet_location)
        .first()
    )
    if existing:
        raise HTTPException(400, "Cabinet location already configured — use PATCH to update it")

    cabinet = models.CabinetSetting(**payload.model_dump())
    db.add(cabinet)
    db.commit()
    db.refresh(cabinet)
    return schemas.CabinetSettingOut(**cabinet.__dict__, condition_status=_condition_status(cabinet))


@router.get("", response_model=List[schemas.CabinetSettingOut])
def list_cabinets(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    cabinets = db.query(models.CabinetSetting).all()
    return [
        schemas.CabinetSettingOut(**c.__dict__, condition_status=_condition_status(c)) for c in cabinets
    ]


@router.patch("/{cabinet_location}", response_model=schemas.CabinetSettingOut)
def update_cabinet_setpoint(
    cabinet_location: str,
    payload: schemas.CabinetSettingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """User customises target temperature/humidity to suit whatever is now stored there."""
    cabinet = (
        db.query(models.CabinetSetting)
        .filter(models.CabinetSetting.cabinet_location == cabinet_location)
        .first()
    )
    if not cabinet:
        raise HTTPException(404, "Cabinet not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(cabinet, field, value)

    db.commit()
    db.refresh(cabinet)
    return schemas.CabinetSettingOut(**cabinet.__dict__, condition_status=_condition_status(cabinet))


@router.post("/{cabinet_location}/telemetry", response_model=schemas.CabinetSettingOut)
def post_telemetry(
    cabinet_location: str,
    reading: schemas.CabinetTelemetryIn,
    db: Session = Depends(get_db),
):
    """
    Called by the ESP32/controller (no user login — use a device API key
    in production, e.g. via a header dependency) to push a live reading.
    Triggers an immediate email alert on out-of-range conditions.
    """
    cabinet = (
        db.query(models.CabinetSetting)
        .filter(models.CabinetSetting.cabinet_location == cabinet_location)
        .first()
    )
    if not cabinet:
        raise HTTPException(404, "Cabinet not found")

    cabinet.last_reported_temperature_c = reading.temperature_c
    cabinet.last_reported_humidity_percent = reading.humidity_percent
    cabinet.last_reading_at = datetime.utcnow()
    db.commit()
    db.refresh(cabinet)

    status_ = _condition_status(cabinet)

    if status_ == "OUT_OF_RANGE":
        # Alert every user who owns a component stored in this cabinet
        owners = (
            db.query(models.User)
            .join(models.Component, models.Component.owner_id == models.User.id)
            .filter(models.Component.cabinet_location == cabinet_location)
            .distinct()
            .all()
        )
        subject, body_html = build_condition_violation_email(
            cabinet_location, reading.temperature_c, reading.humidity_percent,
            cabinet.target_temperature_c, cabinet.target_humidity_percent,
        )
        for owner in owners:
            send_email(owner.email, subject, body_html)

    return schemas.CabinetSettingOut(**cabinet.__dict__, condition_status=status_)
