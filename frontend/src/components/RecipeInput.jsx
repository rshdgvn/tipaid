import { useFormContext } from "../contexts/FormContext";

export default function RecipeInput() {
  const { form, updateForm } = useFormContext();

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
        Recipe for
      </label>
      <input
        type="text"
        placeholder="e.g. Chicken Adobo"
        className="w-full h-12 px-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
        value={form.Recipe}
        onChange={(e) => updateForm("Recipe", e.target.value)}
      />
    </div>
  );
}
