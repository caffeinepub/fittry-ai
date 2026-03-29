import { Badge } from "@/components/ui/badge";
import { Heart, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { outfits } from "../data/outfits";
import type { Outfit } from "../types";

interface FavoritesScreenProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onTryOn: (outfit: Outfit) => void;
}

export default function FavoritesScreen({
  favorites,
  onToggleFavorite,
  onTryOn,
}: FavoritesScreenProps) {
  const favoriteOutfits = outfits.filter((o) => favorites.includes(o.id));

  return (
    <div className="min-h-screen pb-24">
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: "oklch(0.10 0.015 240 / 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.22 0.022 240 / 0.4)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center">
            <Heart size={16} className="text-white fill-white" />
          </div>
          <span className="font-display font-bold text-lg">Favorites</span>
        </div>
        <span className="text-xs text-muted-foreground">
          {favoriteOutfits.length} saved
        </span>
      </header>

      <div className="px-4 pt-5">
        <AnimatePresence mode="wait">
          {favoriteOutfits.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              data-ocid="favorites.empty_state"
              className="flex flex-col items-center justify-center min-h-[60vh] gap-5 text-center"
            >
              <div
                className="w-24 h-24 rounded-3xl flex items-center justify-center"
                style={{
                  background: "oklch(0.14 0.018 240)",
                  border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                }}
              >
                <Heart size={40} className="text-muted-foreground/50" />
              </div>
              <div>
                <h3 className="text-xl font-display font-bold">
                  No favorites yet
                </h3>
                <p className="text-sm text-muted-foreground mt-2 max-w-[240px]">
                  Start trying on outfits and tap the heart icon to save your
                  favorites here.
                </p>
              </div>
              <p className="text-xs text-muted-foreground opacity-60">
                &#128161; Browse trending looks on the Home tab
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="grid grid-cols-2 gap-3"
            >
              {favoriteOutfits.map((outfit, i) => (
                <motion.div
                  key={outfit.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl overflow-hidden border"
                  style={{
                    background: "oklch(0.14 0.018 240)",
                    borderColor: "oklch(0.22 0.022 240 / 0.5)",
                  }}
                  data-ocid={`favorites.item.${i + 1}`}
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <img
                      src={outfit.image}
                      alt={outfit.name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <button
                      type="button"
                      data-ocid={`favorites.remove.${i + 1}`}
                      onClick={() => onToggleFavorite(outfit.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90"
                    >
                      <Heart size={15} className="fill-red-400 text-red-400" />
                    </button>
                    <Badge
                      className="absolute top-2.5 left-2.5 text-[10px]"
                      style={{
                        background: "oklch(0.12 0.016 240 / 0.85)",
                        color: "oklch(0.78 0.12 265)",
                        border: "1px solid oklch(0.28 0.03 265 / 0.5)",
                      }}
                    >
                      {outfit.platform}
                    </Badge>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold truncate">
                      {outfit.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {outfit.brand}
                    </p>
                    <div className="flex items-center justify-between mt-2.5">
                      <span
                        className="text-sm font-bold"
                        style={{ color: "oklch(0.82 0.13 210)" }}
                      >
                        {outfit.price}
                      </span>
                      <button
                        type="button"
                        data-ocid={`favorites.tryon.${i + 1}`}
                        onClick={() => onTryOn(outfit)}
                        className="flex items-center gap-1 text-xs font-semibold gradient-blue text-white px-3 py-1.5 rounded-lg transition-all active:scale-95"
                      >
                        <Sparkles size={11} /> Try
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
