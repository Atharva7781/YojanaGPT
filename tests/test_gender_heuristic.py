from gender_utils import extract_scheme_gender

def test_title_female_detected():
    s = {"scheme_name": "Mahila Kisan Yojana (Maharashtra)", "eligibility_structured": None}
    gender, conf, prov = extract_scheme_gender(s)
    assert gender == "female"
    assert conf >= 0.8
    assert prov in ("title_heuristic",)

def test_required_gender_precedence():
    s = {
        "scheme_name": "Some Scheme",
        "eligibility_structured": {"required": [{"field": "gender", "operator": "=", "value": "male"}]},
    }
    gender, conf, prov = extract_scheme_gender(s)
    assert gender == "male"
    assert prov == "required_clause"
    assert conf >= 0.9
