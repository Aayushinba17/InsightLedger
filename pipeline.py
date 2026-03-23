"""
Main Execution Pipeline for InsightLedger
Orchestrates scraping, AI extraction, data merging, peer evaluation, and database upload.
"""

import json
from pathlib import Path

# Implemented pipeline modules
from symbols import get_nifty100_symbols
from scraper import run_scraper
from unzip import run_unzip_cleanup
from quantitative_fetcher import fetch_yfinance_metrics
from scraper.ai_extractor import run_ai_extraction
from scraper.merge_data import merge_folders
from scraper.peer_evaluator import run_scripted_peer_evaluation
import db_uploader

BASE_DIR = Path(__file__).resolve().parent.parent
PROGRESS_PATH = BASE_DIR / "data" / "progress.json"

def load_progress():
    """Loads pipeline progress to allow resuming after interruptions."""
    default = {
        "scraper": False,
        "scraping_done": False,
        "unzip_done": False,
        "quantitative_analysis": False,
        "quantitative_done": False,
        "quantitative_completed": [],
        "quantitative_pending": [],
        "individual_completed": [],
        "peer_eval_completed": [],
        "individual_skipped": []
    }

    if PROGRESS_PATH.exists():
        try:
            with open(PROGRESS_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
            merged = {**default, **data}
            if "quantitative_completed" not in merged:
                merged["quantitative_completed"] = []
            if "quantitative_pending" not in merged:
                merged["quantitative_pending"] = []
            return merged
        except Exception:
            return default
    return default


def save_progress(progress):
    """Saves pipeline state to disk."""
    PROGRESS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2)


def run_pipeline():
    print("Fetching NIFTY 100 symbols...")
    symbols = get_nifty100_symbols()
    symbols = symbols[80:100] 
    if "LICI" in symbols:
        symbols.remove("LICI")
    print(f"Found {len(symbols)} companies for processing.")

    progress = load_progress()

    # ========================================
    # PRE-PROCESSING: Scraper & Cleanup
    # ========================================
    if progress.get("scraper"):
        print("\n[STEP] Scraper: already done according to progress.json")
    else:
        print("\n[STEP] Running scraper (download 2 records per company)...")
        run_scraper(symbols)
        progress["scraper"] = True
        progress["scraping_done"] = True
        save_progress(progress)
        print("[DONE] Scraper completed.")

    if progress.get("unzip_done"):
        print("\n[STEP] Unzip cleanup: already done according to progress.json")
    else:
        print("\n[STEP] Running unzip cleanup...")
        run_unzip_cleanup()
        progress["unzip_done"] = True
        save_progress(progress)
        print("[DONE] Unzip cleanup completed.")

    # ========================================
    # QUANTITATIVE: Yahoo Finance Data
    # ========================================
    if progress.get("quantitative_done"):
        print("\n[STEP] Quantitative metrics: already done according to progress.json")
    else:
        print("\n[STEP] Fetching deterministic quantitative metrics (yfinance)...")
        if not progress.get("quantitative_pending"):
            progress["quantitative_pending"] = symbols.copy()

        def _progress_callback(symbol, success):
            if success and symbol not in progress["quantitative_completed"]:
                progress["quantitative_completed"].append(symbol)
            if symbol in progress["quantitative_pending"]:
                progress["quantitative_pending"].remove(symbol)
            progress["quantitative_analysis"] = len(progress["quantitative_completed"]) > 0
            progress["quantitative_done"] = len(progress["quantitative_pending"]) == 0
            save_progress(progress)

        result = fetch_yfinance_metrics(symbols, progress_callback=_progress_callback)
        if result is None:
            completed, failed = [], symbols.copy()
        else:
            try:
                completed, failed = result
            except Exception as e:
                completed, failed = [], symbols.copy()

        progress["quantitative_completed"] = completed
        progress["quantitative_pending"] = [s for s in symbols if s not in completed]
        progress["quantitative_analysis"] = True
        progress["quantitative_done"] = len(progress["quantitative_pending"]) == 0
        save_progress(progress)
        print("[DONE] Quantitative metrics completed.")

    # ========================================
    # PHASE 1: Individual AI Company Analysis
    # ========================================
    print("\n" + "=" * 60)
    print("PHASE 1: Individual Company Analysis (Gemini Extract)")
    print("=" * 60)

    phase1_ok = run_ai_extraction(symbols)

    if not phase1_ok:
        print("\nPhase 1 interrupted (Likely API Rate Limit). Re-run pipeline to resume.")
        return

    # ========================================
    # DATA STITCHING: Merge Quant & Qual
    # ========================================
    print("\n" + "=" * 60)
    print("DATA INTEGRATION: Merging Quantitative and Qualitative Data")
    print("=" * 60)
    
    # 🚀 CRITICAL ADDITION: This must run before Phase 2!
    merge_folders()

    # ========================================
    # PHASE 2: Sector Peer Evaluation (Math Engine)
    # ========================================
    print("\n" + "=" * 60)
    print("PHASE 2: Sector Peer Evaluation (Python Math Engine)")
    print("=" * 60)

    phase2_ok = run_scripted_peer_evaluation()

    if not phase2_ok:
        print("\nPhase 2 failed. Check your individual JSON files for formatting errors.")
        return
        
    # ========================================
    # PHASE 3: Database Upload
    # ========================================
    print("\n" + "=" * 60)
    print("PHASE 3: Pushing Data to Local MongoDB")
    print("=" * 60)
    
    db_uploader.upload_individual_companies()
    db_uploader.upload_peer_evaluations()

    print("\n" + "=" * 60)
    print("🏁 Pipeline run complete! All data is staged and in the database.")
    print("=" * 60)

if __name__ == "__main__":
    run_pipeline()