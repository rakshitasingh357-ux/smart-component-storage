from datetime import datetime


def create_alert(component, alert_type, severity, message, recommendation):
    return {
        "batchId": component["batchId"],
        "partNumber": component["partNumber"],
        "alertType": alert_type,
        "severity": severity,
        "message": message,
        "recommendation": recommendation,
        "timestamp": datetime.now().isoformat()
    }


def generate_environment_alert(component, environment_result):
    if environment_result["environmentSafe"]:
        return None

    problems = []

    if not environment_result["temperatureSafe"]:
        problems.append("Temperature is outside the safe range")

    if not environment_result["humiditySafe"]:
        problems.append("Humidity is above the maximum allowed level")

    return create_alert(
        component,
        "Environment",
        "High",
        " and ".join(problems),
        "Adjust the cabinet temperature or humidity to the required range"
    )


def generate_lifecycle_alert(component, lifecycle_result):
    status = lifecycle_result["status"]

    if status == "Safe":
        return None

    if status == "Shelf Life Exceeded":
        severity = "Critical"
        message = "Component has exceeded its shelf life"
        recommendation = "Remove the component from storage"

    elif status == "Critical":
        severity = "High"
        message = "Component is critically close to its shelf life limit"
        recommendation = "Prioritize this component for use"

    else:
        severity = "Medium"
        message = "Component is approaching its shelf life limit"
        recommendation = "Plan to use this component soon"

    return create_alert(
        component,
        "Lifecycle",
        severity,
        message,
        recommendation
    )


def generate_idle_alert(component, idle_result):
    if not idle_result["isIdle"]:
        return None

    return create_alert(
        component,
        "Idle",
        "Medium",
        "Component has been unused for too long",
        "Prioritize this component for use"
    )


def generate_all_alerts(
    component,
    environment_result,
    lifecycle_result,
    idle_result
):
    alerts = []

    environment_alert = generate_environment_alert(
        component,
        environment_result
    )

    lifecycle_alert = generate_lifecycle_alert(
        component,
        lifecycle_result
    )

    idle_alert = generate_idle_alert(
        component,
        idle_result
    )

    if environment_alert is not None:
        alerts.append(environment_alert)

    if lifecycle_alert is not None:
        alerts.append(lifecycle_alert)

    if idle_alert is not None:
        alerts.append(idle_alert)

    return alerts