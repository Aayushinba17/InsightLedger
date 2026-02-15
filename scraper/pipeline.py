# pipeline.py

from symbols import get_nifty50_symbols
from scraper import run_scraper
from unzip import run_unzip_cleanup


def run_pipeline():
    print("Fetching NIFTY 50 symbols...")
    symbols = get_nifty50_symbols()

    print(f"Found {len(symbols)} companies.")

    print("\nRunning scraper...")
    run_scraper(symbols)

    print("\nRunning unzip cleanup...")
    run_unzip_cleanup()

    print("\nPipeline completed successfully.")


if __name__ == "__main__":
    run_pipeline()
