from user_profile_model import UserProfile
from ranking import rank_schemes_for_profile, set_schemes_path
from semantic_retrieval import set_index_paths

def main():
    set_schemes_path("schemes_with_rules_llm.parquet")
    set_index_paths("faiss_index/faiss_index_llm.bin", "scheme_ids_llm.npy")

    query = "schemes for employment / skill development"

    male_profile = UserProfile(
        state="Maharashtra",
        district="Kolhapur",
        gender="male",
        income_annual=20000.0 * 12,
        occupation="Engineer",
        farmer=False,
        age=42,
    )
    female_profile = UserProfile(
        state="Maharashtra",
        district="Kolhapur",
        gender="female",
        income_annual=20000.0 * 12,
        occupation="Engineer",
        farmer=False,
        age=42,
    )

    print("\n=== Male profile results ===")
    male_results = rank_schemes_for_profile(male_profile, query, top_k=10, w_r=0.667, w_s=0.333, w_f=0.05)
    for i, r in enumerate(male_results, 1):
        print(f"{i}. {r['scheme_name']}  Match:{r['percent_match']:.1f}%  R:{r['R']:.3f}  S:{r['S']:.3f}")

    print("\n=== Female profile results ===")
    female_results = rank_schemes_for_profile(female_profile, query, top_k=10, w_r=0.667, w_s=0.333, w_f=0.05)
    for i, r in enumerate(female_results, 1):
        print(f"{i}. {r['scheme_name']}  Match:{r['percent_match']:.1f}%  R:{r['R']:.3f}  S:{r['S']:.3f}")

if __name__ == "__main__":
    main()
