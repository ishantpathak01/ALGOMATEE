import React from "react";
import toast from "react-hot-toast";
import { ShoppingBag, Coins, Sparkles } from "lucide-react";
import { useAppContext } from "../../context/userContext";

// Dummy product pictures (inline SVG, no external files). Swap `image` for real photos later.
const svg = (inner, a, b) =>
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="400" height="300" fill="url(#g)"/>${inner}</svg>`
  );

const TSHIRT = svg(
  `<path d="M130 70l45-20c8 18 42 18 50 0l45 20 45 40-35 25-18-15v125H138V120l-18 15-35-25z" fill="#fff" opacity=".92"/><text x="200" y="175" font-family="Arial" font-weight="700" font-size="22" text-anchor="middle" fill="#2563eb">AlgoMate</text>`,
  "#1e3a8a", "#6d28d9"
);
const BOTTLE = svg(
  `<rect x="170" y="45" width="60" height="28" rx="8" fill="#e5e7eb"/><rect x="155" y="70" width="90" height="190" rx="22" fill="#fff" opacity=".92"/><rect x="155" y="130" width="90" height="46" fill="#2563eb"/><text x="200" y="160" font-family="Arial" font-weight="700" font-size="14" text-anchor="middle" fill="#fff">AlgoMate</text>`,
  "#065f46", "#0e7490"
);
const STICKERS = svg(
  `<circle cx="140" cy="120" r="50" fill="#fbbf24"/><rect x="195" y="85" width="100" height="70" rx="14" fill="#fff" transform="rotate(8 245 120)"/><path d="M170 220l30-50 30 50z" fill="#f472b6"/><text x="245" y="128" font-family="monospace" font-weight="700" font-size="22" text-anchor="middle" fill="#2563eb" transform="rotate(8 245 120)">{ }</text>`,
  "#9d174d", "#c2410c"
);
const MUG = svg(
  `<rect x="130" y="95" width="130" height="120" rx="16" fill="#fff" opacity=".92"/><path d="M260 120h22a22 22 0 010 60h-22" fill="none" stroke="#fff" stroke-width="14" opacity=".92"/><text x="195" y="165" font-family="monospace" font-weight="700" font-size="20" text-anchor="middle" fill="#7c3aed">&lt;/&gt;</text>`,
  "#334155", "#0f172a"
);

const ITEMS = [
  { id: 1, name: "AlgoMate T-Shirt", desc: "Soft cotton tee with the AlgoMate logo.", coins: 500, image: TSHIRT },
  { id: 2, name: "Steel Water Bottle", desc: "750 ml insulated bottle for long coding nights.", coins: 400, image: BOTTLE },
  { id: 3, name: "Developer Sticker Pack", desc: "10 laptop stickers: code, bugs and good vibes.", coins: 150, image: STICKERS },
  { id: 4, name: "Coder's Coffee Mug", desc: "Ceramic mug for your morning debug session.", coins: 250, image: MUG },
];

export default function Store() {
  const { user } = useAppContext();
  const coins = user?.Coins;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-[#0a0f1d] to-black text-white pt-28 pb-20 px-4 md:px-12">
      <div className="max-w-6xl mx-auto space-y-10">
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 border border-amber-500/30 text-amber-300">
            <Sparkles className="w-4 h-4" /> AlgoMate Store
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-orange-300 to-pink-300">
            Goodies for Coders
          </h1>
          <p className="text-gray-400 text-sm md:text-base">
            Earn coins by solving problems and winning contests, then redeem them for AlgoMate merch.
          </p>
          {typeof coins === "number" && (
            <p className="inline-flex items-center gap-1.5 text-sm text-amber-300 font-semibold">
              <Coins className="w-4 h-4" /> You have {coins} coins
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {ITEMS.map((it) => (
            <div key={it.id} className="rounded-2xl bg-gray-900/80 border border-gray-800 overflow-hidden flex flex-col hover:border-gray-700 transition">
              <img src={it.image} alt={it.name} className="w-full h-44 object-cover" />
              <div className="p-4 flex flex-col flex-1 space-y-2">
                <h3 className="font-bold text-lg">{it.name}</h3>
                <p className="text-xs text-gray-400 flex-1">{it.desc}</p>
                <div className="flex items-center justify-between pt-2">
                  <span className="flex items-center gap-1.5 text-amber-300 font-mono font-bold text-sm">
                    <Coins className="w-4 h-4" /> {it.coins}
                  </span>
                  <button
                    onClick={() => toast("Store opens soon! Keep earning coins.", { icon: "🛍️" })}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-bold transition"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" /> Redeem
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-500">Demo items for now. Real products and redeeming are coming soon.</p>
      </div>
    </div>
  );
}
