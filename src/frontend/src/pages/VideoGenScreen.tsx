import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clapperboard,
  Cloud,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Shirt,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const REPLICATE_KEY_STORAGE = "replicate_api_key";
const CLOUDINARY_NAME_STORAGE = "cloudinary_cloud_name";
const CLOUDINARY_PRESET_STORAGE = "cloudinary_upload_preset";

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

  // Poll for completion
  while (true) {
    await new Promise((r) => setTimeout(r, 3000));
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
  const [outfit, setOutfit] = useState("casual clothes");
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
    if (!replicateKey || !cloudName || !uploadPreset || !imageFile) return;
    setVideoUrl(null);
    setErrorMsg("");
    setPollSeconds(0);

    pollTimerRef.current = setInterval(
      () => setPollSeconds((s) => s + 1),
      1000,
    );

    try {
      setStatus("uploading");
      const imageUrl = await uploadToCloudinary(
        imageFile,
        cloudName,
        uploadPreset,
      );

      setStatus("generating");
      const url = await generateVideoWithReplicate(
        replicateKey,
        imageUrl,
        outfit || "casual clothes",
      );
      setVideoUrl(url);
      setStatus("success");
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
  const canGenerate =
    !!replicateKey.trim() &&
    !!cloudName.trim() &&
    !!uploadPreset.trim() &&
    !!imageFile &&
    !isRunning;

  const statusLabel =
    status === "uploading"
      ? `Uploading to Cloudinary... · ${pollSeconds}s`
      : status === "generating"
        ? pollSeconds < 10
          ? `Sending to Replicate AI... · ${pollSeconds}s`
          : pollSeconds < 25
            ? `Generating outfit video... · ${pollSeconds}s`
            : `Finalizing video... · ${pollSeconds}s`
        : "";

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
              Powered by Replicate + Cloudinary
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-4">
        {/* Replicate API Key */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Clapperboard size={14} style={{ color: "oklch(0.70 0.12 285)" }} />
            Replicate API Key
          </Label>
          <div className="relative">
            <Input
              data-ocid="videogen.input"
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
              {showKey ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          <a
            href="https://replicate.com/account/api-tokens"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "oklch(0.68 0.14 285)" }}
          >
            <ExternalLink size={11} /> Get key at replicate.com
          </a>
        </motion.div>

        {/* Cloudinary Settings */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Cloud size={14} style={{ color: "oklch(0.70 0.15 200)" }} />
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
            className="rounded-xl text-sm"
            style={{
              background: "oklch(0.10 0.012 240)",
              border: "1px solid oklch(0.25 0.025 240 / 0.6)",
            }}
          />
          <a
            href="https://cloudinary.com/console"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "oklch(0.68 0.14 200)" }}
          >
            <ExternalLink size={11} /> Get settings at cloudinary.com
          </a>
        </motion.div>

        {/* Outfit Description */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="rounded-2xl p-4 space-y-2"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <Shirt size={14} style={{ color: "oklch(0.70 0.15 150)" }} />
            Outfit Description
          </Label>
          <Input
            placeholder="e.g. red dress, casual jeans, formal suit"
            value={outfit}
            onChange={(e) => setOutfit(e.target.value)}
            className="rounded-xl text-sm"
            style={{
              background: "oklch(0.10 0.012 240)",
              border: "1px solid oklch(0.25 0.025 240 / 0.6)",
            }}
          />
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
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {isRunning && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              data-ocid="videogen.loading_state"
              className="rounded-2xl p-5 flex flex-col items-center gap-4"
              style={{
                background: "oklch(0.14 0.018 240)",
                border: "1px solid oklch(0.30 0.10 285 / 0.4)",
              }}
            >
              <div className="relative">
                <div
                  className="w-16 h-16 rounded-full animate-ping absolute inset-0"
                  style={{ background: "oklch(0.45 0.18 285 / 0.15)" }}
                />
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center relative"
                  style={{ background: "oklch(0.20 0.08 285)" }}
                >
                  <Video
                    size={28}
                    style={{ color: "oklch(0.72 0.18 285)" }}
                    className="animate-pulse"
                  />
                </div>
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold">
                  {status === "uploading"
                    ? "Uploading photo to Cloudinary..."
                    : "Generating outfit video with Replicate..."}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {statusLabel}
                </p>
              </div>
              <div
                className="w-full h-1.5 rounded-full overflow-hidden"
                style={{ background: "oklch(0.20 0.03 240)" }}
              >
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background:
                      "linear-gradient(90deg, oklch(0.55 0.20 285), oklch(0.65 0.18 310))",
                  }}
                  animate={{ width: ["0%", "85%"] }}
                  transition={{ duration: 40, ease: "easeInOut" }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error State */}
        <AnimatePresence>
          {status === "error" && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              data-ocid="videogen.error_state"
              className="rounded-2xl p-4 flex items-start gap-3"
              style={{
                background: "oklch(0.14 0.04 15)",
                border: "1px solid oklch(0.45 0.18 15 / 0.4)",
              }}
            >
              <AlertCircle
                size={18}
                className="flex-shrink-0 mt-0.5"
                style={{ color: "oklch(0.65 0.22 15)" }}
              />
              <div>
                <p
                  className="text-sm font-semibold"
                  style={{ color: "oklch(0.75 0.18 15)" }}
                >
                  Generation Failed
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {errorMsg}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
                  download="replicate-video.mp4"
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
