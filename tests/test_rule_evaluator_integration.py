import json
import pandas as pd
import pytest

from rule_evaluator import evaluate_scheme_rules
from user_profile_model import UserProfile

SCHEME_ID = "a23c0261-7711-4213-aecf-6b7c4cc844ed"
PARQUET = "schemes_with_rules_llm.parquet"


def load_scheme_row(parquet_path: str, scheme_id: str):
    df = pd.read_parquet(parquet_path)
    row = df[df["scheme_id"] == scheme_id]
    assert len(row) == 1, f"scheme_id={scheme_id} not found in {parquet_path}"
    return row.iloc[0]


def make_rajasthan_farmer_profile() -> UserProfile:
    return UserProfile(
        user_id=None,
        state="Rajasthan",
        district="Jaipur",
        age=40,
        gender="male",
        category="General",
        income_annual=150000.0,
        occupation="Farmer",
        farmer=True,
        land_area=1.0,
        land_type="agricultural",
        documents={},
        extra_flags={},
    )


def test_diggy_evaluator_matches_all_required():
    row = load_scheme_row(PARQUET, SCHEME_ID)
    eligibility_structured = row.get("eligibility_structured")
    assert eligibility_structured is not None, "eligibility_structured missing in parquet for Diggy"
    if isinstance(eligibility_structured, str):
        eligibility_structured = json.loads(eligibility_structured)

    profile = make_rajasthan_farmer_profile()
    result = evaluate_scheme_rules(eligibility_structured, profile.model_dump())

    assert pytest.approx(result.get("R", 0.0), rel=1e-6) == 1.0

    required = result.get("required", {})
    assert required.get("total") == 2, f"expected 2 required clauses, got {required.get('total')}"
    assert required.get("matched") == 2, f"expected matched=2, got {required.get('matched')}"
    assert required.get("unmet") == 0

    matched = result.get("matched_clauses", [])
    fields = sorted([c.get("field") for c in matched])
    assert fields == ["occupation", "state"]
