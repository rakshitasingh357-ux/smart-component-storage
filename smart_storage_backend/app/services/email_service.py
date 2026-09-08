"""
Simple SMTP email service used to send shelf-life / condition alert emails
to the user's registered address.
"""

import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

from app.config import settings

logger = logging.getLogger("email_service")


def send_email(to_email: str, subject: str, body_html: str) -> bool:
    """
    Sends an HTML email via SMTP. Returns True on success, False on failure
    (failures are logged, not raised, so a bad SMTP config doesn't crash
    the alert-checking background job).
    """
    if not settings.SMTP_USERNAME or not settings.SMTP_PASSWORD:
        logger.warning("SMTP credentials not configured — skipping email send to %s", to_email)
        return False

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.SMTP_FROM_NAME} <{settings.SMTP_USERNAME}>"
    msg["To"] = to_email
    msg.attach(MIMEText(body_html, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.starttls()
            server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
            server.sendmail(settings.SMTP_USERNAME, [to_email], msg.as_string())
        logger.info("Alert email sent to %s", to_email)
        return True
    except Exception as exc:
        logger.error("Failed to send email to %s: %s", to_email, exc)
        return False


def build_shelf_life_email(component, days_in_storage: int, days_remaining: int) -> tuple[str, str]:
    """Returns (subject, html_body) for a shelf-life alert."""
    if days_remaining <= 0:
        subject = f"⚠ Shelf-life EXCEEDED: {component.part_number} (Batch {component.batch_id})"
        status_line = f"<b style='color:#c0392b;'>Shelf life exceeded by {abs(days_remaining)} day(s).</b>"
    else:
        subject = f"⏰ Attention needed soon: {component.part_number} (Batch {component.batch_id})"
        status_line = f"<b style='color:#e67e22;'>Only {days_remaining} day(s) left before the shelf-life limit.</b>"

    body_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Smart Component Storage — Lifecycle Alert</h2>
        <p>{status_line}</p>
        <table style="border-collapse: collapse;" cellpadding="6">
          <tr><td><b>Part Number</b></td><td>{component.part_number}</td></tr>
          <tr><td><b>Batch ID</b></td><td>{component.batch_id}</td></tr>
          <tr><td><b>Manufacturer</b></td><td>{component.manufacturer}</td></tr>
          <tr><td><b>Category</b></td><td>{component.category}</td></tr>
          <tr><td><b>Cabinet Location</b></td><td>{component.cabinet_location}</td></tr>
          <tr><td><b>Quantity</b></td><td>{component.quantity}</td></tr>
          <tr><td><b>Stored Since</b></td><td>{component.stored_date}</td></tr>
          <tr><td><b>Days in Storage</b></td><td>{days_in_storage}</td></tr>
          <tr><td><b>Shelf Life Limit</b></td><td>{component.shelf_life_days} days</td></tr>
        </table>
        <p>Recommendation: Prioritize this batch for use/inspection according to
        manufacturer guidance (FEFO — First-Expire, First-Out).</p>
      </body>
    </html>
    """
    return subject, body_html


def build_condition_violation_email(cabinet_location: str, temperature_c: float, humidity_percent: float,
                                     target_temperature_c: float, target_humidity_percent: float) -> tuple[str, str]:
    subject = f"🚨 Storage condition violation: {cabinet_location}"
    body_html = f"""
    <html>
      <body style="font-family: Arial, sans-serif;">
        <h2>Smart Component Storage — Condition Violation</h2>
        <p><b style="color:#c0392b;">Cabinet '{cabinet_location}' is outside its target range.</b></p>
        <table style="border-collapse: collapse;" cellpadding="6">
          <tr><td><b>Reported Temperature</b></td><td>{temperature_c} °C</td></tr>
          <tr><td><b>Target Temperature</b></td><td>{target_temperature_c} °C</td></tr>
          <tr><td><b>Reported Humidity</b></td><td>{humidity_percent} %</td></tr>
          <tr><td><b>Target Humidity</b></td><td>{target_humidity_percent} %</td></tr>
        </table>
        <p>Please inspect the cabinet and the components stored in this location.</p>
      </body>
    </html>
    """
    return subject, body_html
