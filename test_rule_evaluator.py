import json
from typing import Dict, Any
from user_profile_model import UserProfile
from rule_evaluator import evaluate_scheme_rules

def print_evaluation_results(results: Dict[str, Any]) -> None:
    """Helper function to print evaluation results in a readable format."""
    print("\n" + "="*50)
    print(f"Overall Score (R): {results['R']:.2f}")
    print("-"*50)
    
    print("\nRequired Rules:")
    print(f"  Score: {results['required']['score']:.2f} "
          f"(Matched: {results['required']['matched']}/"
          f"{results['required']['total']})")
    
    print("\nOptional Rules:")
    print(f"  Score: {results['optional']['score']:.2f} "
          f"(Matched: {results['optional']['matched']}/"
          f"{results['optional']['total']})")
    
    print("\nClause Summary:")
    print(f"  Matched: {len(results['matched_clauses'])}")
    print(f"  Unmet: {len(results['unmet_clauses'])}")
    print(f"  Unknown: {len(results['unknown_clauses'])}")
    print("="*50 + "\n")

def test_case_1() -> None:
    """Test case 1: Basic eligibility with all conditions met."""
    print("\n" + "="*20 + " TEST CASE 1: BASIC ELIGIBILITY " + "="*20)
    
    # Sample user profile
    user_profile = UserProfile(
        state="Karnataka",
        age=30,
        gender="female",
        income_annual=450000,
        category="OBC",
        education_level="graduate"
    )
    
    # Sample eligibility rules
    eligibility_rules = {
        "required": [
            {"field": "state", "operator": "=", "value": "Karnataka", 
             "text_span": "Must be a resident of Karnataka", "confidence": 0.95},
            {"field": "age", "operator": ">=", "value": 18,
             "text_span": "Must be at least 18 years old", "confidence": 0.98},
            {"field": "income_annual", "operator": "<", "value": 500000,
             "text_span": "Annual income less than ₹5,00,000", "confidence": 0.92}
        ],
        "optional": [
            {"field": "education_level", "operator": "in", 
             "value": ["graduate", "postgraduate", "doctorate"],
             "text_span": "Preferred: Graduate or higher education", "confidence": 0.85}
        ]
    }
    
    # Evaluate rules
    results = evaluate_scheme_rules(eligibility_rules, user_profile.dict())
    print_evaluation_results(results)
    
    # Expected: All required and optional rules should pass
    assert results["R"] == 1.0
    assert len(results["matched_clauses"]) == 4
    print("✅ Test Case 1 Passed: All conditions met")

def test_case_2() -> None:
    """Test case 2: Some conditions unmet and some unknown fields."""
    print("\n" + "="*20 + " TEST CASE 2: MIXED RESULTS " + "="*20)
    
    # Sample user profile with missing and non-matching fields
    user_profile = UserProfile(
        state="Maharashtra",  # Doesn't match required state
        age=16,  # Below required age
        gender="male",
        # income_annual not provided (unknown)
        category="General",
        education_level="12th"  # Doesn't match preferred education
    )
    
    # Same eligibility rules as test case 1
    eligibility_rules = {
        "required": [
            {"field": "state", "operator": "=", "value": "Karnataka", 
             "text_span": "Must be a resident of Karnataka", "confidence": 0.95},
            {"field": "age", "operator": ">=", "value": 18,
             "text_span": "Must be at least 18 years old", "confidence": 0.98},
            {"field": "income_annual", "operator": "<", "value": 500000,
             "text_span": "Annual income less than ₹5,00,000", "confidence": 0.92}
        ],
        "optional": [
            {"field": "education_level", "operator": "in", 
             "value": ["graduate", "postgraduate", "doctorate"],
             "text_span": "Preferred: Graduate or higher education", "confidence": 0.85}
        ]
    }
    
    # Evaluate rules
    results = evaluate_scheme_rules(eligibility_rules, user_profile.dict())
    print_evaluation_results(results)
    
    # Expected:
    # - Required: 0/3 passed (state and age don't match, income unknown)
    # - Optional: 0/1 passed (education doesn't match)
    # - R-score should be between 0 and 0.5 (due to unknown fields)
    assert results["R"] < 0.5
    assert len(results["unmet_clauses"]) >= 2  # state and age
    assert len(results["unknown_clauses"]) == 1  # income_annual
    print("✅ Test Case 2 Passed: Mixed results handled correctly")

def test_case_3() -> None:
    """Test case 3: Complex conditions with dates and numeric ranges."""
    print("\n" + "="*20 + " TEST CASE 3: COMPLEX CONDITIONS " + "="*20)
    
    # Sample user profile with various data types
    user_profile = UserProfile(
        state="Karnataka",
        age=45,
        gender="female",
        income_annual=750000,
        category="SC",
        farmer=True,
        land_area=2.5,
        established_date="2020-01-15"
    )
    
    # More complex eligibility rules
    eligibility_rules = {
        "required": [
            {"field": "state", "operator": "in", 
             "value": ["Karnataka", "Andhra Pradesh", "Tamil Nadu"],
             "text_span": "Must be from specified states", "confidence": 0.97},
            {"field": "category", "operator": "in", 
             "value": ["SC", "ST", "OBC"],
             "text_span": "Must belong to SC/ST/OBC category", "confidence": 0.99},
            {"field": "farmer", "operator": "=", "value": True,
             "text_span": "Must be a farmer", "confidence": 0.95},
            {"field": "land_area", "operator": "between", 
             "value": {"min": 1, "max": 5},
             "text_span": "Land holding between 1-5 acres", "confidence": 0.90}
        ],
        "optional": [
            {"field": "established_date", "operator": ">=", 
             "value": "2018-01-01",
             "text_span": "Established after 2018", "confidence": 0.88},
            {"field": "age", "operator": "<", "value": 50,
             "text_span": "Age below 50 years", "confidence": 0.95}
        ]
    }
    
    # Evaluate rules
    results = evaluate_scheme_rules(eligibility_rules, user_profile.dict())
    print_evaluation_results(results)
    
    # Expected:
    # - 2 out of 4 required rules pass (50%)
    # - 2 out of 2 optional rules pass (100%)
    # Weighted score: 0.8 * 0.5 + 0.2 * 1.0 = 0.6
    assert abs(results["R"] - 0.6) < 0.01  # Allow for floating point precision
    assert len(results["matched_clauses"]) == 4  # 2 from required + 2 from optional
    assert len(results["unmet_clauses"]) == 2   # 2 required rules didn't match
    print("✅ Test Case 3 Passed: Complex conditions evaluated correctly")

if __name__ == "__main__":
    # Run all test cases
    test_case_1()
    test_case_2()
    test_case_3()
    
    print("\n" + "🎉 All test cases completed successfully!")
    print("\n👉 Stage 4 completed — Next stage")
