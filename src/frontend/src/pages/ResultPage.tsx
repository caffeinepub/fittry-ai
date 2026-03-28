import { Button } from "@/components/ui/button";
import {
  Check,
  Download,
  Heart,
  Home,
  RotateCcw,
  Share2,
  Star,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import AffiliateBanner from "../components/AffiliateBanner";
import type { ImportedProduct, Outfit } from "../types";

interface ResultPageProps {
  outfit: Outfit;
  photo: string;
  onTryAnother: () => void;
  onHome: () => void;
  isPremium: boolean;
  onUpgrade: () => void;
  sourceProduct?: ImportedProduct | null;
}

export default function ResultPage({
  outfit,
  photo,
  onTryAnother,
  onHome,
  isPremium,
  onUpgrade,
  sourceProduct,
}: ResultPageProps) {
  const [saved, setSaved] = useState(false);
  const [activeView, setActiveView] = useState<"result" | "original">("result");

  const handleSave = () => {
    setSaved(true);
    toast.success("Saved to your collection!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator
        .share({
          title: "My AI Try-On - FitTry AI",
          text: `Check out how I look in ${outfit.name}!`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const handleHDDownload = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    toast.success("HD download started!");
  };

  return (
    <div className="max-w-[430px] mx-auto px-4 pt-6 pb-8 animate-slide-up">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-2xl font-black">Your Result ✨</h2>
        <button
          type="button"
          onClick={onHome}
          className="text-muted-foreground hover:text-foreground transition-colors"
          data-ocid="result.link"
        >
          <Home className="w-5 h-5" />
        </button>
      </div>

      {/* View toggle */}
      <div className="flex bg-muted rounded-full p-1 mb-4">
        {(["result", "original"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => setActiveView(v)}
            className={`flex-1 text-sm py-2 rounded-full font-semibold capitalize transition-all ${
              activeView === v
                ? "gradient-lavender-pink text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="result.tab"
          >
            {v === "result" ? "AI Try-On" : "Original"}
          </button>
        ))}
      </div>

      {/* Main image */}
      <div className="relative rounded-3xl overflow-hidden shadow-float mb-5">
        <img
          src={photo}
          alt={activeView === "result" ? "AI Try-On Result" : "Original"}
          className="w-full object-cover"
          style={
            activeView === "result"
              ? { filter: "contrast(1.05) saturate(1.15) brightness(1.02)" }
              : {}
          }
        />
        {activeView === "result" && (
          <>
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background:
                  "linear-gradient(180deg, transparent 0%, transparent 30%, oklch(0.76 0.1 295 / 0.15) 50%, oklch(0.82 0.08 5 / 0.2) 80%, transparent 100%)",
                mixBlendMode: "soft-light",
              }}
            />
            <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-green-accent/20 border border-green-accent/50 text-green-accent text-sm font-bold px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Star className="w-3.5 h-3.5 fill-current" />
              AI Match: {outfit.aiMatch || 96}%
            </div>
            <div className="absolute bottom-4 left-4 right-4 bg-black/50 backdrop-blur-sm rounded-2xl px-4 py-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white font-bold">{outfit.name}</p>
                  <p className="text-white/60 text-xs">
                    {outfit.brand} · {outfit.price}
                  </p>
                </div>
                {outfit.image && (
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-10 h-12 rounded-lg object-cover"
                  />
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Affiliate banner — only when try-on was from an imported product */}
      {sourceProduct && <AffiliateBanner product={sourceProduct} />}

      {/* Action buttons */}
      <div className="grid grid-cols-3 gap-3 mb-5">
        <button
          type="button"
          onClick={handleSave}
          className={`flex flex-col items-center gap-1.5 py-3 rounded-2xl border transition-all ${
            saved
              ? "border-green-accent/40 bg-green-accent/10 text-green-accent"
              : "border-border bg-card hover:border-primary/30 hover:bg-primary/5"
          }`}
          data-ocid="result.save_button"
        >
          {saved ? (
            <Check className="w-5 h-5" />
          ) : (
            <Heart className="w-5 h-5" />
          )}
          <span className="text-xs font-semibold">
            {saved ? "Saved" : "Save"}
          </span>
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all"
          data-ocid="result.secondary_button"
        >
          <Share2 className="w-5 h-5" />
          <span className="text-xs font-semibold">Share</span>
        </button>
        <button
          type="button"
          onClick={handleHDDownload}
          className="flex flex-col items-center gap-1.5 py-3 rounded-2xl border border-border bg-card hover:border-primary/30 hover:bg-primary/5 transition-all"
          data-ocid="result.download_button"
        >
          <Download className="w-5 h-5" />
          <span className="text-xs font-semibold">HD {!isPremium && "🔒"}</span>
        </button>
      </div>

      <Button
        onClick={onTryAnother}
        className="w-full pill gradient-lavender-pink border-0 text-white font-bold h-12 text-base hover:opacity-90 transition-opacity mb-3"
        data-ocid="result.primary_button"
      >
        <RotateCcw className="w-4 h-4 mr-2" />
        Try Another Outfit
      </Button>

      {/* Rating */}
      <div className="bg-muted/50 rounded-2xl p-4 text-center">
        <p className="text-sm font-semibold mb-2">
          How's the fit? Rate this try-on
        </p>
        <div className="flex justify-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => toast.success(`Thanks for rating ${star} stars!`)}
              className="w-8 h-8 rounded-full hover:bg-yellow-400/20 transition-colors flex items-center justify-center"
              data-ocid="result.toggle"
            >
              <Star className="w-5 h-5 text-yellow-400" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
