import React from "react";
import toast from "react-hot-toast";
import { ShoppingBag, Sparkles } from "lucide-react";

// Product pictures live in /public/store (swap the files to change them).
const ITEMS = [
  { id: 1, name: "AlgoMate T-Shirt", desc: "Premium black tee with the AlgoMate logo. Soft, breathable and made for long coding nights.", image: "/store/tshirt.webp" },
  { id: 2, name: "AlgoMate Insulated Bottle", desc: "Matte black steel bottle that keeps drinks cold or hot while you solve problems.", image: "/store/bottle.webp" },
  { id: 3, name: "AlgoMate Coffee Mug", desc: "Glossy black ceramic mug for your morning debug session.", image: "/store/mug.webp" },
];

export default function Store() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#0a0f1d] to-black text-white pt-28 pb-20 px-4 md:px-12">
      <div className="max-w-7xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Sparkles className="w-4 h-4" /> AlgoMate Store
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300">
            Goodies for Coders
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Official AlgoMate merch for coders. Launching soon!
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ITEMS.map((it) => (
            <div key={it.id} className="rounded-3xl bg-gray-900/80 border border-gray-800 overflow-hidden flex flex-col hover:border-blue-500/50 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-900/20 transition-all duration-300">
              <div className="h-96 bg-gradient-to-b from-gray-900 to-black flex items-center justify-center p-6">
                <img src={it.image} alt={it.name} className="max-h-full max-w-full object-contain" loading="lazy" />
              </div>
              <div className="p-6 flex flex-col flex-1 space-y-3">
                <h3 className="font-bold text-2xl">{it.name}</h3>
                <p className="text-sm text-gray-400 flex-1 leading-relaxed">{it.desc}</p>
                <div className="flex items-center justify-between pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">Coming soon</span>
                  <button
                    onClick={() => toast("Store opens soon! Stay tuned.", { icon: "🛍️" })}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-sm font-bold transition"
                  >
                    <ShoppingBag className="w-4 h-4" /> Notify me
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500">Demo items for now. Real products are coming soon.</p>
      </div>
    </div>
  );
}
