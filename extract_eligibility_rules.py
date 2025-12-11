# extract_eligibility_rules.py
import os
import json
import logging
import re
import pandas as pd
from typing import Dict, Any, List, Optional
from pathlib import Path
from datetime import datetime
from deterministic_patterns import extract_deterministic_rules

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('eligibility_extraction.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class EligibilityExtractor:
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {
            'input_file': 'schemes_cleaned.parquet',
            'output_file': 'schemes_with_rules.parquet',  # Changed to direct file path
            'batch_size': 10,
            'max_retries': 3,
            'delay_between_requests': 1.0
        }
        self.df = None
        self.processed_count = 0
        
    def load_data(self) -> bool:
        """Load the input parquet file."""
        try:
            self.df = pd.read_parquet(self.config['input_file'])
            logger.info(f"Loaded {len(self.df)} schemes from {self.config['input_file']}")
            return True
        except Exception as e:
            logger.error(f"Error loading input file: {e}")
            return False

    def extract_rules(self) -> bool:
        """Extract rules for all schemes in the dataframe."""
        if self.df is None:
            logger.error("No data loaded. Call load_data() first.")
            return False

        # Process in batches
        batch_size = self.config.get('batch_size', 10)
        total_schemes = len(self.df)
        
        logger.info(f"Starting rule extraction for {total_schemes} schemes...")
        
        for i in range(0, total_schemes, batch_size):
            batch = self.df.iloc[i:i + batch_size]
            logger.info(f"Processing batch {i//batch_size + 1}/{(total_schemes + batch_size - 1)//batch_size}")
            
            for _, row in batch.iterrows():
                try:
                    rules = self._extract_rules_for_scheme(row)
                    self.df.at[row.name, 'eligibility_structured'] = json.dumps(rules)
                    self.processed_count += 1
                except Exception as e:
                    logger.error(f"Error processing scheme {row.get('scheme_id', 'unknown')}: {str(e)}")
                    self.df.at[row.name, 'eligibility_structured'] = json.dumps({
                        "required": [],
                        "optional": [],
                        "error": str(e)
                    })

        return True

    def _extract_rules_for_scheme(self, scheme_data: Dict[str, Any]) -> Dict[str, Any]:
        """Extract structured eligibility rules for a single scheme."""
        out = {
            "required": [],
            "optional": [],
            "notes": {},
            "source_text": (scheme_data.get('eligibility_raw', '') or '')[:500] + ("..." if len(scheme_data.get('eligibility_raw', '') or '') > 500 else "")
        }

        elig_text = str(scheme_data.get('eligibility_raw') or '')
        desc_text = str(scheme_data.get('description_raw') or '')
        combined_text = (elig_text + " " + desc_text).strip()

        det_rules = extract_deterministic_rules(combined_text)
        if det_rules:
            seen_fields = set()
            for r in det_rules:
                f = r.get("field")
                if not f or f in seen_fields:
                    continue
                span = (r.get("text_span") or "").lower()
                target = out["optional"] if ("prefer" in span or "optional" in span) else out["required"]
                target.append({
                    "field": r.get("field"),
                    "operator": r.get("operator"),
                    "value": r.get("value"),
                    "text_span": r.get("text_span"),
                    "confidence": 0.9,
                    "source": "regex"
                })
                seen_fields.add(f)
            out["notes"] = {"deterministic": True, "covered_fields": sorted(list(seen_fields)), "rule_count": len(out["required"]) + len(out["optional"]) }
            return out

        if not elig_text:
            out["notes"] = {"deterministic": False, "reason": "no_eligibility_text"}
            return out

        try:
            text = elig_text
            clauses = re.split(r'(?<=[.!?])\s+', text)
            for clause in clauses:
                clause = clause.strip()
                if not clause:
                    continue
                rule = self._parse_rule(clause)
                if any(word in clause.lower() for word in ["must", "require", "shall", "need to"]):
                    out["required"].append(rule)
                else:
                    out["optional"].append(rule)
        except Exception as e:
            logger.error(f"Error in rule extraction: {e}")
            out["error"] = str(e)
        out["notes"] = {"deterministic": False}
        return out

    def _parse_rule(self, text: str) -> Dict[str, Any]:
        """Parse a single rule from text."""
        rule = {
            "original_text": text,
            "field": None,
            "operator": None,
            "value": None,
            "confidence": 0.5
        }
        
        # Simple pattern matching
        patterns = [
            (r'(\w+)\s+(must|should)\s+be\s+([\w\s]+)', 1, '==', 3),
            (r'(\w+)\s+(must|should)\s+have\s+([\w\s]+)', 1, 'has', 3),
            (r'(\w+)\s+(?:must|should)\s+be\s+at\s+least\s+([\d,]+)', 1, '>=', 2),
            (r'(\w+)\s+(?:must|should)\s+be\s+at\s+most\s+([\d,]+)', 1, '<=', 2),
        ]
        
        for pattern, field_idx, op, value_idx in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                rule.update({
                    "field": match.group(field_idx).strip().lower(),
                    "operator": op,
                    "value": match.group(value_idx).strip().strip('.'),
                    "confidence": 0.8
                })
                break
                
        return rule

    def save_results(self) -> bool:
        """Save the processed data to the output file."""
        try:
            # Ensure the directory exists
            output_path = Path(self.config['output_file'])
            output_path.parent.mkdir(parents=True, exist_ok=True)
            
            self.df.to_parquet(str(output_path), index=False)
            logger.info(f"Successfully saved {self.processed_count} processed schemes to {output_path}")
            return True
        except Exception as e:
            logger.error(f"Error saving results: {e}")
            return False

def main():
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", dest="input_file", default="schemes_cleaned.parquet")
    parser.add_argument("--output", dest="output_file", default="schemes_with_rules.parquet")
    args = parser.parse_args()

    extractor = EligibilityExtractor({
        'input_file': args.input_file,
        'output_file': args.output_file,
        'batch_size': 10,
        'max_retries': 3,
        'delay_between_requests': 1.0
    })

    if not extractor.load_data():
        return
    if not extractor.extract_rules():
        return
    extractor.save_results()

if __name__ == "__main__":
    main()
