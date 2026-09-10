"""
Adapter between the FastAPI backend and Akhil's Smart Logic Engine.

This adapter only converts backend SQLAlchemy objects into the
12-parameter format expected by the Smart Logic Engine.

It does not modify the database, routes, scheduler, or existing services.
"""

import sys
from pathlib import Path


# Find the main smart-component-storage repository root
REPOSITORY_ROOT = Path(__file__).resolve().parents[3]

if str(REPOSITORY_ROOT) not in sys.path:
    sys.path.insert(0, str(REPOSITORY_ROOT))


from services.smart_logic_engine import (
    analyze_component,
    analyze_all_components,
)


def component_to_engine_data(component):
    """
    Convert a backend Component object into the
    12 parameters expected by the Smart Logic Engine.
    """

    return {
        "batchId": component.batch_id,
        "partNumber": component.part_number,
        "manufacturer": component.manufacturer,
        "category": component.category,
        "cabinetLocation": component.cabinet_location,
        "quantity": component.quantity,
        "storedDate": component.stored_date.isoformat(),
        "lastAccessedDate": (
            component.last_accessed_date.isoformat()
            if component.last_accessed_date is not None
            else None
        ),
        "minimumTemperature": component.min_temperature_c,
        "maximumTemperature": component.max_temperature_c,
        "maximumHumidity": component.max_humidity_percent,
        "shelfLife": component.shelf_life_days,
    }


def cabinet_to_environment_data(cabinet):
    """
    Convert backend cabinet telemetry into the
    environment format expected by the Smart Logic Engine.
    """

    if (
        cabinet.last_reported_temperature_c is None
        or cabinet.last_reported_humidity_percent is None
    ):
        return None

    return {
        "temperature": cabinet.last_reported_temperature_c,
        "humidity": cabinet.last_reported_humidity_percent,
    }


def analyze_backend_component(component, cabinet):
    """
    Analyze one backend component using its cabinet's
    latest telemetry.
    """

    component_data = component_to_engine_data(component)

    environment = cabinet_to_environment_data(cabinet)

    if environment is None:
        cabinet_environment = {}
    else:
        cabinet_environment = {
            component.cabinet_location: environment
        }

    return analyze_component(
        component_data,
        cabinet_environment
    )


def analyze_backend_components(components, cabinets):
    """
    Analyze multiple backend components and calculate
    FEFO priority using the Smart Logic Engine.
    """

    component_data = [
        component_to_engine_data(component)
        for component in components
    ]

    cabinet_environment = {}

    for cabinet in cabinets:
        environment = cabinet_to_environment_data(cabinet)

        if environment is not None:
            cabinet_environment[
                cabinet.cabinet_location
            ] = environment

    return analyze_all_components(
        component_data,
        cabinet_environment
    )