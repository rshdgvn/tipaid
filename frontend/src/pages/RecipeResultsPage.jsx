import React, { useState } from "react";
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
  Coins,
} from "lucide-react";
import { API_URL } from "../utils/config";

export default function RecipeResultsPage() {
  const { form, updateForm } = useFormContext();
  const navigate = useNavigate();

  const recipe = form.RecipeData;

  const [ingredients, setIngredients] = useState(recipe?.ingredients || []);

  const [groceryList, setGroceryList] = useState([]);

  const [budget, setBudget] = useState(recipe?.budget || "");

  const [customLeft, setCustomLeft] = useState({ name: "", quantity: "" });
  const [showCustomLeft, setShowCustomLeft] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!recipe) {
    setTimeout(() => navigate("/"), 0);
    return null;
  }

  const addItemToGrocery = (item) => {
    if (groceryList.some((g) => g.name === item.name)) return;
    setGroceryList((prev) => [...prev, item]);
  };

  const removeItem = (index) =>
    setGroceryList((prev) => prev.filter((_, i) => i !== index));

  const handleAddCustomLeft = () => {
    if (!customLeft.name.trim() || !customLeft.quantity.trim()) return;
    setIngredients((prev) => [...prev, customLeft]);
    setCustomLeft({ name: "", quantity: "" });
    setShowCustomLeft(false);
  };

  const handleGenerateRecommendation = async () => {
    if (groceryList.length === 0) {
      alert("Please add at least one item to your basket.");
      return;
    }

    setIsGenerating(true);

    const formattedBudget =
      budget && !isNaN(budget) ? parseFloat(budget) : null;

    const payload = {
      people: recipe.people,
      budget: formattedBudget,
      ingredients: groceryList,
    };

    console.log("Sending Payload:", payload);

    try {
      const res = await fetch(`${API_URL}generate/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        updateForm("Recommendation", data);
        navigate("/recommendation");
      } else {
        alert(data.error || "Error generating recommendation");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-6 pb-24">
      <div className="mt-8 mb-10 animate-in slide-in-from-top-4 duration-500">
        <button
          onClick={() => navigate("/")}
          className="group flex items-center gap-2 text-gray-500 hover:text-emerald-600 font-medium transition-colors mb-6"
        >
          <div className="p-2 rounded-full bg-gray-100 group-hover:bg-emerald-50 transition-colors">
            <ArrowLeft size={16} />
          </div>
          Back to Search
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-4 gap-1">
              <ChefHat size={14} />
              Recipe Found
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 leading-tight">
              {recipe.dish}
            </h1>
          </div>

          <div className="flex gap-3">
            <div className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 rounded-2xl shadow-sm text-sm font-bold text-gray-700">
              <Utensils size={18} className="text-emerald-500" />
              {recipe.people} People
            </div>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8 items-start">
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl shadow-gray-200/40 overflow-hidden animate-in slide-in-from-left-4 duration-500 delay-100">
          <div className="p-6 md:p-8 border-b border-gray-100 bg-gray-50/50">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                <Utensils size={20} />
              </div>
              Select Ingredients
            </h2>
            <p className="text-gray-500 mt-2 text-lg">
              Add the items you need to buy.
            </p>
          </div>

          <div className="p-6 md:p-8 space-y-3">
            {ingredients.map((item, i) => {
              const isAdded = groceryList.some((g) => g.name === item.name);
              return (
                <div
                  key={i}
                  className={`
                    group flex items-center justify-between p-4 rounded-2xl border transition-all duration-200
                    ${
                      isAdded
                        ? "bg-emerald-50 border-emerald-100 opacity-60"
                        : "bg-white border-gray-200 hover:border-emerald-300 hover:shadow-md hover:shadow-emerald-100/50"
                    }
                  `}
                >
                  <div>
                    <p
                      className={`font-bold text-lg ${
                        isAdded ? "text-emerald-800" : "text-gray-800"
                      }`}
                    >
                      {item.name}
                    </p>
                    <p
                      className={`text-sm ${
                        isAdded ? "text-emerald-600" : "text-gray-500"
                      }`}
                    >
                      {item.quantity}
                    </p>
                  </div>

                  <button
                    onClick={() => addItemToGrocery(item)}
                    disabled={isAdded}
                    className={`
                      flex items-center justify-center w-12 h-12 rounded-full transition-all
                      ${
                        isAdded
                          ? "bg-emerald-100 text-emerald-600 cursor-default"
                          : "bg-gray-100 text-gray-400 group-hover:bg-emerald-500 group-hover:text-white"
                      }
                    `}
                  >
                    {isAdded ? <CheckCircle2 size={22} /> : <Plus size={22} />}
                  </button>
                </div>
              );
            })}

            {!showCustomLeft ? (
              <button
                onClick={() => setShowCustomLeft(true)}
                className="w-full mt-6 py-4 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400 font-bold hover:border-emerald-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all flex items-center justify-center gap-2"
              >
                <Plus size={20} />
                Add Custom Item
              </button>
            ) : (
              <div className="mt-6 p-5 bg-gray-50 rounded-2xl border border-gray-200 animate-in fade-in slide-in-from-top-2">
                <div className="flex flex-col gap-3">
                  <input
                    value={customLeft.name}
                    onChange={(e) =>
                      setCustomLeft({ ...customLeft, name: e.target.value })
                    }
                    placeholder="Ingredient Name (e.g. Soy Sauce)"
                    className="w-full px-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                  />
                  <div className="flex gap-3">
                    <input
                      value={customLeft.quantity}
                      onChange={(e) =>
                        setCustomLeft({
                          ...customLeft,
                          quantity: e.target.value,
                        })
                      }
                      placeholder="Quantity (e.g., 500 g)"
                      className="flex-1 px-4 py-4 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all font-medium"
                    />
                    <button
                      onClick={handleAddCustomLeft}
                      className="px-6 py-3 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition-all"
                    >
                      Add
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowCustomLeft(false)}
                  className="text-sm font-medium text-gray-400 mt-3 hover:text-gray-600 underline decoration-gray-300 underline-offset-4"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-emerald-900/5 rounded-3xl border border-emerald-100/50 shadow-xl shadow-emerald-100/20 flex flex-col h-full sticky top-8 animate-in slide-in-from-right-4 duration-500 delay-200">
          <div className="p-6 md:p-8 border-b border-emerald-100/50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-emerald-950 flex items-center gap-3">
                <div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg">
                  <ShoppingBasket size={20} />
                </div>
                Your Basket
              </h2>
              <span className="bg-white text-emerald-700 border border-emerald-100 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                {groceryList.length} Items
              </span>
            </div>

            <div className="bg-white p-3 rounded-2xl border border-emerald-200 shadow-sm flex items-center gap-3">
              <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600">
                <Coins size={20} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-bold text-emerald-800 uppercase tracking-wide">
                  Target Budget
                </p>
                <input
                  type="number"
                  placeholder="Set limit (Optional)"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  className="w-full bg-transparent font-bold text-gray-800 placeholder-gray-400 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex-1 p-6 md:p-8">
            {groceryList.length === 0 ? (
              <div className="h-48 flex flex-col items-center justify-center text-center border-2 border-dashed border-emerald-200/60 rounded-2xl bg-white/40">
                <ShoppingBasket size={48} className="text-emerald-200 mb-3" />
                <p className="text-emerald-900 font-bold">
                  Your basket is empty
                </p>
                <p className="text-sm text-emerald-600/60">
                  Select ingredients from the left
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {groceryList.map((item, idx) => (
                  <div
                    key={idx}
                    className="group flex justify-between items-center bg-white p-4 pr-4 rounded-2xl border border-emerald-100 shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-2"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-1.5 h-10 bg-emerald-400 rounded-full" />
                      <div>
                        <p className="font-bold text-gray-800 text-lg leading-tight">
                          {item.name}
                        </p>
                        <p className="text-sm font-medium text-gray-500 mt-0.5">
                          {item.quantity}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => removeItem(idx)}
                      className="p-3 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                      title="Remove item"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-6 md:p-8 bg-white/60 backdrop-blur-sm border-t border-emerald-100 rounded-b-3xl">
            <button
              onClick={handleGenerateRecommendation}
              disabled={isGenerating || groceryList.length === 0}
              className={`
                w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg transition-all
                ${
                  isGenerating || groceryList.length === 0
                    ? "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.98]"
                }
              `}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" />
                  Analyzing Prices...
                </>
              ) : (
                <>
                  <Sparkles size={20} />
                  Shop Smart Now
                </>
              )}
            </button>
            <p className="text-center text-xs font-medium text-emerald-800/40 mt-4">
              AI will optimize this list based on current market prices.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
