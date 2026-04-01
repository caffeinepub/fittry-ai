import { motion } from "motion/react";
import { OUTFITS } from "../data/outfits";
import type { Outfit } from "../types";

interface Props {
  onTryOn: () => void;
  onGallery: () => void;
}

const platforms = [
  {
    name: "Amazon",
    color: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  },
  { name: "Myntra", color: "bg-pink-500/20 text-pink-400 border-pink-500/30" },
  {
    name: "Flipkart",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  },
  { name: "Ajio", color: "bg-red-500/20 text-red-400 border-red-500/30" },
];

const featured: Outfit[] = OUTFITS.slice(0, 6);

function OutfitCard({ outfit }: { outfit: Outfit }) {
  return (
    <div className="flex-shrink-0 w-36 rounded-2xl overflow-hidden bg-slate-800/60 border border-slate-700/40">
      <div
        className="h-28 flex items-center justify-center text-5xl"
        style={{ backgroundColor: `${outfit.color}33` }}
      >
        {outfit.emoji}
      </div>
      <div className="p-2.5">
        <p className="text-white text-xs font-semibold truncate">
          {outfit.name}
        </p>
        <p className="text-slate-400 text-xs truncate">{outfit.brand}</p>
        <p className="text-violet-400 text-xs font-bold mt-0.5">
          {outfit.price}
        </p>
      </div>
    </div>
  );
}

export default function HomeScreen({ onTryOn, onGallery }: Props) {
  const year = new Date().getFullYear();

  return (
    <div className="pb-24 min-h-screen">
      {/* Header */}
      <div className="pt-12 px-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-display text-white">
              FitTry AI 👗
            </h1>
            <p className="text-slate-400 text-xs mt-0.5">
              Virtual Try-On Powered by AI
            </p>
          </div>
          <div className="flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-green-400 text-xs font-semibold">LIVE</span>
          </div>
        </div>
      </div>

      {/* Hero Card */}
      <div className="px-5 mb-5">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-violet-900/60 to-slate-800/80 border border-violet-500/20 p-6"
        >
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-48 h-48 rounded-full bg-violet-600/10 blur-2xl" />
            <div className="absolute bottom-0 left-0 w-36 h-36 rounded-full bg-violet-800/15 blur-xl" />
          </div>
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-2 bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                <span className="text-red-400 text-xs font-bold">LIVE</span>
              </div>
              <span className="text-4xl animate-float">✨</span>
            </div>
            <h2 className="text-2xl font-bold font-display text-white mb-1">
              Try Any Outfit
            </h2>
            <p className="text-violet-300 text-sm mb-6">
              Instantly see how it looks on you with AI
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onTryOn}
                className="flex-1 bg-violet-600 hover:bg-violet-500 text-white rounded-2xl py-3 text-sm font-semibold transition-all active:scale-95"
                data-ocid="home.primary_button"
              >
                Try On Now
              </button>
              <button
                type="button"
                onClick={onGallery}
                className="flex-1 bg-slate-700/60 hover:bg-slate-700 text-white rounded-2xl py-3 text-sm font-semibold transition-all border border-slate-600/40 active:scale-95"
                data-ocid="home.secondary_button"
              >
                Browse Gallery
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Platform Badges */}
      <div className="px-5 mb-5">
        <p className="text-slate-400 text-sm mb-3">Shop from</p>
        <div className="flex gap-2 flex-wrap">
          {platforms.map((p) => (
            <span
              key={p.name}
              className={`border rounded-full px-3 py-1.5 text-xs font-semibold ${p.color}`}
            >
              {p.name}
            </span>
          ))}
        </div>
      </div>

      {/* Featured Outfits */}
      <div className="mb-5">
        <div className="px-5 flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold">Featured Outfits</h3>
          <button
            type="button"
            onClick={onGallery}
            className="text-violet-400 text-sm"
            data-ocid="home.link"
          >
            See all →
          </button>
        </div>
        <div
          className="flex gap-3 overflow-x-auto px-5 pb-1"
          style={{ scrollbarWidth: "none" }}
        >
          {featured.map((o) => (
            <OutfitCard key={o.id} outfit={o} />
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="px-5 mb-6">
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Outfits", value: "120+", icon: "👗" },
            { label: "Brands", value: "20+", icon: "🏷️" },
            { label: "Try-Ons", value: "Free", icon: "✨" },
          ].map((s) => (
            <div
              key={s.label}
              className="bg-slate-800/50 border border-slate-700/40 rounded-2xl p-3 text-center"
            >
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-white font-bold text-sm">{s.value}</div>
              <div className="text-slate-500 text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      <footer className="px-5 text-center text-slate-600 text-xs">
        © {year} built with 🖤 ai agent
      </footer>
    </div>
  );
}
