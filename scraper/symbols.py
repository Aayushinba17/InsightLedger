# import requests
# import json

# session = requests.Session()

# headers = {
#     "User-Agent": "Mozilla/5.0",
#     "Accept": "application/json",
#     "Referer": "https://www.nseindia.com/"
# }

# # Step 1: get cookies
# session.get("https://www.nseindia.com", headers=headers)

# # Step 2: call Nifty 50 API
# url = "https://www.nseindia.com/api/equity-stockIndices"

# params = {
#     "index": "NIFTY 50"
# }

# response = session.get(url, headers=headers, params=params)
# data = response.json()

# symbols = []

# for stock in data["data"]:
#     symbol = stock["symbol"]
#     symbols.append(symbol)

# print(symbols)

# symbols.py

# symbols.py




# import requests


# def get_nifty50_symbols():
#     session = requests.Session()

#     headers = {
#         "User-Agent": "Mozilla/5.0",
#         "Accept": "application/json",
#         "Referer": "https://www.nseindia.com/"
#     }

#     session.get("https://www.nseindia.com", headers=headers)

#     url = "https://www.nseindia.com/api/equity-stockIndices"
#     params = {"index": "NIFTY 50"}

#     response = session.get(url, headers=headers, params=params)
#     data = response.json()

#     # Filter out non-stock entries (like "NIFTY 50")
#     symbols = [
#         stock["symbol"]
#         for stock in data["data"]
#         if stock.get("symbol") and stock["symbol"] != "NIFTY 50"
#     ]

#     return symbols


# if __name__ == "__main__":
#     print(get_nifty50_symbols())




# symbols.py

import requests

def get_nifty100_symbols():
    session = requests.Session()

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/"
    }

    # Step 1: Get cookies
    session.get("https://www.nseindia.com", headers=headers)

    # Step 2: Call Nifty 100 API
    url = "https://www.nseindia.com/api/equity-stockIndices"
    params = {"index": "NIFTY 100"}  # <--- Changed to NIFTY 100

    response = session.get(url, headers=headers, params=params)
    data = response.json()

    # Filter out non-stock entries (like the "NIFTY 100" header row itself)
    symbols = [
        stock["symbol"]
        for stock in data["data"]
        if stock.get("symbol") and stock["symbol"] != "NIFTY 100"
    ]

    # Return as many as available (nifty lists are typically 50/100/500)
    return symbols

if __name__ == "__main__":
    # Test to see if it prints all 100
    print(get_nifty100_symbols())
