from datetime import datetime
from typing import Dict, List, Optional, Tuple, Any
from gender_utils import extract_scheme_gender
import pandas as pd
from user_profile_model import UserProfile
import logging
import json

# Set up logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Global cache for schemes data
_schemes_df = None
SCHEMES_PATH = "schemes_with_rules.parquet"

# Import with error handling to avoid circular imports
try:
    from rule_evaluator import evaluate_scheme_rules
    from semantic_retrieval import semantic_search
except ImportError as e:
    logger.warning(f"Could not import dependencies: {e}. Some functions may not work.")
    evaluate_scheme_rules = None  # type: ignore
    semantic_search = None  # type: ignore

def set_schemes_path(path: str) -> None:
    global SCHEMES_PATH, _schemes_df
    SCHEMES_PATH = path
    _schemes_df = None

def load_schemes_data() -> pd.DataFrame:
    """Load and cache the schemes data."""
    global _schemes_df
    if _schemes_df is None:
        try:
            _schemes_df = pd.read_parquet(SCHEMES_PATH)
            logger.info(f"Loaded {len(_schemes_df)} schemes from {SCHEMES_PATH}")
        except Exception as e:
            logger.error(f"Failed to load schemes data: {e}")
            _schemes_df = pd.DataFrame()  # Return empty DataFrame on error
    return _schemes_df

def compute_freshness_penalty(last_updated: Optional[str], today: Optional[datetime] = None) -> float:
    """
    Compute freshness penalty factor F in [0, 0.1].
    
    Args:
        last_updated: Last update date string in YYYY-MM-DD format
        today: Reference date (defaults to current date)
        
    Returns:
        float: Freshness penalty between 0.0 and 0.1
    """
    if today is None:
        today = datetime.now()
    
    # Handle missing or invalid dates
    if not last_updated or not isinstance(last_updated, str):
        return 0.05
    
    try:
        # Try parsing the date
        updated_date = datetime.strptime(str(last_updated).split('T')[0], '%Y-%m-%d')
        days_old = (today - updated_date).days
        
        # Return penalty based on age
        if days_old <= 365:  # Within 1 year
            return 0.0
        else:
            return 0.1
    except (ValueError, TypeError) as e:
        logger.debug(f"Invalid date format for last_updated '{last_updated}': {e}")
        return 0.05

