
import google.generativeai as genai
import json
from pathlib import Path
import environ
import os
from django.conf import settings
import pandas as pd
from rest_framework.response import Response


BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))


genai.configure(api_key=env('AI_KEY'))

# -------------------------------------------------
#  AI GENERATOR (SAFE JSON)
# -------------------------------------------------
def generate(prompt):
    """
    Sends prompt to Gemini and returns strict JSON.
    Safely handles markdown, code fences, etc.
    """
    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = model.generate_content(prompt)

        text = response.text.strip()

        # Remove fences like ```json ... ```
        if text.startswith("```"):
            text = text.replace("```json", "").replace("```", "").strip()

        # Force valid JSON only
        parsed = json.loads(text)

        return {
            "success": True,
            "recommendation": parsed
        }

    except json.JSONDecodeError:
        return {
            "success": False,
            "error": "JSON parse failed",
            "raw_text": response.text
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

def read_csv(store):
    dataset_path = Path(settings.BASE_DIR) / "csv" / f"{store}.csv"

    if not dataset_path.exists():
        raise FileNotFoundError(f"CSV file not found: {dataset_path}")

    try:
        data = pd.read_csv(dataset_path)

        if data.empty:
            raise pd.errors.EmptyDataError(f"CSV file is empty: {dataset_path}")

        data = data.where(pd.notnull(data), None)

        return data.to_dict(orient='records')

    except pd.errors.ParserError as e:
        raise pd.errors.ParserError(f"Error parsing CSV file {dataset_path}: {str(e)}")
    except Exception as e:
        raise Exception(f"Unexpected error reading {dataset_path}: {str(e)}")
    
def check_loaded(csv):
    if csv is None or len(csv) == 0:
        return Response({"error": f"{csv} CSV not loaded or empty."}, status=500)
    else:
        print(f"csv is loaded")
        
# -------------------------------------------------
#  AI WEB-SCRAPER (Google-based)
# -------------------------------------------------
def ai_webscrape_price(store_name, ingredient):
    """
    AI fetches price by simulating a Google search.
    Extracts a single price or returns None.
    """

    # Construct Google search URL for each store
    url = f"https://www.google.com/search?q={store_name}+{ingredient}+price"

    prompt = f"""
    You are an AI web scraping engine.

    REQUIRED:
    - Fetch the webpage: {url}
    - Search for product related to "{ingredient}" at "{store_name}"
    - Extract the exact numeric price shown.
    - If multiple matches exist, choose the most relevant.
    - If price not available, return null.

    Return STRICT JSON only:
    {{
        "price": <number or null>
    }}
    """

    response = generate(prompt)
    print(response)
    if response.get("success"):
        price = response["recommendation"].get("price")
        try:
            return float(price) if price is not None else None
        except:
            return None

    return None


# -----------------------------------------------
#   PRICE NORMALIZER
# -----------------------------------------------
def normalize_price(value):
    """
    Converts any AI output to a clean float.
    Avoids None/null and keeps consistency.
    """
    try:
        if value is None:
            return 0.0
        if isinstance(value, str):
            value = value.replace("₱", "").replace(",", "").strip()
        value = float(value)
        return round(value, 2)
    except:
        return 0.0


# -----------------------------------------------
#   SCRAPE ALL STORES (Google URLs)
# -----------------------------------------------
def get_prices_from_ai(name):
    """
    Uses AI to scrape Google for each store and returns
    consistent, normalized, non-null prices.
    """

    stores = ["OSAVE", "Dali Supermarket", "Pampanga Market"]
    prices = {}

    for store in stores:
        price = ai_webscrape_price(store, name)
        prices[store.lower().replace(" ", "_")] = price

    # -----------------------------------------------
    #   FALLBACK : AI Estimated Prices
    # -----------------------------------------------
    missing_any = any(p is None for p in prices.values())
    if missing_any:
        prompt = f"""
        You MUST estimate accurate ingredient prices for:
        - OSAVE supermarket
        - Dali Supermarket (Philippines)
        - Public Markets in Pampanga

        Ingredient: "{name}"

        Use:
        - DA price watch bulletins
        - Public market reports
        - Facebook marketplace listings
        - Kapampangan local market trends
        - Fresh produce daily price patterns
        - Grocery pricing behavior

        Return STRICT JSON:
        {{
          "osave": <number>,
          "dali": <number>,
          "pampanga_market": <number>
        }}
        """

        ai_result = generate(prompt)
        if ai_result.get("success"):
            fb = ai_result["recommendation"]
            for store_key in prices:
                if prices[store_key] is None:
                    prices[store_key] = fb.get(store_key)

    # -----------------------------------------------
    #   NORMALIZE ALL PRICES
    # -----------------------------------------------
    for store_key in prices:
        prices[store_key] = normalize_price(prices[store_key])

    return prices