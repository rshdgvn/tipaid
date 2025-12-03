import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChefHat,
  Search,
  ListChecks,
  Store,
  Wallet,
  Download,
  Sparkles,
  Zap,
  TrendingDown,
} from "lucide-react";

export default function HowItWorksPage() {
  const navigate = useNavigate();

  const STEPS = [
    {
      icon: <Search size={24} />,
      title: "1. Find a Recipe",
      description:
        "Search for a dish you want to cook. We'll automatically pull the ingredients for you, or you can build a custom list from scratch.",
    },
    {
      icon: <ListChecks size={24} />,
      title: "2. Customize Your List",
      description:
        "Remove items you already have at home, adjust quantities, or add extra custom items to your basket.",
    },
    {
      icon: <Wallet size={24} />,
      title: "3. Set Your Budget",
      description:
        "Tell us how much you want to spend. We'll help you track your estimated total against your budget in real-time.",
    },
    {
      icon: <Store size={24} />,
      title: "4. Compare & Save",
      description:
        "We instantly compare prices across stores like O-Save, Dali, and Pampanga Market to find you the absolute best deal.",
    },
    {
      icon: <Download size={24} />,
      title: "5. Download & Shop",
      description:
        "Get a neatly organized shopping list with the exact prices. Download it as an image and take it with you!",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">
      {/* --- Header --- */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-gray-100 hover:bg-emerald-100 hover:text-emerald-600 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="font-bold text-lg text-gray-800 flex items-center gap-2">
            <Sparkles size={18} className="text-emerald-500" /> How It Works
          </span>
        </div>
      </div>

      {/* --- Hero Section --- */}
      <div className="bg-emerald-900 text-white pt-16 pb-24 px-6 text-center relative overflow-hidden">
        <ChefHat
          className="absolute top-10 left-10 text-emerald-800 opacity-20 rotate-[-12deg]"
          size={120}
        />
        <Store
          className="absolute bottom-[-20px] right-[-20px] text-emerald-800 opacity-20 rotate-12"
          size={150}
        />

        <div className="relative z-10 max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight leading-tight">
            Smart Shopping <br />
            <span className="text-emerald-400">Made Simple.</span>
          </h1>
          <p className="text-emerald-100 text-lg md:text-xl font-medium leading-relaxed">
            Stop guessing prices. We analyze local stores to help you cook
            delicious meals without breaking the bank.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-16 relative z-20">
        {/* --- Steps Container --- */}
        <div className="bg-white rounded-[2rem] shadow-xl shadow-gray-200/50 border border-gray-100 p-8 md:p-12">
          <div className="space-y-12 relative">
            {/* Connecting Line (Desktop) */}
            <div className="hidden md:block absolute left-[27px] top-4 bottom-4 w-0.5 bg-dashed border-l-2 border-dashed border-gray-200" />

            {STEPS.map((step, index) => (
              <div
                key={index}
                className="relative flex flex-col md:flex-row gap-6 md:gap-8 items-start animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Icon Bubble */}
                <div className="shrink-0 relative">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-sm z-10 relative ring-4 ring-white">
                    {step.icon}
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 pt-2">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-500 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* --- Why Use Us Grid --- */}
          <div className="mt-16 pt-10 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-center mb-8 text-gray-800">
              Why use <span className="text-emerald-500">Tipaid</span>?
            </h2>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100 hover:border-emerald-200 transition-colors">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap size={20} />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">Save Time</h4>
                <p className="text-xs text-gray-500">
                  No more visiting multiple stores to check prices.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100 hover:border-emerald-200 transition-colors">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <TrendingDown size={20} />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">Save Money</h4>
                <p className="text-xs text-gray-500">
                  Find the cheapest ingredients instantly.
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl text-center border border-gray-100 hover:border-emerald-200 transition-colors">
                <div className="w-10 h-10 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Wallet size={20} />
                </div>
                <h4 className="font-bold text-gray-800 mb-1">Stay on Budget</h4>
                <p className="text-xs text-gray-500">
                  Know exactly what you'll spend before you leave home.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Sticky CTA Footer --- */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-emerald-100 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden md:block">
            <p className="font-bold text-gray-800 text-sm">Ready to save?</p>
            <p className="text-xs text-gray-400">
              Start your smart shopping journey now.
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full md:w-auto px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl shadow-lg shadow-emerald-200 transition-all transform active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles size={18} /> Get Started
          </button>
        </div>
      </div>
    </div>
  );
}
