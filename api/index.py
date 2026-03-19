from http.server import BaseHTTPRequestHandler
import yfinance as yf
import pandas as pd
import json

class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        # 1. Define a diverse list of tickers for a better demo
        # Includes Tech, Crypto, and Commodities
        symbols = ['AAPL', 'TSLA', 'NVDA', 'MSFT', 'AMZN', 'BTC-USD', 'ETH-USD', 'GC=F']
        
        try:
            # 2. Fetch data: 2 days of 1-hour intervals
            # We fetch 2 days to ensure we have at least 2 data points for the delta calculation
            data = yf.download(symbols, period="2d", interval="1h", group_by='ticker')
            
            gainers = []

            for ticker in symbols:
                # Extract data for the specific ticker and drop empty rows
                ticker_data = data[ticker].dropna()
                
                # Check if we have enough data points to compare (current vs previous hour)
                if len(ticker_data) >= 2:
                    current_price = ticker_data['Close'].iloc[-1]
                    previous_price = ticker_data['Close'].iloc[-2]
                    
                    # Calculate percentage change
                    percent_change = ((current_price - previous_price) / previous_price) * 100
                    
                    # Only add to list if the value increased
                    if percent_change > 0:
                        gainers.append({
                            "ticker": ticker,
                            "change": round(percent_change, 2),
                            "price": round(current_price, 2)
                        })

            # 3. Sort by highest gainers first
            gainers = sorted(gainers, key=lambda x: x['change'], reverse=True)

            # 4. Construct the successful HTTP response
            self.send_response(200)
            self.send_header('Content-type', 'application/json')
            # Essential for local testing if your frontend is on a different port
            self.send_header('Access-Control-Allow-Origin', '*') 
            self.end_headers()
            self.wfile.write(json.dumps(gainers).encode('utf-8'))

        except Exception as e:
            # Handle errors gracefully so the frontend gets a valid JSON error message
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            error_response = {"error": str(e)}
            self.wfile.write(json.dumps(error_response).encode('utf-8'))