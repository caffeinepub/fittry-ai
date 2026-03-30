import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Clapperboard,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  Loader2,
  Sparkles,
  Upload,
  Video,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";

const RUNWAY_KEY_STORAGE = "runway_api_key";

async function generateVideo(apiKey: string, imageFile: File): Promise<string> {
  const base64 = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imageFile);
  });

  const createRes = await fetch("https://api.runwayml.com/v1/image_to_video", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "X-Runway-Version": "2024-11-06",
    },
    body: JSON.stringify({
      promptImage: base64,
      ratio: "1280:720",
      duration: 5,
      model: "gen3a_turbo",
    }),
  });

  if (!createRes.ok) {
    const err = await createRes.json().catch(() => ({}));
    throw new Error(
      (err as { message?: string }).message || `API error: ${createRes.status}`,
    );
  }

  const { id } = (await createRes.json()) as { id: string };

  while (true) {
    await new Promise((r) => setTimeout(r, 3000));
    const pollRes = await fetch(`https://api.runwayml.com/v1/tasks/${id}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Runway-Version": "2024-11-06",
      },
    });
    const task = (await pollRes.json()) as {
      status: string;
      output?: string[];
      failure?: string;
    };
    if (task.status === "SUCCEEDED") return task.output![0];
    if (task.status === "FAILED")
      throw new Error(task.failure || "Generation failed");
  }
}

interface VideoGenScreenProps {
  onBack: () => void;
}

export default function VideoGenScreen({ onBack }: VideoGenScreenProps) {
  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem(RUNWAY_KEY_STORAGE) || "",
  );
  const [showKey, setShowKey] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [status, setStatus] = useState<
    "idle" | "generating" | "success" | "error"
  >("idle");
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [pollSeconds, setPollSeconds] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const handleApiKeyChange = (val: string) => {
    setApiKey(val);
    localStorage.setItem(RUNWAY_KEY_STORAGE, val);
  };

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setVideoUrl(null);
    setStatus("idle");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith("image/")) handleImageSelect(file);
  };

  const handleGenerate = async () => {
    if (!apiKey || !imageFile) return;
    setStatus("generating");
    setErrorMsg("");
    setVideoUrl(null);
    setPollSeconds(0);

    pollTimerRef.current = setInterval(() => {
      setPollSeconds((s) => s + 1);
    }, 1000);

    try {
      const url = await generateVideo(apiKey, imageFile);
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

  const canGenerate = !!apiKey.trim() && !!imageFile && status !== "generating";

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
              Powered by Runway AI
            </p>
          </div>
        </div>
      </header>

      <div className="px-4 pt-5 space-y-5">
        {/* API Key */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl p-4 space-y-3"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <Label
            htmlFor="runway-key"
            className="text-sm font-semibold flex items-center gap-1.5"
          >
            <Clapperboard size={14} style={{ color: "oklch(0.70 0.12 285)" }} />
            Runway API Key
          </Label>
          <div className="relative">
            <Input
              id="runway-key"
              data-ocid="videogen.input"
              type={showKey ? "text" : "password"}
              placeholder="Enter your Runway API key"
              value={apiKey}
              onChange={(e) => handleApiKeyChange(e.target.value)}
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
            href="https://app.runwayml.com/settings/api-keys"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs"
            style={{ color: "oklch(0.68 0.14 285)" }}
          >
            <ExternalLink size={11} />
            Get your key at runwayml.com
          </a>
        </motion.div>

        {/* Image Upload */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-2"
        >
          <Label className="text-sm font-semibold flex items-center gap-1.5">
            <ImageIcon size={14} style={{ color: "oklch(0.70 0.12 285)" }} />
            Source Image
          </Label>

          <button
            type="button"
            data-ocid="videogen.dropzone"
            onClick={() => fileInputRef.current?.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="relative w-full rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 group text-left"
            style={{
              minHeight: imagePreview ? "auto" : "180px",
              background: imagePreview
                ? "transparent"
                : "oklch(0.13 0.016 240)",
              border: imagePreview
                ? "2px solid oklch(0.40 0.14 285 / 0.6)"
                : "2px dashed oklch(0.30 0.07 285 / 0.5)",
              boxShadow: imagePreview
                ? "0 0 20px oklch(0.40 0.14 285 / 0.15)"
                : "none",
            }}
          >
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="w-full rounded-2xl object-cover"
                  style={{ maxHeight: "280px" }}
                />
                <div
                  className="absolute inset-0 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: "oklch(0.05 0.01 240 / 0.7)" }}
                >
                  <div className="flex flex-col items-center gap-1.5">
                    <Upload size={22} className="text-white" />
                    <span className="text-xs text-white font-medium">
                      Change Image
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full min-h-[180px] gap-3 p-6">
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
            {status === "generating" ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <Sparkles size={17} />
            )}
            {status === "generating" ? "Generating..." : "Generate Video"}
          </Button>
        </motion.div>

        {/* Loading State */}
        <AnimatePresence>
          {status === "generating" && (
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
                  Generating your video...
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {pollSeconds < 5
                    ? "Uploading image to Runway AI"
                    : pollSeconds < 15
                      ? "AI is animating your photo"
                      : "Almost there, finalizing..."}{" "}
                  · {pollSeconds}s
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
                  transition={{ duration: 30, ease: "easeInOut" }}
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
              {/* biome-ignore lint/a11y/useMediaCaption: AI-generated video has no captions */}
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
                  download="runway-video.mp4"
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
