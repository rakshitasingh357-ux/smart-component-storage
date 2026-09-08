"""
Alert endpoints for manually triggering shelf-life email alerts.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app import auth, models
from app.services.scheduler import check_shelf_life_and_alert

router = APIRouter(prefix="/api/alerts", tags=["Alerts"])


@router.post("/send-email")
def send_alert_emails(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    """
    Manually trigger the shelf-life alert checker.

    The existing scheduler checks for expired/near-expiry components
    and sends emails to their registered owners.
    """

    check_shelf_life_and_alert()

    return {
        "status": "success",
        "message": "Shelf-life alert check completed."
    }