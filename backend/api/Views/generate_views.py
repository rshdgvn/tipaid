from rest_framework.decorators import api_view
from rest_framework.response import Response
import json
from django.conf import settings
from ..utils.generate import generate, check_loaded


@api_view(["POST"])
def generate_recommendation(request):
    """
    Recommend stores and prices for user-provided ingredients.
    If an ingredient is missing from datasets, AI estimates its price.
    """

    people = request.data.get("people", 1)
    budget = request.data.get("budget")
    ingredients_raw = request.data.get("ingredients")

    try:
        people = int(people)
    except:
        return Response({"error": "People must be a number."}, status=400)

    try:
        budget = float(budget) if budget else None
    except:
        return Response({"error": "Budget must be a number."}, status=400)

    # Validate ingredients JSON
    try:
        ingredients_list = json.loads(ingredients_raw) if ingredients_raw else []
        if not isinstance(ingredients_list, list):
            raise ValueError
    except:
        return Response({"error": "Invalid ingredients JSON format."}, status=400)

    # Load store datasets
    csv_data = settings.CSV_CACHE
    osave = csv_data["osave"]
    dali = csv_data["dali"]
    dti = csv_data["dti"]

    check_loaded(osave)
    check_loaded(dali)
    check_loaded(dti)

    result = []
    store_counts = {"osave": 0, "dali": 0, "dti": 0}
    total_cost = 0

    for ingredient in ingredients_list:
        if not isinstance(ingredient, dict):
            continue
        name = ingredient.get("name")
        quantity = ingredient.get("quantity", "")
        if not name:
            continue

        # Lookup in datasets
        osave_price = next((item.get("price") for item in osave if item.get("name", "").lower() == name.lower()), None)
        dali_price  = next((item.get("price") for item in dali  if item.get("name", "").lower() == name.lower()), None)
        dti_price   = next((item.get("price") for item in dti   if item.get("name", "").lower() == name.lower()), None)

        # If ingredient missing in all stores, use AI to estimate prices
        if all(p is None for p in [osave_price, dali_price, dti_price]):
            prompt = f"""
            You are an assistant that provides estimated prices for ingredients in Philippine stores.
            Give prices for the ingredient "{name}" in OSAVE, DALI, and DTI in PHP.
            Return JSON only: {{"osave": price1, "dali": price2, "dti": price3}}
            """
            ai_response = generate(prompt)
            if ai_response.get("success"):
                ai_prices = ai_response.get("recommendation", {})
                osave_price = ai_prices.get("osave")
                dali_price = ai_prices.get("dali")
                dti_price = ai_prices.get("dti")

        prices = {"osave": osave_price, "dali": dali_price, "dti": dti_price}

        # Choose cheapest store
        cheapest_store = min((k for k,v in prices.items() if v is not None), key=lambda k: prices[k], default=None)
        cheapest_price = prices.get(cheapest_store)

        if cheapest_store and cheapest_price is not None:
            store_counts[cheapest_store] += 1
            total_cost += cheapest_price

        result.append({
            "name": name,
            "quantity": quantity,
            "prices": prices,
            "cheapest_store": cheapest_store,
            "cheapest_price": cheapest_price
        })

    # Determine recommended store
    max_count = max(store_counts.values())
    candidates = [s for s, c in store_counts.items() if c == max_count]
    if len(candidates) > 1:
        total_per_store = {s: sum(item["cheapest_price"] 
                                  for item in result 
                                  if item["cheapest_store"] == s and item["cheapest_price"] is not None)
                           for s in candidates}
        recommended_store = min(total_per_store, key=total_per_store.get)
    else:
        recommended_store = candidates[0] if candidates else None

    within_budget = True if (budget is None or total_cost <= budget) else False
    adjusted_budget = None if within_budget else total_cost

    return Response({
        "recommended_store": recommended_store,
        "ingredients": result,
        "total_cost": total_cost,
        "within_budget": within_budget,
        "adjusted_budget": adjusted_budget
    })

@api_view(["POST"])
def generate_ingredients(request):
    """
    Generate ingredients for a given dish and match them with store datasets
    """

    # ---------------------------
    # GET PARAMETERS
    # ---------------------------
    dish = request.data.get("dish")
    people = request.data.get("people", 1)

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
