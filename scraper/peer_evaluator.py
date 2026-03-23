import json
import math
from pathlib import Path
from collections import defaultdict
import yfinance as yf

# ==========================================
# CONFIGURATION & PATHS
# ==========================================
# Assuming this script is in the 'scraper' folder
BASE_DIR = Path(__file__).resolve().parent.parent
INSIGHTS_DIR = BASE_DIR / "data" / "qualitative_insights"
PEER_EVAL_DIR = BASE_DIR / "data" / "peer_evaluations"

PEER_EVAL_DIR.mkdir(parents=True, exist_ok=True)

# ==========================================
# 1. HELPER FUNCTIONS: MATH & RANKING
# ==========================================
def normalize_metric(peer_group_values, inverse=False):
    """Applies Min-Max normalization across a peer group."""
    valid_data = {sym: val for sym, val in peer_group_values.items() if val is not None}
    
    if not valid_data:
        return {}
        
    min_val = min(valid_data.values())
    max_val = max(valid_data.values())
    
    normalized = {}
    for sym, val in valid_data.items():
        if max_val == min_val:
            normalized[sym] = 1.0  # If all values are identical, max score
            continue
            
        if inverse:
            normalized[sym] = (max_val - val) / (max_val - min_val)
        else:
            normalized[sym] = (val - min_val) / (max_val - min_val)
            
    return normalized

def calculate_weighted_score(symbol, metrics_data, weights_config):
    """Calculates the final score, dynamically re-weighting if a metric is missing."""
    total_score = 0.0
    active_weight = 0.0
    
    for metric_name, weight in weights_config.items():
        val = metrics_data.get(metric_name, {}).get(symbol)
        if val is not None:
            total_score += val * weight
            active_weight += weight
            
    if active_weight > 0:
        return total_score / active_weight
    return 0.0

def apply_competition_ranking(scores_dict):
    """Applies standard competition ranking (e.g., 1, 1, 3)."""
    sorted_symbols = sorted(scores_dict.keys(), key=lambda k: scores_dict[k], reverse=True)
    
    rankings = []
    
    for i in range(len(sorted_symbols)):
        sym = sorted_symbols[i]
        score = scores_dict[sym]
        
        if i > 0 and math.isclose(score, scores_dict[sorted_symbols[i-1]], rel_tol=1e-5):
            rankings.append({"company": sym, "score": round(score, 4), "rank": rankings[-1]["rank"]})
        else:
            rankings.append({"company": sym, "score": round(score, 4), "rank": i + 1})
            
    return rankings

# ==========================================
# 2. METRIC EXTRACTION
# ==========================================

def safe_float(val):
    """Safely converts any string/number to a float, returning None if it fails."""
    if val is None:
        return None
    try:
        return float(val)
    except (ValueError, TypeError):
        return None

def extract_raw_metrics(company_json):
    """
    Extracts needed metrics matching quantitative_fetcher.py AND schema_individual.json perfectly.
    """
    recent_quant = company_json.get("quantitative_data", {}).get("Recent", {})
    
    return {
        # Normal Quantitative (Safely cast to float)
        "roe": safe_float(recent_quant.get("Return on equity")),
        "roce": safe_float(recent_quant.get("Return on capital employed")),
        "sales_growth": safe_float(recent_quant.get("Sales growth")),
        "profit_growth": safe_float(recent_quant.get("Profit growth")),
        "earnings_yield": safe_float(recent_quant.get("Earnings yield")),
        "dividend_yield": safe_float(recent_quant.get("Dividend yield")),
        "current_ratio": safe_float(recent_quant.get("Current ratio")),
        "interest_coverage": safe_float(recent_quant.get("Interest Coverage Ratio")),
        
        # Inverse Quantitative
        "debt_to_equity": safe_float(recent_quant.get("Debt to equity")),
        "pe": safe_float(recent_quant.get("Price to Earning")),
        "pb": safe_float(recent_quant.get("Price to book value")),
        "peg": safe_float(recent_quant.get("PEG Ratio")),
        
        # Qualitative Scores (Safely cast AI output to float)
        "bq": safe_float(company_json.get("business_quality_signals", {}).get("BQ")), 
        "bg": safe_float(company_json.get("governance_signals", {}).get("BG")),
        "rp": safe_float(company_json.get("return_profile_signals", {}).get("RP")),
        "cy": safe_float(company_json.get("cyclicality_signals", {}).get("CY"))
    }

