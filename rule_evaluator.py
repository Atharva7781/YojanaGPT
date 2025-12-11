from typing import Any, Dict, List, Optional, Union


def eval_operator(operator: str, user_value: Any, rule_value: Any) -> str:
    """
    Compare user_value vs rule_value using various operators.
    
    Args:
        operator: The comparison operator (=, !=, <, <=, >, >=, in, contains, between, exists)
        user_value: The value from user profile
        rule_value: The value from the rule to compare against
        
    Returns:
        str: "matched", "unmet", or "unknown"
    """
    # Handle unknown/missing values
    if user_value is None:
        return "unknown"
        
    try:
        # Try to convert both values to numbers if they look numeric
        def safe_convert(value):
            if isinstance(value, (int, float)):
                return float(value)
            try:
                return float(str(value).replace(',', ''))
            except (ValueError, TypeError):
                return str(value).lower() if isinstance(value, str) else value
        
        # Convert values for comparison if they're numeric
        user_val = safe_convert(user_value)
        rule_val = safe_convert(rule_value) if operator != "between" else rule_value
        
        # Special handling for exists operator
        if operator == "exists":
            return "matched" if user_value not in (None, False, "", "no", "false") else "unmet"
            
        # Handle between operator specially
        if operator == "between":
            if not isinstance(rule_value, dict) or "min" not in rule_value or "max" not in rule_value:
                return "unknown"
            min_val = safe_convert(rule_value["min"])
            max_val = safe_convert(rule_value["max"])
            if not all(isinstance(x, (int, float)) for x in (user_val, min_val, max_val)):
                return "unknown"
            return "matched" if min_val <= user_val <= max_val else "unmet"
        
        # Standard comparisons
        if operator == "=":
            return "matched" if user_val == rule_val else "unmet"
        elif operator == "!=":
            return "matched" if user_val != rule_val else "unmet"
        elif operator == "<":
            return "matched" if user_val < rule_val else "unmet"
        elif operator == "<=":
            return "matched" if user_val <= rule_val else "unmet"
        elif operator == ">":
            return "matched" if user_val > rule_val else "unmet"
        elif operator == ">=":
            return "matched" if user_val >= rule_val else "unmet"
        elif operator == "in":
            if not hasattr(rule_val, '__iter__') or isinstance(rule_val, str):
                return "unknown"
            return "matched" if user_val in rule_val else "unmet"
        elif operator == "contains":
            if not isinstance(user_val, str) or not isinstance(rule_val, str):
                return "unknown"
            return "matched" if rule_val.lower() in user_val.lower() else "unmet"
        else:
            return "unknown"
            
    except (ValueError, TypeError):
        return "unknown"


def get_user_value(profile: Dict[str, Any], field_path: str) -> Any:
    """
    Safely get a value from the user profile using dot notation and field mapping.
    
    Args:
        profile: The user profile dictionary
        field_path: Dot-separated path to the field (e.g., 'personal.age')
        
    Returns:
        The value from the profile or None if not found
    """
    if not profile or not field_path:
        return None
    
    # First try direct mapping from rule_field_to_profile_field.json
    mapped_field = None
    try:
        import json
        with open('rule_field_to_profile_field.json', 'r') as f:
            field_mapping = json.load(f)
        mapped_field = field_mapping.get(field_path, field_path)
    except (FileNotFoundError, json.JSONDecodeError):
        mapped_field = field_path
    
    # Handle dot notation for nested fields
    keys = mapped_field.split('.')
    value = profile
    
    try:
        for key in keys:
            # Handle list indices (e.g., 'addresses.0.city')
            if '[' in key and key.endswith(']'):
                list_key, idx = key.split('[')
                idx = int(idx[:-1])  # Remove the trailing ']' and convert to int
                value = value.get(list_key, [])[idx]
            else:
                value = value.get(key)
                if value is None:
                    return None
        return value
    except (KeyError, IndexError, AttributeError, TypeError):
        return None


