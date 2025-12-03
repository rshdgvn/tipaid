import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export default function RecipeResultsPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const recipe = state?.recipeData;

  // If page is accessed directly
  if (!recipe) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-500">
            No Recipe Data Found
          </h2>
          <p className="text-gray-600 mt-2">Please generate a recipe first.</p>
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

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-lg p-8 border border-gray-200">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          🍽️ {recipe.dish.toUpperCase()}
        </h1>

        <p className="text-lg text-gray-600 mb-6">
          Ingredients for <span className="font-semibold">{recipe.people}</span>{" "}
          people
        </p>

        {/* Ingredients List */}
        <div className="space-y-4">
          {recipe.ingredients.map((item, index) => (
            <div
              key={index}
              className="flex justify-between p-4 bg-gray-50 rounded-xl shadow-sm border border-gray-200"
            >
              <span className="font-semibold text-gray-800">{item.name}</span>
              <span className="text-gray-600">{item.quantity}</span>
            </div>
          ))}
        </div>

        {/* Back Button */}
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl shadow hover:bg-teal-700 active:scale-95 transition"
          >
            Generate Another Recipe
          </button>
        </div>
      </div>
    </div>
  );
}
