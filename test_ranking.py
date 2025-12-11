from user_profile_model import UserProfile
from ranking import rank_schemes

def test_karnataka_farmer():
    print("\n" + "="*80)
    print("TEST CASE 1: KARNATAKA FARMER")
    print("="*80)
    
    # Create a sample farmer profile from Karnataka with low income
    profile = UserProfile(
        state="Karnataka",
        district="Tumkur",
        age=45,
        gender="male",
        category="SC",
        income_annual=120000,  # Low income
        occupation="Farmer",
        farmer=True,
        land_area=2.5,  # Small land holding
        land_type="agricultural"
    )

    # Test query for irrigation subsidies
    query = "looking for subsidy for irrigation"
    
    print(f"Testing ranking for: {query}")
    print("Profile:", profile.dict())
    print("-" * 80)
    
    # Get ranked schemes
    results = rank_schemes(
        profile=profile,
        free_text=query,
        top_k=5,
        w_r=0.6,  # Higher weight for rules
        w_s=0.3,  # Medium weight for semantic similarity
        w_f=0.1   # Small weight for freshness
    )
    
    # Print results
    for i, scheme in enumerate(results, 1):
        print(f"\n{i}. {scheme['scheme_name']}")
        print(f"   Match: {scheme['percent_match']}%")
        print(f"   R: {scheme['R']:.3f} (Rules), S: {scheme['S']:.3f} (Semantic), F: {scheme['F']:.3f} (Freshness)")
        print(f"   Scheme ID: {scheme.get('scheme_id', 'N/A')}")
        print(f"   URL: {scheme.get('source_url', 'N/A')}")
        print(f"   Description: {scheme.get('description', 'No description')}")

def test_rajasthan_farmer():
    print("\n" + "="*80)
    print("TEST CASE 2: RAJASTHAN FARMER (DIGGY)")
    print("="*80)
    
    # Create a Rajasthan farmer profile that should match Diggy scheme
    profile_rj = UserProfile(
        state="Rajasthan",
        district="Jaipur",
        age=40,
        gender="male",
        category="General",
        income_annual=150000.0,
        occupation="Farmer",
        farmer=True,
        land_area=1.0,  # > 0.5 hectares
        land_type="agricultural"
    )

    query_rj = "looking for subsidy for irrigation structures / water storage"
    
    print(f"Testing ranking for: {query_rj}")
    print(f"Profile: {profile_rj.dict()}")
    print("-" * 80)
    
    # Get ranked schemes
    results_rj = rank_schemes(
        profile=profile_rj,
        free_text=query_rj,
        top_k=5,
        w_r=0.6,
        w_s=0.3,
        w_f=0.1
    )
    
    # Print results
    for i, scheme in enumerate(results_rj, 1):
        print(f"\n{i}. {scheme['scheme_name']}")
        print(f"   Match: {scheme['percent_match']}%")
        print(f"   R: {scheme['R']:.3f} (Rules), S: {scheme['S']:.3f} (Semantic), F: {scheme['F']:.3f} (Freshness)")
        print(f"   Scheme ID: {scheme.get('scheme_id', 'N/A')}")
        print(f"   URL: {scheme.get('source_url', 'N/A')}")
    
    # Print rule breakdown for top result
    if results_rj:
        top = results_rj[0]
        rb = top.get('rule_breakdown', {})
        
        print("\n" + "-"*40 + " RULE BREAKDOWN " + "-"*40)
        print("Required summary:", rb.get("required", "N/A"))
        print("Optional summary:", rb.get("optional", "N/A"))
        print()

        # Print matched required clauses
        print("Matched REQUIRED clauses:")
        for clause in rb.get("matched_clauses", []):
            if clause.get("scope") == "required":
                print(f"  - {clause.get('field', 'N/A')} {clause.get('operator', 'N/A')} {clause.get('value', 'N/A')} | user_value={clause.get('user_value', 'N/A')}")

        # Print unmet required clauses
        print("\nUnmet REQUIRED clauses:")
        for clause in rb.get("unmet_clauses", []):
            if clause.get("scope") == "required":
                print(f"  - {clause.get('field', 'N/A')} {clause.get('operator', 'N/A')} {clause.get('value', 'N/A')} | user_value={clause.get('user_value', 'N/A')}")

        # Print unknown required clauses
        print("\nUnknown REQUIRED clauses:")
        for clause in rb.get("unknown_clauses", []):
            if clause.get("scope") == "required":
                print(f"  - {clause.get('field', 'N/A')} {clause.get('operator', 'N/A')} {clause.get('value', 'N/A')} | user_value={clause.get('user_value', 'N/A')}")

        print("-" * 96 + "\n")

if __name__ == "__main__":
    test_karnataka_farmer()
    test_rajasthan_farmer()