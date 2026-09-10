from services.lifecycle_service import calculate_lifecycle
from services.idle_service import check_idle
from services.environment_service import check_environment
from services.fefo_service import prioritize_fefo


def test_lifecycle():
    component = {
        "batchId": "TEST001",
        "partNumber": "TEST-PART",
        "manufacturer": "Test",
        "category": "Sensor",
        "storedDate": "2026-08-01",
        "shelfLife": 90
    }

    result = calculate_lifecycle(
        component,
        "2026-09-01"
    )

    assert result["remainingDays"] == 59
    assert result["status"] == "Safe"


def test_idle():
    component = {
        "batchId": "TEST002",
        "partNumber": "TEST-PART",
        "manufacturer": "Test",
        "category": "Sensor",
        "lastAccessedDate": "2026-07-01"
    }

    result = check_idle(
        component,
        "2026-09-01"
    )

    assert result["idleDays"] == 62
    assert result["isIdle"] is True


def test_environment_safe():
    component = {
        "batchId": "TEST003",
        "partNumber": "TEST-PART",
        "minimumTemperature": 20,
        "maximumTemperature": 25,
        "maximumHumidity": 60
    }

    result = check_environment(
        component,
        23,
        50
    )

    assert result["temperatureSafe"] is True
    assert result["humiditySafe"] is True
    assert result["environmentSafe"] is True


def test_environment_unsafe():
    component = {
        "batchId": "TEST004",
        "partNumber": "TEST-PART",
        "minimumTemperature": 20,
        "maximumTemperature": 25,
        "maximumHumidity": 60
    }

    result = check_environment(
        component,
        30,
        70
    )

    assert result["temperatureSafe"] is False
    assert result["humiditySafe"] is False
    assert result["environmentSafe"] is False


def test_fefo():
    lifecycle_results = [
        {
            "batchId": "B001",
            "partNumber": "P001",
            "remainingDays": 50
        },
        {
            "batchId": "B002",
            "partNumber": "P002",
            "remainingDays": 10
        },
        {
            "batchId": "B003",
            "partNumber": "P003",
            "remainingDays": 25
        }
    ]

    result = prioritize_fefo(lifecycle_results)

    assert result[0]["batchId"] == "B002"
    assert result[1]["batchId"] == "B003"
    assert result[2]["batchId"] == "B001"