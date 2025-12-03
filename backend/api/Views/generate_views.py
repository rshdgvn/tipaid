from rest_framework import generics
from rest_framework.decorators import api_view
from rest_framework.response import Response
import google.generativeai as genai
import json
from pathlib import Path
import environ
import os
from rest_framework.permissions import AllowAny
from ..utils.generate import generate, read_csv


BASE_DIR = Path(__file__).resolve().parent.parent

env = environ.Env()
environ.Env.read_env(os.path.join(BASE_DIR, ".env"))


genai.configure(api_key=env('AI_KEY'))




@api_view(["GET"])
def generate_recommendation(request):

    people = request.query_params.get("people")
    budget = request.query_params.get("budget")
    ingredients_raw = request.query_params.get("ingredients")

    # Parse ingredients from JSON string → Python list
    try:
        ingredients = json.loads(ingredients_raw) if ingredients_raw else []
    except:
        ingredients = []

    # Convert budget to float if present
    try:
        budget = float(budget) if budget else None
    except:
        budget = None

    # Load CSV store datasets
    osave = read_csv("osave")
    dali = read_csv("dali")
    dti = read_csv("dti")

    # ----------- AI PROMPT -----------------
    
    prompt = f"""
    You are a system that compares ingredient prices across three stores: Osave, Dali, and DTI.

    Here are the datasets:
    OSAVE: {osave}
    DALI: {dali}
    DTI: {dti}

    User needs ingredients: {ingredients}
    For {people} people.
    Budget: {budget}

    TASKS:
    1. For EACH INGREDIENT:
    - Find its price from all three stores.
    - Choose the CHEAPEST price.
    - Store must reflect where that cheapest value came from.

    2. Multiply ingredient amount based on number of people (if applicable).
    3. Sum all chosen cheapest prices = total_cost.
    4. Determine the recommended_store:
        - The store that provided the MOST cheapest ingredients.
        - If tie, choose the store with the overall lower total contribution.

    5. Compare total_cost with budget:
        - within_budget = true if total_cost <= budget.
        - If cost exceeds budget, adjusted_budget = total_cost.

    Return ONLY valid JSON in this exact format:

    {{
        "recommended_store": "osave/dali/dti",
        "ingredients": [
            {{
                "name": "Ingredient name",
                "price": 0,
                "store": "osave/dali/dti"
            }}
        ],
        "total_cost": 0,
        "within_budget": true/false,
        "adjusted_budget": null or number
    }}

    RULES:
    - ALWAYS choose the cheapest store per ingredient.
    - recommended_store MUST be osave, dali, or dti.
    - total_cost = sum of cheapest prices of all ingredients.
    - within_budget = true only if total_cost <= budget.
    - If over budget → adjusted_budget = total_cost.
    - Produce STRICT VALID JSON ONLY — no extra text or comments.
    """

    # ---------------------------------------

    ai_response = generate(prompt)
    return Response(ai_response)



    
