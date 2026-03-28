import { Button } from "@/components/ui/button";
import {
  Camera,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  Star,
  Upload,
} from "lucide-react";
import { useState } from "react";
import OutfitCard from "../components/OutfitCard";
import { OUTFITS } from "../data/outfits";
import type { AppState } from "../types";

const CATEGORIES_INFO = [
  {
    name: "Casual",
    emoji: "👕",
    description: "Everyday comfort",
    color: "from-blue-500/20 to-blue-600/10",
  },
  {
    name: "Formal",
    emoji: "👔",
    description: "Business & events",
    color: "from-purple-500/20 to-purple-600/10",
  },
  {
    name: "Streetwear",
    emoji: "🧢",
    description: "Urban style",
    color: "from-orange-500/20 to-orange-600/10",
  },
  {
    name: "Sport",
    emoji: "🏃",
    description: "Active lifestyle",
    color: "from-green-500/20 to-green-600/10",
  },
];

const AVATAR_COLORS = ["#C7B6E8", "#E8B9C7", "#B6C7E8", "#E8C7B6"];

interface HomePageProps {
  onNavigate: (page: AppState) => void;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

export default function HomePage({
  onNavigate,
  favorites,
  onToggleFavorite,
}: HomePageProps) {
  const [activeCategory, setActiveCategory] = useState("All");

  const filteredOutfits =
    activeCategory === "All"
      ? OUTFITS
      : OUTFITS.filter((o) => o.category === activeCategory);

  return (
    <div className="max-w-[430px] mx-auto pb-8">
      {/* Hero */}
      <section
        className="relative px-4 pt-8 pb-10 overflow-hidden"
        data-ocid="home.section"
      >
        <div className="absolute inset-0 gradient-hero opacity-30 pointer-events-none" />
        <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full bg-lavender/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-40 h-40 rounded-full bg-pink-accent/10 blur-3xl pointer-events-none" />

        <div className="relative">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-3 py-1 mb-5">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span className="text-xs font-semibold text-primary">
              AI-Powered Virtual Try-On
            </span>
          </div>

          <h1 className="text-3xl font-black leading-tight mb-3">
            Your Virtual
            <br />
            <span className="gradient-text">Fitting Room</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-6">
            Try any outfit on your upload instantly. No returns, no guessing —
            just perfect fits.
          </p>

          <div className="flex gap-3">
            <Button
              onClick={() => onNavigate("upload")}
              className="flex-1 pill gradient-lavender-pink border-0 text-white font-semibold h-11 hover:opacity-90 transition-opacity text-sm"
              data-ocid="home.primary_button"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload Photo
            </Button>
            <Button
              onClick={() => onNavigate("upload")}
              variant="outline"
              className="flex-1 pill border-border font-semibold h-11 text-sm hover:bg-muted transition-colors"
              data-ocid="home.secondary_button"
            >
              <Camera className="w-4 h-4 mr-2" />
              Use Camera
            </Button>
          </div>

          <div className="flex items-center gap-3 mt-5">
            <div className="flex -space-x-1.5">
              {AVATAR_COLORS.map((c) => (
                <div
                  key={c}
                  className="w-6 h-6 rounded-full border-2 border-background"
                  style={{ background: c }}
                />
              ))}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              <span>
                <strong className="text-foreground">50K+</strong> happy shoppers
              </span>
            </div>
          </div>
        </div>

        {/* Floating cards */}
        <div className="relative mt-8 h-52">
          <div className="absolute left-0 top-4 w-32 bg-card border border-border rounded-2xl p-2 shadow-float animate-float">
            <img
              src="/assets/generated/outfit-streetwear.dim_400x500.jpg"
              alt="Streetwear outfit"
              className="w-full aspect-[4/5] object-cover rounded-xl mb-1.5"
            />
            <div className="px-1">
              <p className="text-xs font-bold truncate">Urban Streetwear</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                <span className="text-[10px] text-green-accent font-semibold">
                  94% match
                </span>
              </div>
            </div>
          </div>
          <div
            className="absolute right-0 top-0 w-36 bg-card border border-border rounded-2xl p-2 shadow-float"
            style={{
              animation: "float 3s ease-in-out infinite",
              animationDelay: "1.5s",
            }}
          >
            <img
              src="/assets/generated/outfit-evening.dim_400x500.jpg"
              alt="Evening outfit"
              className="w-full aspect-[4/5] object-cover rounded-xl mb-1.5"
            />
            <div className="px-1">
              <p className="text-xs font-bold truncate">Evening Glamour</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                <span className="text-[10px] text-green-accent font-semibold">
                  96% match
                </span>
              </div>
            </div>
          </div>
          <div
            className="absolute left-1/2 -translate-x-1/2 top-8 w-28 bg-card border border-primary/30 rounded-2xl p-2 shadow-glow"
            style={{
              animation: "float 3s ease-in-out infinite",
              animationDelay: "0.7s",
            }}
          >
            <img
              src="/assets/generated/outfit-casual.dim_400x500.jpg"
              alt="Casual outfit"
              className="w-full aspect-[4/5] object-cover rounded-xl mb-1.5"
            />
            <div className="px-1">
              <p className="text-xs font-bold truncate">Casual Friday</p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-accent" />
                <span className="text-[10px] text-green-accent font-semibold">
                  97% match
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Explore Gallery */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Explore Gallery</h2>
          <button
            type="button"
            className="text-sm text-primary flex items-center gap-0.5"
            onClick={() => onNavigate("outfit-selector")}
            data-ocid="home.link"
          >
            See all <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES_INFO.map((cat) => (
            <button
              key={cat.name}
              type="button"
              onClick={() => onNavigate("outfit-selector")}
              className={`rounded-2xl p-4 text-left bg-gradient-to-br ${cat.color} border border-border hover:border-primary/30 transition-all hover:scale-[1.02]`}
              data-ocid="home.tab"
            >
              <span className="text-2xl">{cat.emoji}</span>
              <p className="font-bold mt-2">{cat.name}</p>
              <p className="text-xs text-muted-foreground">{cat.description}</p>
            </button>
          ))}
        </div>
      </section>

      {/* Virtual Closet */}
      <section className="px-4 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">Virtual Closet</h2>
          <div className="flex gap-2 overflow-x-auto">
            {["All", "Casual", "Formal", "Streetwear"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCategory(cat)}
                className={`text-xs px-3 py-1 rounded-full whitespace-nowrap transition-all ${
                  activeCategory === cat
                    ? "gradient-lavender-pink text-white font-semibold"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
                data-ocid="home.tab"
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {filteredOutfits.slice(0, 4).map((outfit, i) => (
            <OutfitCard
              key={outfit.id}
              outfit={outfit}
              isFavorite={favorites.includes(outfit.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={() => onNavigate("upload")}
              index={i}
            />
          ))}
        </div>
      </section>

      {/* Premium Banner */}
      <section className="px-4 mb-8">
        <div className="rounded-3xl gradient-lavender-pink p-6 relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-white/10" />
          <div className="relative">
            <span className="text-xs font-bold text-white/70 uppercase tracking-wider">
              FitTry Pro
            </span>
            <h3 className="text-xl font-black text-white mt-1 mb-3">
              Unlock Unlimited Try-Ons
            </h3>
            <ul className="space-y-1.5 mb-5">
              {["Unlimited Try-Ons", "HD Downloads", "AI Styling"].map((b) => (
                <li
                  key={b}
                  className="flex items-center gap-2 text-white/90 text-sm"
                >
                  <ShieldCheck className="w-4 h-4 text-white" />
                  {b}
                </li>
              ))}
            </ul>
            <Button
              className="pill bg-white text-purple-700 font-bold h-10 px-6 hover:bg-white/90 transition-colors text-sm border-0"
              data-ocid="home.primary_button"
            >
              Go Pro Now →
            </Button>
          </div>
        </div>
      </section>

      <footer className="px-4 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>
    </div>
  );
}
