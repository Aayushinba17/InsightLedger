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
            
            # Prepare comprehensive metrics for schema_individual.json
            metrics = {
                "company_metadata": {
                    "company_name": info.get("longName") or info.get("shortName"),
                    "ticker": symbol,
                    "sector": info.get("sector"),
                    "industry": info.get("industry"),
                    "market_cap": info.get("marketCap"),
                    "headquarters": f"{info.get('city', '')}, {info.get('country', '')}".strip(', '),
                    "currency": info.get("currency") or info.get("financialCurrency", "INR")
                },
                "financial_metrics": {
                    "revenue": info.get("totalRevenue"),
                    "net_income": info.get("netIncomeToCommon"),
                    "operating_margin": info.get("operatingMargins"),
                    "roe": info.get("returnOnEquity"),
                    "debt_to_equity": info.get("debtToEquity"),
                },
                "valuation_metrics": {
                    "pe_ratio": info.get("trailingPE"),
                    "pb_ratio": info.get("priceToBook"),
                    "ev_ebitda": info.get("enterpriseToEbitda"),
                    "peg_ratio": info.get("pegRatio") or info.get("trailingPegRatio")
                }
            }
            
            # Additional logic to calculate missing financial metrics
            try:
                financials = ticker.financials
                cashflow = ticker.cashflow
                balance_sheet = ticker.balance_sheet
                
                # Free Cash Flow = Operating Cash Flow - Capital Expenditure
                if not cashflow.empty:
                    fcf = cashflow.loc['Free Cash Flow'].iloc[0] if 'Free Cash Flow' in cashflow.index else None
                    if fcf is None and 'Operating Cash Flow' in cashflow.index and 'Capital Expenditure' in cashflow.index:
                         fcf = cashflow.loc['Operating Cash Flow'].iloc[0] + cashflow.loc['Capital Expenditure'].iloc[0] # CapEx is usually negative
                    metrics["financial_metrics"]["free_cash_flow"] = fcf
                
                # Interest Coverage = EBIT / Interest Expense
                if not financials.empty:
                    ebit = financials.loc['EBIT'].iloc[0] if 'EBIT' in financials.index else None
                    interest = financials.loc['Interest Expense'].iloc[0] if 'Interest Expense' in financials.index else None
                    if ebit is not None and interest is not None and interest != 0:
                        metrics["financial_metrics"]["interest_coverage"] = abs(ebit / interest)
                    
                # ROIC = NOPAT / Invested Capital
                if not financials.empty and not balance_sheet.empty:
                    net_income = financials.loc['Net Income'].iloc[0] if 'Net Income' in financials.index else 0
                    tax_provision = financials.loc['Tax Provision'].iloc[0] if 'Tax Provision' in financials.index else 0
                    pretax_income = financials.loc['Pretax Income'].iloc[0] if 'Pretax Income' in financials.index else 1 # Avoid div zero
                    
                    effective_tax_rate = tax_provision / pretax_income if pretax_income != 0 else 0
                    ebit = financials.loc['EBIT'].iloc[0] if 'EBIT' in financials.index else 0
                    nopat = ebit * (1 - effective_tax_rate)
                    
                    total_debt = balance_sheet.loc['Total Debt'].iloc[0] if 'Total Debt' in balance_sheet.index else 0
                    total_equity = balance_sheet.loc['Stockholders Equity'].iloc[0] if 'Stockholders Equity' in balance_sheet.index else 0
                    cash = balance_sheet.loc['Cash And Cash Equivalents'].iloc[0] if 'Cash And Cash Equivalents' in balance_sheet.index else 0
                    
                    invested_capital = (total_debt + total_equity) - cash
                    if invested_capital > 0:
                        metrics["financial_metrics"]["roic"] = nopat / invested_capital
                        
            except Exception as calc_err:
                print(f"    Warning: Could not calculate advanced financial metrics for {symbol}: {calc_err}")
            
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