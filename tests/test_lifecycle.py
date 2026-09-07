from services.lifecycle_service import calculate_lifecycle
from data.components import components


result = calculate_lifecycle(
    components[0],
    "2026-09-07"
)


print(result)