from rest_framework.decorators import api_view
from rest_framework.response import Response
import json
from django.conf import settings
from ..utils.generate import generate, check_loaded

@api_view(["GET"])
def generate_recommendation(request):

    # ---------------------------
    # GET PARAMETERS
    # ---------------------------
    people = request.query_params.get("people")
    budget = request.query_params.get("budget")
    ingredients_raw = request.query_params.get("ingredients")

    # Validate ingredients JSON
    try:
        ingredients = json.loads(ingredients_raw) if ingredients_raw else []
        if not isinstance(ingredients, list):
            raise ValueError
    except:
        return Response({"error": "Invalid ingredients JSON format."}, status=400)

    # Validate budget
    try:
        budget = float(budget) if budget else None
    except:
        return Response({"error": "Budget must be a number."}, status=400)

    # ---------------------------
    # USE CACHED CSV DATA
    # ---------------------------
    csv_data = settings.CSV_CACHE
    osave = csv_data["osave"]
    dali = csv_data["dali"]
    dti = csv_data["dti"]

    # Ensure CSVs are loaded
    check_loaded(osave)
    check_loaded(dali)
    check_loaded(dti)

    # Convert CSV data to JSON strings for AI prompt (faster than printing Python lists)
    osave_json = json.dumps(osave)
    dali_json = json.dumps(dali)
    dti_json = json.dumps(dti)

    # ---------------------------
    # AI PROMPT
    # ---------------------------
    prompt = f"""
    You are a system that compares ingredient prices across three stores: Osave, Dali, and DTI.

    Here are the datasets:
    OSAVE: {osave_json}
    DALI: {dali_json}
    DTI: {dti_json}

    User needs ingredients: {json.dumps(ingredients)}
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
            {{"name": "Ingredient name","price": 0,"store": "osave/dali/dti"}}
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

    # ---------------------------
    # RUN AI
    # ---------------------------
    ai_response = generate(prompt)
    return Response(ai_response)


@api_view(["GET"])
def generate_ingredients(request):
    """
    Generate ingredients for a given dish and match them with store datasets
    """

    # ---------------------------
    # GET PARAMETERS
    # ---------------------------
    dish = request.query_params.get("dish")
    people = request.query_params.get("people", 1)

    if not dish:
        return Response({"error": "Dish parameter is required."}, status=400)

    try:
        people = int(people)
    except:
        return Response({"error": "People must be a number."}, status=400)

    # ---------------------------
    # USE CACHED CSV DATA
    # ---------------------------
    csv_data = settings.CSV_CACHE
    osave = csv_data["osave"]
    dali = csv_data["dali"]
    dti = csv_data["dti"]

    check_loaded(osave)
    check_loaded(dali)
    check_loaded(dti)

    # ---------------------------
    # AI PROMPT TO GENERATE INGREDIENTS
    # ---------------------------
    prompt = f"""
    You are a cooking assistant. Generate a list of ingredients for the dish: "{dish}".
    Consider enough portions for {people} people.

    Return ONLY valid JSON in this exact format:
    [
        {{
            "name": "Ingredient name",
            "quantity": "amount with unit, e.g., 500g, 2 pieces"
        }}
    ]
    STRICT VALID JSON ONLY — no extra text.
    """

    # ---------------------------
    # RUN AI TO GET INGREDIENTS
    # ---------------------------
    ingredients_list = generate(prompt)
    print(ingredients_list)
    
    # Check for errors
    if not ingredients_list.get("success"):
        return Response({"error": "AI generation failed", "details": ingredients_list}, status=500)

    ingredients_list = ingredients_list.get("recommendation", [])

    # Make sure it's a list
    if not isinstance(ingredients_list, list):
        return Response({"error": "AI response is not a list of ingredients"}, status=500)

    # ---------------------------
    # MATCH INGREDIENTS WITH STORE PRICES
    # ---------------------------
    result = []

    for ingredient in ingredients_list:
        # Ensure ingredient is a dict
        if not isinstance(ingredient, dict):
            continue  # skip invalid entries

        name = ingredient.get("name")
        quantity = ingredient.get("quantity", "")

        if not name:
            continue  # skip if name is missing

        # Find prices in each store
        osave_price = next((item.get("price") for item in osave if item.get("name", "").lower() == name.lower()), None)
        dali_price  = next((item.get("price") for item in dali  if item.get("name", "").lower() == name.lower()), None)
        dti_price   = next((item.get("price") for item in dti   if item.get("name", "").lower() == name.lower()), None)

        # Choose cheapest store
        prices = {"osave": osave_price, "dali": dali_price, "dti": dti_price}
        cheapest_store = min((k for k,v in prices.items() if v is not None), key=lambda k: prices[k], default=None)
        cheapest_price = prices.get(cheapest_store)

        result.append({
            "name": name,
            "quantity": quantity,
        })
    
    return Response({
        "dish": dish,
        "people": people,
        "ingredients": result
    })
