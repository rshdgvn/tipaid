import React, { useState, useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
// Assuming the backend is running locally on port 8000 (common Django setup)
const API_URL = "http://127.0.0.1:8000/api/generate/";

export default function RecipeResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  // We assume 'recipeData' contains the People and Budget used in the FormPage
  const recipe = state?.recipeData;

  // Initial data: grocery list starts blank, states for custom input visibility/data
  const [groceryList, setGroceryList] = useState([]);
  const [customItem, setCustomItem] = useState({ name: "", quantity: "" });
  const [showCustomInput, setShowCustomInput] = useState(false);
  // **isGenerating handles the single-click submission lock and loading state.**
  const [isGenerating, setIsGenerating] = useState(false);

  // --- Utility Functions ---

  const removeItem = useCallback((index) => {
    setGroceryList((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const addCustomItem = useCallback(() => {
    if (!customItem.name.trim() || !customItem.quantity.trim()) return;

    setGroceryList((prev) => [
      ...prev,
      { name: customItem.name.trim(), quantity: customItem.quantity.trim() },
    ]);
    setCustomItem({ name: "", quantity: "" });
    setShowCustomInput(false);
  }, [customItem]);

  const addItemToGrocery = useCallback(
    (item) => {
      // Prevent duplicates based on name
      if (groceryList.some((g) => g.name === item.name)) {
        alert(`${item.name} is already in the list!`);
        return;
      }
      setGroceryList((prev) => [...prev, item]);
    },
    [groceryList]
  );

  // --- Backend Interaction Function ---

  const handleGenerateRecommendation = useCallback(async () => {
    if (groceryList.length === 0) {
      alert(
        "Please add at least one ingredient to the grocery list before generating recommendations."
      );
      return;
    }

    // 1. SET LOADING STATE: Disables the button immediately
    setIsGenerating(true);

    const payload = {
      people: recipe.people,
      budget: recipe.budget,
      ingredients: groceryList.map((item) => ({
        name: item.name,
        quantity: item.quantity,
      })),
    };

    console.log("Sending Payload to Django:", payload);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const result = await response.json();
      // 2. SUCCESS: Navigate and pass data
      navigate("/recommendation", { state: { recommendation: result } });

      // NOTE: Since navigation occurs, the component unmounts,
      // so we don't strictly need to set isGenerating(false) here.
    } catch (error) {
      console.error("❌ Error generating recommendation:", error.message);
      alert(`Failed to get recommendations: ${error.message}`);
      // 3. FAILURE: Reset loading state to allow retry
      setIsGenerating(false);
    }
  }, [groceryList, recipe.people, recipe.budget, navigate]); // Added navigate to dependencies

  // --- Error Handling ---
  if (!recipe) {
    // ... (unchanged error block)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-500">
            No Recipe Data Found
          </h2>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 active:scale-95 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  // --- Render ---
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-8 font-sans">
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header Section */}
        <div className="p-8 bg-teal-500 text-white rounded-t-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight mb-1">
            {recipe.dish}
          </h1>
          <p className="text-lg opacity-90">
            Plan for **{recipe.people}** people | Budget: **₱{recipe.budget}**
          </p>
        </div>

        <div className="p-8 flex flex-col md:flex-row gap-8">
          {/* Left Side: Recipe Ingredients (Unchanged) */}
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-2">
              Recipe Ingredients 🍳
            </h2>

            <div className="space-y-3">
              {recipe.ingredients.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 bg-gray-50 rounded-xl shadow-sm border border-gray-200 hover:bg-teal-50 transition"
                >
                  <span className="font-semibold text-gray-800">
                    {item.name}
                  </span>
                  <span className="text-gray-600 ml-4">{item.quantity}</span>

                  <button
                    onClick={() => addItemToGrocery(item)}
                    // Disable while generating to prevent UI interaction bugs
                    disabled={isGenerating}
                    className="ml-4 px-3 py-1 text-sm bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:scale-95 transition shadow-md flex items-center disabled:bg-teal-300"
                    title="Add to Grocery List"
                  >
                    + Add
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Right Side: Grocery List & Actions */}
          <div className="flex-1 pt-4 md:pt-0 md:border-l md:pl-8 border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              Grocery List ({groceryList.length}) 🛒
            </h2>

            {/* List Display (Unchanged) */}
            <div className="min-h-[150px] space-y-3 p-2 bg-gray-50 rounded-xl border border-dashed border-gray-300 mb-6">
              {groceryList.length === 0 ? (
                <p className="text-center text-gray-500 py-10">
                  Your grocery list is empty. Click '+ Add' next to an
                  ingredient.
                </p>
              ) : (
                groceryList.map((item, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm border border-gray-100"
                  >
                    <div>
                      <span className="font-semibold text-gray-800">
                        {item.name}
                      </span>
                      <span className="text-gray-600 block text-sm">
                        {item.quantity}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(index)}
                      // Disable while generating
                      disabled={isGenerating}
                      className="px-3 py-1 text-xs bg-red-500 text-white rounded-lg hover:bg-red-600 active:scale-95 transition disabled:bg-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Custom Input Toggle Button */}
            {!showCustomInput && (
              <button
                onClick={() => setShowCustomInput(true)}
                // Disable while generating
                disabled={isGenerating}
                className="w-full px-4 py-3 mb-4 bg-gray-200 text-gray-800 rounded-xl hover:bg-gray-300 transition active:scale-95 font-semibold disabled:bg-gray-100 disabled:text-gray-400"
              >
                + Add Manual Item
              </button>
            )}

            {/* Custom Item Inputs (CONDITIONAL DISPLAY) */}
            {showCustomInput && (
              <div className="flex flex-col gap-2 p-4 bg-white rounded-xl shadow-md border border-teal-500 animate-in fade-in duration-300 mb-6">
                <input
                  type="text"
                  placeholder="Item name (e.g., Cooking Oil)"
                  value={customItem.name}
                  onChange={(e) =>
                    setCustomItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Quantity (e.g., 1 bottle)"
                  value={customItem.quantity}
                  onChange={(e) =>
                    setCustomItem((prev) => ({
                      ...prev,
                      quantity: e.target.value,
                    }))
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-teal-500 focus:border-teal-500 outline-none"
                />
                <button
                  onClick={addCustomItem}
                  className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 active:scale-95 transition font-semibold"
                >
                  Confirm Addition
                </button>
              </div>
            )}

            {/* ACTION BUTTON: GENERATE RECOMMENDATION */}
            <button
              onClick={handleGenerateRecommendation}
              // Button disabled if list is empty OR if loading/generating is true
              disabled={groceryList.length === 0 || isGenerating}
              className="w-full px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 active:scale-95 transition font-semibold mt-4 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <div className="flex items-center justify-center space-x-2">
                  {/* Simple Loading Spinner using Tailwind Animation */}
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  <span>Generating...</span>
                </div>
              ) : (
                "✨ Generate Store Recommendation"
              )}
            </button>

            {/* Back Button */}
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => navigate("/")}
                disabled={isGenerating} // Disable navigation while processing
                className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 active:scale-95 transition font-semibold disabled:bg-gray-100 disabled:text-gray-400"
              >
                ← Go Back to Form
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
