import RecipeInput from "../components/RecipeInput";
import PeopleInput from "../components/PeopleInput";
import BudgetInput from "../components/BudgetInput";
import AddressSelector from "../components/AddressSelector";
import { useNavigate } from "react-router-dom";
import { useFormContext } from "../contexts/FormContext";

export default function FormPage() {
  const { form } = useFormContext();
  const navigate = useNavigate();

  const handleSubmit = () => {
    if (!form.Address) return alert("Please select your address.");
    navigate("/summary");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-sans">
      {/* Main Card */}
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        {/* Header decoration */}
        <div className="h-2 w-full bg-teal-500"></div>

        <div className="p-8 flex flex-col gap-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Plan your meal
          </h1>

          {/* Row 1: Recipe */}
          <RecipeInput />

          {/* Row 2: People & Budget (Side by Side) */}
          <div className="grid grid-cols-2 gap-4">
            <PeopleInput />
            <BudgetInput />
          </div>

          {/* Row 3: Address & Map */}
          <AddressSelector />

          {/* Submit Button */}
          <div className="mt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-8 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 hover:shadow-lg transform active:scale-95 transition-all duration-200"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
