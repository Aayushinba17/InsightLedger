"""
Industry Evaluator — Pure Python Math Engine

Aggregates company-level individual JSONs by industry (via yfinance)
and produces industry-level evaluation dashboards covering:
  1. Composite AI Scores (BQ, CY, RP, BG averages)
  2. Revenue Health (total revenue, avg OPM, avg ROE, avg ROCE)
  3. Cumulative Quarterly Growth (avg YOY quarterly sales & profit growth)
  4. Stockholder Participation (promoter %, change, total shareholders, dividend yield)
  5. Investment Safety (debt/equity, current ratio, interest coverage, governance flags, risk severity)

Output: Per-industry JSON files + a master _industry_summary.json with cross-industry rankings.
"""

import json
import math
from pathlib import Path
from collections import defaultdict

import yfinance as yf

# ============================================================
# PATHS
# ============================================================

BASE_DIR = Path(__file__).resolve().parent.parent
INSIGHTS_DIR = BASE_DIR / "data" / "qualitative_insights"
QUANT_DIR = BASE_DIR / "data" / "quantitative"
INDUSTRY_EVAL_DIR = BASE_DIR / "data" / "industry_evaluations"
INDUSTRY_EVAL_DIR.mkdir(parents=True, exist_ok=True)

# ============================================================
# HELPERS
# ============================================================

def safe_float(val):
    """Safely cast to float, returning None on failure."""
    if val is None:
        return None
    try:
        f = float(val)
        return f if not math.isnan(f) else None
    except (ValueError, TypeError):
        return None


def mean_of(values):
    """Mean of non-None values, or None if empty."""
    valid = [v for v in values if v is not None]
    return sum(valid) / len(valid) if valid else None


def sum_of(values):
    """Sum of non-None values, or None if empty."""
    valid = [v for v in values if v is not None]
    return sum(valid) if valid else None


def normalize_across(industry_scores):
    """
    Min-Max normalize a dict {industry: score} across all industries.
    Returns {industry: normalized_score (0-1)}.
    """
    valid = {k: v for k, v in industry_scores.items() if v is not None}

    if not valid:
        return {k: None for k in industry_scores}

    min_v = min(valid.values())
    max_v = max(valid.values())

    result = {}
    for k, v in industry_scores.items():
        if v is None:
            result[k] = None
        elif max_v == min_v:
            result[k] = 1.0
        else:
            result[k] = (v - min_v) / (max_v - min_v)
    return result


def normalize_across_inverse(industry_scores):
    """
    Min-Max normalize inversely (lower is better, e.g. debt-to-equity).
    """
    valid = {k: v for k, v in industry_scores.items() if v is not None}

    if not valid:
        return {k: None for k in industry_scores}

    min_v = min(valid.values())
    max_v = max(valid.values())

    result = {}
    for k, v in industry_scores.items():
        if v is None:
            result[k] = None
        elif max_v == min_v:
            result[k] = 1.0
        else:
            result[k] = (max_v - v) / (max_v - min_v)
    return result


# ============================================================
# DATA EXTRACTION PER COMPANY
# ============================================================

