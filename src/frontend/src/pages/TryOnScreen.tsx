import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clapperboard,
  Cloud,
  Download,
  ExternalLink,
  Eye,
  EyeOff,
  ImageIcon,
  RotateCcw,
  Server,
  Settings2,
  Share2,
  Sparkles,
  Upload,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CameraCapture from "../components/CameraCapture";
import { outfits } from "../data/outfits";
import type { Outfit } from "../types";

type Step = "upload" | "select" | "processing" | "result";

// LocalStorage keys shared with VideoGenScreen
const REPLICATE_KEY_STORAGE = "replicate_api_key";
const CLOUDINARY_NAME_STORAGE = "cloudinary_cloud_name";
const CLOUDINARY_PRESET_STORAGE = "cloudinary_upload_preset";
const BACKEND_URL_STORAGE = "visionvideo_backend_url";

const simulatedMessages = [
  "AI is analyzing your body shape...",
  "Mapping your facial features...",
  "Fitting the outfit virtually...",
  "Adding final touches & lighting...",
  "Almost there \u2014 rendering magic! \u2728",
];

const realModeMessages = [
  "Uploading images...",
  "AI is processing...",
  "Generating your look...",
  "Almost done...",
];

interface TryOnScreenProps {
  initialOutfit?: Outfit | null;
}

