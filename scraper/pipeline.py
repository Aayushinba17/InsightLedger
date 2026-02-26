# pipeline.py

from symbols import get_nifty50_symbols
from scraper import run_scraper
from unzip import run_unzip_cleanup
from quantitative_fetcher import fetch_yfinance_metrics
from ai_extractor import run_ai_extraction


def run_pipeline():
    print("Fetching NIFTY 50 symbols...")
    ##symbols = get_nifty50_symbols()
    symbols = ["RELIANCE"]
    print(f"Found {len(symbols)} companies.")

    print("\nRunning scraper...")
    run_scraper(symbols)

    print("\nRunning unzip cleanup...")
    run_unzip_cleanup()

    print("Fetching deterministic quantitative metrics (yfinance)...")
    fetch_yfinance_metrics(symbols)
    
    print("\nExtracting qualitative insights from PDFs (Gemini)...")
    run_ai_extraction(symbols)

    print("\nPipeline completed successfully.")


if __name__ == "__main__":
    run_pipeline()
