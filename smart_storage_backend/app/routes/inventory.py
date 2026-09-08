"""
Inventory endpoints — backs the app's inventory table:
Batch ID, Part Number, Manufacturer, Category, Cabinet Location, Quantity,
Stored Date, Last Accessed Date, Min/Max Temperature, Max Humidity, Shelf Life.

Also computes derived fields (days_in_storage, days_until_shelf_life, status)
and exposes a FEFO-sorted endpoint.
"""

from datetime import date
from typing import List, Optional
from io import BytesIO

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth


router = APIRouter(prefix="/inventory", tags=["Inventory"])
api_router = APIRouter(prefix="/api/inventory", tags=["Inventory"])


def _to_component_out(component: models.Component) -> schemas.ComponentOut:
    today = date.today()
    days_in_storage = (today - component.stored_date).days
    days_until_shelf_life = component.shelf_life_days - days_in_storage

    if days_until_shelf_life <= 0:
        status_ = "EXPIRED"
    elif days_until_shelf_life <= 7:
        status_ = "APPROACHING_LIMIT"
    else:
        status_ = "OK"

    return schemas.ComponentOut(
        **{c.name: getattr(component, c.name) for c in component.__table__.columns},
        days_in_storage=days_in_storage,
        days_until_shelf_life=days_until_shelf_life,
        status=status_,
    )


@router.post("", response_model=schemas.ComponentOut, status_code=201)
def create_component(
    payload: schemas.ComponentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    if payload.min_temperature_c > payload.max_temperature_c:
        raise HTTPException(400, "min_temperature_c cannot exceed max_temperature_c")

    component = models.Component(**payload.model_dump(), owner_id=current_user.id)
    db.add(component)
    db.commit()
    db.refresh(component)
    return _to_component_out(component)


@router.get("", response_model=List[schemas.ComponentOut])
def list_components(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
    category: Optional[str] = None,
    cabinet_location: Optional[str] = None,
    search: Optional[str] = Query(None, description="Matches part number or batch ID"),
    sort_by_fefo: bool = Query(False, description="Sort so soonest-to-expire batches come first"),
):
    q = db.query(models.Component)

    if category:
        q = q.filter(models.Component.category == category)
    if cabinet_location:
        q = q.filter(models.Component.cabinet_location == cabinet_location)
    if search:
        like = f"%{search}%"
        q = q.filter(
            (models.Component.part_number.ilike(like)) | (models.Component.batch_id.ilike(like))
        )

    components = q.all()
    results = [_to_component_out(c) for c in components]

    if sort_by_fefo:
        results.sort(key=lambda r: r.days_until_shelf_life)  # soonest expiry first

    return results

@api_router.get("/export-excel")
def export_inventory_excel(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Export the user's inventory as an Excel spreadsheet."""

    components = (
        db.query(models.Component)
        .filter(models.Component.owner_id == current_user.id)
        .all()
    )

    data = []

    for component in components:
        today = date.today()
        days_in_storage = (today - component.stored_date).days
        days_until_shelf_life = component.shelf_life_days - days_in_storage

        if days_until_shelf_life <= 0:
            status = "EXPIRED"
        elif days_until_shelf_life <= 7:
            status = "APPROACHING_LIMIT"
        else:
            status = "OK"

        data.append({
            "Batch ID": component.batch_id,
            "Part Number": component.part_number,
            "Manufacturer": component.manufacturer,
            "Category": component.category,
            "Cabinet Location": component.cabinet_location,
            "Quantity": component.quantity,
            "Stored Date": component.stored_date,
            "Last Accessed Date": component.last_accessed_date,
            "Min Temperature (°C)": component.min_temperature_c,
            "Max Temperature (°C)": component.max_temperature_c,
            "Max Humidity (%)": component.max_humidity_percent,
            "Shelf Life (days)": component.shelf_life_days,
            "Days in Storage": days_in_storage,
            "Days Until Shelf Life": days_until_shelf_life,
            "Status": status,
            "Notes": component.notes,
        })

    df = pd.DataFrame(data)

    output = BytesIO()

    with pd.ExcelWriter(output, engine="openpyxl") as writer:
        df.to_excel(writer, index=False, sheet_name="Inventory")

    output.seek(0)

    return StreamingResponse(
        output,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={
            "Content-Disposition": "attachment; filename=inventory_export.xlsx"
        },
    )

    
@router.get("/{component_id}", response_model=schemas.ComponentOut)
def get_component(
    component_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not component:
        raise HTTPException(404, "Component not found")
    return _to_component_out(component)


@router.patch("/{component_id}", response_model=schemas.ComponentOut)
def update_component(
    component_id: int,
    payload: schemas.ComponentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not component:
        raise HTTPException(404, "Component not found")

    updates = payload.model_dump(exclude_unset=True)
    for field, value in updates.items():
        setattr(component, field, value)

    db.commit()
    db.refresh(component)
    return _to_component_out(component)


@router.post("/{component_id}/mark-accessed", response_model=schemas.ComponentOut)
def mark_accessed(
    component_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """Quick action: user taps 'used/inspected' on a batch -> updates last_accessed_date."""
    component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not component:
        raise HTTPException(404, "Component not found")

    component.last_accessed_date = date.today()
    db.commit()
    db.refresh(component)
    return _to_component_out(component)


@router.delete("/{component_id}", status_code=204)
def delete_component(
    component_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    component = db.query(models.Component).filter(models.Component.id == component_id).first()
    if not component:
        raise HTTPException(404, "Component not found")
    db.delete(component)
    db.commit()
    return None
