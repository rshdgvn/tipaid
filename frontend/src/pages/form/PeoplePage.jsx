import { useFormContext } from "../../contexts/FormContext";
import { useNavigate } from "react-router-dom";

export default function PeoplePage() {
  const { form, updateForm } = useFormContext();
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col items-center justify-center px-4">
      <h1 className="text-3xl font-bold mb-6">How many people?</h1>

      <input
        type="number"
        className="w-full max-w-md px-4 py-2 border rounded-lg shadow-sm focus:ring-2 focus:ring-teal-500"
        placeholder="2"
        value={form.People}
        onChange={(e) => updateForm("People", e.target.value)}
      />

      <button
        onClick={() => navigate("/budget")}
        className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
      >
        Next
      </button>
    </div>
  );
}