def rank_schemes(
    profile: UserProfile,
    free_text: str = "",
    top_k: int = 10,
    w_r: float = 0.6,
    w_s: float = 0.4,
    w_f: float = 0.1
) -> List[Dict]:
    """
    Rank schemes based on rule matching, semantic similarity, and freshness.
    
    Args:
        profile: User profile containing demographic and other relevant information
        free_text: Free-text query from the user
        top_k: Number of top results to return
        w_r: Weight for rule-based score (R)
        w_s: Weight for semantic score (S)
        w_f: Weight for freshness penalty (F)
        
    Returns:
        List[Dict]: Ranked list of schemes with scores and metadata
    """
    # Validate weights
    if not (0 <= w_r <= 1 and 0 <= w_s <= 1 and 0 <= w_f <= 1):
        raise ValueError("Weights must be between 0 and 1")

    # Ensure weights are valid and sum to 1.0 (normalize if not)
    # Place this after w_r, w_s, w_f are read/defined.
    _total_rs = (w_r or 0.0) + (w_s or 0.0)
    if abs(_total_rs - 1.0) > 1e-9:
        # If both w_r and w_s are zero, fall back to semantic-heavy default
        if _total_rs == 0.0:
            w_r = 0.6
            w_s = 0.3
            w_f = 0.1
            logger.warning("Weights were zero — using defaults w_r=0.6, w_s=0.3, w_f=0.1")
        else:
            # Normalize proportionally so w_r + w_s == 1.0, keep w_f as-is (freshness treated separately)
            w_r = float(w_r) / _total_rs
            w_s = float(w_s) / _total_rs
            logger.warning("Normalized weights so (w_r + w_s) == 1.0 (new w_r=%.3f, w_s=%.3f)", w_r, w_s)
    # Optional: clamp to [0,1]
    w_r = max(0.0, min(1.0, w_r))
    w_s = max(0.0, min(1.0, w_s))
    
    # Load schemes data
    schemes_df = load_schemes_data()
    if schemes_df.empty:
        logger.error("No schemes data available")
        return []
    
    # Get semantic search results
    semantic_results = []
    if semantic_search is not None:
        try:
            semantic_results = semantic_search(profile, free_text, top_k=min(50, len(schemes_df)))
        except Exception as e:
            logger.error(f"Semantic search failed: {e}")
            semantic_results = []
    else:
        logger.error("Semantic search is unavailable (missing dependency).")
    
    results = []
    today = datetime.now()
    
    # Process each candidate scheme
    for item in semantic_results:
        try:
            scheme_id = item.get("scheme_id")
            S = float(item.get("similarity", 0.0))  # Semantic score from FAISS
            
            # Find the scheme in our data
            scheme_data = schemes_df[schemes_df['scheme_id'] == scheme_id].iloc[0] \
                if scheme_id in schemes_df['scheme_id'].values else None
            
            if scheme_data is None:
                logger.warning(f"Scheme {scheme_id} not found in schemes data")
                continue
            
            # Evaluate rules to get R score
            eligibility_structured = scheme_data.get('eligibility_structured', {})
            try:
                # Parse JSON string if needed
                if isinstance(eligibility_structured, str):
                    eligibility_structured = json.loads(eligibility_structured)
                rule_result = evaluate_scheme_rules(eligibility_structured, profile.model_dump())
                R = rule_result.get('R', rule_result.get('score', 0.0))
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse eligibility_structured JSON for scheme {scheme_id}: {e}")
                R = 0.0
                rule_result = {"score": 0.0, "breakdown": {"error": "Invalid rule format"}}
            except Exception as e:
                logger.error(f"Error evaluating rules for scheme {scheme_id}: {e}")
                R = 0.0
                rule_result = {"score": 0.0, "breakdown": {"error": str(e)}}

            # Compute freshness penalty
            last_updated = scheme_data.get('last_updated')
            F = compute_freshness_penalty(last_updated, today)

            # Calculate final score (clamped to [0, 1])
            final_score = max(0.0, min(1.0, w_r * R + w_s * S - w_f * F))
            percent_match = round(final_score * 100, 1)

            # Prepare result entry
            result = {
                'scheme_id': scheme_id,
                'scheme_name': scheme_data.get('scheme_name', 'N/A'),
                'R': round(R, 4),
                'S': round(S, 4),
                'F': round(F, 4),
                'final_score': round(final_score, 4),
                'percent_match': percent_match,
                'rule_breakdown': rule_result.get('breakdown', {}),
                'source_url': scheme_data.get('source_url', ''),
                'description': scheme_data.get('description_raw', '')[:200] + '...',
                'eligibility_structured': eligibility_structured
            }
            
            results.append(result)
            
        except Exception as e:
            logger.error(f"Error processing scheme {scheme_id}: {e}", exc_info=True)
            continue
    
    # Sort by final score (descending)
    results.sort(key=lambda x: x['final_score'], reverse=True)
    
    # Return top_k results
    return results[:top_k]

def _extract_scheme_gender(eligibility_structured: Dict[str, Any]) -> Optional[str]:
    try:
        if not eligibility_structured:
            return None
        req = eligibility_structured.get("required", [])
        for clause in req:
            if clause.get("field") == "gender":
                val = clause.get("value")
                if val is None:
                    return None
                v = str(val).strip().lower()
                if v in ("female", "f", "women", "woman", "mahila"):
                    return "female"
                if v in ("male", "m", "man", "men"):
                    return "male"
                return None
    except Exception:
        return None
    return None

def split_by_gender_buckets(ranked_schemes: List[Dict], profile: Optional[Dict] = None) -> Dict[str, List[Dict]]:
    male_bucket: List[Dict] = []
    female_bucket: List[Dict] = []
    neutral: List[Dict] = []
    profile_gender = None
    try:
        if profile:
            pg = profile.get("gender")
            if isinstance(pg, str):
                profile_gender = pg.strip().lower()
    except Exception:
        profile_gender = None

    for s in ranked_schemes:
        g, conf, prov = extract_scheme_gender({
            "scheme_name": s.get("scheme_name"),
            "eligibility_structured": s.get("eligibility_structured"),
            "eligibility_raw": s.get("description", "")
        })
        if g == "female":
            female_bucket.append(s)
            continue
        if g == "male":
            male_bucket.append(s)
            continue
        neutral.append(s)

    return {"male": male_bucket + neutral, "female": female_bucket + neutral, "neutral": neutral}

