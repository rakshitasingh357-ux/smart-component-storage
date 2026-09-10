from datetime import date

from services.lifecycle_service import calculate_lifecycle
from services.idle_service import check_idle
from services.environment_service import check_environment
from services.alert_service import generate_all_alerts
from services.fefo_service import prioritize_fefo


def analyze_component(component, cabinet_environment, current_date=None):
    """
    Runs all Smart Logic checks for a component
    using the environment of its cabinet.
    """

    if current_date is None:
        current_date = date.today().isoformat()

    cabinet = cabinet_environment.get(
        component["cabinetLocation"]
    )

    if cabinet is None:
        current_temperature = None
        current_humidity = None
    else:
        current_temperature = cabinet["temperature"]
        current_humidity = cabinet["humidity"]

    lifecycle_result = calculate_lifecycle(
        component,
        current_date
    )

    idle_result = check_idle(
        component,
        current_date
    )

    environment_result = check_environment(
        component,
        current_temperature,
        current_humidity
    )

    alerts = generate_all_alerts(
        component,
        environment_result,
        lifecycle_result,
        idle_result
    )

    return {
        "batchId": component["batchId"],
        "partNumber": component["partNumber"],
        "manufacturer": component["manufacturer"],
        "category": component["category"],
        "cabinetLocation": component["cabinetLocation"],
        "quantity": component["quantity"],
        "lifecycle": lifecycle_result,
        "idle": idle_result,
        "environment": environment_result,
        "alerts": alerts
    }


def analyze_all_components(
    components,
    cabinet_environment,
    current_date=None
):
    """
    Analyzes all components and prioritizes them using FEFO.
    """

    if current_date is None:
        current_date = date.today().isoformat()

    results = []

    for component in components:
        result = analyze_component(
            component,
            cabinet_environment,
            current_date
        )

        results.append(result)

    lifecycle_results = [
        result["lifecycle"]
        for result in results
    ]

    fefo_priority = prioritize_fefo(
        lifecycle_results
    )

    return {
        "components": results,
        "fefoPriority": fefo_priority
    }