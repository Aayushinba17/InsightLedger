# pipeline.py

from symbols import get_nifty100_symbols
from scraper import run_scraper
from unzip import run_unzip_cleanup
from quantitative_fetcher import fetch_yfinance_metrics
from ai_extractor import run_ai_extraction, run_peer_evaluation, load_progress, save_progress


def run_pipeline():
    print("Fetching NIFTY 100 symbols...")
    symbols = get_nifty100_symbols()
    symbols=symbols[80:100]
    if "LICI" in symbols:
        symbols.remove("LICI")
    print(f"Found {len(symbols)} companies.")

    progress = load_progress()

    # --- Scraping ---
    if progress.get("scraping_done"):
        print("\nScraping already done. Skipping.")
    else:
        print("\nRunning scraper...")
        run_scraper(symbols)
        progress["scraping_done"] = True
        save_progress(progress)

    # --- Unzip ---
    if progress.get("unzip_done"):
        print("Unzip already done. Skipping.")
    else:
        print("\nRunning unzip cleanup...")
        run_unzip_cleanup()
        progress["unzip_done"] = True
        save_progress(progress)

    # --- Quantitative ---
    if progress.get("quantitative_done"):
        print("Quantitative fetch already done. Skipping.")
    else:
        print("\nFetching deterministic quantitative metrics (yfinance)...")
        fetch_yfinance_metrics(symbols)
        progress["quantitative_done"] = True
        save_progress(progress)

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


if __name__ == "__main__":
    run_pipeline()
