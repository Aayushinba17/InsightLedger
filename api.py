import os
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv
import yfinance as yf
from datetime import datetime, timezone

# ============================
# LOAD ENVIRONMENT VARIABLES
# ============================
load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
print(
    f"🔍 DEBUG: MONGO_URI loaded = {MONGO_URI[:100]}..." if MONGO_URI else "❌ MONGO_URI NOT FOUND in .env")

if not MONGO_URI:
    raise ValueError("MONGO_URI is missing in .env file! Check your root .env")

# ============================
# CONNECT TO MONGODB ATLAS
# ============================
client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
db = client['insightledger']
print("🟢 Successfully connected to MongoDB Atlas!")

# --- NEW: TRACKING PROCESSING SYMBOLS IN MEMORY ---
processing_symbols = set()

# ============================
# FASTAPI APP SETUP
# ============================
app = FastAPI(title="Insight Ledger API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:5175",
                   "http://127.0.0.1:5173", "http://127.0.0.1:5174", "https://insight-ledger-eta.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================
# NEWS PARSER — handles all known yfinance formats
# ============================


def parse_news_item(item: dict) -> dict | None:
    """
    yfinance has shipped multiple news-response shapes across versions.

    Shape A — v0.2.50+ (nested under "content"):
      {
        "content": {
          "title": "...",
          "summary": "...",
          "pubDate": "2025-03-28T10:30:00Z",
          "canonicalUrl": { "url": "https://..." },
          "provider": { "displayName": "Reuters" }
        }
      }

    Shape B — older versions (flat keys):
      { "title": "...", "link": "...", "publisher": "...", "providerPublishTime": 1234567 }

    Shape C — some versions nest under "body" or expose both shapes simultaneously.
    We try Shape A first, fall back field-by-field to Shape B/C.

    Returns None if we can't extract at minimum a title + link.
    """
    title = None
    link = None
    publisher = None
    summary = None
    published_str = None

    # ── Shape A: content dict ──────────────────────────────────────────────
    content = item.get("content") if isinstance(item, dict) else None
    if content and isinstance(content, dict):
        title = content.get("title") or content.get("headline")
        summary = content.get("summary") or content.get("description")

        canonical = content.get("canonicalUrl") or content.get("url") or {}
        if isinstance(canonical, dict):
            link = canonical.get("url")
        elif isinstance(canonical, str):
            link = canonical

        provider = content.get("provider") or {}
        if isinstance(provider, dict):
            publisher = provider.get("displayName") or provider.get("name")
        elif isinstance(provider, str):
            publisher = provider

        pub_date = content.get("pubDate") or content.get("publishedAt")
        if pub_date and isinstance(pub_date, str):
            try:
                dt = datetime.fromisoformat(pub_date.replace("Z", "+00:00"))
                published_str = dt.strftime("%d %b %Y")
            except Exception:
                pass

    # ── Shape B / C: top-level flat fields (fill any gaps left by Shape A) ──
    if not title:
        title = item.get("title") or item.get("headline")
    if not link:
        link = item.get("link") or item.get("url")
    if not publisher:
        publisher = item.get("publisher") or item.get("source")
    if not summary:
        summary = item.get("summary") or item.get("description")
    if not published_str:
        ts = item.get("providerPublishTime") or item.get("publishedAt")
        if ts:
            try:
                published_str = datetime.fromtimestamp(
                    int(ts), tz=timezone.utc).strftime("%d %b %Y")
            except Exception:
                try:
                    # Sometimes it's already an ISO string
                    dt = datetime.fromisoformat(str(ts).replace("Z", "+00:00"))
                    published_str = dt.strftime("%d %b %Y")
                except Exception:
                    pass

    # Discard items that don't have the two minimum required fields
    if not title or not link:
        return None

    return {
        "title":        title.strip(),
        "summary":      summary.strip() if summary else None,
        "link":         link.strip(),
        "publisher":    publisher.strip() if publisher else None,
        "published_at": published_str,
    }


def fetch_news_for_symbol(sym: str) -> list[dict]:
    """
    Tries three ticker variants in order and returns the first non-empty result.
    Always returns a list — never raises.
    Variants tried:
      1. <SYM>.NS  (NSE-listed Indian stocks)
      2. <SYM>.BO  (BSE-listed Indian stocks — fallback)
      3. <SYM>     (US / international — final fallback)
    """
    variants = [f"{sym}.NS", f"{sym}.BO", sym]

    for ticker_str in variants:
        try:
            ticker = yf.Ticker(ticker_str)
            raw = ticker.news  # returns list or None

            # yfinance ≥0.2.61 sometimes returns a dict with a "news" key
            if isinstance(raw, dict):
                raw = raw.get("news") or []

            if raw:
                return list(raw)
        except Exception as exc:
            print(f"⚠️  yfinance news fetch failed for {ticker_str}: {exc}")
            continue

    return []


# ============================
# API ENDPOINTS
# ============================

@app.get("/")
def read_root():
    return {"status": "API is running!", "database": "Connected to Atlas"}


@app.get("/api/companies")
def get_all_companies():
    companies = list(db.companies.find({}, {"_id": 0, "symbol": 1}))
    return [c["symbol"] for c in companies if "symbol" in c]


@app.get("/api/company/{symbol}")
def get_company(symbol: str):
    sym = symbol.upper().strip()
    
    # 1. Check if we're currently processing it
    if sym in processing_symbols:
        return {"status": "processing", "symbol": sym}
        
    # 2. Check if it's already in the database
    data = db.companies.find_one({"symbol": sym}, {"_id": 0})
    if not data:
        return {"status": "not_found", "symbol": sym}
        
    return {"status": "success", "data": data}


def run_pipeline_task(symbol: str):
    """Background task to run the pipeline."""
    from pipeline import run_pipeline
    try:
        print(f"🚀 [BACKGROUND] Starting pipeline for {symbol}...")
        run_pipeline(manual_symbol=symbol)
        print(f"✅ [BACKGROUND] Pipeline finished for {symbol}")
    except Exception as e:
        print(f"❌ [BACKGROUND] Pipeline failed for {symbol}: {e}")
    finally:
        if symbol in processing_symbols:
            processing_symbols.remove(symbol)


@app.post("/api/pipeline/{symbol}")
async def trigger_pipeline(symbol: str, background_tasks: BackgroundTasks):
    sym = symbol.upper().strip()
    
    # Check if already in database
    exists = db.companies.find_one({"symbol": sym}, {"_id": 0})
    if exists:
        return {"status": "already_exists", "symbol": sym}

    if sym in processing_symbols:
        return {"status": "already_processing", "symbol": sym}

    processing_symbols.add(sym)
    background_tasks.add_task(run_pipeline_task, sym)
    
    return {"status": "started", "symbol": sym}


@app.get("/api/sectors")
def get_all_sectors():
    return list(db.sector_evaluations.find({}, {"_id": 0}))


@app.get("/api/sector/{industry_name}")
def get_sector_by_name(industry_name: str):
    data = db.sector_evaluations.find_one(
        {"industry": industry_name}, {"_id": 0})
    if not data:
        raise HTTPException(status_code=404, detail="Sector not found")
    return data


@app.get("/api/industries")
def get_all_industries():
    return list(db.industry_evaluations.find({"_type": {"$ne": "industry_summary"}}, {"_id": 0}))


@app.get("/api/industry-summary")
def get_industry_summary():
    data = db.industry_evaluations.find_one(
        {"_type": "industry_summary"}, {"_id": 0})
    if not data:
        raise HTTPException(
            status_code=404, detail="Industry summary not found")
    return data


@app.get("/api/industry/{industry_name}")
def get_industry_by_name(industry_name: str):
    data = db.industry_evaluations.find_one(
        {"industry": industry_name}, {"_id": 0})
    if not data:
        raise HTTPException(status_code=404, detail="Industry not found")
    return data


@app.get("/api/index-scores")
def get_all_index_scores():
    companies = list(db.companies.find(
        {},
        {"_id": 0, "symbol": 1, "fundamental_score": 1,
            "z_score": 1, "business_overview": 1, "industry": 1}
    ))
    return companies


@app.get("/api/top-performers")
def get_top_performers():
    companies = list(db.companies.find(
        {"z_score": {"$exists": True}},
        {"_id": 0, "symbol": 1, "z_score": 1, "business_overview": 1, "industry": 1}
    ).sort("z_score", -1).limit(6))
    return companies

# ============================
# LIVE NEWS ENDPOINT
# ============================


@app.get("/api/news/{symbol}")
def get_live_news(symbol: str):
    """
    Returns up to 3 parsed news articles for the given ticker symbol.
    Tries NSE (.NS), BSE (.BO), and bare symbol variants.
    Always returns {"news": []} on failure — never a 500.
    """
    sym = symbol.upper().strip()

    try:
        raw_items = fetch_news_for_symbol(sym)
    except Exception as exc:
        print(f"❌ Unexpected error fetching news for {sym}: {exc}")
        return {"news": []}

    cleaned: list[dict] = []
    for item in raw_items:
        try:
            parsed = parse_news_item(item)
            if parsed:
                cleaned.append(parsed)
            if len(cleaned) == 3:
                break
        except Exception as exc:
            print(f"⚠️  parse_news_item error: {exc}")
            continue

    return {"news": cleaned}


# ============================
# RUN SERVER
# ============================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
