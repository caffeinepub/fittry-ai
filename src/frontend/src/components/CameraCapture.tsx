import { Button } from "@/components/ui/button";
import { Camera, RotateCcw, X } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

interface CameraCaptureProps {
  onCapture: (dataUrl: string) => void;
  onClose: () => void;
}

export default function CameraCapture({
  onCapture,
  onClose,
}: CameraCaptureProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [facing, setFacing] = useState<"user" | "environment">("user");

  const stopStream = useCallback(() => {
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) t.stop();
      streamRef.current = null;
    }
  }, []);

  const startCamera = useCallback(
    async (facingMode: "user" | "environment") => {
      stopStream();
      try {
        const s = await navigator.mediaDevices.getUserMedia({
          video: { facingMode },
          audio: false,
        });
        streamRef.current = s;
        if (videoRef.current) {
          videoRef.current.srcObject = s;
        }
        setError(null);
      } catch {
        setError("Camera access denied. Please allow camera permission.");
      }
    },
    [stopStream],
  );

  useEffect(() => {
    startCamera(facing);
    return stopStream;
  }, [facing, startCamera, stopStream]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d")?.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
    stopStream();
    onCapture(dataUrl);
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      <div className="flex items-center justify-between p-4">
        <span className="text-white font-semibold text-lg">Take a Photo</span>
        <button
          type="button"
          onClick={onClose}
          className="text-white/70 hover:text-white transition-colors"
          data-ocid="camera.close_button"
        >
          <X size={24} />
        </button>
      </div>

      <div className="flex-1 relative overflow-hidden">
        {error ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-white/70 text-center px-8">{error}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="w-full h-full object-cover"
          />
        )}
        <canvas ref={canvasRef} className="hidden" />
      </div>

      <div className="p-6 flex items-center justify-center gap-6">
        <button
          type="button"
          onClick={() =>
            setFacing((f) => (f === "user" ? "environment" : "user"))
          }
          className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          data-ocid="camera.toggle"
        >
          <RotateCcw size={20} />
        </button>
        <Button
          type="button"
          onClick={handleCapture}
          disabled={!!error}
          className="w-20 h-20 rounded-full gradient-blue text-white shadow-glow-blue"
          data-ocid="camera.capture_button"
        >
          <Camera size={28} />
        </Button>
        <div className="w-12 h-12" />
      </div>
    </div>
  );
}
