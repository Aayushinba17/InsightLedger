import google.generativeai as genai
import json
import time
import os
from dotenv import load_dotenv
from fpdf import FPDF
from pathlib import Path

# 1. CONFIGURE THE API SECURELY
load_dotenv()  # This loads the variables from your .env file
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("API key not found! Please check your .env file.")

genai.configure(api_key=api_key)

# Setup directories
REPORTS_DIR = Path("data/reports")
INSIGHTS_DIR = Path("data/qualitative_insights")
INSIGHTS_DIR.mkdir(parents=True, exist_ok=True)

# 2. SET UP THE PROMPT & MODEL
system_instruction = """
You are an evidence-first document extraction assistant for financial annual reports. Your job is only to extract structured facts and qualitative judgments from the supplied PDF, and to return a single JSON object matching the schema below.
Important rules:

Return only valid JSON (no markdown, no explanatory text, no backticks). If you cannot extract a field, return null for that field and "evidence": [].

For every qualitative judgement, score, or assertion, include one or more evidence items with page, quote (exact excerpt), and optional location (e.g., section header or sentence index). Keep quotes verbatim and limit each quote to 400 characters.

Numeric values must be normalized: return numbers as JSON numbers (no commas), and include currency and units when relevant. If you detect lakhs/crores, convert to plain numbers and set units (e.g., units: "INR", scale: "crore", and normalized_value: 1234500000). If the document does not state currency, set currency to null.

Do not hallucinate: if a fact or metric is not present or uncertain, set that field to null and provide an empty evidence array or an explicit {"note":"not found in document"} inside evidence.

Use the schema exactly. If a list is empty, return []. If an object field is missing, return null.

Use the fiscal year or report year indicated in the document when assigning report_year. If unclear, return null.

For text fields (MD&A summary, Auditor remarks summary, Related party summary), produce short normalized strings (max 200 words each) and attach evidence items.

Provide a confidence score [0.0–1.0] for each major block (Governance, Risk, Growth, Financials) indicating how confident you are that the field is correctly extracted from the document.

Output must validate as JSON and conform to the schema below.

Schema (enforced): (the model must output JSON matching the schema defined below — examples follow) Do not use markdown tables or special characters that might break PDF formatting.
{
  "company": {
    "name": "string or null",
    "identifier": { "isin": "string/null", "ticker": "string/null", "cin": "string/null" },
    "report_year": "YYYY or null"
  },
  "metadata": {
    "pages": "integer or null",
    "currency": "string or null (e.g., INR, USD)",
    "units": "string or null (e.g., crore, million, thousand, number)",
    "fiscal_period": "string or null (e.g., FY2023-24)",
    "pdf_path": "string or null (path you provided)"
  },
  "financials": {
    "income_statement_summary": {
      "revenue": { "value": number|null, "currency":"", "units":"", "evidence":[{"page":int,"quote":"..."}] },
      "net_profit": { "value": number|null, ... },
      "ebitda": { "value": number|null, ... },
      "notes": "short string or null",
      "confidence": number
    },
    "balance_sheet_summary": {
      "total_assets": {...},
      "total_liabilities": {...},
      "equity": {...},
      "notes": "short string or null",
      "confidence": number
    },
    "key_ratios": {
      "roe": {"value": number|null,"units":"%","evidence":[]},
      "roce": {...},
      "debt_to_equity": {...},
      "current_ratio": {...},
      "interest_coverage": {...},
      "confidence": number
    }
  },
  "governance": {
    "score_1_10": {"value": number|null, "evidence": [{"page":int,"quote":"..."}]},
    "issues": [{"type":"string","description":"string","evidence":[{"page":int,"quote":"..."}]}],
    "board_structure": {"chair_and_ceo_separate": boolean|null, "independent_directors_percent": number|null, "board_changes": "short string or null", "evidence":[]},
    "auditor_opinion": {"type":"unqualified/qualified/adverse/disclaimer/other/null", "text_summary":"string or null", "evidence":[]},
    "related_party_transactions": {"flagged": boolean, "summary":"string or null","evidence":[]},
    "confidence": number
  },
  "risk_management": {
    "score_1_10": {"value": number|null,"evidence":[]},
    "key_risks": [{"risk_type":"string","description":"string","likelihood":"low/medium/high/unknown","evidence":[...]}],
    "risk_controls_summary":"string or null",
    "confidence": number
  },
  "growth_outlook": {
    "score_1_10": {"value": number|null,"evidence":[]},
    "drivers":"short string or null",
    "management_guidance":"string or null",
    "capex_plan": {"value": number|null, "currency":"", "units":"", "evidence":[]},
    "confidence": number
  },
  "evidence_index": [
    {"page": int, "section_heading": "string or null", "text_snippet": "string (<=400 chars)"}
  ],
  "summary_comparison_vector": {
    "numeric_vector": {"valuation": number|null, "growth": number|null, "profitability": number|null, "risk": number|null},
    "tags": ["DashPick","Watchlist","Avoid","Other"],
    "confidence": number
  },
  "processing": {
    "warnings": ["strings..."],
    "errors": [],
    "extraction_time_seconds": number
  }
}
Rules for scoring & normalization:

Scores score_1_10 must be integers 1–10. If you cannot assign integer confidently, set value to null.

confidence fields are floats 0.0–1.0.

evidence arrays must contain at least one object with page and quote for any non-null field that claims facts.

numeric_vector values should be normalized z-score style relative to the document where possible; if not possible, use null. (Your extraction should ensure downstream analytics will be deterministic — raw numbers are most important.)
"""

