from utils.date_utils import calculate_days_between


def calculate_lifecycle(component, current_date):
    """
    Calculates the remaining shelf life of a component.
    """

    required_fields = [
        "batchId",
        "partNumber",
        "manufacturer",
        "category",
        "storedDate",
        "shelfLife"
    ]

    for field in required_fields:
        if field not in component or component[field] is None:
            return {
                "batchId": component.get("batchId"),
                "partNumber": component.get("partNumber"),
                "status": "Invalid Data",
                "error": f"Missing {field}"
            }

    try:
        stored_days = calculate_days_between(
            component["storedDate"],
            current_date
        )

        shelf_life = component["shelfLife"]
        remaining_days = shelf_life - stored_days

        if remaining_days < 0:
            status = "Shelf Life Exceeded"
        elif remaining_days <= shelf_life * 0.10:
            status = "Critical"
        elif remaining_days <= shelf_life * 0.30:
            status = "Approaching Limit"
        else:
            status = "Safe"

        return {
            "batchId": component["batchId"],
            "partNumber": component["partNumber"],
            "storedDays": stored_days,
            "remainingDays": remaining_days,
            "status": status
        }

    except (ValueError, TypeError):
        return {
            "batchId": component.get("batchId"),
            "partNumber": component.get("partNumber"),
            "status": "Invalid Data",
            "error": "Invalid date or shelf life"
        }