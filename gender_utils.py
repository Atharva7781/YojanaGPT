import re
from typing import Tuple, Optional

FEMALE_KEYWORDS = [
    r"\bmahila\b", r"\bmahilas?\b", r"\bmahila-?\b",
    r"\bwomen\b", r"\bwomen's\b", r"\bwomen\s+only\b",
    r"\bladki\b", r"\bbeti\b", r"\bmahila\s+kisan\b",
    r"\bsamridhi\b", r"\bmajhi\s+ladki\b",
]
MALE_KEYWORDS = [
    r"\bshetkari\b", r"\bshetkari\s+purush\b", r"\bmale\b", r"\bman\b",
]

_FEMALE_RE = re.compile("|".join(FEMALE_KEYWORDS), flags=re.IGNORECASE)
_MALE_RE = re.compile("|".join(MALE_KEYWORDS), flags=re.IGNORECASE)


def detect_gender_from_required_clauses(eligibility_structured: dict) -> Optional[str]:
    if not eligibility_structured:
        return None
    required = eligibility_structured.get("required", [])
    for clause in required:
        field = clause.get("field")
        if not field:
            continue
        if field.lower() == "gender":
            val = clause.get("value")
            if not val:
                continue
            v = str(val).strip().lower()
            if v.startswith("f") or "female" in v or "woman" in v:
                return "female"
            if v.startswith("m") or "male" in v or "man" in v:
                return "male"
    return None


def detect_gender_from_title(title: str) -> Tuple[Optional[str], float]:
    if not title:
        return None, 0.0
    t = title.lower()
    if _FEMALE_RE.search(t):
        return "female", 0.85
    if _MALE_RE.search(t):
        return "male", 0.80
    return None, 0.0


def extract_scheme_gender(scheme_record: dict) -> Tuple[Optional[str], float, str]:
    elig = scheme_record.get("eligibility_structured") if scheme_record else None
    if elig:
        g = detect_gender_from_required_clauses(elig)
        if g:
            return g, 0.95, "required_clause"
    title = scheme_record.get("scheme_name") or scheme_record.get("title") or ""
    g_title, conf = detect_gender_from_title(title)
    if g_title:
        return g_title, conf, "title_heuristic"
    raw = scheme_record.get("eligibility_raw", "") or ""
    if raw:
        g_from_raw, _ = detect_gender_from_title(raw)
        if g_from_raw:
            return g_from_raw, 0.80, "raw_text_heuristic"
    return None, 0.0, "none"
