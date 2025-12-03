import React from "react";
import { useNavigate } from "react-router-dom";

export default function Layout({ children }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 flex flex-col">
      <nav className="w-full max-w-7xl mx-auto px-6 py-6 flex justify-between items-center">
        <div className="flex items-center cursor-pointer">
          <img src="tpaid_logo.png" className="h-7 w-7" />
          <span className="text-xl font-bold text-emerald-900 tracking-tight ml-1 cursor-pointer" onClick={() => navigate('/')}>
            Tipaid
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
          <button className="hover:text-emerald-600 transition-colors cursor-pointer" onClick={() => navigate('/works')}>
            How it works
          </button>
        </div>
      </nav>

      <main className="flex-1 w-full flex justify-center">{children}</main>
    </div>
  );
}
