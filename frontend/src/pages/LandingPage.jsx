import React from "react";
import { useNavigate } from "react-router-dom";

function LandingPage() {
  const nav = useNavigate();

  return (
    <div className="h-screen flex flex-col justify-center items-center text-center">
      <h1 className="text-4xl font-bold mb-4">Welcome to TipAid</h1>
      <p className="text-gray-600 mb-6">
        Your AI-powered cooking & budgeting helper
      </p>

      <button
        onClick={() => nav('/recipe')}
        className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition text-lg"
      >
        Start Cooking Plan
      </button>
    </div>
  );
}

export default LandingPage;
