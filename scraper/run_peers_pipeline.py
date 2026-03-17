import symbols
import ai_extractor
import find_peers

def main():
    print("Fetching symbols...")
    nifty_symbols = symbols.get_nifty50_symbols()
    print(f"Concatenating JSONs for {len(nifty_symbols)} symbols...")
    ai_extractor.concatenate_individual_jsons(nifty_symbols)
    
    print("\nRunning peer finding process...")
    find_peers.main()

if __name__ == "__main__":
    main()
