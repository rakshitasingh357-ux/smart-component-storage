"""
Inventory endpoints — backs the app's inventory table:
Batch ID, Part Number, Manufacturer, Category, Cabinet Location, Quantity,
Stored Date, Last Accessed Date, Min/Max Temperature, Max Humidity, Shelf Life.

Also computes derived fields (days_in_storage, days_until_shelf_life, status)
and exposes a FEFO-sorted endpoint.
"""

from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models, schemas, auth

router = APIRouter(prefix="/inventory", tags=["Inventory"])


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
