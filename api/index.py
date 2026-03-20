from http.server import BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
import yfinance as yf
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. Parse the URL to find extra tickers
        query = parse_qs(urlparse(self.path).query)
        extra_str = query.get('extra', [''])[0]
        
        # Base list + any custom ones from the cookie
        symbols = ['AAPL', 'TSLA', 'BTC-USD', 'ETH-USD']
        if extra_str:
            symbols += extra_str.split(',')

        # Remove duplicates and empty strings
        symbols = list(set([s.strip() for s in symbols if s.strip()]))

        try:
            data = yf.download(symbols, period="2d", interval="1h", group_by='ticker')
            gainers = []

            for ticker in symbols:
                ticker_data = data[ticker].dropna()
                if len(ticker_data) >= 2:
                    current = ticker_data['Close'].iloc[-1]
                    prev = ticker_data['Close'].iloc[-2]
                    change = ((current - prev) / prev) * 100
                    if change > 0:
                        gainers.append({"ticker": ticker, "change": round(change, 2)})

            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            self.send_header('Access-Control-Allow-Origin', '*')
            self.end_headers()
            self.wfile.write(json.dumps(gainers).encode('utf-8'))
        except Exception as e:
            self.send_response(500)
            self.end_headers()
            self.wfile.write(str(e).encode())