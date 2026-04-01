import { Heart, Trash2 } from "lucide-react";
import { OUTFITS } from "../data/outfits";
import type { Outfit } from "../types";

interface Props {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onTryOn: (outfit: Outfit) => void;
}

export default function FavoritesScreen({
  favorites,
  onToggleFavorite,
  onTryOn,
}: Props) {
  const savedOutfits = OUTFITS.filter((o) => favorites.includes(o.id));

  return (
    <div className="pb-24 min-h-screen">
      <div className="pt-12 px-5 pb-5">
        <h1 className="text-2xl font-bold font-display text-white">
          Favorites
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          {savedOutfits.length} saved outfit
          {savedOutfits.length !== 1 ? "s" : ""}
        </p>
      </div>

      {savedOutfits.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center pt-20 px-8"
          data-ocid="favorites.empty_state"
        >
          <div className="w-20 h-20 rounded-3xl bg-slate-800/60 flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-slate-600" />
          </div>
          <h3 className="text-white font-semibold text-lg mb-2">
            No favorites yet
          </h3>
          <p className="text-slate-400 text-sm text-center">
            Browse the gallery and tap the heart icon to save outfits you love.
          </p>
        </div>
      ) : (
        <div className="px-5 grid grid-cols-2 gap-4">
          {savedOutfits.map((outfit, idx) => (
            <div
              key={outfit.id}
              className="rounded-2xl overflow-hidden bg-slate-800/60 border border-slate-700/40"
              data-ocid={`favorites.item.${idx + 1}`}
            >
              <div className="relative">
                <div
                  className="h-32 flex items-center justify-center text-5xl"
                  style={{ backgroundColor: `${outfit.color}33` }}
                >
                  {outfit.emoji}
                </div>
                <button
                  type="button"
                  onClick={() => onToggleFavorite(outfit.id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/50 flex items-center justify-center"
                  data-ocid="favorites.delete_button"
                >
                  <Trash2 className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
              <div className="p-3">
                <p className="text-white text-sm font-semibold truncate">
                  {outfit.name}
                </p>
                <p className="text-slate-400 text-xs">{outfit.brand}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-violet-400 text-xs font-bold">
                    {outfit.price}
                  </span>
                  <button
                    type="button"
                    onClick={() => onTryOn(outfit)}
                    className="bg-violet-600/80 hover:bg-violet-600 text-white text-xs rounded-lg px-2.5 py-1 font-semibold"
                    data-ocid="favorites.button"
                  >
                    Try On
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
