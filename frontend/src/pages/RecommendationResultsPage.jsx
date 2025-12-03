import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RecommendationResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const recommendation = state?.recommendation;

  if (!recommendation) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-500">
            No Recommendation Data Found
          </h2>
          <p className="text-gray-600 mt-2">
            Please generate a recommendation first.
          </p>
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

  const {
    recommended_store,
    ingredients,
    total_cost,
    within_budget,
    adjusted_budget,
  } = recommendation;

  const storeNames = ["osave", "dali", "dti"];
  const displayStore = (store) => store.toUpperCase();

  // Determine the main budget status message
  let budgetStatusText;
  let budgetStatusColor;
  if (within_budget) {
    budgetStatusText = "✅ Budget Approved!";
    budgetStatusColor = "bg-green-100 text-green-700 border-green-300";
  } else {
    budgetStatusText = `⚠️ Over Budget by ₱${(
      adjusted_budget - total_cost
    ).toFixed(2)}`;
    budgetStatusColor = "bg-red-100 text-red-700 border-red-300";
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-8 font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-200">
        {/* Header: Recommendation Summary */}
        <div className="p-8 bg-gray-900 text-white">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">
            💰 Cheapest Shopping Plan
          </h1>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end">
            <div className="flex flex-col">
              <span className="text-sm font-light uppercase opacity-80">
                Recommended Primary Store:
              </span>
              <span className="text-5xl font-black text-teal-400">
                {displayStore(recommended_store)}
              </span>
            </div>
            <div className="text-right mt-4 md:mt-0">
              <span className="text-sm font-light uppercase opacity-80">
                Estimated Total Cost:
              </span>
              <span className="text-4xl font-bold text-white">
                ₱{total_cost.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Budget Status Alert */}
        <div
          className={`p-4 mx-8 -mt-4 mb-4 rounded-xl font-semibold border ${budgetStatusColor} shadow-md`}
        >
          {budgetStatusText}
        </div>

        <div className="p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">
            Detailed Price Breakdown
          </h2>

          {/* Ingredient Table */}
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantity
                  </th>
                  {storeNames.map((store) => (
                    <th
                      key={store}
                      className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {displayStore(store)}
                    </th>
                  ))}
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-teal-100">
                    Cheapest Price
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {ingredients.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {item.quantity}
                    </td>
                    {storeNames.map((store) => {
                      const price = item.prices[store];
                      const isCheapest = item.cheapest_store === store;
                      return (
                        <td
                          key={store}
                          className={`px-6 py-4 whitespace-nowrap text-sm text-center font-medium ${
                            isCheapest
                              ? "text-teal-700 bg-teal-50"
                              : "text-gray-700"
                          }`}
                        >
                          {price !== null ? `₱${price.toFixed(2)}` : "N/A"}
                        </td>
                      );
                    })}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-center font-bold text-teal-800 bg-teal-100">
                      {item.cheapest_price !== null
                        ? `₱${item.cheapest_price.toFixed(2)}`
                        : "N/A"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer Actions */}
          <div className="mt-8 flex justify-center gap-4">
            <button
              onClick={() => navigate("/")}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-xl hover:bg-gray-400 active:scale-95 transition font-semibold"
            >
              ← Start New Plan
            </button>
            <button
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 active:scale-95 transition font-semibold"
            >
              Review Grocery List
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
