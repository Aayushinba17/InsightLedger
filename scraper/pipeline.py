# pipeline.py

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
    symbols=symbols[80:100]
    if "LICI" in symbols:
        symbols.remove("LICI")
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

# <<<<<<< HEAD
#     # Optionally run AI extraction for qualitative insights
#     # print("\nExtracting qualitative insights from PDFs (Gemini)...")
#     # run_ai_extraction(symbols)

# <<<<<<< HEAD
#     # ========================================
#     # Phase 1: Individual company analysis
#     # ========================================
#     print("\n" + "=" * 60)
#     print("PHASE 1: Individual Company Analysis (Gemini)")
#     print("=" * 60)

#     phase1_ok = run_ai_extraction(symbols)

#     if not phase1_ok:
#         print("\nPhase 1 interrupted. Re-run pipeline to resume from where it stopped.")
#         return

#     # ========================================
#     # Phase 2: Peer group evaluation
#     # ========================================
# #     print("\n" + "=" * 60)
# #     print("PHASE 2: Peer Group Evaluation (Gemini)")
# #     print("=" * 60)

# #     phase2_ok = run_peer_evaluation(symbols)

# #     if not phase2_ok:
# #         print("\nPhase 2 interrupted. Re-run pipeline to resume from where it stopped.")
# #         return

#     print("\n" + "=" * 60)
#     print("Pipeline completed successfully.")
#     print("=" * 60)
# =======
#     print("\nPipeline completed successfully.")
# >>>>>>> 7b1047652d4959cb54a5f50dee8b98e7392a47dc
# =======
#     print("\nPipeline run complete. Progress saved to progress.json.")
# >>>>>>> df66bede97c30b1c9f1e9ec4da7c79a69786a8fb

# ========================================
    # Phase 1: Individual company analysis
    # ========================================
    print("\n" + "=" * 60)
    print("PHASE 1: Individual Company Analysis (Gemini)")
    print("=" * 60)

    phase1_ok = run_ai_extraction(symbols)

    if not phase1_ok:
        print("\nPhase 1 interrupted. Re-run pipeline to resume.")
        return

    print("\n" + "=" * 60)
    print("Pipeline run complete. Progress saved to progress.json.")
    print("=" * 60)

if __name__ == "__main__":
    run_pipeline()
