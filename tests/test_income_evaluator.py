from rule_evaluator import evaluate_scheme_rules

def test_monthly_income_used_for_evaluation():
    profile = {"monthly_income": 5000}
    rules = {"required": [{"field": "income_annual", "operator": "<=", "value": 70000}]}
    res = evaluate_scheme_rules(rules, profile)
    assert res["required"]["matched"] == 1

def test_income_annual_precedence():
    profile = {"monthly_income": 5000, "income_annual": 200000}
    rules = {"required": [{"field": "income_annual", "operator": "<=", "value": 70000}]}
    res = evaluate_scheme_rules(rules, profile)
    assert res["required"]["matched"] == 0