def extract_company_metrics(data):
    """
    Extract all metrics needed from a single company's individual JSON.
    Returns a flat dict of values (any can be None).
    """
    recent = data.get("quantitative_data", {}).get("Recent", {})

    # Qualitative AI scores
    bq = safe_float(data.get("business_quality_signals", {}).get("BQ"))
    cy = safe_float(data.get("cyclicality_signals", {}).get("CY"))
    rp = safe_float(data.get("return_profile_signals", {}).get("RP"))
    bg = safe_float(data.get("governance_signals", {}).get("BG"))

    # Revenue health
    revenue = safe_float(recent.get("Sales"))
    opm = safe_float(recent.get("OPM"))
    roe = safe_float(recent.get("Return on equity"))
    roce = safe_float(recent.get("Return on capital employed"))

    # Quarterly growth
    yoy_sales_growth = safe_float(recent.get("YOY Quarterly sales growth"))
    yoy_profit_growth = safe_float(recent.get("YOY Quarterly profit growth"))

    # Stockholder activity
    promoter_holding = safe_float(recent.get("Promoter holding"))
    promoter_change = safe_float(recent.get("Change in promoter holding"))
    dividend_yield = safe_float(recent.get("Dividend yield"))

    stockholder_details = data.get("stockholder_details", {})
    total_shareholders = safe_float(stockholder_details.get("total_shareholders_count"))

    # Investment safety
    debt_to_equity = safe_float(recent.get("Debt to equity"))
    current_ratio = safe_float(recent.get("Current ratio"))
    interest_coverage = safe_float(recent.get("Interest Coverage Ratio"))

    # Governance red flags — count how many are True
    gov_flags = data.get("governance_signals", {}).get("governance_red_flags", {})
    red_flag_count = sum(1 for v in gov_flags.values() if v is True)

    # Risk severity distribution
    risk_analysis = data.get("risk_analysis", {})
    risk_counts = {"high": 0, "medium": 0, "low": 0}
    for risk_category in ["operational_risks", "financial_risks", "industry_risks", "regulatory_risks"]:
        for risk in risk_analysis.get(risk_category, []):
            severity = (risk.get("severity") or "").lower()
            if severity in risk_counts:
                risk_counts[severity] += 1

    return {
        "bq": bq, "cy": cy, "rp": rp, "bg": bg,
        "revenue": revenue, "opm": opm, "roe": roe, "roce": roce,
        "yoy_sales_growth": yoy_sales_growth, "yoy_profit_growth": yoy_profit_growth,
        "promoter_holding": promoter_holding, "promoter_change": promoter_change,
        "dividend_yield": dividend_yield, "total_shareholders": total_shareholders,
        "debt_to_equity": debt_to_equity, "current_ratio": current_ratio,
        "interest_coverage": interest_coverage,
        "red_flag_count": red_flag_count,
        "risk_high": risk_counts["high"],
        "risk_medium": risk_counts["medium"],
        "risk_low": risk_counts["low"],
    }


# ============================================================
# INDUSTRY AGGREGATION
# ============================================================

