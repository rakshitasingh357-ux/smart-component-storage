def check_environment(component, current_temperature, current_humidity):
    """
    Checks whether the current temperature and humidity
    are within the component's safe storage limits.
    """

    required_fields = [
        "batchId",
        "partNumber",
        "minimumTemperature",
        "maximumTemperature",
        "maximumHumidity"
    ]

    for field in required_fields:
        if field not in component or component[field] is None:
            return {
                "batchId": component.get("batchId"),
                "partNumber": component.get("partNumber"),
                "temperatureSafe": False,
                "humiditySafe": False,
                "environmentSafe": False,
                "error": f"Missing {field}"
            }

    if current_temperature is None or current_humidity is None:
        return {
            "batchId": component.get("batchId"),
            "partNumber": component.get("partNumber"),
            "temperatureSafe": False,
            "humiditySafe": False,
            "environmentSafe": False,
            "error": "Missing current temperature or humidity"
        }

    temperature_safe = (
        component["minimumTemperature"]
        <= current_temperature
        <= component["maximumTemperature"]
    )

    humidity_safe = (
        current_humidity <= component["maximumHumidity"]
    )

    return {
        "batchId": component["batchId"],
        "partNumber": component["partNumber"],
        "currentTemperature": current_temperature,
        "currentHumidity": current_humidity,
        "temperatureSafe": temperature_safe,
        "humiditySafe": humidity_safe,
        "environmentSafe": temperature_safe and humidity_safe
    }