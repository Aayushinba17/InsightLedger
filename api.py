import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pymongo import MongoClient
from dotenv import load_dotenv

# Load the environment variables (.env file)
load_dotenv()

app = FastAPI(title="Insight Ledger API")

origins = [
    "http://localhost:5173",  # Keep this for local testing
    "https://insightledger.onrender.com",
    # <-- Paste your Vercel URL here! (No slash at the end)
    "https://insightledger.vercel.app"
]

# Setup CORS so your React frontend (localhost:5173) can talk to this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # For production, change this to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connect to MongoDB Atlas
MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI, tlsAllowInvalidCertificates=True)
db = client['insightledger']

# ==========================================
# API ENDPOINTS
# ==========================================


@app.get("/")
def read_root():
    return {"status": "API is running!", "database": "Connected"}


@app.get("/api/company/{symbol}")
def get_company(symbol: str):
    """Fetch individual company data by ticker symbol"""
    # Exclude the MongoDB '_id' field from the response
    data = db.companies.find_one({"symbol": symbol.upper()}, {"_id": 0})
    if not data:
        raise HTTPException(
            status_code=404, detail=f"Company {symbol} not found")
    return data


@app.get("/api/sectors")
def get_all_sectors():
    """Fetch all sector peer evaluations"""
    data = list(db.sector_evaluations.find({}, {"_id": 0}))
    return data


@app.get("/api/sector/{industry_name}")
def get_sector_by_name(industry_name: str):
    """Fetch a specific sector's peer evaluation"""
    data = db.sector_evaluations.find_one(
        {"industry": industry_name}, {"_id": 0})
    if not data:
        raise HTTPException(status_code=404, detail="Sector not found")
    return data


@app.get("/api/industries")
def get_all_industries():
    """Fetch all industry aggregated evaluations (excluding the summary)"""
    data = list(db.industry_evaluations.find(
        {"_type": {"$ne": "industry_summary"}}, {"_id": 0}))
    return data


@app.get("/api/industry-summary")
def get_industry_summary():
    """Fetch the master industry summary"""
    data = db.industry_evaluations.find_one(
        {"_type": "industry_summary"}, {"_id": 0})
    if not data:
        raise HTTPException(
            status_code=404, detail="Industry summary not found")
    return data


@app.get("/api/industry/{industry_name}")
def get_industry_by_name(industry_name: str):
    """Fetch a specific industry's aggregated evaluation"""
    data = db.industry_evaluations.find_one(
        {"industry": industry_name}, {"_id": 0})
    if not data:
        raise HTTPException(status_code=404, detail="Industry not found")
    return data

@app.get("/api/companies")
def get_all_companies():
    """Fetch a list of all company ticker symbols for the search bar"""
    # Grabs just the "symbol" field from all documents in the companies collection
    companies = db.companies.find({}, {"_id": 0, "symbol": 1})
    # Returns a simple list of strings like ["HDFCBANK", "INFY", "TCS"]
    return [company["symbol"] for company in companies if "symbol" in company]

# File: api.py

@app.get("/api/index-scores")
def get_all_index_scores():
    """Fetch global fundamental scores and Z-Scores."""
    companies = list(db.companies.find(
        {}, 
        {
            "_id": 0, 
            "symbol": 1, 
            "fundamental_score": 1, 
            "z_score": 1,
            "business_overview": 1,
            "industry": 1
        }
    ))
    return companies

@app.get("/api/top-performers")
def get_top_performers():
    """Fetch the top 6 companies based on Global Z-Score."""
    companies = list(db.companies.find(
        {"z_score": {"$exists": True}}, 
        {
            "_id": 0, 
            "symbol": 1, 
            "z_score": 1,
            "business_overview": 1,
            "industry": 1
        }
    ).sort("z_score", -1).limit(6))
    return companies

@app.get("/api/industry/{industry_name}/companies")
def get_industry_companies(industry_name: str):
    """Fetch all companies belonging to a specific industry, ordered by fundamental score."""
    companies = list(db.companies.find(
        # Note: You might need to adjust "company_metadata.industry" depending on exactly where industry is stored in your DB
        {"company_metadata.industry": industry_name}, 
        {
            "_id": 0, 
            "symbol": 1, 
            "fundamental_score": 1, 
            "z_score": 1
        }
    ).sort("fundamental_score", -1)) # Sort descending so the best company is first
    return companies

# ==========================================
# EXECUTE
# ==========================================
if __name__ == "__main__":
    import uvicorn
    # Runs the server on port 8000
    uvicorn.run("api:app", host="0.0.0.0", port=8000, reload=True)
