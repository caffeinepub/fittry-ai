import { Button } from "@/components/ui/button";
import { ArrowLeft, Zap } from "lucide-react";
import { useState } from "react";
import OutfitCard from "../components/OutfitCard";
import { CATEGORIES, OUTFITS } from "../data/outfits";
import type { Outfit } from "../types";

interface OutfitSelectorProps {
  onOutfitSelected: (outfit: Outfit) => void;
  onBack: () => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  triesLeft: number;
  onUpgrade: () => void;
}

export default function OutfitSelectorPage({
  onOutfitSelected,
  onBack,
  favorites,
  onToggleFavorite,
  triesLeft,
  onUpgrade,
}: OutfitSelectorProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered =
    activeCategory === "All"
      ? OUTFITS
      : OUTFITS.filter((o) => o.category === activeCategory);

  return (
    <div className="max-w-[430px] mx-auto px-4 pt-6 pb-8 animate-slide-up">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-4 hover:text-foreground transition-colors"
        data-ocid="selector.link"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Upload
      </button>

      <div className="flex items-center justify-between mb-1">
        <h2 className="text-2xl font-black">Choose Outfit</h2>
        {triesLeft !== Number.POSITIVE_INFINITY && (
          <button
            type="button"
            onClick={onUpgrade}
            className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary font-semibold"
            data-ocid="selector.upgrade_button"
          >
            <Zap className="w-3 h-3" />
            {triesLeft} tries left
          </button>
        )}
      </div>
      <p className="text-muted-foreground text-sm mb-5">
        Tap an outfit to try it on instantly
      </p>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setActiveCategory(cat)}
            className={`text-xs px-4 py-2 rounded-full whitespace-nowrap font-semibold transition-all ${
              activeCategory === cat
                ? "gradient-lavender-pink text-white shadow-glow"
                : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="selector.tab"
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((outfit, i) => (
          <OutfitCard
            key={outfit.id}
            outfit={outfit}
            isFavorite={favorites.includes(outfit.id)}
            onToggleFavorite={onToggleFavorite}
            onSelect={onOutfitSelected}
            index={i}
          />
        ))}
      </div>

      {triesLeft === 0 && (
        <div className="mt-6 rounded-2xl border border-primary/30 bg-primary/5 p-4 text-center">
          <p className="text-sm font-semibold mb-2">
            Free tries used for today
          </p>
          <Button
            onClick={onUpgrade}
            className="pill gradient-lavender-pink border-0 text-white font-bold h-10 px-6 hover:opacity-90 transition-opacity text-sm"
            data-ocid="selector.primary_button"
          >
            Upgrade to Pro 🚀
          </Button>
        </div>
      )}
    </div>
  );
}
