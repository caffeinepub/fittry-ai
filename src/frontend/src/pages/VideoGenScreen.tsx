import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  Clapperboard,
  Cloud,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Server,
  Sparkles,
  Upload,
  Video,
  Wand2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const REPLICATE_KEY_STORAGE = "replicate_api_key";
const CLOUDINARY_NAME_STORAGE = "cloudinary_cloud_name";
const CLOUDINARY_PRESET_STORAGE = "cloudinary_upload_preset";
const BACKEND_URL_STORAGE = "visionvideo_backend_url";

const OUTFITS = [
  {
    id: "casual-shirt",
    label: "Casual Shirt",
    prompt: "casual shirt",
    emoji: "👕",
    hue: 220,
  },
  {
    id: "denim-jacket",
    label: "Denim Jacket",
    prompt: "denim jacket",
    emoji: "🧥",
    hue: 210,
  },
  {
    id: "summer-dress",
    label: "Summer Dress",
    prompt: "summer dress",
    emoji: "👗",
    hue: 340,
  },
  {
    id: "formal-suit",
    label: "Formal Suit",
    prompt: "formal suit",
    emoji: "👔",
    hue: 255,
  },
  {
    id: "hoodie",
    label: "Hoodie",
    prompt: "hoodie",
    emoji: "👚",
    hue: 200,
  },
  {
    id: "saree",
    label: "Saree",
    prompt: "saree",
    emoji: "🥻",
    hue: 30,
  },
  {
    id: "kurta",
    label: "Kurta",
    prompt: "kurta",
    emoji: "👘",
    hue: 150,
  },
  {
    id: "sportswear",
    label: "Sportswear",
    prompt: "sportswear",
    emoji: "🩱",
    hue: 285,
  },
] as const;

type OutfitId = (typeof OUTFITS)[number]["id"];

async function uploadToCloudinary(
  file: File,
  cloudName: string,
  uploadPreset: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", uploadPreset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form },
  );

  if (!res.ok) throw new Error(`Cloudinary upload failed: ${res.status}`);
  const data = (await res.json()) as {
    secure_url?: string;
    error?: { message: string };
  };
  if (data.error) throw new Error(data.error.message);
  if (!data.secure_url) throw new Error("Cloudinary did not return a URL");
  return data.secure_url;
}

async function generateVideoWithReplicate(
  apiKey: string,
  imageUrl: string,
  outfit: string,
  onPoll?: () => void,
): Promise<string> {
  const createRes = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      version: "stable-video-diffusion",
      input: {
        image: imageUrl,
        prompt: `Person wearing ${outfit}, realistic, cinematic`,
        motion_bucket_id: 127,
        fps: 6,
      },
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(
      (err as { detail?: string }).detail ||
        `Replicate API error: ${createRes.status}`,
    );
  }

  const prediction = (await createRes.json()) as { id: string };
  const predictionId = prediction.id;

  while (true) {
    await new Promise((r) => setTimeout(r, 3000));
    onPoll?.();
    const pollRes = await fetch(
      `https://api.replicate.com/v1/predictions/${predictionId}`,
      { headers: { Authorization: `Token ${apiKey}` } },
    );
    const task = (await pollRes.json()) as {
      status: string;
      output?: string[];
      error?: string;
    };
    if (task.status === "succeeded") {
      const output = task.output;
      if (!output || output.length === 0) throw new Error("No output returned");
      return output[0];
    }
    if (task.status === "failed")
      throw new Error(task.error || "Generation failed");
  }
}

interface VideoGenScreenProps {
  onBack: () => void;
}

