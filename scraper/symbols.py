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

import requests


def get_nifty_symbols(index_name="NIFTY 100"):
    session = requests.Session()

    headers = {
        "User-Agent": "Mozilla/5.0",
        "Accept": "application/json",
        "Referer": "https://www.nseindia.com/"
    }

    session.get("https://www.nseindia.com", headers=headers)

    url = "https://www.nseindia.com/api/equity-stockIndices"
    params = {"index": index_name}

    response = session.get(url, headers=headers, params=params)
    data = response.json()

    symbols = [
        stock["symbol"]
        for stock in data.get("data", [])
        if stock.get("symbol")
    ]

    # Return as many as available (nifty lists are typically 50/100/500)
    return symbols


def get_nifty100_symbols():
    return get_nifty_symbols("NIFTY 100")


if __name__ == "__main__":
    print(get_nifty_symbols())
