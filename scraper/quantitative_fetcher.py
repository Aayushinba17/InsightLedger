import yfinance as yf
import json
from pathlib import Path

# Setup directories
DATA_DIR = Path("data")
QUANT_DIR = DATA_DIR / "quantitative"
QUANT_DIR.mkdir(parents=True, exist_ok=True)

def fetch_yfinance_metrics(symbols):
    """
    Fetches hard quantitative data to bypass the LLM.
    """
    for symbol in symbols:
        print(f"Fetching quantitative data for {symbol}...")
        
        # yfinance uses .NS for NSE stocks
        ticker = yf.Ticker(f"{symbol}.NS")
        
        try:
            info = ticker.info
            
            # Extract only what we need for the relative scoring engine
            metrics = {
                "symbol": symbol,
                "pe_ratio": info.get("trailingPE"),
                "forward_pe": info.get("forwardPE"),
                "pb_ratio": info.get("priceToBook"),
                "ev_ebitda": info.get("enterpriseToEbitda"),
                "roe": info.get("returnOnEquity"),
                "revenue_growth": info.get("revenueGrowth")
            }
            
            # Save to JSON
            save_path = QUANT_DIR / f"{symbol}_quant.json"
            with open(save_path, "w") as f:
                json.dump(metrics, f, indent=4)
                
            print(f"Saved metrics to {save_path}")
            
        except Exception as e:
            print(f"Failed to fetch data for {symbol}: {e}")

if __name__ == "__main__":
    # Test with a few symbols
    fetch_yfinance_metrics(["RELIANCE", "TCS"])