export default function VideoGenScreen({ onBack }: VideoGenScreenProps) {
  const [replicateKey, setReplicateKey] = useState(
    () => localStorage.getItem(REPLICATE_KEY_STORAGE) || "",
  );
  const [cloudName, setCloudName] = useState(
    () => localStorage.getItem(CLOUDINARY_NAME_STORAGE) || "",
  );
  const [uploadPreset, setUploadPreset] = useState(
    () => localStorage.getItem(CLOUDINARY_PRESET_STORAGE) || "",
  );
  const [backendUrl, setBackendUrl] = useState(
    () => localStorage.getItem(BACKEND_URL_STORAGE) || "",
  );
  const [apiSettingsOpen, setApiSettingsOpen] = useState(false);
  const [selectedOutfitId, setSelectedOutfitId] =
    useState<OutfitId>("casual-shirt");
  const [showKey, setShowKey] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "uploading" | "generating" | "success" | "error"
  >("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pollSeconds, setPollSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const save = (key: string, val: string) => localStorage.setItem(key, val);

  const selectedOutfit = OUTFITS.find((o) => o.id === selectedOutfitId)!;

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
    setVideoUrl(null);
    setStatus("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleImageSelect(file);
  };

  const handleGenerate = async () => {
    if (!imageFile) return;
    setVideoUrl(null);
    setErrorMsg("");
    setPollSeconds(0);

    pollTimerRef.current = setInterval(
      () => setPollSeconds((s) => s + 1),
      1000,
    );

    try {
      const url = backendUrl.trim();

      if (url) {
        // Use custom backend
        setStatus("uploading");
        const formData = new FormData();
        formData.append("image", imageFile);
        formData.append("outfit", selectedOutfit.prompt);

        const res = await fetch(`${url}/generate-video`, {
          method: "POST",
          body: formData,
        });
        const data = (await res.json()) as { id: string };
        const id = data.id;

        setStatus("generating");
        while (true) {
          await new Promise((r) => setTimeout(r, 3000));
          const poll = await fetch(`${url}/status/${id}`);
          const task = (await poll.json()) as {
            status: string;
            output?: string;
          };
          if (task.status === "succeeded") {
            setVideoUrl(task.output || "");
            setStatus("success");
            break;
          }
          if (task.status === "failed") throw new Error("Generation failed");
        }
      } else {
        // Use direct Cloudinary + Replicate flow
        setStatus("uploading");
        const imageUrl = await uploadToCloudinary(
          imageFile,
          cloudName,
          uploadPreset,
        );

        setStatus("generating");
        const videoOutputUrl = await generateVideoWithReplicate(
          replicateKey,
          imageUrl,
          selectedOutfit.prompt,
        );
        setVideoUrl(videoOutputUrl);
        setStatus("success");
      }
    } catch (err) {
      setErrorMsg(
        err instanceof Error ? err.message : "Unexpected error occurred",
      );
      setStatus("error");
    } finally {
      if (pollTimerRef.current) clearInterval(pollTimerRef.current);
    }
  };

  const isRunning = status === "uploading" || status === "generating";

  const useCustomBackend = !!backendUrl.trim();
  const canGenerate = useCustomBackend
    ? !!imageFile && !isRunning
    : !!replicateKey.trim() &&
      !!cloudName.trim() &&
      !!uploadPreset.trim() &&
      !!imageFile &&
      !isRunning;

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center gap-3"
        style={{
          background: "oklch(0.10 0.015 240 / 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.22 0.022 240 / 0.4)",
        }}
      >
        <button
          type="button"
          data-ocid="videogen.close_button"
          onClick={onBack}
          className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-white/10 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ background: "oklch(0.30 0.12 285)" }}
          >
            <Video size={15} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-sm leading-tight">
              Generate Video
            </p>
            <p
              className="text-[10px] font-medium"
              style={{ color: "oklch(0.70 0.12 285)" }}
            >
              🔥 VisionVideo AI · Powered by Replicate
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-4">
        {/* ⚙️ API Settings — collapsible */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl overflow-hidden"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          {/* Accordion trigger */}
          <button
            type="button"
            data-ocid="videogen.toggle"
            onClick={() => setApiSettingsOpen((v) => !v)}
            className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-white/5 transition-colors"
          >
            <div className="flex items-center gap-2">
              <span className="text-base">⚙️</span>
              <span className="text-sm font-semibold">API Settings</span>
              {useCustomBackend && (
                <span
                  className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                  style={{
                    background: "oklch(0.22 0.10 145 / 0.4)",
                    color: "oklch(0.72 0.16 145)",
                  }}
                >
                  Custom Backend
                </span>
              )}
              {!useCustomBackend && !apiSettingsOpen && (
                <span className="text-[10px] text-muted-foreground hidden sm:inline">
                  Configure your API keys to enable generation
                </span>
              )}
            </div>
            <motion.div
              animate={{ rotate: apiSettingsOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronDown
                size={16}
                style={{ color: "oklch(0.60 0.06 240)" }}
              />
            </motion.div>
          </button>

          {/* Collapsed hint */}
          {!apiSettingsOpen && (
            <p
              className="px-4 pb-3 text-[11px]"
              style={{ color: "oklch(0.56 0.04 240)" }}
            >
              Configure your API keys to enable generation
            </p>
          )}

          {/* Expanded content */}
          <AnimatePresence initial={false}>
            {apiSettingsOpen && (
              <motion.div
                key="api-settings"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
              >
                <div
                  className="px-4 pb-4 space-y-4"
                  style={{
                    borderTop: "1px solid oklch(0.22 0.022 240 / 0.4)",
                  }}
                >
                  {/* Custom Backend URL */}
                  <div className="space-y-1.5 pt-4">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Server
                        size={12}
                        style={{ color: "oklch(0.70 0.14 145)" }}
                      />
                      Custom Backend URL{" "}
                      <span
                        className="font-normal"
                        style={{ color: "oklch(0.56 0.04 240)" }}
                      >
                        (optional)
                      </span>
                    </Label>
                    <Input
                      data-ocid="videogen.input"
                      placeholder="http://localhost:3000"
                      value={backendUrl}
                      onChange={(e) => {
                        setBackendUrl(e.target.value);
                        save(BACKEND_URL_STORAGE, e.target.value);
                      }}
                      className="rounded-xl text-sm"
                      style={{
                        background: "oklch(0.10 0.012 240)",
                        border: "1px solid oklch(0.25 0.025 240 / 0.6)",
                      }}
                    />
                    <p
                      className="text-[10px]"
                      style={{ color: "oklch(0.52 0.04 240)" }}
                    >
                      If set, API keys below are not required
                    </p>
                  </div>

                  {/* Replicate API Key */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Clapperboard
                        size={12}
                        style={{ color: "oklch(0.70 0.12 285)" }}
                      />
                      Replicate API Key
                    </Label>
                    <div className="relative">
                      <Input
                        type={showKey ? "text" : "password"}
                        placeholder="r8_xxxxxxxxxxxxxx"
                        value={replicateKey}
                        onChange={(e) => {
                          setReplicateKey(e.target.value);
                          save(REPLICATE_KEY_STORAGE, e.target.value);
                        }}
                        className="pr-10 rounded-xl text-sm"
                        style={{
                          background: "oklch(0.10 0.012 240)",
                          border: "1px solid oklch(0.25 0.025 240 / 0.6)",
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowKey((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showKey ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                    <a
                      href="https://replicate.com/account/api-tokens"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px]"
                      style={{ color: "oklch(0.62 0.12 285)" }}
                    >
                      <ExternalLink size={10} /> Get key at replicate.com
                    </a>
                  </div>

                  {/* Cloudinary Settings */}
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold flex items-center gap-1.5">
                      <Cloud
                        size={12}
                        style={{ color: "oklch(0.70 0.15 200)" }}
                      />
                      Cloudinary Settings
                    </Label>
                    <Input
                      placeholder="Cloud Name (e.g. my-cloud)"
                      value={cloudName}
                      onChange={(e) => {
                        setCloudName(e.target.value);
                        save(CLOUDINARY_NAME_STORAGE, e.target.value);
                      }}
                      className="rounded-xl text-sm"
                      style={{
                        background: "oklch(0.10 0.012 240)",
                        border: "1px solid oklch(0.25 0.025 240 / 0.6)",
                      }}
                    />
                    <Input
                      placeholder="Upload Preset (unsigned)"
                      value={uploadPreset}
                      onChange={(e) => {
                        setUploadPreset(e.target.value);
                        save(CLOUDINARY_PRESET_STORAGE, e.target.value);
                      }}
                      className="rounded-xl text-sm mt-2"
                      style={{
                        background: "oklch(0.10 0.012 240)",
                        border: "1px solid oklch(0.25 0.025 240 / 0.6)",
                      }}
                    />
                    <a
                      href="https://cloudinary.com/console"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-[10px]"
                      style={{ color: "oklch(0.62 0.12 200)" }}
                    >
                      <ExternalLink size={10} /> Get settings at cloudinary.com
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Outfit Selector — 3-col product thumbnails */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Wand2 size={14} style={{ color: "oklch(0.70 0.15 150)" }} />
            Select Outfit
            <span
              className="text-[10px] font-normal ml-1 px-1.5 py-0.5 rounded-full"
              style={{
                background: "oklch(0.22 0.08 285 / 0.5)",
                color: "oklch(0.72 0.14 285)",
              }}
            >
              Amazon / Myntra Style
            </span>
          </Label>

          {/* 3-col product thumbnail grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {OUTFITS.map((outfit) => {
              const isSelected = selectedOutfitId === outfit.id;
              return (
                <motion.button
                  key={outfit.id}
                  type="button"
                  data-ocid={`videogen.outfit.${outfit.id}.button`}
                  onClick={() => setSelectedOutfitId(outfit.id)}
                  whileTap={{ scale: 0.95 }}
                  className="relative flex flex-col rounded-xl overflow-hidden cursor-pointer transition-all duration-200"
                  style={{
                    background: "oklch(0.11 0.012 240)",
                    border: isSelected
                      ? "2px solid oklch(0.55 0.22 285)"
                      : "2px solid oklch(0.20 0.020 240 / 0.6)",
                    boxShadow: isSelected
                      ? "0 0 16px oklch(0.50 0.22 285 / 0.45)"
                      : "none",
                  }}
                >
                  {/* Product photo area — 80px tall with gradient */}
                  <div
                    className="w-full flex items-center justify-center"
                    style={{
                      height: "80px",
                      background: isSelected
                        ? `linear-gradient(160deg, oklch(0.22 0.12 ${outfit.hue} / 0.8), oklch(0.16 0.08 ${outfit.hue} / 0.6))`
                        : `linear-gradient(160deg, oklch(0.18 0.07 ${outfit.hue} / 0.5), oklch(0.13 0.04 ${outfit.hue} / 0.35))`,
                    }}
                  >
                    <span style={{ fontSize: "24px", lineHeight: 1 }}>
                      {outfit.emoji}
                    </span>
                  </div>

                  {/* Label area */}
                  <div
                    className="px-1.5 py-2 text-center"
                    style={{
                      background: isSelected
                        ? `oklch(0.17 0.06 ${outfit.hue} / 0.5)`
                        : "oklch(0.12 0.013 240)",
                    }}
                  >
                    <span
                      className="text-[10px] font-bold leading-tight block truncate"
                      style={{
                        color: isSelected
                          ? "oklch(0.92 0.08 285)"
                          : "oklch(0.70 0.03 240)",
                      }}
                    >
                      {outfit.label}
                    </span>
                  </div>

                  {/* Selected checkmark badge */}
                  {isSelected && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{
                        background: "oklch(0.55 0.22 285)",
                        boxShadow: "0 1px 6px oklch(0.45 0.20 285 / 0.6)",
                      }}
                    >
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 8 8"
                        fill="none"
                        className="w-3 h-3"
                      >
                        <path
                          d="M1.5 4L3.5 6L6.5 2"
                          stroke="white"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>

          {/* Selected outfit display */}
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl"
            style={{
              background: "oklch(0.18 0.06 285 / 0.25)",
              border: "1px solid oklch(0.35 0.10 285 / 0.3)",
            }}
          >
            <Sparkles size={12} style={{ color: "oklch(0.70 0.16 285)" }} />
            <p
              className="text-xs font-medium"
              style={{ color: "oklch(0.80 0.08 285)" }}
            >
              Selected:{" "}
              <span
                className="font-semibold"
                style={{ color: "oklch(0.92 0.14 285)" }}
              >
                {selectedOutfit.label}
              </span>
            </p>
          </div>
        </motion.div>

        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="space-y-2"
        >
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <ImageIcon size={14} style={{ color: "oklch(0.70 0.12 285)" }} />
            Source Photo
          </Label>
          <button
            type="button"
            data-ocid="videogen.dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group text-left"
            style={{
              minHeight: imagePreview ? "auto" : "160px",
              background: imagePreview
                ? "transparent"
                : "oklch(0.13 0.016 240)",
              border: imagePreview
                ? "2px solid oklch(0.40 0.14 285 / 0.6)"
                : "2px dashed oklch(0.30 0.07 285 / 0.5)",
            }}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-full rounded-2xl object-cover"
                  style={{ maxHeight: "260px" }}
                />
                <div
                  className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "oklch(0.05 0.01 240 / 0.7)" }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload size={22} className="text-white" />
                    <span className="text-xs text-white font-medium">
                      Change Photo
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[160px] gap-3 p-6">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "oklch(0.20 0.05 285)" }}
                >
                  <Upload size={24} style={{ color: "oklch(0.72 0.16 285)" }} />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold">Tap to upload photo</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    JPG, PNG, WEBP supported
                  </p>
                </div>
              </div>
            )}
          </button>
          <input
            ref={fileInputRef}
            data-ocid="videogen.upload_button"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleImageSelect(f);
            }}
          />
        </motion.div>

        {/* Generate Button */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-3"
        >
          <Button
            data-ocid="videogen.primary_button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full h-12 rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
            style={{
              background: canGenerate
                ? "linear-gradient(135deg, oklch(0.45 0.18 285), oklch(0.55 0.20 310))"
                : undefined,
              boxShadow: canGenerate
                ? "0 4px 20px oklch(0.45 0.18 285 / 0.4)"
                : undefined,
            }}
          >
            {isRunning ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Sparkles size={17} />
            )}
            {isRunning
              ? status === "uploading"
                ? "Uploading..."
                : "Generating..."
              : "Generate Video"}
          </Button>

          {/* Inline status pill */}
          <AnimatePresence mode="wait">
            {status === "uploading" && (
              <motion.div
                key="status-uploading"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                data-ocid="videogen.loading_state"
                className="flex items-center justify-center"
              >
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: "oklch(0.18 0.06 285 / 0.35)",
                    border: "1px solid oklch(0.35 0.10 285 / 0.4)",
                    color: "oklch(0.82 0.12 285)",
                  }}
                >
                  📤 Uploading &amp; Processing...
                </span>
              </motion.div>
            )}

            {status === "generating" && (
              <motion.div
                key="status-generating"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                data-ocid="videogen.loading_state"
                className="flex items-center justify-center"
              >
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: "oklch(0.18 0.06 285 / 0.35)",
                    border: "1px solid oklch(0.35 0.10 285 / 0.4)",
                    color: "oklch(0.82 0.12 285)",
                  }}
                >
                  ⏳ Processing... · {pollSeconds}s
                </span>
              </motion.div>
            )}

            {status === "success" && (
              <motion.div
                key="status-success"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center"
              >
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full"
                  style={{
                    background: "oklch(0.17 0.07 145 / 0.35)",
                    border: "1px solid oklch(0.35 0.12 145 / 0.4)",
                    color: "oklch(0.78 0.16 145)",
                  }}
                >
                  ✅ Video Ready
                </span>
              </motion.div>
            )}

            {status === "error" && (
              <motion.div
                key="status-error"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                data-ocid="videogen.error_state"
                className="flex items-center justify-center"
              >
                <span
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full max-w-full text-center"
                  style={{
                    background: "oklch(0.15 0.06 15 / 0.35)",
                    border: "1px solid oklch(0.40 0.16 15 / 0.4)",
                    color: "oklch(0.70 0.20 15)",
                  }}
                >
                  <AlertCircle size={12} className="flex-shrink-0" />❌{" "}
                  {errorMsg || "Generation failed"}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Success / Video Player */}
        <AnimatePresence>
          {status === "success" && videoUrl && (
            <motion.div
              key="video"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              data-ocid="videogen.success_state"
              className="rounded-2xl overflow-hidden"
              style={{
                border: "1px solid oklch(0.40 0.14 285 / 0.5)",
                boxShadow: "0 0 30px oklch(0.40 0.14 285 / 0.2)",
              }}
            >
              <div
                className="px-4 py-3 flex items-center gap-2"
                style={{ background: "oklch(0.16 0.04 285)" }}
              >
                <CheckCircle2
                  size={16}
                  style={{ color: "oklch(0.72 0.18 145)" }}
                />
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.85 0.10 145)" }}
                >
                  Video Ready!
                </p>
              </div>
              {/* biome-ignore lint/a11y/useMediaCaption: AI-generated video */}
              <video
                controls
                src={videoUrl}
                className="w-full"
                style={{ background: "#000" }}
              />
              <div
                className="px-4 py-3"
                style={{ background: "oklch(0.13 0.018 240)" }}
              >
                <a
                  href={videoUrl}
                  download="visionvideo-output.mp4"
                  target="_blank"
                  rel="noreferrer"
                >
                  <Button
                    data-ocid="videogen.secondary_button"
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl text-xs font-semibold"
                  >
                    Download Video
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
