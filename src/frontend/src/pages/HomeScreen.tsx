import { Badge } from "@/components/ui/badge";
import { ChevronRight, Heart, ShoppingBag, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import { outfits, platformInfo } from "../data/outfits";
import type { Outfit, Platform } from "../types";

const platforms: Platform[] = ["Amazon", "Myntra", "Flipkart", "Ajio"];

const platformColors: Record<Platform, string> = {
  Amazon: "from-[#ff9900]/20 to-[#ff9900]/5 border-[#ff9900]/30",
  Myntra: "from-[#ff3f6c]/20 to-[#ff3f6c]/5 border-[#ff3f6c]/30",
  Flipkart: "from-[#2874f0]/20 to-[#2874f0]/5 border-[#2874f0]/30",
  Ajio: "from-[#e84393]/20 to-[#e84393]/5 border-[#e84393]/30",
};

const platformEmoji: Record<Platform, string> = {
  Amazon: "\uD83D\uDED2",
  Myntra: "\uD83D\uDC57",
  Flipkart: "\uD83D\uDECD\uFE0F",
  Ajio: "\u2728",
};

interface HomeScreenProps {
  onTryOn: (outfit: Outfit) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onNavigateTryOn: () => void;
}

export default function HomeScreen({
  onTryOn,
  favorites,
  onToggleFavorite,
  onNavigateTryOn,
}: HomeScreenProps) {
  const [selectedPlatform, setSelectedPlatform] = useState<Platform | null>(
    null,
  );

  const filteredOutfits = selectedPlatform
    ? outfits.filter((o) => o.platform === selectedPlatform)
    : outfits;

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
          <div className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center shadow-glow-blue">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-foreground">
            FitTry AI
          </span>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          AI Virtual Try-On
        </span>
      </header>

      <div className="px-4 space-y-7 pt-5">
        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-3xl overflow-hidden"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.018 240) 0%, oklch(0.17 0.025 240) 100%)",
            border: "1px solid oklch(0.22 0.022 240 / 0.6)",
          }}
        >
          <div className="flex gap-4 p-5">
            <div className="flex-1 flex flex-col justify-center gap-3">
              <div className="flex items-center gap-2">
                <span className="live-badge text-xs font-bold px-3 py-1 rounded-full animate-pulse-glow">
                  &#x25CF; LIVE
                </span>
                <span className="text-xs text-muted-foreground">AI Ready</span>
              </div>
              <h1 className="text-2xl font-display font-bold leading-tight">
                <span className="gradient-blue-text">Try Before</span>
                <br />
                <span className="text-foreground">You Buy</span>
              </h1>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Upload your photo and virtually try on thousands of outfits
                instantly.
              </p>
              <button
                type="button"
                data-ocid="home.tryon.primary_button"
                onClick={onNavigateTryOn}
                className="gradient-blue text-white text-sm font-semibold py-2.5 px-5 rounded-xl w-fit shadow-glow-blue transition-transform active:scale-95"
              >
                Try On Now &#8594;
              </button>
            </div>
            <div className="w-36 relative flex-shrink-0">
              <div className="relative w-36 h-44 rounded-2xl overflow-hidden">
                <img
                  src="/assets/generated/fashion-model-hero.dim_600x800.jpg"
                  alt="Fashion model"
                  className="w-full h-full object-cover animate-float"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
              </div>
              <div className="absolute -inset-1 rounded-3xl border border-cyan-live/30 animate-pulse-ring pointer-events-none" />
            </div>
          </div>
        </motion.div>

        {/* Shop by Platform */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-bold text-foreground">
              Shop by Platform
            </h2>
            <span className="text-xs text-muted-foreground">4 stores</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {platforms.map((platform) => (
              <button
                type="button"
                key={platform}
                data-ocid={`platform.${platform.toLowerCase()}.button`}
                onClick={() =>
                  setSelectedPlatform(
                    selectedPlatform === platform ? null : platform,
                  )
                }
                className={`rounded-2xl p-4 text-left border bg-gradient-to-br transition-all duration-200 active:scale-95 ${platformColors[platform]} ${
                  selectedPlatform === platform
                    ? "ring-2 ring-primary/50 scale-[1.02]"
                    : "hover:scale-[1.01]"
                }`}
              >
                <div className="text-2xl mb-2">{platformEmoji[platform]}</div>
                <div className="font-semibold text-foreground text-sm">
                  {platform}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {platformInfo[platform].count} outfits
                </div>
                <div
                  className="text-xs font-medium mt-2"
                  style={{ color: platformInfo[platform].color }}
                >
                  {platformInfo[platform].tagline} &#8594;
                </div>
              </button>
            ))}
          </div>
        </motion.section>

        {/* Trending Looks */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-bold text-foreground">
              Trending Looks
            </h2>
            {selectedPlatform && (
              <button
                type="button"
                onClick={() => setSelectedPlatform(null)}
                className="text-xs text-primary font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredOutfits.map((outfit, i) => (
              <motion.div
                key={outfit.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.05 }}
                className="rounded-2xl overflow-hidden border"
                style={{
                  background: "oklch(0.14 0.018 240)",
                  borderColor: "oklch(0.22 0.022 240 / 0.5)",
                }}
                data-ocid={`outfit.item.${i + 1}`}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    type="button"
                    data-ocid={`outfit.favorite.${i + 1}`}
                    onClick={() => onToggleFavorite(outfit.id)}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center transition-all active:scale-90"
                  >
                    <Heart
                      size={15}
                      className={
                        favorites.includes(outfit.id)
                          ? "fill-red-400 text-red-400"
                          : "text-white"
                      }
                    />
                  </button>
                  <Badge
                    className="absolute top-2.5 left-2.5 text-[10px] px-1.5 py-0.5 font-semibold"
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
                  <p className="text-sm font-semibold text-foreground leading-tight truncate">
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
                      data-ocid={`outfit.tryon.${i + 1}`}
                      onClick={() => onTryOn(outfit)}
                      className="flex items-center gap-1 text-xs font-semibold gradient-blue text-white px-3 py-1.5 rounded-lg transition-all active:scale-95"
                    >
                      Try On <ChevronRight size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* CTA Banner */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="rounded-2xl p-5 flex items-center gap-4 mb-2"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.018 240) 0%, oklch(0.16 0.025 240) 100%)",
            border: "1px solid oklch(0.30 0.04 265 / 0.4)",
          }}
        >
          <div className="w-12 h-12 rounded-2xl gradient-blue flex items-center justify-center flex-shrink-0 shadow-glow-blue">
            <ShoppingBag size={22} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">
              100% Free &#8212; No Limits
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload your photo and try on any outfit for free, always.
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