def aggregate_industry(symbols, all_companies):
    """
    Given a list of symbols belonging to one industry,
    compute industry-level aggregate metrics.
    """
    company_metrics = []
    for sym in symbols:
        if sym in all_companies:
            company_metrics.append(extract_company_metrics(all_companies[sym]))

    if not company_metrics:
        return None

    # --- 1. Composite Scores ---
    avg_bq = mean_of([m["bq"] for m in company_metrics])
    avg_cy = mean_of([m["cy"] for m in company_metrics])
    avg_rp = mean_of([m["rp"] for m in company_metrics])
    avg_bg = mean_of([m["bg"] for m in company_metrics])
    composite_parts = [v for v in [avg_bq, avg_cy, avg_rp, avg_bg] if v is not None]
    industry_composite = sum(composite_parts) / len(composite_parts) if composite_parts else None

    # --- 2. Revenue Health ---
    total_revenue = sum_of([m["revenue"] for m in company_metrics])
    avg_opm = mean_of([m["opm"] for m in company_metrics])
    avg_roe = mean_of([m["roe"] for m in company_metrics])
    avg_roce = mean_of([m["roce"] for m in company_metrics])

    # --- 3. Quarterly Growth ---
    avg_yoy_sales_growth = mean_of([m["yoy_sales_growth"] for m in company_metrics])
    avg_yoy_profit_growth = mean_of([m["yoy_profit_growth"] for m in company_metrics])

    # --- 4. Stockholder Activity ---
    avg_promoter_holding = mean_of([m["promoter_holding"] for m in company_metrics])
    avg_promoter_change = mean_of([m["promoter_change"] for m in company_metrics])
    total_shareholders_count = sum_of([m["total_shareholders"] for m in company_metrics])
    avg_dividend_yield = mean_of([m["dividend_yield"] for m in company_metrics])

    # --- 5. Investment Safety ---
    avg_debt_to_equity = mean_of([m["debt_to_equity"] for m in company_metrics])
    avg_current_ratio = mean_of([m["current_ratio"] for m in company_metrics])
    avg_interest_coverage = mean_of([m["interest_coverage"] for m in company_metrics])
    governance_red_flag_count = sum(m["red_flag_count"] for m in company_metrics)
    risk_severity = {
        "high": sum(m["risk_high"] for m in company_metrics),
        "medium": sum(m["risk_medium"] for m in company_metrics),
        "low": sum(m["risk_low"] for m in company_metrics),
    }

    return {
        "companies": symbols,
        "company_count": len(symbols),
        "composite_scores": {
            "avg_bq": round(avg_bq, 2) if avg_bq is not None else None,
            "avg_cy": round(avg_cy, 2) if avg_cy is not None else None,
            "avg_rp": round(avg_rp, 2) if avg_rp is not None else None,
            "avg_bg": round(avg_bg, 2) if avg_bg is not None else None,
            "industry_composite": round(industry_composite, 2) if industry_composite is not None else None,
        },
        "revenue_health": {
            "total_revenue": total_revenue,
            "avg_opm": round(avg_opm, 4) if avg_opm is not None else None,
            "avg_roe": round(avg_roe, 4) if avg_roe is not None else None,
            "avg_roce": round(avg_roce, 4) if avg_roce is not None else None,
        },
        "quarterly_growth": {
            "avg_yoy_sales_growth": round(avg_yoy_sales_growth, 4) if avg_yoy_sales_growth is not None else None,
            "avg_yoy_profit_growth": round(avg_yoy_profit_growth, 4) if avg_yoy_profit_growth is not None else None,
        },
        "stockholder_activity": {
            "avg_promoter_holding": round(avg_promoter_holding, 2) if avg_promoter_holding is not None else None,
            "avg_promoter_holding_change": round(avg_promoter_change, 2) if avg_promoter_change is not None else None,
            "total_shareholders_count": int(total_shareholders_count) if total_shareholders_count is not None else None,
            "avg_dividend_yield": round(avg_dividend_yield, 4) if avg_dividend_yield is not None else None,
        },
        "investment_safety": {
            "avg_debt_to_equity": round(avg_debt_to_equity, 4) if avg_debt_to_equity is not None else None,
            "avg_current_ratio": round(avg_current_ratio, 4) if avg_current_ratio is not None else None,
            "avg_interest_coverage": round(avg_interest_coverage, 4) if avg_interest_coverage is not None else None,
            "governance_red_flag_count": governance_red_flag_count,
            "risk_severity_distribution": risk_severity,
        },
    }


# ============================================================
# CROSS-INDUSTRY NORMALIZATION & RANKING
# ============================================================

