import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import BottomNav from "./components/BottomNav";
import { useLocalAuth } from "./hooks/useLocalAuth";
import FavoritesScreen from "./pages/FavoritesScreen";
import HomeScreen from "./pages/HomeScreen";
import LoginScreen from "./pages/LoginScreen";
import MoreScreen from "./pages/MoreScreen";
import OutfitGallery from "./pages/OutfitGallery";
import ServerScreen from "./pages/ServerScreen";
import TryOnScreen from "./pages/TryOnScreen";
import VideoGenScreen from "./pages/VideoGenScreen";
import type { Outfit, Screen } from "./types";

const FAVORITES_KEY = "fittriai_favorites";

function loadFavorites(): string[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  } catch {
    return [];
  }
}

export default function App() {
  const { user, logout } = useLocalAuth();
  const [screen, setScreen] = useState<Screen>("home");
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [pendingOutfit, setPendingOutfit] = useState<Outfit | null>(null);

  if (!user) {
    return <LoginScreen />;
  }

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
  };

  const handleScreenChange = (s: Screen) => {
    if (s !== "tryon") setPendingOutfit(null);
    setScreen(s);
  };

  const isSubScreen = screen === "server" || screen === "videogen";

  return (
    <div className="gradient-bg min-h-screen">
      <div className="max-w-[430px] mx-auto relative min-h-screen">
        {screen === "home" && (
          <HomeScreen
            onTryOn={() => handleScreenChange("tryon")}
            onGallery={() => handleScreenChange("gallery")}
          />
        )}
        {screen === "tryon" && (
          <TryOnScreen
            initialOutfit={pendingOutfit}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {screen === "gallery" && (
          <OutfitGallery
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onTryOn={handleTryOn}
          />
        )}
        {screen === "favorites" && (
          <FavoritesScreen
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            onTryOn={handleTryOn}
          />
        )}
        {screen === "more" && (
          <MoreScreen
            onLogout={logout}
            onOpenServer={() => setScreen("server")}
            onGenerateVideo={() => setScreen("videogen")}
          />
        )}
        {screen === "server" && (
          <ServerScreen onBack={() => setScreen("more")} />
        )}
        {screen === "videogen" && (
          <VideoGenScreen onBack={() => setScreen("more")} />
        )}
        {!isSubScreen && (
          <BottomNav active={screen} onChange={handleScreenChange} />
        )}
      </div>
      <Toaster />
    </div>
  );
}