# ==========================================
# 3. MAIN EVALUATION ENGINE
# ==========================================
def run_scripted_peer_evaluation():
    print("\n" + "=" * 60)
    print("PHASE 2: Python Math Engine - Sector Peer Evaluation")
    print("=" * 60)
    
    all_companies = {}
    
    # 1. Load all JSONs from Insights directory
    for company_folder in INSIGHTS_DIR.iterdir():
        if company_folder.is_dir():
            sym = company_folder.name
            json_path = company_folder / f"{sym}_individual.json"
            if json_path.exists():
                try:
                    with open(json_path, 'r', encoding='utf-8') as f:
                        all_companies[sym] = json.load(f)
                except Exception as e:
                    print(f" ❌ Failed to load {sym}: {e}")

    if not all_companies:
        print(" ⚠ No companies found to evaluate. Exiting Phase 2.")
        return False

    # 2. Dynamically group by sector
    print(f" 📊 Grouping {len(all_companies)} companies by industry...")
    sector_map = defaultdict(list)
    for sym in all_companies.keys():
        try:
            ticker = yf.Ticker(f"{sym}.NS")
            sector = ticker.info.get("industry", "Unclassified").replace(" ", "_").replace("/", "_")
            sector_map[sector].append(sym)
        except:
            sector_map["Unclassified"].append(sym)

    # 3. Process each sector
    for industry, symbols in sector_map.items():
        if len(symbols) < 2:
            print(f" ⏭ Skipping {industry.replace('_', ' ')}: Need at least 2 companies for peer comparison.")
            continue
            
        print(f"\n ⚙ Analyzing Sector: {industry.replace('_', ' ')} ({len(symbols)} companies)")
        
        raw_data = {sym: extract_raw_metrics(all_companies[sym]) for sym in symbols}
        
        metrics = defaultdict(dict)
        for sym, data in raw_data.items():
            for k, v in data.items():
                metrics[k][sym] = v

        # Normalize metrics & scale qualitative scores down to 0-1
        norm_metrics = {
            "roe": normalize_metric(metrics["roe"]),
            "roce": normalize_metric(metrics["roce"]),
            "sales_growth": normalize_metric(metrics["sales_growth"]),
            "profit_growth": normalize_metric(metrics["profit_growth"]),
            "earnings_yield": normalize_metric(metrics["earnings_yield"]),
            "dividend_yield": normalize_metric(metrics["dividend_yield"]),
            "current_ratio": normalize_metric(metrics["current_ratio"]),
            "interest_coverage": normalize_metric(metrics["interest_coverage"]),
            
            "debt_to_equity": normalize_metric(metrics["debt_to_equity"], inverse=True),
            "pe": normalize_metric(metrics["pe"], inverse=True),
            "pb": normalize_metric(metrics["pb"], inverse=True),
            "peg": normalize_metric(metrics["peg"], inverse=True),
            
            "qual_bq": {s: (v / 100) if v is not None else None for s, v in metrics["bq"].items()},
            "qual_bg": {s: (v / 100) if v is not None else None for s, v in metrics["bg"].items()},
            "qual_rp": {s: (v / 100) if v is not None else None for s, v in metrics["rp"].items()},
            "qual_cy": {s: (v / 100) if v is not None else None for s, v in metrics["cy"].items()},
            "qual_bq_bg_avg": {s: ((metrics["bq"].get(s, 0) + metrics["bg"].get(s, 0)) / 200) if metrics["bq"].get(s) and metrics["bg"].get(s) else None for s in symbols}
        }

        # Calculate formulas
        fundamental_scores = {}
        value_scores = {}
        growth_scores = {}
        safety_scores = {}
        
        for sym in symbols:
            fundamental_scores[sym] = calculate_weighted_score(sym, norm_metrics, {
                "roe": 0.30, "roce": 0.20, "sales_growth": 0.15, 
                "profit_growth": 0.10, "debt_to_equity": 0.10, "qual_bq_bg_avg": 0.15
            })
            value_scores[sym] = calculate_weighted_score(sym, norm_metrics, {
                "pe": 0.35, "pb": 0.25, "earnings_yield": 0.15, 
                "dividend_yield": 0.10, "qual_bq": 0.15
            })
            growth_scores[sym] = calculate_weighted_score(sym, norm_metrics, {
                "sales_growth": 0.35, "profit_growth": 0.25, "qual_rp": 0.15, 
                "roe": 0.15, "peg": 0.10
            })
            safety_scores[sym] = calculate_weighted_score(sym, norm_metrics, {
                "debt_to_equity": 0.25, "current_ratio": 0.20, "interest_coverage": 0.20, 
                "qual_cy": 0.15, "qual_bg": 0.20
            })

        # Save to disk
        output_payload = {
            "industry": industry,
            "companies_count": len(symbols),
            "rankings": {
                "fundamental_investor": apply_competition_ranking(fundamental_scores),
                "value_investor": apply_competition_ranking(value_scores),
                "growth_investor": apply_competition_ranking(growth_scores),
                "safety_investor": apply_competition_ranking(safety_scores)
            }
        }

        output_file = PEER_EVAL_DIR / f"{industry}_evaluation.json"
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(output_payload, f, indent=2)
            
        print(f"   ✓ Saved leaderboard → {output_file.name}")
        
    return True

if __name__ == "__main__":
    run_scripted_peer_evaluation()