import { Heart, Search, X } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { OUTFITS } from "../data/outfits";
import type { Category, Gender, Outfit } from "../types";

const CATEGORIES: Category[] = [
  "All",
  "Casual",
  "Formal",
  "Traditional",
  "Western",
  "Sports",
  "Party",
];

interface Props {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onTryOn: (outfit: Outfit) => void;
}

function OutfitCard({
  outfit,
  isFav,
  onFav,
  onPreview,
}: {
  outfit: Outfit;
  isFav: boolean;
  onFav: () => void;
  onPreview: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl overflow-hidden bg-slate-800/60 border border-slate-700/40"
    >
      <div
        className="relative cursor-pointer"
        onClick={onPreview}
        onKeyDown={(e) => e.key === "Enter" && onPreview()}
        role="presentation"
      >
        <div
          className="h-28 flex items-center justify-center text-5xl"
          style={{ backgroundColor: `${outfit.color}33` }}
        >
          {outfit.emoji}
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onFav();
          }}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
          data-ocid="gallery.toggle"
        >
          <Heart
            className={`w-3.5 h-3.5 ${isFav ? "fill-red-500 text-red-500" : "text-white"}`}
          />
        </button>
      </div>
      <div className="p-2.5">
        <p className="text-white text-xs font-semibold truncate">
          {outfit.name}
        </p>
        <p className="text-slate-400 text-xs truncate">{outfit.brand}</p>
        <div className="flex items-center justify-between mt-2">
          <span className="text-violet-400 text-xs font-bold">
            {outfit.price}
          </span>
          <button
            type="button"
            onClick={onPreview}
            className="bg-violet-600/80 hover:bg-violet-600 text-white text-xs rounded-lg px-2.5 py-1 font-semibold transition-all"
            data-ocid="gallery.button"
          >
            Try On
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function OutfitGallery({
  favorites,
  onToggleFavorite,
  onTryOn,
}: Props) {
  const [gender, setGender] = useState<Gender>("Women");
  const [category, setCategory] = useState<Category>("All");
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<Outfit | null>(null);

  const filtered = OUTFITS.filter((o) => {
    if (o.gender !== gender) return false;
    if (category !== "All" && o.category !== category) return false;
    if (
      search &&
      !o.name.toLowerCase().includes(search.toLowerCase()) &&
      !o.brand.toLowerCase().includes(search.toLowerCase())
    )
      return false;
    return true;
  });

  return (
    <div className="pb-24 min-h-screen">
      <div className="pt-12 px-5 pb-4">
        <h1 className="text-2xl font-bold font-display text-white">
          Outfit Gallery
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {OUTFITS.length}+ styles to explore
        </p>
      </div>

      {/* Gender Toggle */}
      <div className="px-5 mb-4">
        <div className="flex bg-slate-800/60 rounded-2xl p-1 border border-slate-700/40">
          {(["Women", "Men"] as Gender[]).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                gender === g
                  ? "bg-violet-600 text-white shadow-lg"
                  : "text-slate-400 hover:text-white"
              }`}
              data-ocid="gallery.tab"
            >
              {g === "Women" ? "👩 Women" : "👨 Men"}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            className="w-full bg-slate-800/60 border border-slate-700/40 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm placeholder:text-slate-500 outline-none"
            placeholder="Search outfits or brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            data-ocid="gallery.search_input"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4 text-slate-400" />
            </button>
          )}
        </div>
      </div>

      {/* Categories */}
      <div
        className="flex gap-2 overflow-x-auto px-5 pb-2 mb-4"
        style={{ scrollbarWidth: "none" }}
      >
        {CATEGORIES.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCategory(c)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
              category === c
                ? "bg-violet-600 text-white border-violet-600"
                : "bg-slate-800/60 text-slate-400 border-slate-700/40 hover:text-white"
            }`}
            data-ocid="gallery.tab"
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="px-5">
        <p className="text-slate-500 text-xs mb-3">{filtered.length} outfits</p>
        {filtered.length === 0 ? (
          <div className="text-center py-16" data-ocid="gallery.empty_state">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-slate-400">No outfits found</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {filtered.map((outfit) => (
              <OutfitCard
                key={outfit.id}
                outfit={outfit}
                isFav={favorites.includes(outfit.id)}
                onFav={() => onToggleFavorite(outfit.id)}
                onPreview={() => setPreview(outfit)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {preview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 flex items-end justify-center px-5 pb-8"
            onClick={() => setPreview(null)}
          >
            <motion.div
              initial={{ y: 48, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 48, opacity: 0 }}
              className="w-full max-w-sm bg-slate-900 border border-slate-700/60 rounded-3xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
              data-ocid="gallery.modal"
            >
              <div
                className="h-56 flex items-center justify-center text-8xl"
                style={{ backgroundColor: `${preview.color}33` }}
              >
                {preview.emoji}
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-white font-bold text-lg">
                    {preview.name}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setPreview(null)}
                    data-ocid="gallery.close_button"
                  >
                    <X className="w-5 h-5 text-slate-400" />
                  </button>
                </div>
                <p className="text-slate-400 text-sm">{preview.brand}</p>
                <div className="flex items-center gap-2 mt-1 mb-4">
                  <span className="bg-violet-600/20 text-violet-300 text-xs px-2 py-0.5 rounded-full">
                    {preview.category}
                  </span>
                  <span className="text-violet-400 font-bold">
                    {preview.price}
                  </span>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => onToggleFavorite(preview.id)}
                    className={`flex-1 py-3 rounded-2xl text-sm font-semibold border transition-all ${
                      favorites.includes(preview.id)
                        ? "bg-red-500/20 border-red-500/40 text-red-400"
                        : "bg-slate-800 border-slate-700 text-slate-300"
                    }`}
                    data-ocid="gallery.toggle"
                  >
                    {favorites.includes(preview.id) ? "❤️ Saved" : "🤍 Save"}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onTryOn(preview);
                      setPreview(null);
                    }}
                    className="flex-1 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-all"
                    data-ocid="gallery.primary_button"
                  >
                    Try On
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
