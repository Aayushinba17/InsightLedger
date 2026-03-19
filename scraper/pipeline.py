# pipeline.py

from symbols import get_nifty100_symbols
from scraper import run_scraper
from unzip import run_unzip_cleanup
from quantitative_fetcher import fetch_yfinance_metrics
from ai_extractor import run_ai_extraction

PROGRESS_PATH = Path(__file__).resolve().parent / "data" / "progress.json"


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
    progress["quantitative_pending"] = symbols.copy()

    print("\nRunning scraper (download 2 records per company)...")
    run_scraper(symbols)
    progress["scraper"] = True
    progress["scraping_done"] = True
    save_progress(progress)

    print("\nRunning unzip cleanup...")
    run_unzip_cleanup()
    progress["unzip_done"] = True
    save_progress(progress)

    print("Fetching deterministic quantitative metrics (yfinance) for all NIFTY 100 companies...")

    def _progress_callback(symbol, success):
        if success and symbol not in progress["quantitative_completed"]:
            progress["quantitative_completed"].append(symbol)
        if symbol in progress["quantitative_pending"]:
            progress["quantitative_pending"].remove(symbol)
        progress["quantitative_analysis"] = len(progress["quantitative_completed"]) > 0
        progress["quantitative_done"] = len(progress["quantitative_pending"]) == 0
        save_progress(progress)

    completed, failed = fetch_yfinance_metrics(symbols, progress_callback=_progress_callback)
    progress["quantitative_completed"] = completed
    progress["quantitative_pending"] = [s for s in symbols if s not in completed]
    progress["quantitative_analysis"] = True
    progress["quantitative_done"] = len(progress["quantitative_pending"]) == 0
    save_progress(progress)

    # Optionally run AI extraction for qualitative insights
    # print("\nExtracting qualitative insights from PDFs (Gemini)...")
    # run_ai_extraction(symbols)

<<<<<<< HEAD
    # ========================================
    # Phase 1: Individual company analysis
    # ========================================
    print("\n" + "=" * 60)
    print("PHASE 1: Individual Company Analysis (Gemini)")
    print("=" * 60)

    phase1_ok = run_ai_extraction(symbols)

    if not phase1_ok:
        print("\nPhase 1 interrupted. Re-run pipeline to resume from where it stopped.")
        return

    # ========================================
    # Phase 2: Peer group evaluation
    # ========================================
#     print("\n" + "=" * 60)
#     print("PHASE 2: Peer Group Evaluation (Gemini)")
#     print("=" * 60)

#     phase2_ok = run_peer_evaluation(symbols)

#     if not phase2_ok:
#         print("\nPhase 2 interrupted. Re-run pipeline to resume from where it stopped.")
#         return

    print("\n" + "=" * 60)
    print("Pipeline completed successfully.")
    print("=" * 60)
=======
    print("\nPipeline completed successfully.")
>>>>>>> 7b1047652d4959cb54a5f50dee8b98e7392a47dc


if __name__ == "__main__":
    run_pipeline()