def rank_schemes_for_profile(
    profile: UserProfile,
    free_text: str = "",
    top_k: int = 10,
    faiss_path: Optional[str] = None,
    schemes_path: Optional[str] = None,
    w_r: float = 0.6,
    w_s: float = 0.4,
    w_f: float = 0.1,
) -> List[Dict]:
    if schemes_path:
        set_schemes_path(schemes_path)
    if faiss_path:
        try:
            from semantic_retrieval import set_index_paths
            ids_path = "scheme_ids_llm.npy" if "llm" in faiss_path else "faiss_index/scheme_ids.npy"
            set_index_paths(faiss_path, ids_path)
        except Exception:
            pass

    ranked = rank_schemes(profile=profile, free_text=free_text, top_k=top_k, w_r=w_r, w_s=w_s, w_f=w_f)
    buckets = split_by_gender_buckets(ranked, getattr(profile, 'model_dump', lambda: {})())
    pg = (profile.gender or "").strip().lower() if profile.gender else None
    if pg == "male":
        return buckets.get("male", ranked)
    if pg == "female":
        return buckets.get("female", ranked)
    return buckets.get("neutral", ranked)

def load_resources_for_api() -> Dict[str, Any]:
    import os
    import pandas as pd
    from pathlib import Path
    try:
        preferred_schemes = "schemes_with_rules_llm.parquet"
        fallback_schemes = "schemes_with_rules.parquet"
        schemes_path = preferred_schemes if Path(preferred_schemes).exists() else fallback_schemes
        set_schemes_path(schemes_path)
        schemes_df = pd.read_parquet(schemes_path)
    except Exception as e:
        logger.error("Failed to load schemes parquet: %s", e)
        schemes_df = pd.DataFrame()

    try:
        preferred_index = "faiss_index/faiss_index_llm.bin"
        fallback_index = "faiss_index/faiss_index.bin"
        ids_path = "scheme_ids_llm.npy" if Path(preferred_index).exists() else "faiss_index/scheme_ids.npy"
        index_path = preferred_index if Path(preferred_index).exists() else fallback_index
        from semantic_retrieval import set_index_paths, _get_index, _get_model
        set_index_paths(index_path, ids_path)
        faiss_index, _ = _get_index()
        embed_model = _get_model()
    except Exception as e:
        logger.error("Failed to load FAISS/resources: %s", e)
        faiss_index = None
        embed_model = None

    return {"schemes_df": schemes_df, "faiss_index": faiss_index, "embed_model": embed_model}

def rank_schemes_for_api(query: str, profile: Dict[str, Any], top_k: int, resources: Dict[str, Any], gender_bucket: Optional[str] = None) -> List[Dict]:
    try:
        p = UserProfile(**{k: v for k, v in profile.items() if k in UserProfile.model_fields})
    except Exception:
        p = UserProfile()
        for k, v in profile.items():
            if hasattr(p, k):
                setattr(p, k, v)
    ranked = rank_schemes(profile=p, free_text=query, top_k=top_k)
    buckets = split_by_gender_buckets(ranked, profile)
    gb = (gender_bucket or profile.get("gender") or "").strip().lower()
    if gb == "male":
        return buckets.get("male", ranked)
    if gb == "female":
        return buckets.get("female", ranked)
    return buckets.get("neutral", ranked)

# Example usage
if __name__ == "__main__":
    # Example user profile
    profile = UserProfile(
        state="Maharashtra",
        district="Pune",
        age=35,
        category="OBC",
        income_annual=250000,
        occupation="Farmer",
        farmer=True,
        business_type="Agriculture"
    )
    
    # Example search
    ranked_schemes = rank_schemes(
        profile=profile,
        free_text="Looking for agricultural subsidies and farming equipment support",
        top_k=5,
        w_r=0.6,
        w_s=0.3,
        w_f=0.1
    )
    
    # Print results
    print("\nTop matching schemes:")
    for i, scheme in enumerate(ranked_schemes, 1):
        print(f"\n{i}. {scheme['scheme_name']}")
        print(f"   Scheme ID: {scheme['scheme_id']}")
        print(f"   Match: {scheme['percent_match']}%")
        print(f"   R: {scheme['R']:.3f}, S: {scheme['S']:.3f}, F: {scheme['F']:.3f}")
        print(f"   URL: {scheme.get('source_url', 'N/A')}")
