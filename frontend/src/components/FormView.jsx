import { SearchIcon, UserIcon, SparklesIcon, Loader2 } from "lucide-react";

export const FormView = ({
  form,
  updateForm,
  handleSubmit,
  handlePopularClick,
  isButtonDisabled,
  isSubmitting,
}) => (
  <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24 mt-8">
    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wide mb-8 gap-1">
      <SparklesIcon size={14} />
      AI Grocery & Meal Assistant
    </div>

    <h1 className="text-5xl md:text-6xl font-extrabold text-center leading-tight mb-4 text-gray-900">
      Decide what to eat,
      <br />
      Find the best store with <span className="text-emerald-500">Tipaid</span>
    </h1>

    <p className="text-gray-500 text-center text-lg max-w-xl mb-12">
      Type a dish and how many people you're serving. Our AI will break down
      ingredients and help you shop smarter.
    </p>

    <div className="w-full max-w-3xl flex flex-col gap-4">
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <SearchIcon className="text-gray-400" />
        </div>

        <input
          type="text"
          placeholder="What are you craving? (e.g., Adobo, Ramen, Lasagna)"
          className="
            w-full pl-12 pr-6 py-5 text-lg text-gray-700 placeholder-gray-400 
            bg-white border border-gray-200 rounded-2xl
            focus:outline-none focus:border-emerald-500
            focus:ring-4 focus:ring-emerald-500/20 
            transition-all shadow-sm
            group-hover:shadow-md
          "
          value={form.Recipe}
          onChange={(e) => updateForm("Recipe", e.target.value)}
        />
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
            <UserIcon className="text-gray-400" />
          </div>

          <input
            type="number"
            min="1"
            placeholder="Number of people"
            className="
              w-full pl-12 pr-4 py-4 text-gray-700 placeholder-gray-400 
              bg-white border border-gray-200 rounded-2xl 
              focus:outline-none focus:border-emerald-500 
              focus:ring-4 focus:ring-emerald-500/20 
              transition-all shadow-sm
            "
            value={form.People}
            onChange={(e) => updateForm("People", e.target.value)}
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={isButtonDisabled}
          className={`
            flex-1 md:flex-none md:w-auto px-8 py-4 text-white font-bold text-lg rounded-2xl 
            transition-all duration-200 flex items-center justify-center gap-3
            ${
              isButtonDisabled
                ? "bg-emerald-300 cursor-not-allowed shadow-none"
                : "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-200 hover:shadow-emerald-300 active:scale-[0.97]"
            }
          `}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin text-white/80" />
              Generating…
            </>
          ) : (
            <>
              <SearchIcon className="text-white" />
              Generate Ingredients
            </>
          )}
        </button>
      </div>
    </div>

    <div className="mt-12 text-center">
      <p className="text-gray-500 text-sm mb-4">Try a popular dish:</p>

      <div className="flex flex-wrap justify-center gap-3">
        {[
          "Adobo",
          "Spaghetti Carbonara",
          "Beef Tacos",
          "Pancit",
          "Fried Rice",
        ].map((dish) => (
          <button
            key={dish}
            onClick={() => handlePopularClick(dish)}
            className="
                px-5 py-2 bg-emerald-50 text-emerald-800 
                text-sm font-semibold rounded-full 
                hover:bg-emerald-100 hover:shadow-sm 
                transition-all
              "
          >
            {dish}
          </button>
        ))}
      </div>
    </div>
  </div>
);
