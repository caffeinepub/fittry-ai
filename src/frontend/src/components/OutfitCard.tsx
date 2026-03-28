import { cn } from "@/lib/utils";
import { Heart } from "lucide-react";
import type { Outfit } from "../types";

interface OutfitCardProps {
  outfit: Outfit;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onSelect?: (outfit: Outfit) => void;
  compact?: boolean;
  index?: number;
}

export default function OutfitCard({
  outfit,
  isFavorite,
  onToggleFavorite,
  onSelect,
  compact = false,
  index = 0,
}: OutfitCardProps) {
  return (
    <button
      type="button"
      className={cn(
        "relative group rounded-2xl overflow-hidden bg-card border border-border cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-float text-left w-full",
        compact ? "" : "",
      )}
      onClick={() => onSelect?.(outfit)}
      data-ocid={`outfit.item.${index + 1}`}
    >
      <div className="relative overflow-hidden bg-muted aspect-[4/5]">
        {outfit.image ? (
          <img
            src={outfit.image}
            alt={outfit.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full gradient-lavender-pink opacity-40" />
        )}

        {outfit.aiMatch && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-accent/20 border border-green-accent/40 text-green-accent text-xs font-semibold px-2 py-0.5 rounded-full backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-green-accent inline-block" />
            {outfit.aiMatch}% match
          </div>
        )}

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(outfit.id);
          }}
          className={cn(
            "absolute top-2 right-2 w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-sm transition-all",
            isFavorite
              ? "bg-red-500/20 border border-red-500/40 text-red-400"
              : "bg-black/20 border border-white/10 text-white/60 hover:text-white",
          )}
          data-ocid={`outfit.toggle.${index + 1}`}
        >
          <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
        </button>
      </div>

      <div className="p-3">
        <p className="text-xs text-muted-foreground truncate">{outfit.brand}</p>
        <p className="font-semibold text-sm truncate">{outfit.name}</p>
        <p className="text-sm font-bold text-primary mt-0.5">{outfit.price}</p>
      </div>
    </button>
  );
}
