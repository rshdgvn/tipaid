import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../contexts/FormContext";
import {
  ArrowLeft,
  Store,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Home,
  RefreshCcw,
  Trophy,
  TrendingDown,
  ChefHat,
  Wallet,
  Download,
  MousePointerClick,
} from "lucide-react";
import * as htmlToImage from "html-to-image";

export default function RecommendationResultsPage() {
  const { form } = useFormContext();
  const navigate = useNavigate();

  // 1. Ref for capturing ONLY the Detailed Breakdown
  const tableRef = useRef(null);

  const recommendation = form.Recommendation;
  const recipeData = form.RecipeData;
  const userBudget = parseFloat(form.Budget) || 0; // Fixed case sensitivity (form.budget)

  // 2. State for currently selected store
  const [selectedStore, setSelectedStore] = useState(null);

  // 3. Define ingredients safely for hooks to use immediately
  const ingredients = recommendation?.ingredients || [];
  const storeNames = ["osave", "dali", "pampanga_market"];

  // --- Logic: Leaderboard Calculation (MOVED UP) ---
  // We calculate this FIRST so we know which store is actually the cheapest
  const storeLeaderboard = useMemo(() => {
    if (ingredients.length === 0) return [];

    return storeNames
      .map((store) => {
        const total = ingredients.reduce((sum, item) => {
          return sum + (item.prices?.[store] || 0);
        }, 0);
        return { name: store, total };
      })
      .sort((a, b) => a.total - b.total); // Sort cheapest to expensive
  }, [ingredients, storeNames]);

  // Determine the Cheapest Store Name
  const cheapestStoreName = storeLeaderboard.length > 0 ? storeLeaderboard[0].name : null;

  // 4. useEffect to handle redirects and initial state
  useEffect(() => {
    if (!recommendation) {
      setTimeout(() => navigate("/"), 0);
    } else if (!selectedStore && cheapestStoreName) {
      // FIX: Set default to the CHEAPEST option found
      setSelectedStore(cheapestStoreName);
    }
  }, [recommendation, navigate, selectedStore, cheapestStoreName]);

  // --- Logic: Dynamic Total Calculation ---
  const currentTotal = useMemo(() => {
    if (!selectedStore || ingredients.length === 0) return 0;

    return ingredients.reduce((sum, item) => {
      return sum + (item.prices?.[selectedStore] || 0);
    }, 0);
  }, [selectedStore, ingredients]);

  // 5. Conditional Return
  if (!recommendation || !selectedStore) return null;

  // Helper: Format Price
  const formatPrice = (val) => {
    if (typeof val === "number") return `₱${val.toFixed(2)}`;
    return "N/A";
  };

  // Helper: Format Store Name
  const displayStore = (store) =>
    store?.replace("_", " ").toUpperCase() || "STORE";

  // --- Logic: Download PNG (FIXED CROPPING) ---
  const downloadPNG = async () => {
    if (!tableRef.current) return;
    try {
      const element = tableRef.current;
      
      // 1. Get the TRUE dimensions of the table content
      const width = element.scrollWidth; 
      const height = element.scrollHeight; 

      const dataUrl = await htmlToImage.toPng(element, {
        quality: 1.0,
        backgroundColor: "#ffffff",
        // 2. Force the image capture to use the full content dimensions
        width: width,
        height: height,
        style: {
             // 3. Override styles to ensure nothing is hidden during capture
             overflow: "visible", 
             maxWidth: "none",
             maxHeight: "none",
             padding: "40px", // Add nice padding
        },
      });
      const link = document.createElement("a");
      link.download = `shopping_list_${selectedStore}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Error generating PNG:", err);
    }
  };

  // --- Logic: Budget Badge ---
  const isWithinBudget = currentTotal <= userBudget;
  let budgetStatus;

  if (isWithinBudget) {
    const savedAmount = userBudget - currentTotal;
    budgetStatus = (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-emerald-800 bg-emerald-50 border border-emerald-200 shadow-sm px-5 py-4 rounded-2xl transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-100 p-2 rounded-full">
            <CheckCircle2 size={24} className="text-emerald-600" />
          </div>
          <div>
            <span className="font-black text-lg block">Within Budget!</span>
            {savedAmount > 0 && (
              <span className="text-sm">
                You save {formatPrice(savedAmount)} at{" "}
                {displayStore(selectedStore)}
              </span>
            )}
          </div>
        </div>
        <div className="text-right border-t md:border-t-0 border-emerald-100 pt-2 md:pt-0">
          <span className="text-xs text-emerald-600 font-bold uppercase tracking-wider flex items-center md:justify-end gap-1">
            <Wallet size={14} /> Budget
          </span>
          <span className="font-bold text-xl">{formatPrice(userBudget)}</span>
        </div>
      </div>
    );
  } else {
    const overAmount = currentTotal - userBudget;
    budgetStatus = (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 text-red-800 bg-red-50 border border-red-200 shadow-sm px-5 py-4 rounded-2xl transition-all">
        <div className="flex items-center gap-3">
          <div className="bg-red-100 p-2 rounded-full">
            <AlertTriangle size={24} className="text-red-600" />
          </div>
          <div>
            <span className="font-black text-lg block">Over Budget</span>
            <span className="text-sm font-medium">
              Exceeds by {formatPrice(overAmount)} at{" "}
              {displayStore(selectedStore)}
            </span>
          </div>
        </div>
        <div className="text-right border-t md:border-t-0 border-red-100 pt-2 md:pt-0">
          <span className="text-xs text-red-600 font-bold uppercase tracking-wider flex items-center md:justify-end gap-1">
            <Wallet size={14} /> Budget
          </span>
          <span className="font-bold text-xl">{formatPrice(userBudget)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex justify-center p-4 md:p-8 font-sans pb-24">
      <div className="w-full max-w-6xl bg-white rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        {/* --- Header Section --- */}
        <div className="p-8 md:p-12 bg-emerald-900 text-white relative overflow-hidden transition-colors duration-500">
          <Store
            className="absolute right-[-20px] top-[-20px] text-emerald-800 opacity-20 rotate-12"
            size={300}
          />

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-300 font-bold uppercase tracking-widest text-xs mb-2">
              <ChefHat size={14} /> Shopping Plan For
            </div>
            <h1 className="text-3xl md:text-5xl font-black tracking-tight mb-8 leading-tight">
              {recipeData?.dish || "Your Recipe"}
            </h1>

            {/* Main Stats Grid */}
            <div className="grid md:grid-cols-2 gap-6 items-end">
              <div className="flex flex-col">
                <span className="text-emerald-200 text-sm font-bold uppercase tracking-wider mb-1">
                  Selected Store
                </span>
                <span className="text-4xl font-bold text-white tracking-tight flex items-center gap-3 animate-in fade-in slide-in-from-left-4 duration-300">
                  {displayStore(selectedStore)}
                  {/* FIX: Show Recommended badge if selected store is the CHEAPEST one */}
                  {selectedStore === cheapestStoreName && (
                    <span className="bg-emerald-500 text-emerald-950 text-xs px-2 py-1 rounded-full font-bold">
                      Best Price
                    </span>
                  )}
                </span>
              </div>

              <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl flex items-center justify-between shadow-lg">
                <div>
                  <span className="block text-emerald-200 text-xs font-bold uppercase tracking-wider mb-1">
                    Total Estimated Cost
                  </span>
                  <span className="text-3xl font-bold text-white">
                    {formatPrice(currentTotal)}
                  </span>
                </div>
                <div className="h-10 w-10 bg-emerald-500 rounded-full flex items-center justify-center text-emerald-900">
                  <Receipt size={20} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- Budget Status Bar --- */}
        <div className="px-8 -mt-7 relative z-20 flex justify-center md:justify-start">
          {budgetStatus}
        </div>

        <div className="p-6 md:p-10 space-y-10">
          {/* --- 1. Interactive Store Leaderboards --- */}
          <section>
            <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Trophy size={20} className="text-yellow-500" /> Compare & Select
              Store
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {storeLeaderboard.map((storeData, index) => {
                const isCheapest = index === 0;
                const isSelected = storeData.name === selectedStore;

                return (
                  <button
                    key={storeData.name}
                    onClick={() => setSelectedStore(storeData.name)}
                    className={`relative p-4 rounded-2xl border-2 flex items-center justify-between transition-all cursor-pointer text-left w-full hover:shadow-md ${
                      isSelected
                        ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-200 ring-offset-2"
                        : "bg-white border-gray-100 hover:border-emerald-200"
                    }`}
                  >
                    {isCheapest && (
                      <div className="absolute -top-3 left-4 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                        Cheapest Option
                      </div>
                    )}
                    <div>
                      <p
                        className={`text-xs font-bold uppercase tracking-wider ${
                          isSelected ? "text-emerald-700" : "text-gray-400"
                        }`}
                      >
                        {displayStore(storeData.name)}
                      </p>
                      <p
                        className={`text-xl font-bold ${
                          isSelected ? "text-emerald-900" : "text-gray-600"
                        }`}
                      >
                        {formatPrice(storeData.total)}
                      </p>
                    </div>
                    {isSelected ? (
                      <div className="bg-emerald-500 text-white p-2 rounded-full shadow-sm">
                        <CheckCircle2 size={18} />
                      </div>
                    ) : (
                      <div className="text-gray-200">
                        <MousePointerClick size={18} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </section>

          {/* --- 2. Detailed Breakdown Table (Capturable) --- */}
          {/* We wrap this section in the ref to download ONLY this part */}
          <div ref={tableRef} className="bg-white rounded-xl">
            <section>
              <div className="flex items-center justify-between mb-6 pt-4 px-2">
                <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
                  <Receipt size={20} className="text-emerald-600" /> Shopping
                  List for {displayStore(selectedStore)}
                </h2>

                <div className="flex gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-emerald-100 border border-emerald-500 rounded-sm"></div>
                    <span className="text-gray-500">Selected</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 bg-blue-50 border border-blue-500 rounded-sm"></div>
                    <span className="text-gray-500">Better Price</span>
                  </div>
                </div>
              </div>

              {/* Added overflow-visible for printing purposes */}
              <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm bg-white print:overflow-visible">
                <table className="min-w-full divide-y divide-gray-100">
                  <thead>
                    <tr className="bg-gray-50/80">
                      <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Ingredient
                      </th>
                      <th className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Qty
                      </th>
                      {storeNames.map((store) => (
                        <th
                          key={store}
                          className={`px-6 py-4 text-center text-xs font-bold uppercase tracking-wider transition-colors duration-300 ${
                            store === selectedStore
                              ? "text-emerald-600 bg-emerald-50/50 border-b-2 border-emerald-500"
                              : "text-gray-400"
                          }`}
                        >
                          {displayStore(store)}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody className="bg-white divide-y divide-gray-50">
                    {ingredients.map((item, index) => (
                      <tr
                        key={index}
                        className="hover:bg-gray-50/30 transition-colors group"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                          {item.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-medium text-gray-500 bg-gray-50/30">
                          {item.quantity}
                        </td>

                        {storeNames.map((store) => {
                          const price = item.prices ? item.prices[store] : null;

                          const isSelectedColumn = store === selectedStore;
                          const isCheapestOption =
                            item.cheapest_store === store;
                          const isBetterDeal =
                            isCheapestOption && !isSelectedColumn;

                          let cellClass = "text-gray-400"; // Default
                          let innerClass = "";

                          if (isSelectedColumn) {
                            cellClass =
                              "bg-emerald-50/30 text-emerald-800 font-bold border-x border-emerald-100/50";
                            if (isCheapestOption) {
                              innerClass = "text-emerald-700";
                            }
                          } else if (isBetterDeal) {
                            cellClass =
                              "bg-blue-50/50 text-blue-600 font-bold cursor-help opacity-100";
                            innerClass =
                              "flex items-center justify-center gap-1";
                          }

                          return (
                            <td
                              key={store}
                              className={`px-6 py-4 whitespace-nowrap text-sm text-center transition-colors duration-300 ${cellClass}`}
                            >
                              <div className={innerClass}>
                                {isBetterDeal && <TrendingDown size={14} />}
                                {formatPrice(price)}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* --- Navigation Buttons (Outside of Ref) --- */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-gray-50 text-gray-600 rounded-2xl hover:bg-gray-100 transition font-bold flex items-center justify-center gap-2 border border-gray-200"
            >
              <Home size={18} />
              Home
            </button>

            <button
              onClick={() => navigate("/recipe-results")}
              className="px-8 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-xl shadow-emerald-200 hover:shadow-emerald-300 transition-all transform active:scale-95 font-bold flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} />
              Modify List
            </button>

            <button
              onClick={downloadPNG}
              className="px-8 py-4 bg-blue-500 text-white rounded-2xl hover:bg-blue-600 shadow-lg shadow-blue-200 hover:shadow-blue-300 transition-all transform active:scale-95 font-bold flex items-center justify-center gap-2"
            >
              <Download/>
              Download List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}