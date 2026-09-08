from utils.date_utils import calculate_days_between


def check_idle(component, current_date):
    """
    Checks whether a component has been unused for too long.
    """

    idle_days = calculate_days_between(
        component["lastUsedDate"],
        current_date
    )

    idle_limit = component["idleLimit"]

    is_idle = idle_days > idle_limit

    return {
        "componentId": component["componentId"],
        "componentName": component["componentName"],
        "batch": component["batch"],
        "idleDays": idle_days,
        "idleLimit": idle_limit,
        "isIdle": is_idle
    }