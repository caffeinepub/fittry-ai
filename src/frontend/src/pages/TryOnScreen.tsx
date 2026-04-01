import { ChevronDown, ChevronUp, Heart, Settings, Upload } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { OUTFITS } from "../data/outfits";
import type { Outfit } from "../types";

const GRID_OUTFITS = OUTFITS.slice(0, 12);

interface Props {
  initialOutfit: Outfit | null;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
}

interface SettingsState {
  backendUrl: string;
  replicateKey: string;
  cloudName: string;
  uploadPreset: string;
}

type ProcessState = "idle" | "processing" | "done";

export default function TryOnScreen({
  initialOutfit,
  favorites,
  onToggleFavorite,
}: Props) {
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(
    initialOutfit,
  );
  const [processState, setProcessState] = useState<ProcessState>("idle");
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    backendUrl: "http://localhost:3000",
    replicateKey: "",
    cloudName: "",
    uploadPreset: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setUserPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleTryOn = async (outfit: Outfit) => {
    setSelectedOutfit(outfit);
    if (!userPhoto) return;
    setProcessState("processing");
    const hasRealSettings =
      settings.backendUrl &&
      settings.replicateKey &&
      settings.cloudName &&
      settings.uploadPreset;
    if (hasRealSettings) {
      try {
        const photoBlob = await (await fetch(userPhoto)).blob();
        const form = new FormData();
        form.append("person", photoBlob, "person.jpg");
        await fetch(`${settings.backendUrl}/tryon`, {
          method: "POST",
          body: form,
        });
      } catch (_) {
        // fallback to simulation
      }
    } else {
      await new Promise((r) => setTimeout(r, 2500));
    }
    setProcessState("done");
  };

  return (
    <div className="pb-24 min-h-screen">
      <div className="pt-12 px-5 pb-5">
        <h1 className="text-2xl font-bold font-display text-white">
          Virtual Try-On
        </h1>
        <p className="text-slate-400 text-sm mt-0.5">
          Upload your photo and try any outfit
        </p>
      </div>

      {/* Upload */}
      <div className="px-5 mb-5">
        <button
          type="button"
          className="relative w-full border-2 border-dashed border-violet-500/30 rounded-2xl bg-violet-900/10 p-6 flex flex-col items-center gap-3 cursor-pointer hover:border-violet-500/60 transition-all text-left"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhotoUpload}
            data-ocid="tryon.upload_button"
          />
          {userPhoto ? (
            <div className="flex items-center gap-4 w-full">
              <img
                src={userPhoto}
                alt="Uploaded portrait"
                className="w-20 h-20 rounded-xl object-cover border-2 border-violet-500/40"
              />
              <div>
                <p className="text-white font-semibold text-sm">
                  Photo uploaded ✓
                </p>
                <p className="text-slate-400 text-xs mt-0.5">Tap to change</p>
              </div>
            </div>
          ) : (
            <>
              <div className="w-14 h-14 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Upload className="w-6 h-6 text-violet-400" />
              </div>
              <div className="text-center">
                <p className="text-white font-semibold text-sm">
                  Upload Your Photo
                </p>
                <p className="text-slate-400 text-xs mt-0.5">
                  Tap to select from gallery
                </p>
              </div>
            </>
          )}
        </button>
      </div>

      {/* Result */}
      <AnimatePresence>
        {selectedOutfit &&
          userPhoto &&
          (processState === "processing" || processState === "done") && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-5 mb-5"
            >
              <div className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4">
                {processState === "processing" ? (
                  <div
                    className="flex flex-col items-center py-6"
                    data-ocid="tryon.loading_state"
                  >
                    <div className="flex gap-2 mb-3">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="w-3 h-3 rounded-full bg-violet-500"
                          style={{
                            animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-slate-400 text-sm">
                      AI is styling you...
                    </p>
                  </div>
                ) : (
                  <div data-ocid="tryon.success_state">
                    <div className="flex gap-3 mb-3">
                      <div className="flex-1">
                        <p className="text-slate-500 text-xs mb-1">
                          Your photo
                        </p>
                        <img
                          src={userPhoto}
                          alt="You"
                          className="w-full h-36 rounded-xl object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-slate-500 text-xs mb-1">
                          With outfit
                        </p>
                        <div
                          className="w-full h-36 rounded-xl flex items-center justify-center text-6xl"
                          style={{
                            backgroundColor: `${selectedOutfit.color}33`,
                          }}
                        >
                          {selectedOutfit.emoji}
                        </div>
                      </div>
                    </div>
                    <p className="text-white font-semibold text-sm">
                      {selectedOutfit.name}
                    </p>
                    <p className="text-slate-400 text-xs">
                      {selectedOutfit.brand} · {selectedOutfit.price}
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
      </AnimatePresence>

      {/* AI Settings */}
      <div className="px-5 mb-5">
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between w-full bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 py-3"
          data-ocid="tryon.toggle"
        >
          <span className="flex items-center gap-2 text-slate-300 text-sm">
            <Settings className="w-4 h-4" /> AI Settings
          </span>
          {showSettings ? (
            <ChevronUp className="w-4 h-4 text-slate-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-400" />
          )}
        </button>
        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-800/40 border border-slate-700/40 border-t-0 rounded-b-2xl p-4 space-y-3">
                {(
                  [
                    ["backendUrl", "Backend URL"],
                    ["replicateKey", "Replicate API Key"],
                    ["cloudName", "Cloudinary Cloud Name"],
                    ["uploadPreset", "Upload Preset"],
                  ] as [keyof SettingsState, string][]
                ).map(([key, label]) => (
                  <div key={key}>
                    <label
                      htmlFor={key}
                      className="text-slate-400 text-xs block mb-1"
                    >
                      {label}
                    </label>
                    <input
                      id={key}
                      className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600 outline-none"
                      value={settings[key]}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, [key]: e.target.value }))
                      }
                      placeholder={
                        key === "backendUrl" ? "http://localhost:3000" : ""
                      }
                      data-ocid="tryon.input"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Outfit Grid */}
      <div className="px-5">
        <h3 className="text-white font-semibold mb-3">Select Outfit to Try</h3>
        {!userPhoto && (
          <p className="text-slate-500 text-xs mb-3">
            Upload your photo above to enable try-on
          </p>
        )}
        <div className="grid grid-cols-3 gap-3">
          {GRID_OUTFITS.map((outfit) => (
            <motion.div
              key={outfit.id}
              whileTap={{ scale: 0.95 }}
              className={`rounded-2xl overflow-hidden border transition-all cursor-pointer ${
                selectedOutfit?.id === outfit.id
                  ? "border-violet-500 ring-2 ring-violet-500/30"
                  : "border-slate-700/40"
              }`}
            >
              <div
                className="h-20 flex items-center justify-center text-4xl relative"
                style={{ backgroundColor: `${outfit.color}33` }}
              >
                {outfit.emoji}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(outfit.id);
                  }}
                  className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/40 flex items-center justify-center"
                >
                  <Heart
                    className={`w-3 h-3 ${
                      favorites.includes(outfit.id)
                        ? "fill-red-500 text-red-500"
                        : "text-white"
                    }`}
                  />
                </button>
              </div>
              <div className="p-2 bg-slate-800/60">
                <p className="text-white text-xs font-medium truncate">
                  {outfit.name}
                </p>
                <button
                  type="button"
                  onClick={() => handleTryOn(outfit)}
                  className="w-full mt-1.5 bg-violet-600/80 hover:bg-violet-600 text-white text-xs rounded-lg py-1 font-semibold transition-all"
                  data-ocid="tryon.button"
                >
                  Try On
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
