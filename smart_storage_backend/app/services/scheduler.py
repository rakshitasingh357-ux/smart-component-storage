"""
Background job (APScheduler) that periodically scans the inventory and
emails the owning user when a component is approaching (or has exceeded)
its manufacturer shelf-life limit.

Duplicate-alert protection: for each (component, alert_type) we only send
one email per calendar day, tracked via AlertLog.
"""

import logging
from datetime import date, datetime, timedelta

from apscheduler.schedulers.background import BackgroundScheduler
from sqlalchemy.orm import Session

from app.database import SessionLocal
from app.config import settings
from app import models
from app.services.email_service import send_email, build_shelf_life_email

logger = logging.getLogger("scheduler")

scheduler = BackgroundScheduler()


def _already_alerted_today(db: Session, component_id: int, alert_type: models.AlertType) -> bool:
    today_start = datetime.combine(date.today(), datetime.min.time())
    existing = (
        db.query(models.AlertLog)
        .filter(
            models.AlertLog.component_id == component_id,
            models.AlertLog.alert_type == alert_type,
            models.AlertLog.sent_at >= today_start,
        )
        .first()
    )
    return existing is not None


def check_shelf_life_and_alert():
    """Scans all components; emails the owner if nearing/over shelf-life limit."""
    db: Session = SessionLocal()
    try:
        components = db.query(models.Component).all()
        today = date.today()

        for component in components:
            days_in_storage = (today - component.stored_date).days
            days_remaining = component.shelf_life_days - days_in_storage

            if days_remaining > settings.SHELF_LIFE_ALERT_THRESHOLD_DAYS:
                continue  # not close enough yet

            alert_type = (
                models.AlertType.shelf_life_exceeded
                if days_remaining <= 0
                else models.AlertType.shelf_life_approaching
            )

            if _already_alerted_today(db, component.id, alert_type):
                continue

            owner = component.owner
            if owner is None or not owner.email:
                logger.warning("Component %s has no owner/email — skipping alert", component.id)
                continue

            subject, body_html = build_shelf_life_email(component, days_in_storage, days_remaining)
            sent = send_email(owner.email, subject, body_html)

            if sent:
                log_entry = models.AlertLog(
                    component_id=component.id,
                    alert_type=alert_type,
                    message=f"{days_in_storage} days stored / {component.shelf_life_days} day limit "
                            f"({days_remaining} day(s) remaining)",
                    email_sent_to=owner.email,
                )
                db.add(log_entry)
                db.commit()
    except Exception:
        logger.exception("check_shelf_life_and_alert failed")
    finally:
        db.close()


def start_scheduler():
    interval_hours = settings.ALERT_CHECK_INTERVAL_HOURS
    scheduler.add_job(
        check_shelf_life_and_alert,
        "interval",
        hours=interval_hours,
        id="shelf_life_check",
        replace_existing=True,
        next_run_time=datetime.now(),  # run once immediately on startup too
    )
    scheduler.start()
    logger.info("Scheduler started — checking shelf life every %s hour(s)", interval_hours)


def stop_scheduler():
    scheduler.shutdown(wait=False)
