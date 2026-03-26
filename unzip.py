import zipfile
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
REPORTS_DIR = BASE_DIR / "data" / "reports"


def extract_and_flatten_zip(zip_path, company_folder):
    try:
        temp_extract_folder = company_folder / zip_path.stem

        # Extract ZIP
        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            zip_ref.extractall(temp_extract_folder)

        print(f"Extracted → {zip_path.name}")

        # Find all PDFs inside extracted folder (recursive)
        pdf_files = list(temp_extract_folder.rglob("*.pdf"))

        for pdf in pdf_files:
            destination = company_folder / pdf.name

            # Avoid overwrite
            if not destination.exists():
                shutil.move(str(pdf), destination)
                print(f"Moved PDF → {pdf.name}")
            else:
                print(f"PDF already exists → {pdf.name}")

        # Remove extracted folder
        shutil.rmtree(temp_extract_folder)
        print(f"Removed temp folder → {temp_extract_folder.name}")

        # Remove original ZIP
        zip_path.unlink()
        print(f"Removed ZIP → {zip_path.name}")

    except zipfile.BadZipFile:
        print(f"Invalid ZIP file → {zip_path.name}")
    except Exception as e:
        print(f"Error processing {zip_path.name}: {e}")


def process_all_companies():
    for company_folder in REPORTS_DIR.iterdir():
        if company_folder.is_dir():
            print(f"\nProcessing company: {company_folder.name}")

            zip_files = list(company_folder.glob("*.zip"))

            for zip_file in zip_files:
                extract_and_flatten_zip(zip_file, company_folder)

def run_unzip_cleanup():
    process_all_companies()


if __name__ == "__main__":
    process_all_companies()
    print("\nUnzip cleanup completed.")