export default function TryOnScreen({ initialOutfit }: TryOnScreenProps) {
  // Step
  const [step, setStep] = useState<Step>(initialOutfit ? "select" : "upload");

  // Photo
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [userPhotoFile, setUserPhotoFile] = useState<File | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Outfit
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(
    initialOutfit ?? null,
  );

  // Cloth upload
  const [clothFile, setClothFile] = useState<File | null>(null);
  const [clothPreview, setClothPreview] = useState<string | null>(null);
  const clothInputRef = useRef<HTMLInputElement>(null);

  // Settings panel
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [backendUrl, setBackendUrl] = useState(
    () => localStorage.getItem(BACKEND_URL_STORAGE) || "",
  );
  const [replicateKey, setReplicateKey] = useState(
    () => localStorage.getItem(REPLICATE_KEY_STORAGE) || "",
  );
  const [cloudName, setCloudName] = useState(
    () => localStorage.getItem(CLOUDINARY_NAME_STORAGE) || "",
  );
  const [uploadPreset, setUploadPreset] = useState(
    () => localStorage.getItem(CLOUDINARY_PRESET_STORAGE) || "",
  );
  const [showKey, setShowKey] = useState(false);

  // Processing
  const [processingMsgIndex, setProcessingMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isRealMode, setIsRealMode] = useState(false);

  // Result
  const [realResultUrl, setRealResultUrl] = useState<string | null>(null);

  const save = (key: string, val: string) => localStorage.setItem(key, val);

  // ── Upload photo ──────────────────────────────────────────────────────────
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUserPhotoFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setUserPhoto(ev.target?.result as string);
      setStep("select");
    };
    reader.readAsDataURL(file);
  };

  const handleCameraCapture = (dataUrl: string) => {
    setUserPhoto(dataUrl);
    setShowCamera(false);
    // Convert dataURL to File for real-mode
    fetch(dataUrl)
      .then((r) => r.blob())
      .then((blob) => {
        setUserPhotoFile(
          new File([blob], "camera.jpg", { type: "image/jpeg" }),
        );
      });
    setStep("select");
  };

  // ── Cloth upload ──────────────────────────────────────────────────────────
  const handleClothUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setClothFile(file);
    setClothPreview(URL.createObjectURL(file));
  };

  const handleClothClear = () => {
    setClothFile(null);
    setClothPreview(null);
    if (clothInputRef.current) clothInputRef.current.value = "";
  };

  // ── Try On ────────────────────────────────────────────────────────────────
  const handleTryOn = async () => {
    if (!selectedOutfit) return;

    const url = backendUrl.trim();
    const useReal = !!url;
    setIsRealMode(useReal);
    setRealResultUrl(null);
    setStep("processing");
    setProcessingMsgIndex(0);
    setProgress(0);

    if (!useReal) {
      // ── Simulated mode ──
      let msgStep = 0;
      const interval = setInterval(() => {
        msgStep += 1;
        setProcessingMsgIndex(msgStep);
        setProgress((msgStep / simulatedMessages.length) * 100);
        if (msgStep >= simulatedMessages.length) {
          clearInterval(interval);
          setTimeout(() => setStep("result"), 500);
        }
      }, 900);
      return;
    }

    // ── Real mode ──
    try {
      // Animate progress slowly
      let progressTick = 0;
      const progressInterval = setInterval(() => {
        progressTick += 1;
        setProgress(Math.min(progressTick * 3, 90));
      }, 800);

      // Cycle through polling messages
      let msgIndex = 0;
      setProcessingMsgIndex(0);
      const msgInterval = setInterval(() => {
        msgIndex = Math.min(msgIndex + 1, realModeMessages.length - 1);
        setProcessingMsgIndex(msgIndex);
      }, 4000);

      try {
        // Build person blob
        let personBlob: Blob;
        if (userPhotoFile) {
          personBlob = userPhotoFile;
        } else if (userPhoto) {
          const res = await fetch(userPhoto);
          personBlob = await res.blob();
        } else {
          throw new Error("No person photo available");
        }

        // Build cloth blob
        let clothBlob: Blob;
        if (clothFile) {
          clothBlob = clothFile;
        } else {
          const res = await fetch(selectedOutfit.image);
          if (!res.ok) throw new Error("Failed to fetch outfit image");
          clothBlob = await res.blob();
        }

        const formData = new FormData();
        formData.append("person", personBlob, "person.jpg");
        formData.append("cloth", clothBlob, "cloth.jpg");

        const response = await fetch(`${url}/tryon`, {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            (errData as { error?: string }).error ||
              `Server error: ${response.status}`,
          );
        }

        const data = (await response.json()) as {
          success: boolean;
          output?: string | string[];
          error?: string;
        };

        if (!data.success) throw new Error(data.error || "Try-on failed");

        const outputUrl = Array.isArray(data.output)
          ? data.output[0]
          : data.output;
        if (!outputUrl) throw new Error("No output returned from server");

        clearInterval(progressInterval);
        clearInterval(msgInterval);
        setProgress(100);
        setProcessingMsgIndex(realModeMessages.length - 1);
        setRealResultUrl(outputUrl);
        setTimeout(() => setStep("result"), 500);
      } finally {
        clearInterval(progressInterval);
        clearInterval(msgInterval);
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Unexpected error";
      toast.error(`Try-on failed: ${msg}`);
      setStep("select");
    }
  };

  const handleReset = () => {
    setStep("upload");
    setUserPhoto(null);
    setUserPhotoFile(null);
    setSelectedOutfit(null);
    setClothFile(null);
    setClothPreview(null);
    setProgress(0);
    setProcessingMsgIndex(0);
    setRealResultUrl(null);
    setIsRealMode(false);
  };

  const handleDownload = () => {
    const imgSrc = realResultUrl || selectedOutfit?.image;
    if (!imgSrc) return;
    const link = document.createElement("a");
    link.href = imgSrc;
    link.download = `FitTryAI_${selectedOutfit?.name.replace(/\s/g, "_") ?? "result"}.jpg`;
    link.click();
    toast.success("Image downloaded!");
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "My FitTry AI Look",
          text: `Check out this outfit: ${selectedOutfit?.name}!`,
          url: window.location.href,
        });
      } catch {
        /* ignore */
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard!");
    }
  };

  const steps: Step[] = ["upload", "select", "processing", "result"];
  const currentMessages = isRealMode ? realModeMessages : simulatedMessages;

  return (
    <div className="min-h-screen pb-24">
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center justify-between"
        style={{
          background: "oklch(0.10 0.015 240 / 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.22 0.022 240 / 0.4)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">Try On</span>
        </div>
        {step !== "upload" && (
          <button
            type="button"
            onClick={handleReset}
            className="text-xs text-primary font-medium flex items-center gap-1"
            data-ocid="tryon.reset.button"
          >
            <RotateCcw size={12} /> Start Over
          </button>
        )}
      </header>

      {/* Step dots */}
      <div className="flex items-center gap-2 px-4 py-3">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                s === step
                  ? "bg-primary scale-125"
                  : steps.indexOf(step) > i
                    ? "bg-primary/50"
                    : "bg-muted"
              }`}
            />
            {i < 3 && <div className="w-6 h-px bg-border" />}
          </div>
        ))}
        <span className="ml-1 text-xs text-muted-foreground capitalize">
          {step}
        </span>
      </div>

      <div className="px-4">
        <AnimatePresence mode="wait">
          {/* ── UPLOAD STEP ─────────────────────────────────────────────── */}
          {step === "upload" && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 pt-4"
            >
              <div className="text-center mb-6">
                <h2 className="text-2xl font-display font-bold">
                  Upload Your Photo
                </h2>
                <p className="text-sm text-muted-foreground mt-2">
                  Use a clear, front-facing photo for best results
                </p>
              </div>

              <button
                type="button"
                data-ocid="tryon.upload.button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-4 py-14 transition-all active:scale-[0.98]"
                style={{
                  borderColor: "oklch(0.35 0.06 265)",
                  background: "oklch(0.14 0.018 240 / 0.6)",
                }}
              >
                <div className="w-20 h-20 rounded-3xl gradient-blue flex items-center justify-center shadow-glow-blue">
                  <Upload size={32} className="text-white" />
                </div>
                <div className="text-center">
                  <p className="text-foreground font-semibold text-base">
                    Upload Photo
                  </p>
                  <p className="text-muted-foreground text-sm mt-1">
                    JPG, PNG up to 10MB
                  </p>
                </div>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />

              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-xs text-muted-foreground">or</span>
                <div className="flex-1 h-px bg-border" />
              </div>

              <Button
                type="button"
                data-ocid="tryon.camera.button"
                variant="outline"
                className="w-full h-14 rounded-2xl border-border gap-3 text-base font-semibold"
                onClick={() => setShowCamera(true)}
              >
                <Camera size={22} />
                Capture with Camera
              </Button>

              <div
                className="rounded-2xl p-4 mt-2"
                style={{
                  background: "oklch(0.14 0.018 240)",
                  border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                }}
              >
                <p className="text-xs text-muted-foreground text-center">
                  &#9989; 100% Free &#183; &#9989; No sign-up &#183; &#9989; No
                  watermark
                </p>
              </div>
            </motion.div>
          )}

          {/* ── SELECT STEP ─────────────────────────────────────────────── */}
          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5 pt-4"
            >
              {/* Your photo preview */}
              {userPhoto && (
                <div
                  className="flex items-center gap-4 rounded-2xl p-3"
                  style={{
                    background: "oklch(0.14 0.018 240)",
                    border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                  }}
                >
                  <img
                    src={userPhoto}
                    alt="You"
                    className="w-16 h-16 rounded-xl object-cover"
                  />
                  <div>
                    <p className="text-sm font-semibold">Your photo is ready</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Now pick an outfit to try on
                    </p>
                  </div>
                  <CheckCircle2 size={20} className="ml-auto text-green-400" />
                </div>
              )}

              {/* ⚙ AI Settings panel */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl overflow-hidden"
                style={{
                  background: "oklch(0.13 0.016 240)",
                  border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                }}
              >
                {/* Toggle button */}
                <button
                  type="button"
                  data-ocid="tryon.settings.toggle"
                  onClick={() => setSettingsOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Settings2
                      size={14}
                      style={{ color: "oklch(0.70 0.14 265)" }}
                    />
                    <span>&#9881; AI Settings</span>
                    {backendUrl.trim() && (
                      <span
                        className="text-[10px] font-normal px-1.5 py-0.5 rounded-full"
                        style={{
                          background: "oklch(0.22 0.10 145 / 0.5)",
                          color: "oklch(0.72 0.18 145)",
                        }}
                      >
                        Real AI Active
                      </span>
                    )}
                  </div>
                  <motion.div
                    animate={{ rotate: settingsOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown size={16} className="text-muted-foreground" />
                  </motion.div>
                </button>

                {/* Expanded settings */}
                <AnimatePresence initial={false}>
                  {settingsOpen && (
                    <motion.div
                      key="settings-panel"
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
                        {/* Backend URL */}
                        <div className="space-y-1.5 pt-4">
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <Server
                              size={12}
                              style={{ color: "oklch(0.70 0.14 145)" }}
                            />
                            Backend URL{" "}
                            <span
                              className="font-normal"
                              style={{ color: "oklch(0.56 0.04 240)" }}
                            >
                              (optional)
                            </span>
                          </Label>
                          <Input
                            data-ocid="tryon.backend_url.input"
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
                            Your Node.js /tryon backend URL. If set, real AI
                            try-on is used.
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
                              data-ocid="tryon.replicate_key.input"
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
                              {showKey ? (
                                <EyeOff size={14} />
                              ) : (
                                <Eye size={14} />
                              )}
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

                        {/* Cloudinary settings */}
                        <div className="space-y-1.5">
                          <Label className="text-xs font-semibold flex items-center gap-1.5">
                            <Cloud
                              size={12}
                              style={{ color: "oklch(0.70 0.15 200)" }}
                            />
                            Cloudinary Settings
                          </Label>
                          <Input
                            data-ocid="tryon.cloudinary_name.input"
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
                            data-ocid="tryon.cloudinary_preset.input"
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
                            <ExternalLink size={10} /> Get settings at
                            cloudinary.com
                          </a>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              <h2 className="text-xl font-display font-bold">
                Select an Outfit
              </h2>

              {/* Outfit grid */}
              <div className="grid grid-cols-2 gap-3">
                {outfits.map((outfit, i) => (
                  <button
                    type="button"
                    key={outfit.id}
                    data-ocid={`select.outfit.${i + 1}`}
                    onClick={() => setSelectedOutfit(outfit)}
                    className={`rounded-2xl overflow-hidden border transition-all duration-200 text-left ${
                      selectedOutfit?.id === outfit.id
                        ? "border-primary ring-2 ring-primary/40 scale-[1.02]"
                        : "border-border hover:border-primary/40"
                    }`}
                    style={{ background: "oklch(0.14 0.018 240)" }}
                  >
                    <div className="relative aspect-[4/5] overflow-hidden">
                      <img
                        src={outfit.image}
                        alt={outfit.name}
                        className="w-full h-full object-cover"
                      />
                      {selectedOutfit?.id === outfit.id && (
                        <div
                          className="absolute inset-0 flex items-center justify-center"
                          style={{
                            background: "oklch(0.60 0.18 265 / 0.35)",
                          }}
                        >
                          <CheckCircle2 size={32} className="text-white" />
                        </div>
                      )}
                      <Badge
                        className="absolute top-2 left-2 text-[10px]"
                        style={{
                          background: "oklch(0.12 0.016 240 / 0.85)",
                          color: "oklch(0.78 0.12 265)",
                          border: "1px solid oklch(0.28 0.03 265 / 0.5)",
                        }}
                      >
                        {outfit.platform}
                      </Badge>
                    </div>
                    <div className="p-2.5">
                      <p className="text-xs font-semibold truncate">
                        {outfit.name}
                      </p>
                      <p
                        className="text-xs mt-1"
                        style={{ color: "oklch(0.82 0.13 210)" }}
                      >
                        {outfit.price}
                      </p>
                    </div>
                  </button>
                ))}
              </div>

              {/* Cloth image upload */}
              <div
                className="rounded-2xl p-4 space-y-3"
                style={{
                  background: "oklch(0.14 0.018 240)",
                  border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                }}
              >
                <Label className="text-sm font-semibold flex items-center gap-2">
                  <ImageIcon
                    size={14}
                    style={{ color: "oklch(0.70 0.15 30)" }}
                  />
                  Or upload your own garment photo
                </Label>

                {clothPreview ? (
                  <div className="flex items-center gap-3">
                    <img
                      src={clothPreview}
                      alt="Cloth"
                      className="w-16 h-20 rounded-xl object-cover flex-shrink-0"
                      style={{
                        border: "1px solid oklch(0.35 0.06 265 / 0.7)",
                      }}
                    />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground">
                        {clothFile?.name ?? "Garment uploaded"}
                      </p>
                      <p
                        className="text-[11px] mt-0.5"
                        style={{ color: "oklch(0.62 0.04 240)" }}
                      >
                        This will be used as the cloth image
                      </p>
                    </div>
                    <button
                      type="button"
                      data-ocid="tryon.cloth_clear.button"
                      onClick={handleClothClear}
                      className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/10 transition-colors"
                      style={{
                        background: "oklch(0.18 0.020 240)",
                        border: "1px solid oklch(0.28 0.025 240 / 0.5)",
                      }}
                    >
                      <X size={13} className="text-muted-foreground" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    data-ocid="tryon.cloth_upload.button"
                    onClick={() => clothInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-3 rounded-xl py-4 border-2 border-dashed transition-all hover:border-primary/40 active:scale-[0.98]"
                    style={{
                      borderColor: "oklch(0.28 0.04 265 / 0.5)",
                      background: "oklch(0.11 0.014 240 / 0.5)",
                    }}
                  >
                    <Upload
                      size={18}
                      style={{ color: "oklch(0.65 0.10 265)" }}
                    />
                    <span
                      className="text-sm font-medium"
                      style={{ color: "oklch(0.65 0.10 265)" }}
                    >
                      Upload Cloth Image
                    </span>
                  </button>
                )}
                <input
                  ref={clothInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleClothUpload}
                />
              </div>

              <Button
                type="button"
                data-ocid="tryon.generate.button"
                disabled={!selectedOutfit}
                onClick={handleTryOn}
                className="w-full h-14 rounded-2xl gradient-blue text-white font-bold text-base gap-2 shadow-glow-blue transition-all active:scale-[0.98]"
              >
                <Sparkles size={20} />
                Try On Now
                <ChevronRight size={18} />
              </Button>
            </motion.div>
          )}

          {/* ── PROCESSING STEP ─────────────────────────────────────────── */}
          {step === "processing" && (
            <motion.div
              key="processing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[60vh] gap-8 pt-4"
              data-ocid="tryon.loading_state"
            >
              <div className="relative">
                <div className="w-28 h-28 rounded-full border-4 border-primary/20 flex items-center justify-center">
                  <div className="w-24 h-24 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Sparkles
                    size={28}
                    className="text-primary animate-pulse-glow"
                  />
                </div>
              </div>

              <div className="text-center space-y-3">
                <h3 className="text-xl font-display font-bold">
                  {isRealMode ? "AI Try-On Processing" : "AI is Working"}
                </h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingMsgIndex}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-sm text-muted-foreground min-h-[1.5rem]"
                  >
                    {
                      currentMessages[
                        Math.min(processingMsgIndex, currentMessages.length - 1)
                      ]
                    }
                  </motion.p>
                </AnimatePresence>
                {isRealMode && (
                  <p
                    className="text-[11px]"
                    style={{ color: "oklch(0.55 0.04 240)" }}
                  >
                    This may take 30\u201390 seconds&hellip;
                  </p>
                )}
              </div>

              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs text-muted-foreground mb-2">
                  <span>Processing</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full gradient-blue"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 w-full max-w-xs">
                {(isRealMode
                  ? ["Uploading", "Processing", "Rendering"]
                  : ["Face Mapping", "Outfit Fitting", "HD Render"]
                ).map((label, i) => (
                  <div
                    key={label}
                    className="rounded-xl p-3 text-center"
                    style={{
                      background: "oklch(0.14 0.018 240)",
                      border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                    }}
                  >
                    <div
                      className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${
                        processingMsgIndex > i
                          ? "bg-green-400"
                          : "bg-muted animate-pulse"
                      }`}
                    />
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ── RESULT STEP ─────────────────────────────────────────────── */}
          {step === "result" && selectedOutfit && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5 pt-4"
              data-ocid="tryon.success_state"
            >
              <div className="text-center">
                <div
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-3"
                  style={{
                    background: "oklch(0.72 0.18 150 / 0.15)",
                    border: "1px solid oklch(0.72 0.18 150 / 0.3)",
                  }}
                >
                  <CheckCircle2 size={14} className="text-green-400" />
                  <span className="text-xs font-semibold text-green-400">
                    {isRealMode ? "AI Try-On Complete!" : "Try-On Complete!"}
                  </span>
                </div>
                <h2 className="text-2xl font-display font-bold">Your Look</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {userPhoto && (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{
                      border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                    }}
                  >
                    <img
                      src={userPhoto}
                      alt="Before"
                      className="w-full aspect-[4/5] object-cover"
                    />
                    <div className="p-2 text-center">
                      <p className="text-xs text-muted-foreground">Original</p>
                    </div>
                  </div>
                )}
                <div
                  className="rounded-2xl overflow-hidden"
                  style={{
                    border: "1px solid oklch(0.35 0.06 265 / 0.7)",
                    boxShadow: "0 0 20px oklch(0.60 0.18 265 / 0.2)",
                  }}
                >
                  <img
                    src={realResultUrl ?? selectedOutfit.image}
                    alt={
                      realResultUrl ? "AI Try-On Result" : selectedOutfit.name
                    }
                    className="w-full aspect-[4/5] object-cover"
                  />
                  <div className="p-2 text-center">
                    <p className="text-xs font-semibold text-primary">
                      {isRealMode ? "AI Try-On Result" : "Try-On Result"}
                    </p>
                  </div>
                </div>
              </div>

              <div
                className="rounded-2xl p-4"
                style={{
                  background: "oklch(0.14 0.018 240)",
                  border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                }}
              >
                <p className="font-semibold">{selectedOutfit.name}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOutfit.brand} &#183; {selectedOutfit.platform}
                </p>
                <p
                  className="text-lg font-bold mt-1"
                  style={{ color: "oklch(0.82 0.13 210)" }}
                >
                  {selectedOutfit.price}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <Button
                  type="button"
                  data-ocid="tryon.download.button"
                  variant="outline"
                  className="h-12 rounded-2xl gap-2 font-semibold"
                  onClick={handleDownload}
                >
                  <Download size={18} /> Download
                </Button>
                <Button
                  type="button"
                  data-ocid="tryon.share.button"
                  className="h-12 rounded-2xl gap-2 font-semibold gradient-blue text-white"
                  onClick={handleShare}
                >
                  <Share2 size={18} /> Share
                </Button>
              </div>

              <Button
                type="button"
                data-ocid="tryon.tryagain.button"
                variant="outline"
                className="w-full h-12 rounded-2xl gap-2 font-semibold"
                onClick={handleReset}
              >
                <RotateCcw size={16} /> Try Another Outfit
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
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
