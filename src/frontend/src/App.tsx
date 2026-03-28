import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import Header from "./components/Header";
import PremiumModal from "./components/PremiumModal";
import { loadImports } from "./data/ecommerce";
import HomePage from "./pages/HomePage";
import OutfitSelectorPage from "./pages/OutfitSelectorPage";
import ProcessingPage from "./pages/ProcessingPage";
import ResultPage from "./pages/ResultPage";
import SalesPage from "./pages/SalesPage";
import UploadPage from "./pages/UploadPage";
import type { AppState, FreemiumState, ImportedProduct, Outfit } from "./types";

function getFreemiumState(): FreemiumState {
  const stored = localStorage.getItem("fittry_freemium");
  if (stored) {
    const data = JSON.parse(stored) as FreemiumState;
    const today = new Date().toDateString();
    if (data.date !== today) {
      return { triesUsed: 0, date: today, isPremium: data.isPremium };
    }
    return data;
  }
  return { triesUsed: 0, date: new Date().toDateString(), isPremium: false };
}

function saveFreemiumState(state: FreemiumState) {
  localStorage.setItem("fittry_freemium", JSON.stringify(state));
}

/** Convert an ImportedProduct into a synthetic Outfit for the try-on flow */
function importedToOutfit(p: ImportedProduct): Outfit {
  return {
    id: p.id,
    name: p.name,
    category: "Import",
    brand: p.badge,
    price: p.price,
    image: null,
    aiMatch: 93,
  };
}

export default function App() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [page, setPage] = useState<AppState>("home");
  const [uploadedPhoto, setUploadedPhoto] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [freemium, setFreemium] = useState<FreemiumState>(getFreemiumState);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [recentImports, setRecentImports] =
    useState<ImportedProduct[]>(loadImports);
  const [sourceProduct, setSourceProduct] = useState<ImportedProduct | null>(
    null,
  );

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(theme);
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  const navigate = (p: AppState) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePhotoUploaded = (photo: string) => {
    setUploadedPhoto(photo);
    setSourceProduct(null);
    navigate("outfit-selector");
  };

  const handleOutfitSelected = (outfit: Outfit) => {
    const fresh = getFreemiumState();
    if (!fresh.isPremium && fresh.triesUsed >= 3) {
      setShowPremiumModal(true);
      return;
    }
    setSelectedOutfit(outfit);
    navigate("processing");
  };

  const handleImportedProductTryOn = (product: ImportedProduct) => {
    const fresh = getFreemiumState();
    if (!fresh.isPremium && fresh.triesUsed >= 3) {
      setShowPremiumModal(true);
      return;
    }
    setSourceProduct(product);
    setSelectedOutfit(importedToOutfit(product));
    if (!uploadedPhoto) {
      navigate("upload");
    } else {
      navigate("processing");
    }
  };

  const handleProcessingDone = () => {
    const fresh = getFreemiumState();
    const updated = { ...fresh, triesUsed: fresh.triesUsed + 1 };
    saveFreemiumState(updated);
    setFreemium(updated);
    navigate("result");
  };

  const handleUpgradePremium = () => {
    const fresh = getFreemiumState();
    const updated = { ...fresh, isPremium: true };
    saveFreemiumState(updated);
    setFreemium(updated);
    setShowPremiumModal(false);
  };

  const toggleFavorite = (id: string) => {
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id],
    );
  };

  const triesLeft = freemium.isPremium
    ? Number.POSITIVE_INFINITY
    : Math.max(0, 3 - freemium.triesUsed);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header
        theme={theme}
        onToggleTheme={toggleTheme}
        onNavigate={navigate}
        triesLeft={triesLeft}
        isPremium={freemium.isPremium}
        onUpgrade={() => setShowPremiumModal(true)}
      />

      <main>
        {page === "home" && (
          <HomePage
            onNavigate={navigate}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
          />
        )}
        {page === "upload" && (
          <UploadPage
            onPhotoUploaded={handlePhotoUploaded}
            onBack={() => navigate("home")}
            onImportedProductTryOn={handleImportedProductTryOn}
            recentImports={recentImports}
            onImportsUpdated={setRecentImports}
          />
        )}
        {page === "outfit-selector" && (
          <OutfitSelectorPage
            onOutfitSelected={handleOutfitSelected}
            onBack={() => navigate("upload")}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            triesLeft={triesLeft}
            onUpgrade={() => setShowPremiumModal(true)}
          />
        )}
        {page === "processing" && selectedOutfit && uploadedPhoto && (
          <ProcessingPage
            outfit={selectedOutfit}
            photo={uploadedPhoto}
            onDone={handleProcessingDone}
          />
        )}
        {page === "result" && selectedOutfit && uploadedPhoto && (
          <ResultPage
            outfit={selectedOutfit}
            photo={uploadedPhoto}
            onTryAnother={() => navigate("outfit-selector")}
            onHome={() => navigate("home")}
            isPremium={freemium.isPremium}
            onUpgrade={() => setShowPremiumModal(true)}
            sourceProduct={sourceProduct}
          />
        )}
        {page === "sales" && (
          <SalesPage onBack={() => navigate("home")} onNavigate={navigate} />
        )}
      </main>

      <PremiumModal
        open={showPremiumModal}
        onClose={() => setShowPremiumModal(false)}
        onUpgrade={handleUpgradePremium}
      />

      <Toaster />
    </div>
  );
}
