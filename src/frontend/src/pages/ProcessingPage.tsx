import { Progress } from "@/components/ui/progress";
import { useEffect, useState } from "react";
import type { Outfit } from "../types";

const MESSAGES = [
  "Analyzing body shape...",
  "Mapping clothing contours...",
  "Applying fabric simulation...",
  "Rendering HD output...",
  "Finalizing fit...",
  "Adding finishing touches...",
];

interface ProcessingPageProps {
  outfit: Outfit;
  photo: string;
  onDone: () => void;
}

export default function ProcessingPage({
  outfit,
  photo,
  onDone,
}: ProcessingPageProps) {
  const [progress, setProgress] = useState(0);
  const [msgIndex, setMsgIndex] = useState(0);

  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const steps = duration / interval;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const pct = Math.min((step / steps) * 100, 100);
      setProgress(pct);
      setMsgIndex(Math.floor((pct / 100) * (MESSAGES.length - 1)));
      if (step >= steps) {
        clearInterval(timer);
        setTimeout(onDone, 300);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [onDone]);

  return (
    <div
      className="max-w-[430px] mx-auto px-4 pt-12 pb-8 flex flex-col items-center text-center animate-slide-up"
      data-ocid="processing.loading_state"
    >
      <div className="relative w-48 h-60 rounded-3xl overflow-hidden mb-8 shadow-float">
        <img
          src={photo}
          alt="Processing preview"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 gradient-lavender-pink opacity-40 animate-pulse-glow" />
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-80"
            style={{ top: `${progress}%`, transition: "top 0.05s linear" }}
          />
        </div>
        <div
          className="absolute bottom-0 left-0 right-0 h-1/2 opacity-60"
          style={{
            background:
              "linear-gradient(to top, oklch(0.76 0.1 295 / 0.6), transparent)",
          }}
        />
      </div>

      <div className="w-14 h-14 rounded-2xl gradient-lavender-pink flex items-center justify-center mb-5 shadow-glow">
        <div className="w-8 h-8 border-2 border-white/40 border-t-white rounded-full animate-spin" />
      </div>

      <h2 className="text-xl font-black mb-1">AI Processing</h2>
      <p className="text-sm text-muted-foreground mb-2">
        Trying on <strong>{outfit.name}</strong>
      </p>

      <div className="w-full max-w-64 mb-3">
        <Progress value={progress} className="h-2 bg-muted" />
      </div>
      <p className="text-xs text-primary font-semibold animate-pulse">
        {MESSAGES[msgIndex]}
      </p>
      <p className="text-xs text-muted-foreground mt-4">
        ⚡ HD rendering in progress
      </p>
    </div>
  );
}
