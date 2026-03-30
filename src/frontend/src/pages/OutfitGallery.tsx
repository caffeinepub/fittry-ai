import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  Filter,
  Heart,
  Images,
  Search,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import CameraCapture from "../components/CameraCapture";
import { outfits } from "../data/outfits";
import type { Gender, Outfit } from "../types";

interface OutfitGalleryProps {
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  onTryOn: (outfit: Outfit) => void;
}

const allCategories = Array.from(
  new Set(outfits.map((o) => o.category)),
).sort();

export default function OutfitGallery({
  favorites,
  onToggleFavorite,
  onTryOn,
}: OutfitGalleryProps) {
  const [gender, setGender] = useState<Gender | "All">("All");
  const [category, setCategory] = useState<string>("All");
  const [search, setSearch] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return outfits.filter((o) => {
      if (gender !== "All" && o.gender !== gender) return false;
      if (category !== "All" && o.category !== category) return false;
      if (
        search &&
        !o.name.toLowerCase().includes(search.toLowerCase()) &&
        !o.brand.toLowerCase().includes(search.toLowerCase()) &&
        !o.tags.some((t) => t.includes(search.toLowerCase()))
      )
        return false;
      return true;
    });
  }, [gender, category, search]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUserPhoto(ev.target?.result as string);
      toast.success("Photo uploaded! Pick any outfit below to try it on.");
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (dataUrl: string) => {
    setUserPhoto(dataUrl);
    setShowCamera(false);
    toast.success("Photo captured! Pick any outfit below to try it on.");
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3"
        style={{
          background: "oklch(0.10 0.015 240 / 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.22 0.022 240 / 0.4)",
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center">
              <Images size={16} className="text-white" />
            </div>
            <span className="font-display font-bold text-lg">
              Outfit Gallery
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              showFilters || category !== "All"
                ? "gradient-blue text-white"
                : "bg-muted text-muted-foreground"
            }`}
          >
            <Filter size={12} />
            Filter
            {category !== "All" && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </button>
        </div>

        {/* Search */}
        <div
          className="flex items-center gap-2 rounded-xl px-3 py-2"
          style={{ background: "oklch(0.16 0.020 240)" }}
        >
          <Search size={14} className="text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="Search outfits, brands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="bg-transparent text-sm flex-1 outline-none text-foreground placeholder:text-muted-foreground"
          />
          {search && (
            <button type="button" onClick={() => setSearch("")}>
              <X size={14} className="text-muted-foreground" />
            </button>
          )}
        </div>
      </header>

      <div className="px-4 space-y-4 pt-4">
        {/* Photo Upload Strip */}
        <div
          className="rounded-2xl p-3 flex items-center gap-3"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          {userPhoto ? (
            <>
              <img
                src={userPhoto}
                alt="You"
                className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
              />
              <div className="flex-1">
                <p className="text-sm font-semibold">Your photo is ready!</p>
                <p className="text-xs text-muted-foreground">
                  Tap any outfit to try it on
                </p>
              </div>
              <button
                type="button"
                onClick={() => setUserPhoto(null)}
                className="w-7 h-7 rounded-full bg-muted flex items-center justify-center"
              >
                <X size={13} className="text-muted-foreground" />
              </button>
            </>
          ) : (
            <>
              <div className="flex-1">
                <p className="text-sm font-semibold">Upload your photo</p>
                <p className="text-xs text-muted-foreground">
                  Try on any outfit from the gallery
                </p>
              </div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1.5 gradient-blue text-white text-xs font-semibold px-3 py-2 rounded-xl"
              >
                <Upload size={13} /> Upload
              </button>
              <button
                type="button"
                onClick={() => setShowCamera(true)}
                className="flex items-center gap-1.5 bg-muted text-foreground text-xs font-semibold px-3 py-2 rounded-xl"
              >
                <Camera size={13} /> Camera
              </button>
            </>
          )}
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        {/* Gender Tabs */}
        <div className="flex gap-2">
          {(["All", "Women", "Men"] as const).map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => setGender(g)}
              className={`flex-1 py-2 rounded-xl text-sm font-semibold transition-all ${
                gender === g
                  ? "gradient-blue text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {g === "All" ? "All" : g === "Women" ? "👗 Women" : "👔 Men"}
            </button>
          ))}
        </div>

        {/* Category Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex gap-2 flex-wrap">
                {["All", ...allCategories].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                      category === cat
                        ? "gradient-blue text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Count */}
        <p className="text-xs text-muted-foreground">
          {filtered.length} outfit{filtered.length !== 1 ? "s" : ""}
          {gender !== "All" ? ` for ${gender}` : ""}
          {category !== "All" ? ` in ${category}` : ""}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <p className="text-4xl mb-3">👗</p>
            <p className="font-semibold">No outfits found</p>
            <p className="text-sm mt-1">Try changing your filters</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {filtered.map((outfit, i) => (
              <motion.div
                key={outfit.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: Math.min(i * 0.04, 0.5) }}
                className="rounded-2xl overflow-hidden border"
                style={{
                  background: "oklch(0.14 0.018 240)",
                  borderColor: "oklch(0.22 0.022 240 / 0.5)",
                }}
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={outfit.image}
                    alt={outfit.name}
                    className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <button
                    type="button"
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
                    className="absolute top-2.5 left-2.5 text-[10px] px-1.5 py-0.5"
                    style={{
                      background: "oklch(0.12 0.016 240 / 0.85)",
                      color: "oklch(0.78 0.12 265)",
                      border: "1px solid oklch(0.28 0.03 265 / 0.5)",
                    }}
                  >
                    {outfit.gender}
                  </Badge>
                </div>
                <div className="p-2.5">
                  <p className="text-xs font-semibold truncate">
                    {outfit.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {outfit.brand}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className="text-xs font-bold"
                      style={{ color: "oklch(0.82 0.13 210)" }}
                    >
                      {outfit.price}
                    </span>
                    <Button
                      size="sm"
                      onClick={() => onTryOn(outfit)}
                      className="h-7 px-2.5 text-[11px] rounded-lg gradient-blue text-white font-semibold gap-1"
                    >
                      <Sparkles size={11} />
                      Try On
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {showCamera && (
        <CameraCapture
          onCapture={handleCameraCapture}
          onClose={() => setShowCamera(false)}
        />
      )}
    </div>
  );
}
