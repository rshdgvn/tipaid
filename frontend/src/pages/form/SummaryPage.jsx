import { useFormContext } from "../../contexts/FormContext";

export default function SummaryPage() {
  const { form } = useFormContext();

  const handleSubmit = () => {
    console.log("Final form data:", form);
    // TODO: send to AI backend
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center px-6">
      <h1 className="text-3xl font-bold mb-6">Summary</h1>

      <div className="bg-white shadow-md rounded-lg p-6 w-full max-w-md space-y-3">
        <p>
          <strong>Recipe:</strong> {form.Recipe}
        </p>
        <p>
          <strong>People:</strong> {form.People}
        </p>
        <p>
          <strong>Budget:</strong> ${form.Budget}
        </p>
        <p>
          <strong>Address:</strong> {form.Address}
        </p>
      </div>

      <button
        onClick={handleSubmit}
        className="mt-6 px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition"
      >
        Submit to AI
      </button>
    </div>
  );
}
