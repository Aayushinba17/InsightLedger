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
You are a Financial Regulatory Extraction Assistant. 
Analyze the provided annual report and generate a normalized qualitative report. 
Evaluate the company on a scale of 1 to 10 in three categories: 
1. Governance
2. Risk Management
3. Growth Outlook

For every score given, you MUST justify it with exact quotes and page references from the document.
Format the output as a clean, readable report with clear headings. Use standard text and bullet points. Do not use markdown tables or special characters that might break PDF formatting.
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
