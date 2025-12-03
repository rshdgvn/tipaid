import React from "react";
import { LeafIcon } from "lucide-react";

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="bg-emerald-500 p-1.5 rounded-lg shadow-sm">
            <LeafIcon />
          </div>
          <span className="text-xl font-bold text-emerald-900 tracking-tight">
            Tipaid
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <button className="hover:text-emerald-600 transition-colors">
            How it works
          </button>
          <button className="hover:text-emerald-600 transition-colors">
            Pricing
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full flex justify-center">{children}</main>
    </div>
  );
}
