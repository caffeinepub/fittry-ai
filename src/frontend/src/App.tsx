import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import FavoritesScreen from "./pages/FavoritesScreen";
import HomeScreen from "./pages/HomeScreen";
import MoreScreen from "./pages/MoreScreen";
import TryOnScreen from "./pages/TryOnScreen";
import type { Outfit, Screen } from "./types";

const FAVORITES_KEY = "fittriai_favorites";
const TRYONS_KEY = "fittriai_tryons";

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

function loadTryOns(): number {
  try {
    return Number.parseInt(localStorage.getItem(TRYONS_KEY) || "0", 10);
  } catch {
    return 0;
  }
}

export default function App() {
  const [screen, setScreen] = useState<Screen>("home");
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [tryOnsCompleted, setTryOnsCompleted] = useState<number>(loadTryOns);
  const [pendingOutfit, setPendingOutfit] = useState<Outfit | null>(null);

  const toggleFavorite = (id: string) => {
    setFavorites((prev) => {
      const next = prev.includes(id)
        ? prev.filter((f) => f !== id)
        : [...prev, id];
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const handleTryOn = (outfit: Outfit) => {
    setPendingOutfit(outfit);
    setScreen("tryon");
    setTryOnsCompleted((n) => {
      const next = n + 1;
      localStorage.setItem(TRYONS_KEY, String(next));
      return next;
    });
  };

  const handleNavigateTryOn = () => {
    setPendingOutfit(null);
    setScreen("tryon");
  };

  const handleScreenChange = (s: Screen) => {
    if (s !== "tryon") setPendingOutfit(null);
    setScreen(s);
  };

  return (
    <div className="gradient-bg min-h-screen">
      <div className="max-w-md mx-auto relative">
        {screen === "home" && (
          <HomeScreen
            onTryOn={handleTryOn}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onNavigateTryOn={handleNavigateTryOn}
          />
        )}
        {screen === "tryon" && <TryOnScreen initialOutfit={pendingOutfit} />}
        {screen === "favorites" && (
          <FavoritesScreen
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onTryOn={handleTryOn}
          />
        )}
        {screen === "more" && (
          <MoreScreen
            tryOnsCompleted={tryOnsCompleted}
            outfitsSaved={favorites.length}
          />
        )}
        <BottomNav active={screen} onChange={handleScreenChange} />
      </div>
      <Toaster />
    </div>
  );
}
