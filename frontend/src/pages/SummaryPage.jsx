import React, { useState } from "react";
import { useFormContext } from "../contexts/FormContext";
import { useNavigate } from "react-router-dom";

export default function SummaryPage() {
  const { form } = useFormContext();
  const navigate = useNavigate();
  // New state to manage loading and prevent multiple clicks
  const [isSubmitting, setIsSubmitting] = useState(false);

  const dataPoints = [
    { label: "Recipe for", value: form.Recipe },
    { label: "Number of People", value: form.People, unit: "people" },
    { label: "Budget", value: form.Budget, unit: "₱" },
    { label: "Selected Address", value: form.Address },
    // Use toFixed(4) for better display of coordinates
    {
      label: "Latitude",
      value: form.AddressLat ? form.AddressLat.toFixed(4) : null,
      unit: "°",
    },
    {
      label: "Longitude",
      value: form.AddressLng ? form.AddressLng.toFixed(4) : null,
      unit: "°",
    },
  ];

  if (!form.Recipe && !form.Address) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-100">
        <div className="p-8 bg-white rounded-xl shadow-lg text-center">
          <h2 className="text-xl font-semibold text-red-500">Data Not Found</h2>
          <p className="text-gray-600 mt-2">
            Please go back to the form and fill out the details.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition active:scale-95"
          >
            Go to Form
          </button>
        </div>
      </div>
    );
  }

  // 🔥 Handle backend submit
  const handleSubmit = async () => {
    // Prevent submission if already submitting
    if (isSubmitting) return;

    // Set loading state
    setIsSubmitting(true);

    const payload = {
      dish: form.Recipe,
      people: form.People,
      budget: form.Budget, // Include budget for context/future use
      address: form.Address,
      lat: form.AddressLat,
      lng: form.AddressLng,
    };

    console.log("📤 Sending to Django backend:", payload);

    try {
      const res = await fetch(
        "http://127.0.0.1:8000/api/generate/ingredients/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      const data = await res.json();
      console.log("📥 Backend response:", data);

      if (res.ok) {
        // SUCCESS: Navigate to the results page
        navigate("/recipe-results", {
          state: {
            recipeData: {
              ...data,
              people: form.People, // Pass original people count
              budget: form.Budget, // Pass original budget
              dish: form.Recipe, // Pass original dish name
            },
          },
        });
        // NOTE: Component unmounts upon navigation, so no need to set isSubmitting(false) here.
      } else {
        // FAILURE: Show alert and reset loading state
        alert("Error: " + (data.error || "Unknown backend error"));
        setIsSubmitting(false);
      }
    } catch (error) {
      console.error("Backend error:", error);
      alert("Failed to connect to backend");
      // FAILURE: Reset loading state
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="h-2 w-full bg-teal-500"></div>

        <div className="p-8 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-4 border-b pb-4">
            📝 Submission Summary
          </h1>

          <dl className="space-y-5">
            {dataPoints.map(
              (item, index) =>
                item.value && (
                  <div key={index} className="flex flex-col">
                    <dt className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                      {item.label}:
                    </dt>
                    <dd className="text-xl font-bold text-gray-900 mt-1 flex items-baseline">
                      {item.unit === "₱" && (
                        <span className="mr-1">{item.unit}</span>
                      )}
                      {item.value}
                      {item.unit !== "₱" && item.unit && (
                        <span className="ml-1 text-base font-normal text-gray-500">
                          {item.unit}
                        </span>
                      )}
                    </dd>
                  </div>
                )
            )}
          </dl>

          <div className="mt-6 flex justify-between gap-4">
            <button
              onClick={() => navigate("/form")}
              disabled={isSubmitting} // Disable editing while submitting
              className="flex-1 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors active:scale-95 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed"
            >
              Edit Details
            </button>

            <button
              onClick={handleSubmit}
              // Disable if already submitting
              disabled={isSubmitting}
              className="flex-1 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors shadow-md active:scale-95 disabled:bg-teal-300 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center space-x-2">
                  {/* Simple Loading Spinner */}
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
                "Confirm Submission"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
