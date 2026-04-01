import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Settings,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

interface Props {
  onBack: () => void;
}

const OUTFIT_OPTIONS = [
  { id: "shirt", label: "Shirt", emoji: "👔", value: "casual shirt" },
  { id: "jacket", label: "Jacket", emoji: "🧥", value: "denim jacket" },
  { id: "dress", label: "Dress", emoji: "👗", value: "summer dress" },
  { id: "saree", label: "Saree", emoji: "🥻", value: "silk saree" },
  { id: "kurta", label: "Kurta", emoji: "👘", value: "embroidered kurta" },
  { id: "hoodie", label: "Hoodie", emoji: "🧣", value: "oversized hoodie" },
  { id: "blazer", label: "Blazer", emoji: "🤵", value: "formal blazer" },
  { id: "suit", label: "Suit", emoji: "💼", value: "tailored suit" },
];

type Status = "idle" | "uploading" | "processing" | "done" | "error";

interface SettingsState {
  backendUrl: string;
  replicateKey: string;
  cloudName: string;
  uploadPreset: string;
}

export default function VideoGenScreen({ onBack }: Props) {
  const [photo, setPhoto] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    backendUrl: "http://localhost:3000",
    replicateKey: "",
    cloudName: "",
    uploadPreset: "",
  });
  const fileRef = useRef<HTMLInputElement>(null);

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!photo || !selected) return;
    setStatus("uploading");
    setVideoUrl(null);
    const outfit =
      OUTFIT_OPTIONS.find((o) => o.id === selected)?.value ?? selected;
    const hasSettings = settings.backendUrl && settings.replicateKey;
    if (hasSettings) {
      try {
        const blob = await (await fetch(photo)).blob();
        const form = new FormData();
        form.append("image", blob, "photo.jpg");
        form.append("outfit", outfit);
        const res = await fetch(`${settings.backendUrl}/generate-video`, {
          method: "POST",
          body: form,
        });
        const data = await res.json();
        const id = data.id;
        setStatus("processing");
        let done = false;
        while (!done) {
          await new Promise((r) => setTimeout(r, 3000));
          const check = await fetch(`${settings.backendUrl}/status/${id}`);
          const result = await check.json();
          if (result.status === "succeeded") {
            setVideoUrl(result.output);
            setStatus("done");
            done = true;
          } else if (result.status === "failed") {
            setStatus("error");
            done = true;
          }
        }
      } catch (_) {
        setStatus("error");
      }
    } else {
      setStatus("processing");
      await new Promise((r) => setTimeout(r, 3000));
      setStatus("done");
    }
  };

  const selectedOutfit = OUTFIT_OPTIONS.find((o) => o.id === selected);
  const isGenerating = status === "uploading" || status === "processing";

  return (
    <div className="pb-10 min-h-screen">
      <div className="pt-12 px-5 pb-5 flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-slate-800/60 flex items-center justify-center"
          data-ocid="videogen.button"
        >
          <ArrowLeft className="w-5 h-5 text-white" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-display text-white">
            🔥 VisionVideo AI
          </h1>
          <p className="text-slate-400 text-xs">AI outfit video generation</p>
        </div>
      </div>

      {/* Upload */}
      <div className="px-5 mb-5">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="w-full border-2 border-dashed border-violet-500/30 rounded-2xl bg-violet-900/10 p-5 flex flex-col items-center gap-3 cursor-pointer hover:border-violet-500/50 transition-all"
        >
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePhoto}
            data-ocid="videogen.upload_button"
          />
          {photo ? (
            <div className="flex items-center gap-4 w-full">
              <img
                src={photo}
                alt="Uploaded"
                className="w-16 h-16 rounded-xl object-cover border-2 border-violet-500/40"
              />
              <div>
                <p className="text-white font-semibold text-sm">
                  Photo uploaded ✓
                </p>
                <p className="text-slate-400 text-xs">Tap to change</p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-8 h-8 text-violet-400" />
              <p className="text-white text-sm font-semibold">
                Upload Your Photo
              </p>
            </>
          )}
        </button>
      </div>

      {/* Outfit Grid */}
      <div className="px-5 mb-5">
        <h3 className="text-white font-semibold mb-3">Select Outfit</h3>
        <div className="grid grid-cols-4 gap-3">
          {OUTFIT_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => setSelected(o.id)}
              className={`rounded-2xl p-3 flex flex-col items-center gap-1.5 border transition-all ${
                selected === o.id
                  ? "border-violet-500 bg-violet-600/20 ring-2 ring-violet-500/30"
                  : "border-slate-700/40 bg-slate-800/40"
              }`}
              data-ocid="videogen.toggle"
            >
              <span className="text-3xl">{o.emoji}</span>
              <span className="text-xs text-slate-300 font-medium">
                {o.label}
              </span>
            </button>
          ))}
        </div>
        {selectedOutfit && (
          <p className="text-slate-400 text-xs mt-2">
            Selected:{" "}
            <span className="text-violet-300 font-semibold">
              {selectedOutfit.label}
            </span>
          </p>
        )}
      </div>

      {/* Settings */}
      <div className="px-5 mb-5">
        <button
          type="button"
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center justify-between w-full bg-slate-800/40 border border-slate-700/40 rounded-2xl px-4 py-3"
          data-ocid="videogen.toggle"
        >
          <span className="flex items-center gap-2 text-slate-300 text-sm">
            <Settings className="w-4 h-4" /> ⚙ Settings
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
                      htmlFor={`vg-${key}`}
                      className="text-slate-400 text-xs block mb-1"
                    >
                      {label}
                    </label>
                    <input
                      id={`vg-${key}`}
                      className="w-full bg-slate-900/60 border border-slate-700/40 rounded-xl px-3 py-2 text-white text-sm placeholder:text-slate-600 outline-none"
                      value={settings[key]}
                      onChange={(e) =>
                        setSettings((s) => ({ ...s, [key]: e.target.value }))
                      }
                      placeholder={
                        key === "backendUrl" ? "http://localhost:3000" : ""
                      }
                      data-ocid="videogen.input"
                    />
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Generate Button */}
      <div className="px-5 mb-5">
        <button
          type="button"
          onClick={handleGenerate}
          disabled={!photo || !selected || isGenerating}
          className="w-full py-4 rounded-2xl bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-base transition-all"
          data-ocid="videogen.primary_button"
        >
          {status === "uploading"
            ? "📤 Uploading & Processing..."
            : status === "processing"
              ? "⏳ Generating Video..."
              : "🎬 Generate Video"}
        </button>
      </div>

      {/* Status */}
      <AnimatePresence>
        {status !== "idle" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="px-5"
          >
            {(status === "uploading" || status === "processing") && (
              <div
                className="bg-slate-800/60 border border-slate-700/40 rounded-2xl p-4 text-center"
                data-ocid="videogen.loading_state"
              >
                <div className="flex justify-center gap-2 mb-2">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="w-2.5 h-2.5 rounded-full bg-violet-500"
                      style={{
                        animation: `bounce 1s ease-in-out ${i * 0.15}s infinite`,
                      }}
                    />
                  ))}
                </div>
                <p className="text-slate-300 text-sm">
                  {status === "uploading"
                    ? "📤 Uploading & Processing..."
                    : "⏳ Processing your video..."}
                </p>
              </div>
            )}
            {status === "done" && !videoUrl && (
              <div
                className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 text-center"
                data-ocid="videogen.success_state"
              >
                <p className="text-green-400 font-semibold">✅ Video Ready!</p>
                <p className="text-slate-400 text-xs mt-1">
                  Connect your backend to get real video output
                </p>
              </div>
            )}
            {status === "done" && videoUrl && (
              <div
                className="bg-slate-800/60 border border-slate-700/40 rounded-2xl overflow-hidden"
                data-ocid="videogen.success_state"
              >
                <video controls className="w-full rounded-2xl" src={videoUrl}>
                  <track kind="captions" />
                </video>
              </div>
            )}
            {status === "error" && (
              <div
                className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-center"
                data-ocid="videogen.error_state"
              >
                <p className="text-red-400 font-semibold">
                  ❌ Generation failed
                </p>
                <p className="text-slate-400 text-xs mt-1">
                  Check your backend URL and API keys
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
