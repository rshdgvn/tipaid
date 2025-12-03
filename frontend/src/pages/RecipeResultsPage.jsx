import React, { useState, useEffect } from "react";
import { useFormContext } from "../contexts/FormContext";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ShoppingBasket,
  ChefHat,
  Sparkles,
  Loader2,
  CheckCircle2,
  Utensils,
  ChevronLeft,
  ChevronRight,
  Wallet,
  AlertCircle,
  ChevronUp,
  ChevronDown,
  CheckSquare,
  Square,
} from "lucide-react";
import { API_URL } from "../utils/config";

const ITEMS_PER_PAGE = 5;

export default function RecipeResultsPage() {
  const { form, updateForm } = useFormContext();
  const navigate = useNavigate();

  const recipe = form.RecipeData;
  const [ingredients, setIngredients] = useState(recipe?.ingredients || []);
  const [groceryList, setGroceryList] = useState(form.GroceryList || []);

  const [budget, setBudget] = useState(recipe?.budget || "");
  const [budgetError, setBudgetError] = useState(false);

  const [customLeft, setCustomLeft] = useState({ name: "", quantity: "" });
  const [showCustomLeft, setShowCustomLeft] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    updateForm("GroceryList", groceryList);
  }, [groceryList, updateForm]);

  useEffect(() => {
    if (!recipe) {
      setTimeout(() => navigate("/"), 0);
    }
  }, [recipe, navigate]);

  if (!recipe) return null;

  // --- Logic: Pagination ---
  const totalPages = Math.ceil(
    (ingredients.length + (showCustomLeft ? 1 : 1)) / ITEMS_PER_PAGE
  );
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const currentIngredients = ingredients.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  const nextPage = () => setCurrentPage((p) => Math.min(totalPages, p + 1));
  const prevPage = () => setCurrentPage((p) => Math.max(1, p - 1));

  // --- Logic: List Management ---

  // Add Item (Default count: 1)
  const addItemToGrocery = (item) => {
    if (groceryList.some((g) => g.name === item.name)) return;
    // Add 'count' property for quantity management
    setGroceryList((prev) => [...prev, { ...item, count: 1 }]);
  };

  // Select All Logic
  const handleSelectAll = () => {
    const allSelected = ingredients.every((ing) =>
      groceryList.some((g) => g.name === ing.name)
    );

    if (allSelected) {
      // If all are currently selected, clear the basket (except custom items maybe? keeping it simple: clear all matches)
      setGroceryList((prev) =>
        prev.filter((g) => !ingredients.some((i) => i.name === g.name))
      );
    } else {
      // Add all missing ingredients
      const newItems = ingredients
        .filter((ing) => !groceryList.some((g) => g.name === ing.name))
        .map((ing) => ({ ...ing, count: 1 }));
      setGroceryList((prev) => [...prev, ...newItems]);
    }
  };

  const removeItem = (index) =>
    setGroceryList((prev) => prev.filter((_, i) => i !== index));

  // Quantity Adjustment Logic (Plus/Minus)
  const updateItemCount = (index, change) => {
    setGroceryList((prev) => {
      const newList = [...prev];
      const currentItem = newList[index];
      const newCount = (currentItem.count || 1) + change;

      // If count goes below 1, remove the item? Or stop at 1?
      // Let's stop at 1. User must use trash icon to remove.
      if (newCount < 1) return prev;

      newList[index] = { ...currentItem, count: newCount };
      return newList;
    });
  };

  const handleAddCustomLeft = () => {
    if (!customLeft.name.trim() || !customLeft.quantity.trim()) return;
    setIngredients((prev) => [...prev, customLeft]);
    setCustomLeft({ name: "", quantity: "" });
    setShowCustomLeft(false);
  };

  // --- Logic: Submission ---
  const handleGenerateRecommendation = async () => {
    if (groceryList.length === 0) {
      alert("Please add at least one item to your basket.");
      return;
    }

    if (!budget || isNaN(budget) || parseFloat(budget) <= 0) {
      setBudgetError(true);
      return;
    }
    setBudgetError(false);
    setIsGenerating(true);

    const payload = {
      people: recipe.people,
      budget: parseFloat(budget),
      ingredients: groceryList, // This now includes the 'count' property
    };

    try {
      const res = await fetch(`${API_URL}generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log(form.budget);

      if (res.ok) {
        updateForm("Budget", parseFloat(budget));
        updateForm("Recommendation", data);
        navigate("/recommendation");
      } else {
        alert(data.error || "Error generating recommendation");
      }
    } catch (error) {
      console.error(error);
      alert("Network Error");
    } finally {
      setIsGenerating(false);
    }
  };

  const isAllSelected = ingredients.every((ing) =>
    groceryList.some((g) => g.name === ing.name)
  );

  return (
    // Main Container:
    // Desktop: Fixed height (100vh) so scrolling happens inside cards.
    // Mobile: Auto height so page scrolls naturally, but we add padding-bottom for the fixed footer.
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 h-auto lg:h-[calc(100vh-40px)] flex flex-col pb-24 lg:pb-0">
      {/* --- Header --- */}
      <div className="shrink-0 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-gray-100 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wide">
              <ChefHat size={12} /> Recipe Found
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight">
              {recipe.dish}{" "}
              <span className="text-gray-400 font-medium text-lg ml-2">
                ({recipe.people} servings)
              </span>
            </h1>
          </div>
        </div>
      </div>

      {/* --- Main Content Grid --- */}
      <div className="flex-1 grid lg:grid-cols-2 gap-6 min-h-0 pb-6">
        {/* --- LEFT: Ingredients --- */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-100 flex flex-col overflow-hidden h-[500px] lg:h-auto">
          {/* Header & Select All */}
          <div className="p-5 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Utensils size={18} className="text-emerald-500" /> Ingredients
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Select All Button */}
              <button
                onClick={handleSelectAll}
                className="text-xs font-bold flex items-center gap-1.5 text-gray-600 hover:text-emerald-600 transition-colors bg-white px-3 py-1.5 rounded-lg border border-gray-200 hover:border-emerald-200"
              >
                {isAllSelected ? (
                  <CheckSquare size={14} className="text-emerald-500" />
                ) : (
                  <Square size={14} />
                )}
                {isAllSelected ? "Deselect All" : "Select All"}
              </button>

              {/* Pagination Arrows */}
              <div className="flex gap-1">
                <button
                  onClick={prevPage}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-md border bg-white hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={nextPage}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-md border bg-white hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-3">
            {currentIngredients.map((item, i) => {
              const isAdded = groceryList.some((g) => g.name === item.name);
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isAdded
                      ? "bg-emerald-50 border-emerald-100 opacity-80"
                      : "bg-white border-gray-100 hover:shadow-md"
                  }`}
                >
                  <div>
                    <p
                      className={`font-bold ${
                        isAdded ? "text-emerald-800" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">{item.quantity}</p>
                  </div>
                  <button
                    onClick={() => addItemToGrocery(item)}
                    disabled={isAdded}
                    className={`w-8 h-8 flex items-center justify-center rounded-full transition-colors ${
                      isAdded
                        ? "text-emerald-600 bg-emerald-100"
                        : "bg-gray-100 text-gray-400 hover:bg-emerald-500 hover:text-white"
                    }`}
                  >
                    {isAdded ? <CheckCircle2 size={16} /> : <Plus size={16} />}
                  </button>
                </div>
              );
            })}
            {/* Custom Item Input */}
            {!showCustomLeft && currentPage === totalPages && (
              <button
                onClick={() => setShowCustomLeft(true)}
                className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold hover:border-emerald-400 hover:text-emerald-600 text-sm flex items-center justify-center gap-2"
              >
                <Plus size={16} /> Add Custom Item
              </button>
            )}

            {showCustomLeft && (
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 animate-in fade-in">
                <input
                  value={customLeft.name}
                  onChange={(e) =>
                    setCustomLeft({ ...customLeft, name: e.target.value })
                  }
                  placeholder="Ingredient Name"
                  className="w-full px-3 py-2 bg-white border rounded-lg text-sm mb-2"
                />
                <div className="flex gap-2">
                  <input
                    value={customLeft.quantity}
                    onChange={(e) =>
                      setCustomLeft({ ...customLeft, quantity: e.target.value })
                    }
                    placeholder="Qty"
                    className="flex-1 px-3 py-2 bg-white border rounded-lg text-sm"
                  />
                  <button
                    onClick={handleAddCustomLeft}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg text-sm font-bold"
                  >
                    Add
                  </button>
                  <button
                    onClick={() => setShowCustomLeft(false)}
                    className="px-3 text-xs text-gray-400 underline"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* --- RIGHT: Basket & Budget --- */}
        <div className="flex flex-col gap-4 h-full min-h-0">
          {/* Budget Card */}
          <div
            className={`shrink-0 bg-white p-5 rounded-3xl shadow-lg border-2 transition-colors ${
              budgetError ? "border-red-400 bg-red-50" : "border-emerald-100"
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <label
                className={`text-xs font-bold uppercase tracking-wider flex items-center gap-2 ${
                  budgetError ? "text-red-600" : "text-emerald-800"
                }`}
              >
                <Wallet size={16} /> Budget
              </label>
              {budgetError && (
                <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle size={12} /> Enter amount
                </span>
              )}
            </div>
            <div className="relative">
              <span className="absolute left-0 top-1/2 -translate-y-1/2 text-3xl font-light text-emerald-500">
                ₱
              </span>
              <input
                type="number"
                value={budget}
                onChange={(e) => {
                  setBudget(e.target.value);
                  setBudgetError(false);
                }}
                placeholder="0.00"
                className="w-full pl-8 bg-transparent text-4xl font-extrabold focus:outline-none text-gray-800 placeholder-gray-300"
              />
            </div>
          </div>

          {/* Basket List */}
          <div className="flex-1 bg-emerald-900/5 rounded-3xl border border-emerald-100/50 shadow-inner flex flex-col overflow-hidden h-[400px] lg:h-auto">
            <div className="p-4 border-b border-emerald-100/50 flex justify-between items-center">
              <h3 className="font-bold text-emerald-900 flex items-center gap-2">
                <ShoppingBasket size={18} /> Basket
              </h3>
              <span className="bg-white text-emerald-800 text-xs font-bold px-2 py-1 rounded-full shadow-sm">
                {groceryList.length} items
              </span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {groceryList.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                  <ShoppingBasket size={40} className="text-emerald-400 mb-2" />
                  <p className="text-sm text-emerald-800 font-medium">
                    Basket is empty
                  </p>
                </div>
              ) : (
                groceryList.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center bg-white p-2 md:p-3 rounded-xl shadow-sm border border-emerald-50/50 animate-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-1 h-8 bg-emerald-400 rounded-full shrink-0" />
                      <div className="min-w-0">
                        <p className="font-bold text-gray-800 text-sm truncate">
                          {item.name}
                        </p>
                        <p className="text-xs text-gray-500 truncate">
                          {item.quantity}
                        </p>
                      </div>
                    </div>

                    {/* QUANTITY CONTROLS */}
                    <div className="flex items-center gap-3 shrink-0 ml-2">
                      <div className="flex flex-col items-center bg-gray-50 rounded-lg border border-gray-100">
                        <button
                          onClick={() => updateItemCount(idx, 1)}
                          className="px-2 py-0.5 hover:bg-emerald-100 hover:text-emerald-600 rounded-t-lg transition-colors"
                        >
                          <ChevronUp size={12} />
                        </button>
                        <span className="text-xs font-bold text-gray-700 w-full text-center border-y border-gray-100 bg-white">
                          {item.count || 1}
                        </span>
                        <button
                          onClick={() => updateItemCount(idx, -1)}
                          className="px-2 py-0.5 hover:bg-red-50 hover:text-red-600 rounded-b-lg transition-colors"
                        >
                          <ChevronDown size={12} />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(idx)}
                        className="text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* DESKTOP BUTTON (Hidden on mobile) */}
            <div className="hidden lg:block p-4 bg-white border-t border-emerald-100">
              <GenerateButton
                onClick={handleGenerateRecommendation}
                loading={isGenerating}
                disabled={groceryList.length === 0}
              />
            </div>
          </div>
        </div>
      </div>

      {/* MOBILE STICKY FOOTER (Visible only on mobile) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] z-50">
        <GenerateButton
          onClick={handleGenerateRecommendation}
          loading={isGenerating}
          disabled={groceryList.length === 0}
        />
      </div>
    </div>
  );
}

// Extracted Button Component for reusability
function GenerateButton({ onClick, loading, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.98] ${
        disabled || loading
          ? "bg-gray-200 text-gray-400 cursor-not-allowed"
          : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
      }`}
    >
      {loading ? (
        <>
          <Loader2 className="animate-spin" /> Calculating...
        </>
      ) : (
        <>
          <Sparkles size={18} /> Shop Smart Now
        </>
      )}
    </button>
  );
}
