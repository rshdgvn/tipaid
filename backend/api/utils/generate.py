
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

def generate(prompt):
    try:
        model = genai.GenerativeModel('models/gemini-2.5-flash')
        response = model.generate_content(prompt)

        # Parse AI output
        text = response.text.strip()
        
        # Remove potential markdown code blocks
        if text.startswith("```"):
            text = text.split("```")[1]
            if text.startswith("json"):
                text = text[4:]
        text = text.strip()
        
        recommendation = json.loads(text)
        
    except json.JSONDecodeError:
        return {
            "error": "Failed to parse AI response",
            "raw_text": response.text
        }
    except Exception as e:
        return {
            "error": "Failed to generate questions",
            "details": str(e)
        }


    return {
        "success": True,
        "message": f"recommendation created successfully",
        "recommendation": recommendation
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
    