def compute_dimension_scores(industry_data_map):
    """
    For each of 5 dimensions, compute a 0-1 normalized score across all industries.
    Then compute an overall weighted industry score and rank.

    Dimension weights:
      - Composite Score:       25%
      - Revenue Health:        20%
      - Quarterly Growth:      20%
      - Stockholder Activity:  15%
      - Investment Safety:     20%
    """
    industries = list(industry_data_map.keys())

    # --- Raw dimension scores ---

    # 1. Composite: higher is better
    raw_composite = {ind: d["composite_scores"]["industry_composite"] for ind, d in industry_data_map.items()}

    # 2. Revenue Health: weighted combo of avg_opm, avg_roe, avg_roce  (higher = better)
    raw_rev_health = {}
    for ind, d in industry_data_map.items():
        rh = d["revenue_health"]
        parts = []
        weights = []
        for val, w in [(rh["avg_opm"], 0.3), (rh["avg_roe"], 0.35), (rh["avg_roce"], 0.35)]:
            if val is not None:
                parts.append(val * w)
                weights.append(w)
        raw_rev_health[ind] = sum(parts) / sum(weights) if weights else None

    # 3. Quarterly Growth: average of sales & profit growth  (higher = better)
    raw_qtr_growth = {}
    for ind, d in industry_data_map.items():
        qg = d["quarterly_growth"]
        parts = [v for v in [qg["avg_yoy_sales_growth"], qg["avg_yoy_profit_growth"]] if v is not None]
        raw_qtr_growth[ind] = sum(parts) / len(parts) if parts else None

    # 4. Stockholder Activity: weighted combo  (higher holding & yield = better)
    raw_stockholder = {}
    for ind, d in industry_data_map.items():
        sa = d["stockholder_activity"]
        parts = []
        weights = []
        # Promoter holding (0-100 scale → normalize to 0-1)
        if sa["avg_promoter_holding"] is not None:
            parts.append((sa["avg_promoter_holding"] / 100) * 0.4)
            weights.append(0.4)
        if sa["avg_dividend_yield"] is not None:
            parts.append(sa["avg_dividend_yield"] * 0.3)
            weights.append(0.3)
        # Promoter change: positive = good signal
        if sa["avg_promoter_holding_change"] is not None:
            # Clamp to reasonable range before using
            clamped = max(-10, min(10, sa["avg_promoter_holding_change"]))
            parts.append(((clamped + 10) / 20) * 0.3)  # map -10..10 → 0..1
            weights.append(0.3)
        raw_stockholder[ind] = sum(parts) / sum(weights) if weights else None

    # 5. Investment Safety: inverse debt_to_equity + current_ratio + interest coverage
    #    (lower debt = better, higher current & coverage = better)
    #    Combine the normalized values afterward
    raw_safety = {}
    for ind, d in industry_data_map.items():
        isf = d["investment_safety"]
        parts = []
        weights = []
        # Debt-to-equity: lower is better — will invert during normalization
        if isf["avg_debt_to_equity"] is not None:
            parts.append(("inv_dte", isf["avg_debt_to_equity"], 0.30))
        if isf["avg_current_ratio"] is not None:
            parts.append(("norm", isf["avg_current_ratio"], 0.25))
        if isf["avg_interest_coverage"] is not None:
            parts.append(("norm", isf["avg_interest_coverage"], 0.25))
        # Low red flag count is better
        flag_val = isf["governance_red_flag_count"]
        parts.append(("inv_flag", flag_val, 0.20))

        raw_safety[ind] = parts if parts else None

    # --- Normalize each dimension across industries ---
    norm_composite = normalize_across(raw_composite)
    norm_rev_health = normalize_across(raw_rev_health)
    norm_qtr_growth = normalize_across(raw_qtr_growth)
    norm_stockholder = normalize_across(raw_stockholder)

    # Safety is special — multi-metric, some inverse
    # Compute each sub-metric's raw values, normalize, then combine
    dte_raw = {}
    cr_raw = {}
    ic_raw = {}
    flag_raw = {}
    for ind, d in industry_data_map.items():
        isf = d["investment_safety"]
        dte_raw[ind] = isf["avg_debt_to_equity"]
        cr_raw[ind] = isf["avg_current_ratio"]
        ic_raw[ind] = isf["avg_interest_coverage"]
        flag_raw[ind] = isf["governance_red_flag_count"]

    norm_dte = normalize_across_inverse(dte_raw)     # lower is better
    norm_cr = normalize_across(cr_raw)                # higher is better
    norm_ic = normalize_across(ic_raw)                # higher is better
    norm_flag = normalize_across_inverse(flag_raw)    # lower is better

    norm_safety = {}
    for ind in industries:
        parts = []
        weights = []
        for val, w in [(norm_dte.get(ind), 0.30), (norm_cr.get(ind), 0.25),
                       (norm_ic.get(ind), 0.25), (norm_flag.get(ind), 0.20)]:
            if val is not None:
                parts.append(val * w)
                weights.append(w)
        norm_safety[ind] = sum(parts) / sum(weights) if weights else None

    # --- Weighted overall score ---
    dimension_weights = {
        "composite": 0.25,
        "revenue_health": 0.20,
        "quarterly_growth": 0.20,
        "stockholder_activity": 0.15,
        "investment_safety": 0.20,
    }

    overall_scores = {}
    for ind in industries:
        parts = []
        active_w = []
        for dim_key, w in dimension_weights.items():
            val = {
                "composite": norm_composite,
                "revenue_health": norm_rev_health,
                "quarterly_growth": norm_qtr_growth,
                "stockholder_activity": norm_stockholder,
                "investment_safety": norm_safety,
            }[dim_key].get(ind)
            if val is not None:
                parts.append(val * w)
                active_w.append(w)
        overall_scores[ind] = sum(parts) / sum(active_w) if active_w else 0.0

    # --- Ranking ---
    sorted_industries = sorted(overall_scores.keys(), key=lambda k: overall_scores[k], reverse=True)
    rankings = {}
    prev_score = None
    prev_rank = 0
    for i, ind in enumerate(sorted_industries):
        score = overall_scores[ind]
        if prev_score is not None and math.isclose(score, prev_score, rel_tol=1e-5):
            rankings[ind] = prev_rank
        else:
            rankings[ind] = i + 1
        prev_score = score
        prev_rank = rankings[ind]

    return {
        "normalized_dimensions": {
            ind: {
                "composite": round(norm_composite.get(ind, 0) or 0, 4),
                "revenue_health": round(norm_rev_health.get(ind, 0) or 0, 4),
                "quarterly_growth": round(norm_qtr_growth.get(ind, 0) or 0, 4),
                "stockholder_activity": round(norm_stockholder.get(ind, 0) or 0, 4),
                "investment_safety": round(norm_safety.get(ind, 0) or 0, 4),
            }
            for ind in industries
        },
        "overall_scores": {ind: round(overall_scores[ind], 4) for ind in industries},
        "rankings": rankings,
    }