def evaluate_scheme_rules(
    eligibility_structured: Dict[str, Any], 
    user_profile: Dict[str, Any]
) -> Dict[str, Any]:
    """
    Evaluate scheme rules against a user profile.
    
    Args:
        eligibility_structured: Dictionary with 'required' and 'optional' rule lists
        user_profile: Dictionary containing user profile data
        
    Returns:
        Dictionary containing evaluation results with scores and detailed clauses
    """
    # Initialize result structure
    result = {
        "R": 0.0,
        "required": {
            "score": 0.0,
            "total": 0,
            "matched": 0,
            "unmet": 0,
            "unknown": 0,
            "clauses": []
        },
        "optional": {
            "score": 0.0,
            "total": 0,
            "matched": 0,
            "unmet": 0,
            "unknown": 0,
            "clauses": []
        },
        "matched_clauses": [],
        "unmet_clauses": [],
        "unknown_clauses": []
    }
    
    if not eligibility_structured or not user_profile:
        return result
    
    def evaluate_rule(rule: Dict[str, Any], scope: str) -> Dict[str, Any]:
        """Evaluate a single rule and return the result."""
        field = rule.get("field", "")
        operator = rule.get("operator", "=")
        value = rule.get("value")
        text_span = rule.get("text_span", "")
        confidence = rule.get("confidence", 1.0)
        
        # Get user value using field mapping
        user_value = None
        profile_attr = None
        if field:
            user_value, profile_attr = get_user_value(user_profile, field), field
        
        # Evaluate the rule
        status = "unknown"
        if user_value is not None:
            status = eval_operator(operator, user_value, value)
        
        # Prepare clause result
        clause = {
            "scope": scope,
            "field": field,
            "profile_field": profile_attr,
            "operator": operator,
            "value": value,
            "user_value": user_value,
            "status": status,
            "text_span": text_span,
            "confidence": confidence
        }
        
        return clause, status
    
    # Evaluate required rules
    required_rules = eligibility_structured.get("required", [])
    for rule in required_rules:
        clause, status = evaluate_rule(rule, "required")
        result["required"]["total"] += 1
        result["required"][status] += 1
        result["required"]["clauses"].append(clause)
        
        # Categorize the clause
        if status == "matched":
            result["matched_clauses"].append(clause)
        elif status == "unmet":
            result["unmet_clauses"].append(clause)
        else:
            result["unknown_clauses"].append(clause)
    
    # Evaluate optional rules
    optional_rules = eligibility_structured.get("optional", [])
    for rule in optional_rules:
        clause, status = evaluate_rule(rule, "optional")
        result["optional"]["total"] += 1
        result["optional"][status] += 1
        result["optional"]["clauses"].append(clause)
        
        # Categorize the clause
        if status == "matched":
            result["matched_clauses"].append(clause)
        elif status == "unmet":
            result["unmet_clauses"].append(clause)
        else:
            result["unknown_clauses"].append(clause)
    
    # Calculate scores
    def calculate_score(rule_type: str) -> float:
        total = result[rule_type]["total"]
        if total == 0:
            return 1.0  # Default to passing if no rules of this type
        matched = result[rule_type]["matched"]
        unknown = result[rule_type]["unknown"]
        return (matched + 0.5 * unknown) / total
    
    result["required"]["score"] = calculate_score("required")
    result["optional"]["score"] = calculate_score("optional")
    
    # Calculate overall R score (80% required, 20% optional)
    required_weight = 0.8 if result["required"]["total"] > 0 else 0
    optional_weight = 0.2 if result["optional"]["total"] > 0 else 0
    total_weight = required_weight + optional_weight
    
    if total_weight > 0:
        result["R"] = (
            required_weight * result["required"]["score"] + 
            optional_weight * result["optional"]["score"]
        ) / total_weight
    
    return result


if __name__ == "__main__":
    # Example usage (will be removed in production)
    test_profile = {
        "personal": {
            "age": 30,
            "gender": "male",
            "income": 500000
        }
    }
    
    test_rules = {
        "min_age": {"field": "personal.age", "operator": ">=", "value": 18},
        "max_income": {"field": "personal.income", "operator": "<", "value": 1000000}
    }
    
    result = evaluate_scheme_rules(test_profile, test_rules)
    print(f"Evaluation result: {result}")
