# pipeline.py

import json
from pathlib import Path
from symbols import get_nifty100_symbols
from scraper import run_scraper
from unzip import run_unzip_cleanup
from quantitative_fetcher import fetch_yfinance_metrics
from ai_extractor import run_ai_extraction

BASE_DIR = Path(__file__).resolve().parent.parent
PROGRESS_PATH = BASE_DIR / "data" / "progress.json"


def load_progress():
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
    PROGRESS_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(PROGRESS_PATH, "w", encoding="utf-8") as f:
        json.dump(progress, f, indent=2)


def run_pipeline():
    print("Fetching NIFTY 100 symbols...")
    symbols = get_nifty100_symbols()
    symbols = symbols[:100]
    print(f"Found {len(symbols)} companies.")

    progress = load_progress()

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
            print("Warning: fetch_yfinance_metrics returned None. Setting completed/failed lists to defaults.")
            completed, failed = [], symbols.copy()
        else:
            try:
                completed, failed = result
            except Exception as e:
                print(f"Warning: Unexpected fetch_yfinance_metrics return type: {type(result)}, error: {e}")
                completed, failed = [], symbols.copy()

        progress["quantitative_completed"] = completed
        progress["quantitative_pending"] = [s for s in symbols if s not in completed]
        progress["quantitative_analysis"] = True
        progress["quantitative_done"] = len(progress["quantitative_pending"]) == 0
        save_progress(progress)
        print("[DONE] Quantitative metrics completed.")

    # Run individual extraction if not done
    if progress.get("individual_completed") and len(progress.get("individual_completed")) >= len(symbols):
        print("\n[STEP] Individual extraction: already complete according to progress.json")
    else:
        print("\n[STEP] Running individual qualitative extraction for pending companies...")
        # Only run for skipped companies, not all symbols
        skipped = progress.get("individual_skipped", [])
        if skipped:
            print(f"  Re-running extraction for {len(skipped)} skipped companies: {', '.join(skipped)}")
            run_ai_extraction(skipped)
            progress = load_progress()
            print(f"[DONE] Re-ran individual extraction for skipped companies.")
        else:
            print("  No skipped companies to re-run. Individual extraction is complete.")

    print("\nPipeline run complete. Progress saved to progress.json.")


if __name__ == "__main__":
    run_pipeline()
