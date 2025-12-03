import { useFormContext } from "../contexts/FormContext";

export default function BudgetInput() {
  const { form, updateForm } = useFormContext();

  return (
    <div className="flex flex-col gap-2 w-full">
      <label className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
        Budget
      </label>
      <div className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">
          ₱
        </span>
        <input
          type="number"
          placeholder="500"
          className="w-full h-12 pl-8 pr-4 bg-gray-50 border border-gray-200 rounded-xl outline-none text-gray-800 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
          value={form.Budget}
          onChange={(e) => updateForm("Budget", e.target.value)}
        />
      </div>
    </div>
  );
}