model = genai.GenerativeModel(
    model_name="gemini-2.5-flash",
    system_instruction=system_instruction
)

# 3. PDF GENERATOR HELPER FUNCTION
def create_pdf_report(text_content, save_path):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=11)
    
    # Clean text to prevent character encoding errors in FPDF
    clean_text = text_content.encode('latin-1', 'replace').decode('latin-1')
    
    # Write the text to the PDF
    pdf.multi_cell(0, 6, txt=clean_text)
    pdf.output(str(save_path))

def process_pdf_with_gemini(pdf_path, symbol):
    print(f"\nUploading {pdf_path.name} to Gemini...")

    try:
        # Upload the file to Gemini's temporary storage
        uploaded_file = genai.upload_file(
            path=pdf_path, mime_type="application/pdf")

        # --- NEW POLLING LOGIC ---
        print("Waiting for Google servers to process the document", end="")
        while True:
            # Check the current state of the file
            file_info = genai.get_file(uploaded_file.name)

            if file_info.state.name == "PROCESSING":
                print(".", end="", flush=True)
                time.sleep(5)  # Wait 5 seconds and check again
            elif file_info.state.name == "ACTIVE":
                print("\nDocument is ready!")
                break
            elif file_info.state.name == "FAILED":
                print("\nDocument processing failed on Google's end. Skipping.")
                return  # Exit the function for this specific file
        # -------------------------

        print("Extracting insights (this may take 1-2 minutes for large PDFs)...")

        print("Generating 1-10 scaled report (this may take 1-2 minutes)...")

        # Call the model (Notice we removed the JSON response_schema)
        response = model.generate_content(
            [uploaded_file, "Generate the normalized scoring report based on your system instructions."],
            request_options={"timeout": 600},
            generation_config=genai.GenerationConfig(
                temperature=0.1 # Keep this low so it relies on facts, not hallucination
            )
        )

        # Save as PDF instead of JSON
        company_insight_dir = INSIGHTS_DIR / symbol
        company_insight_dir.mkdir(exist_ok=True)
        
        # Change the extension to .pdf
        pdf_save_path = company_insight_dir / f"{pdf_path.stem}_AI_Report.pdf"
        
        # Call the new PDF function
        create_pdf_report(response.text, pdf_save_path)

        print(f"Successfully saved AI PDF report to {pdf_save_path.name}")

    except Exception as e:
        print(f"Error analyzing {pdf_path.name}: {e}")

    finally:
        # ALWAYS clean up the file from Gemini's servers
        try:
            genai.delete_file(uploaded_file.name)
            print("Deleted file from Gemini servers.")
        except:
            pass


def run_ai_extraction(symbols):
    """Iterates through all downloaded PDFs for the given symbols and extracts insights."""
    for symbol in symbols:
        company_folder = REPORTS_DIR / symbol
        if not company_folder.exists():
            print(f"No reports folder found for {symbol}. Skipping.")
            continue

        # Find all PDFs for this company
        pdf_files = list(company_folder.glob("*.pdf"))

        for pdf_path in pdf_files:
            process_pdf_with_gemini(pdf_path, symbol)
            # Add a small delay to avoid hitting Gemini API rate limits
            time.sleep(15)


if __name__ == "__main__":
    # Test with one specific PDF downloaded by your scraper
    # Update this path to an actual PDF in your data folder
    sample_pdf = Path("data/reports/RELIANCE/AR_2021_2022.pdf")
    if sample_pdf.exists():
        process_pdf_with_gemini(sample_pdf, "RELIANCE")
    else:
        print("Please provide a valid PDF path to test.")
