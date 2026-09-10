def prioritize_fefo(lifecycle_results):
    """
    Prioritizes components based on the least remaining shelf life.
    First Expired, First Out (FEFO).
    """

    valid_components = []

    for component in lifecycle_results:
        if "remainingDays" in component:
            valid_components.append(component)

    sorted_components = sorted(
        valid_components,
        key=lambda component: component["remainingDays"]
    )

    return sorted_components