import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Camera,
  CheckCircle2,
  ChevronRight,
  Download,
  RotateCcw,
  Share2,
  Sparkles,
  Upload,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import CameraCapture from "../components/CameraCapture";
import { outfits } from "../data/outfits";
import type { Outfit } from "../types";

type Step = "upload" | "select" | "processing" | "result";

const processingMessages = [
  "AI is analyzing your body shape...",
  "Mapping your facial features...",
  "Fitting the outfit virtually...",
  "Adding final touches & lighting...",
  "Almost there \u2014 rendering magic! \u2728",
];

interface TryOnScreenProps {
  initialOutfit?: Outfit | null;
}

export default function TryOnScreen({ initialOutfit }: TryOnScreenProps) {
  const [step, setStep] = useState<Step>(initialOutfit ? "select" : "upload");
  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(
    initialOutfit ?? null,
  );
  const [showCamera, setShowCamera] = useState(false);
  const [processingMsgStep, setProcessingMsgStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
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
    setStep("select");
  };

  const handleTryOn = () => {
    if (!selectedOutfit) return;
    setStep("processing");
    setProcessingMsgStep(0);
    setProgress(0);

    let msgStep = 0;
    const interval = setInterval(() => {
      msgStep += 1;
      setProcessingMsgStep(msgStep);
      setProgress((msgStep / processingMessages.length) * 100);
      if (msgStep >= processingMessages.length) {
        clearInterval(interval);
        setTimeout(() => setStep("result"), 500);
      }
    }, 900);
  };

  const handleReset = () => {
    setStep("upload");
    setUserPhoto(null);
    setSelectedOutfit(null);
    setProgress(0);
    setProcessingMsgStep(0);
  };

  const handleDownload = () => {
    if (!selectedOutfit) return;
    const link = document.createElement("a");
    link.href = selectedOutfit.image;
    link.download = `FitTryAI_${selectedOutfit.name.replace(/\s/g, "_")}.jpg`;
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

          {step === "select" && (
            <motion.div
              key="select"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-5 pt-4"
            >
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

              <h2 className="text-xl font-display font-bold">
                Select an Outfit
              </h2>

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
                          style={{ background: "oklch(0.60 0.18 265 / 0.35)" }}
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
                  AI is Working
                </h3>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={processingMsgStep}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="text-sm text-muted-foreground min-h-[1.5rem]"
                  >
                    {
                      processingMessages[
                        Math.min(
                          processingMsgStep,
                          processingMessages.length - 1,
                        )
                      ]
                    }
                  </motion.p>
                </AnimatePresence>
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
                {["Face Mapping", "Outfit Fitting", "HD Render"].map(
                  (label, i) => (
                    <div
                      key={label}
                      className="rounded-xl p-3 text-center"
                      style={{
                        background: "oklch(0.14 0.018 240)",
                        border: "1px solid oklch(0.22 0.022 240 / 0.5)",
                      }}
                    >
                      <div
                        className={`w-2 h-2 rounded-full mx-auto mb-1.5 ${processingMsgStep > i ? "bg-green-400" : "bg-muted animate-pulse"}`}
                      />
                      <p className="text-[10px] text-muted-foreground">
                        {label}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </motion.div>
          )}

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
                    Try-On Complete!
                  </span>
                </div>
                <h2 className="text-2xl font-display font-bold">Your Look</h2>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {userPhoto && (
                  <div
                    className="rounded-2xl overflow-hidden"
                    style={{ border: "1px solid oklch(0.22 0.022 240 / 0.5)" }}
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
                    src={selectedOutfit.image}
                    alt={selectedOutfit.name}
                    className="w-full aspect-[4/5] object-cover"
                  />
                  <div className="p-2 text-center">
                    <p className="text-xs font-semibold text-primary">
                      Try-On Result
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
