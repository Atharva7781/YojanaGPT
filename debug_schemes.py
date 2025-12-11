import pandas as pd
import json

# List of schemes to check
SCHEME_IDS_TO_CHECK = [
    "a23c0261-7711-4213-aecf-6b7c4cc844ed",  # Diggy
    "b4a7f934-4fb6-4809-ab3a-ff39bdde2d08",  # Jal Hauj
    "94189f08-1583-4be3-b0e4-0c2043bdf6c4",  # Shednet House
]

def main():
    print("Loading schemes data...")
    try:
        # Read the parquet file
        df = pd.read_parquet("schemes_with_rules.parquet")
        print(f"\n✅ Successfully loaded {len(df)} schemes")
        
        # Show available columns
        print("\n📋 Available columns:")
        print("-" * 80)
        print("\n".join([f"- {col}" for col in sorted(df.columns)]))
        
        # Check for rule-related columns
        rule_cols = [col for col in df.columns if 'rule' in col.lower() or 'eligibility' in col.lower()]
        print("\n🔍 Rule-related columns found:")
        print("-" * 80)
        print("\n".join([f"- {col}" for col in rule_cols]) if rule_cols else "No rule-related columns found")
        
        # Check each scheme
        print("\n" + "="*80)
        print("🔎 SCHEME DETAILS")
        print("="*80)
        
        for sid in SCHEME_IDS_TO_CHECK:
            print("\n" + "-"*40 + f" {sid} " + "-"*40)
            row = df[df["scheme_id"] == sid]
            
            if row.empty:
                print("❌ No scheme found with this ID")
                continue
                
            # Get basic info
            name = row["scheme_name"].values[0] if 'scheme_name' in row.columns else "N/A"
            print(f"\n🏷️  Name: {name}")
            
            # Print all available data
            print("\n📄 Available data:")
            print("-" * 80)
            for col in df.columns:
                try:
                    val = row[col].values[0]
                    if pd.notna(val):
                        val_str = str(val)
                        if len(val_str) > 100:
                            val_str = val_str[:100] + "..."
                        print(f"{col}: {val_str}")
                except Exception as e:
                    print(f"{col}: <error: {str(e)}>")
            
            # Check for description or other text that might contain rules
            text_cols = [col for col in df.columns if 'desc' in col.lower() or 'text' in col.lower()]
            if text_cols:
                print("\n📝 Text content that might contain rules:")
                print("-" * 80)
                for col in text_cols:
                    try:
                        text = row[col].values[0]
                        if pd.notna(text) and isinstance(text, str) and text.strip():
                            print(f"\n{col} (first 200 chars):")
                            print("-" * 40)
                            print(text[:200] + ("..." if len(text) > 200 else ""))
                    except:
                        pass
    
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\nPlease make sure:")
        print("1. The file 'schemes_with_rules.parquet' exists in the current directory")
        print("2. You have the required permissions to read the file")
        print("3. The file is not corrupted")
        print("\nError details:", str(e))

if __name__ == "__main__":
    main()
