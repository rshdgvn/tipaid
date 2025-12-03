from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.conf import settings
from ..utils.generate import generate, check_loaded, ai_webscrape_price, get_prices_from_ai

@api_view(["POST"])
def generate_recommendation(request):
    """
    Recommend stores and prices for user-provided ingredients.
    If an ingredient is missing from datasets, AI estimates its price.
    """

    people = request.data.get("people", 1)
    budget = request.data.get("budget")
    ingredients_list = request.data.get("ingredients", [])

    # Validate people
    try:
        people = int(people)
    except:
        return Response({"error": "People must be a number."}, status=400)

    # Validate budget
    try:
        budget = float(budget) if budget else None
    except:
        return Response({"error": "Budget must be a number."}, status=400)

    # Validate ingredients
    if not isinstance(ingredients_list, list):
        return Response({"error": "Ingredients must be a list."}, status=400)

    result = []
    store_counts = {"osave": 0, "dali": 0, "pampanga_market": 0}
    total_cost = 0.0
    total_per_store = {"osave": 0.0, "dali": 0.0, "pampanga_market": 0.0}

    for ingredient in ingredients_list:
        if not isinstance(ingredient, dict):
            continue
        name = ingredient.get("name")
        quantity = ingredient.get("quantity", "")
        if not name:
            continue

        # Generate AI prices
        prompt = f"""
        You are an assistant that provides estimated prices for ingredients in Philippine stores.
        Give prices for the ingredient "{name}" in OSAVE, DALI, and Local Markets in Pampanga in PHP.
        Return JSON only: {{"osave": price1, "dali": price2, "pampanga_market": price3}}
        """
        ai_response = generate(prompt)
        print(ai_response)

        if ai_response.get("success"):
            ai_prices = ai_response.get("recommendation", {})
            osave_price = ai_prices.get("osave")
            dali_price  = ai_prices.get("dali")
            local_market_price = ai_prices.get("pampanga_market")

            prices = {
                "osave": osave_price,
                "dali": dali_price,
                "pampanga_market": local_market_price
            }

            # Find cheapest store
            cheapest_store = min(
                (k for k, v in prices.items() if v is not None),
                key=lambda k: prices[k],
                default=None
            )
            cheapest_price = prices.get(cheapest_store) if cheapest_store else None

            if cheapest_store and cheapest_price is not None:
                store_counts[cheapest_store] += 1
                total_cost += cheapest_price
                total_per_store[cheapest_store] += cheapest_price

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
        # Pick the store with lowest total
        candidate_totals = {s: total_per_store[s] for s in candidates}
        recommended_store = min(candidate_totals, key=candidate_totals.get)
    else:
        recommended_store = candidates[0] if candidates else None

    within_budget = True if (budget is None or total_cost <= budget) else False
    adjusted_budget = None if within_budget else total_cost

    return Response({
        "recommended_store": recommended_store,
        "ingredients": result,
        "total_cost": total_cost,
        "total_per_store": total_per_store,
        "within_budget": within_budget,
        "adjusted_budget": adjusted_budget
    })

@api_view(["POST"])
def generate_ingredients(request):
    """
    Generate ingredients for a given dish and match them with store datasets
    """

    dish = request.data.get("dish")
    people = request.data.get("people", 1)

    if not dish:
        return Response({"error": "Dish parameter is required."}, status=400)

    try:
        people = int(people)
    except:
        return Response({"error": "People must be a number."}, status=400)

    # Load CSV datasets
    csv_data = settings.CSV_CACHE
    osave = csv_data["osave"]
    dali = csv_data["dali"]
    dti = csv_data["dti"]

    check_loaded(osave)
    check_loaded(dali)
    check_loaded(dti)

    # AI prompt
    prompt = f"""
    You are a cooking assistant. Generate a list of ingredients for the dish: "{dish}".
    Consider enough portions for {people} people.

    Return ONLY valid JSON in this exact format:
    [
        {{"name": "Ingredient name", "quantity": "amount with unit"}}
    ]
    STRICT VALID JSON ONLY.
    """

    ingredients_list = generate(prompt)

    if not ingredients_list.get("success"):
        return Response({"error": "AI generation failed", "details": ingredients_list}, status=500)

    ingredients_list = ingredients_list.get("recommendation", [])

    # Ensure list
    if not isinstance(ingredients_list, list):
        return Response({"error": "AI response is not a list"}, status=500)

    # Match with store prices
    result = []
    for ingredient in ingredients_list:
        if not isinstance(ingredient, dict):
            continue
        name = ingredient.get("name")
        quantity = ingredient.get("quantity", "")
        if not name:
            continue
        result.append({
            "name": name,
            "quantity": quantity
        })

    return Response({
        "dish": dish,
        "people": people,
        "ingredients": result
    })