# ============================================================
# MAIN ENTRY POINT
# ============================================================

def run_industry_evaluation():
    """
    Main function: load all company JSONs, group by industry,
    compute per-industry aggregates, normalize across industries, rank, and save.
    """
    print("\n" + "=" * 60)
    print("INDUSTRY EVALUATION: Aggregating Companies by Industry")
    print("=" * 60)

    # 1. Load all company JSONs (from both Insights and Quant dirs)
    all_companies = {}
    
    # First load comprehensive qualitative JSONs (which contain merged quant data)
    for company_folder in INSIGHTS_DIR.iterdir():
        if company_folder.is_dir():
            sym = company_folder.name
            json_path = company_folder / f"{sym}_individual.json"
            if json_path.exists():
                try:
                    with open(json_path, "r", encoding="utf-8") as f:
                        all_companies[sym] = json.load(f)
                except Exception as e:
                    print(f"  ❌ Failed to load {sym}: {e}")

    # Next load standalone Quant JSONs for companies that HAVEN'T been through the AI phase
    if QUANT_DIR.exists():
        for quant_file in QUANT_DIR.glob("*_quant.json"):
            sym = quant_file.stem.replace("_quant", "")
            if sym not in all_companies:
                try:
                    with open(quant_file, "r", encoding="utf-8") as f:
                        quant_data = json.load(f)
                        # Structure it identically to the merged JSON format so extract_company_metrics works
                        all_companies[sym] = {
                            "symbol": sym,
                            "quantitative_data": quant_data
                        }
                except Exception as e:
                    print(f"  ❌ Failed to load quant data for {sym}: {e}")

    if not all_companies:
        print("  ⚠ No companies found. Exiting industry evaluation.")
        return False

    print(f"  📦 Loaded {len(all_companies)} company JSONs.")

    # 2. Group by industry via yfinance
    print("  🔍 Grouping companies by industry via yfinance...")
    industry_map = defaultdict(list)
    for sym in all_companies.keys():
        try:
            ticker = yf.Ticker(f"{sym}.NS")
            industry = ticker.info.get("industry", "Unclassified")
            safe_industry = industry.replace(" ", "_").replace("/", "_")
            industry_map[safe_industry].append(sym)
        except Exception:
            print(f"    ⚠ Could not fetch industry for {sym}. Defaulting to Unclassified.")
            industry_map["Unclassified"].append(sym)

    print(f"  📊 Found {len(industry_map)} industries:")
    for ind, syms in sorted(industry_map.items(), key=lambda x: -len(x[1])):
        print(f"      {ind.replace('_', ' ')} → {len(syms)} companies: {', '.join(syms)}")

    # 3. Compute per-industry aggregates
    print("\n  ⚙ Computing per-industry aggregates...")
    industry_data = {}
    for industry, symbols in industry_map.items():
        result = aggregate_industry(symbols, all_companies)
        if result:
            result["industry"] = industry
            industry_data[industry] = result

            # Save per-industry JSON
            output_path = INDUSTRY_EVAL_DIR / f"{industry}_industry.json"
            with open(output_path, "w", encoding="utf-8") as f:
                json.dump(result, f, indent=2, ensure_ascii=False)
            print(f"    ✓ {industry.replace('_', ' ')} ({len(symbols)} companies) → {output_path.name}")

    if not industry_data:
        print("  ⚠ No industries with valid data. Exiting.")
        return False

    # 4. Cross-industry normalization & ranking
    print("\n  📈 Normalizing and ranking across industries...")
    scoring = compute_dimension_scores(industry_data)

    # Attach normalized scores and rank to each industry's data
    for ind in industry_data:
        industry_data[ind]["normalized_scores"] = scoring["normalized_dimensions"][ind]
        industry_data[ind]["overall_industry_score"] = scoring["overall_scores"][ind]
        industry_data[ind]["industry_rank"] = scoring["rankings"][ind]

        # Re-save with normalized scores
        output_path = INDUSTRY_EVAL_DIR / f"{ind}_industry.json"
        with open(output_path, "w", encoding="utf-8") as f:
            json.dump(industry_data[ind], f, indent=2, ensure_ascii=False)

    # 5. Build & save master summary
    summary_entries = []
    for ind in sorted(industry_data.keys(), key=lambda k: scoring["rankings"][k]):
        entry = {
            "industry": ind,
            "company_count": industry_data[ind]["company_count"],
            "companies": industry_data[ind]["companies"],
            "overall_score": scoring["overall_scores"][ind],
            "rank": scoring["rankings"][ind],
            "dimension_scores": scoring["normalized_dimensions"][ind],
        }
        summary_entries.append(entry)

    summary = {
        "total_industries": len(summary_entries),
        "total_companies": sum(e["company_count"] for e in summary_entries),
        "rankings": summary_entries,
    }

    summary_path = INDUSTRY_EVAL_DIR / "_industry_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, indent=2, ensure_ascii=False)

    print(f"\n  🏆 Industry Rankings:")
    for entry in summary_entries:
        print(f"     #{entry['rank']:>2}  {entry['industry'].replace('_', ' '):<40}  "
              f"Score: {entry['overall_score']:.4f}  ({entry['company_count']} companies)")

    print(f"\n  ✅ Saved {len(industry_data)} industry evaluations + master summary.")
    print(f"     → {INDUSTRY_EVAL_DIR}")
    return True


if __name__ == "__main__":
    run_industry_evaluation()
