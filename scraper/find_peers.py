import json
import os
from pathlib import Path

# Paths
BASE_DIR = Path(__file__).parent.parent
DATA_DIR = BASE_DIR / "data"
INPUT_FILE = DATA_DIR / "nifty50_all_individual.json"
OUTPUT_FILE = DATA_DIR / "company_peers.json"

def get_company_data(filepath):
    """Load the JSON data."""
    if not filepath.exists():
        print(f"Error: Could not find input file at {filepath}")
        return {}
    
    with open(filepath, 'r', encoding='utf-8') as f:
        data = json.load(f)
        
    return data.get("companies", {})

def calculate_peers(companies_data):
    """
    Find 5 peers for each company based on:
    1. Exact industry match
    2. Closest composite_score
    If less than 5 peers in the exact industry, broaden to sector match, then just closest scores.
    """
    peers_dict = {}
    
    # Pre-process companies to extract needed info
    processed = {}
    for symbol, details in companies_data.items():
        try:
            metadata = details.get("company_metadata", {})
            scores = details.get("investment_scores", {})
            
            industry = metadata.get("industry", "")
            sector = metadata.get("sector", "")
            composite_score = scores.get("composite_score")
            
            if composite_score is None:
                continue # Skip companies without a composite score
                
            processed[symbol] = {
                "name": metadata.get("company_name", symbol),
                "industry": industry,
                "sector": sector,
                "score": float(composite_score)
            }
        except Exception as e:
            print(f"Skipping {symbol} due to missing data: {e}")
            continue

    # Find peers for each company
    for target_symbol, target_data in processed.items():
        candidates = []
        
        for symbol, data in processed.items():
            if symbol == target_symbol:
                continue
                
            # Score distance
            score_diff = abs(target_data["score"] - data["score"])
            
            # Prioritization logic:
            # Level 0: Same industry
            # Level 1: Same sector (but different industry)
            # Level 2: Different sector entirely
            
            if data["industry"] and data["industry"] == target_data["industry"]:
                priority = 0
            elif data["sector"] and data["sector"] == target_data["sector"]:
                priority = 1
            else:
                priority = 2
                
            candidates.append({
                "symbol": symbol,
                "name": data["name"],
                "industry": data["industry"],
                "sector": data["sector"],
                "composite_score": data["score"],
                "priority": priority,
                "score_diff": score_diff
            })
            
        # Sort candidates: First by priority (lower is better), then by score_diff (lower is better)
        candidates.sort(key=lambda x: (x["priority"], x["score_diff"]))
        
        # Take top 5
        top_5 = candidates[:5]
        
        # Clean up output format (remove the sorting helpers)
        formatted_peers = []
        for peer in top_5:
            formatted_peers.append({
                "symbol": peer["symbol"],
                "name": peer["name"],
                "industry": peer["industry"],
                "sector": peer["sector"],
                "composite_score": peer["composite_score"],
                "match_type": "Industry Match" if peer["priority"] == 0 else ("Sector Match" if peer["priority"] == 1 else "Score Match")
            })
            
        peers_dict[target_symbol] = {
            "target_company": target_data["name"],
            "target_industry": target_data["industry"],
            "target_score": target_data["score"],
            "peers": formatted_peers
        }
        
    return peers_dict

def main():
    print(f"Loading data from {INPUT_FILE.name}...")
    companies_data = get_company_data(INPUT_FILE)
    
    if not companies_data:
        print("No company data found. Exiting.")
        return
        
    print(f"Processing {len(companies_data)} companies...")
    peers_mapping = calculate_peers(companies_data)
    
    # Wrap in a root object for clean JSON
    output_data = {
        "metadata": {
            "source_file": INPUT_FILE.name,
            "total_companies_mapped": len(peers_mapping)
        },
        "company_peers": peers_mapping
    }
    
    print(f"Saving peers mapping to {OUTPUT_FILE.name}...")
    with open(OUTPUT_FILE, 'w', encoding='utf-8') as f:
        json.dump(output_data, f, indent=2)
        
    print("Done!")

if __name__ == "__main__":
    main()
