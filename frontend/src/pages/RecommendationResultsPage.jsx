import React from "react";
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
} from "lucide-react";

export default function RecommendationResultsPage() {
  const { form } = useFormContext();
  const navigate = useNavigate();

  const recommendation = form.Recommendation;

  if (!recommendation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-3xl shadow-xl text-center max-w-md border border-gray-100">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} />
          </div>
          <h2 className="text-xl font-bold text-gray-900">No Data Found</h2>
          <p className="text-gray-500 mt-2 mb-6">
            We couldn't find your plan. Please try generating it again.
          </p>
          <button
            onClick={() => navigate("/")}
            className="w-full px-6 py-3 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-200"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  const {
    recommended_store,
    ingredients,
    total_cost,
    within_budget,
    adjusted_budget,
  } = recommendation;

  const storeNames = ["osave", "dali", "pampanga_market"]; 

  const formatPrice = (val) => {
    if (typeof val === "number") {
      return `₱${val.toFixed(2)}`;
    }
    return "N/A";
  };

  const displayStore = (store) =>
    store?.replace("_", " ").toUpperCase() || "STORE";

  let budgetStatus;
  if (within_budget) {
    budgetStatus = (
      <div className="flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-100 px-4 py-3 rounded-2xl">
        <CheckCircle2 size={20} />
        <span className="font-bold">Within Budget!</span>
      </div>
    );
  } else {
    const overAmount = (total_cost || 0) - (adjusted_budget || 0);
    budgetStatus = (
      <div className="flex items-center gap-2 text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-2xl">
        <AlertTriangle size={20} />
        <span className="font-bold">
          Over Budget by {formatPrice(overAmount)}
        </span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center p-4 md:p-8 font-sans pb-24">
      <div className="w-full max-w-6xl bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 overflow-hidden border border-gray-100">
        <div className="p-8 md:p-10 bg-emerald-900 text-white relative overflow-hidden">
          <Store
            className="absolute right-[-20px] top-[-20px] text-emerald-800 opacity-20"
            size={200}
          />

          <h1 className="text-3xl font-extrabold tracking-tight mb-6 relative z-10">
            Shopping Plan
          </h1>

          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 relative z-10">
            <div className="flex flex-col">
              <span className="flex items-center gap-2 text-emerald-200 text-sm font-bold uppercase tracking-wider mb-1">
                <Store size={16} /> Recommended Store
              </span>
              <span className="text-4xl md:text-5xl font-black text-white tracking-tight">
                {displayStore(recommended_store)}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl min-w-[180px]">
              <span className="flex items-center gap-2 text-emerald-200 text-sm font-bold uppercase tracking-wider mb-1">
                <Receipt size={16} /> Total Est.
              </span>
              <span className="text-3xl font-bold text-white">
                {formatPrice(total_cost)}
              </span>
            </div>
          </div>
        </div>

        <div className="px-8 -mt-6 relative z-20">{budgetStatus}</div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
            Detailed Breakdown
          </h2>

          <div className="overflow-x-auto border border-gray-100 rounded-2xl shadow-sm">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Qty
                  </th>
                  {storeNames.map((store) => (
                    <th
                      key={store}
                      className="px-6 py-4 text-center text-xs font-bold text-gray-400 uppercase tracking-wider"
                    >
                      {displayStore(store)}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-center text-xs font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50/50">
                    Best Price
                  </th>
                </tr>
              </thead>

              <tbody className="bg-white divide-y divide-gray-100">
                {ingredients.map((item, index) => (
                  <tr
                    key={index}
                    className="hover:bg-gray-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-800">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {item.quantity}
                    </td>

                    {storeNames.map((store) => {
                      const price = item.prices ? item.prices[store] : null;
                      const isCheapest = item.cheapest_store === store;

                      return (
                        <td
                          key={store}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${
                            isCheapest
                              ? "text-emerald-700 bg-emerald-50/50 font-bold"
                              : "text-gray-400"
                          }`}
                        >
                          {formatPrice(price)}
                        </td>
                      );
                    })}

                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-emerald-700 bg-emerald-50/50">
                      {formatPrice(item.cheapest_price)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-8 py-4 bg-gray-100 text-gray-600 rounded-2xl hover:bg-gray-200 transition font-bold flex items-center justify-center gap-2"
            >
              <Home size={18} />
              Home
            </button>

            <button
              onClick={() => navigate("/results")} 
              className="px-8 py-4 bg-emerald-500 text-white rounded-2xl hover:bg-emerald-600 shadow-lg shadow-emerald-200 transition font-bold flex items-center justify-center gap-2"
            >
              <RefreshCcw size={18} />
              Modify List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
