from utils.date_utils import calculate_days_between


def check_idle(component, current_date):
    """
    Checks whether a component has been unused for too long.
    """

    required_fields = [
        "batchId",
        "partNumber",
        "manufacturer",
        "category",
        "lastAccessedDate"
    ]

    for field in required_fields:
        if field not in component or component[field] is None:
            return {
                "batchId": component.get("batchId"),
                "partNumber": component.get("partNumber"),
                "isIdle": False,
                "status": "Invalid Data",
                "error": f"Missing {field}"
            }

    try:
        idle_days = calculate_days_between(
            component["lastAccessedDate"],
            current_date
        )

        idle_limit = 30
        is_idle = idle_days > idle_limit

        return {
            "batchId": component["batchId"],
            "partNumber": component["partNumber"],
            "idleDays": idle_days,
            "idleLimit": idle_limit,
            "isIdle": is_idle
        }

    except (ValueError, TypeError):
        return {
            "batchId": component.get("batchId"),
            "partNumber": component.get("partNumber"),
            "isIdle": False,
            "status": "Invalid Data",
            "error": "Invalid last accessed date"
        }