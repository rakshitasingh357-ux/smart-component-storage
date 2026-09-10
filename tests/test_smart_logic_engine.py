from services.smart_logic_engine import analyze_all_components
from data.components import components
from data.cabinet_environment import cabinet_environment


result = analyze_all_components(
    components,
    cabinet_environment
)

assert result["components"]
assert result["fefoPriority"]

for component in result["components"]:
    assert component["batchId"]
    assert component["partNumber"]

remaining_days = [
    component["remainingDays"]
    for component in result["fefoPriority"]
]

assert remaining_days == sorted(remaining_days)