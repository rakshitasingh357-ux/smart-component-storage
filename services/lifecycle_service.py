from utils.date_utils import calculate_days_between


def calculate_lifecycle(component, current_date):
    stored_days = calculate_days_between(
        component["storedDate"],
        current_date
    )

    storage_limit = component["storageLimit"]

    remaining_days = storage_limit - stored_days

    if remaining_days < 0:
        status = "Storage Limit Exceeded"

    elif remaining_days <= storage_limit * 0.10:
        status = "Critical"

    elif remaining_days <= storage_limit * 0.30:
        status = "Approaching Limit"

    else:
        status = "Safe"

    return {
        "componentId": component["componentId"],
        "componentName": component["componentName"],
        "batch": component["batch"],
        "storedDays": stored_days,
        "remainingDays": remaining_days,
        "status": status
    }