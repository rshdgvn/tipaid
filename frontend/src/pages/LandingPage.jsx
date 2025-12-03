import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { FormView } from "../components/FormView";
import { useFormContext } from "../contexts/FormContext";
import { API_URL } from "../utils/config";

export default function LandingPage() {
  const { form, updateForm } = useFormContext();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const isButtonDisabled = useMemo(() => !form.Recipe, [form.Recipe]);

  const handleSubmit = async () => {
    if (isSubmitting || !form.Recipe) return;

    setIsSubmitting(true);

    const payload = {
      dish: form.Recipe,
      people: form.People,
      budget: form.Budget,
      address: form.Address,
      lat: form.AddressLat,
      lng: form.AddressLng,
    };

    try {
      const res = await fetch(`${API_URL}generate/ingredients/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Unknown backend error");
        setIsSubmitting(false);
        return;
      }

      updateForm("RecipeData", {
        dish: form.Recipe,
        people: form.People,
        budget: form.Budget,
        ingredients: data.ingredients,
      });

      navigate("/recipe-results");
    } catch (error) {
      console.error(error);
      alert("Failed to connect to backend");
    }

    setIsSubmitting(false);
  };

  const handlePopularClick = (dish) => {
    updateForm("Recipe", dish);
  };

  return (
    <FormView
      form={form}
      updateForm={updateForm}
      handleSubmit={handleSubmit}
      handlePopularClick={handlePopularClick}
      isButtonDisabled={isButtonDisabled}
      isSubmitting={isSubmitting}
    />
  );
}
