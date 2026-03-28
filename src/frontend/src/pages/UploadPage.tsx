import { Button } from "@/components/ui/button";
import { ArrowLeft, Camera, ImagePlus, Link2, Upload, X } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import ImportedProductCard from "../components/ImportedProductCard";
import PasteLinkInput from "../components/PasteLinkInput";
import { saveImport } from "../data/ecommerce";
import type { ImportedProduct } from "../types";

type UploadTab = "gallery" | "camera" | "link";

interface UploadPageProps {
  onPhotoUploaded: (photo: string) => void;
  onBack: () => void;
  onImportedProductTryOn: (product: ImportedProduct) => void;
  recentImports: ImportedProduct[];
  onImportsUpdated: (imports: ImportedProduct[]) => void;
}

export default function UploadPage({
  onPhotoUploaded,
  onBack,
  onImportedProductTryOn,
  recentImports,
  onImportsUpdated,
}: UploadPageProps) {
  const [activeTab, setActiveTab] = useState<UploadTab>("gallery");
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [freshImport, setFreshImport] = useState<ImportedProduct | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleImported = (product: ImportedProduct) => {
    const updated = saveImport(product);
    onImportsUpdated(updated);
    setFreshImport(product);
  };

  const tabs: { id: UploadTab; label: string; icon: React.ReactNode }[] = [
    {
      id: "gallery",
      label: "Upload",
      icon: <Upload className="w-3.5 h-3.5" />,
    },
    { id: "camera", label: "Camera", icon: <Camera className="w-3.5 h-3.5" /> },
    {
      id: "link",
      label: "Paste Link",
      icon: <Link2 className="w-3.5 h-3.5" />,
    },
  ];

  return (
    <div className="max-w-[430px] mx-auto px-4 pt-6 pb-8 animate-slide-up">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 text-sm text-muted-foreground mb-6 hover:text-foreground transition-colors"
        data-ocid="upload.link"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h2 className="text-2xl font-black mb-1">Get Started</h2>
      <p className="text-muted-foreground text-sm mb-5">
        Upload your photo or import a product link
      </p>

      {/* Tab switcher */}
      <div className="flex bg-muted rounded-2xl p-1 mb-6 gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              setActiveTab(tab.id);
              setFreshImport(null);
            }}
            className={`flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2.5 rounded-xl transition-all ${
              activeTab === tab.id
                ? "gradient-lavender-pink text-white shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
            data-ocid="upload.tab"
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Gallery / Camera tab ─────────────────── */}
      {(activeTab === "gallery" || activeTab === "camera") && (
        <>
          {preview ? (
            <div className="relative rounded-3xl overflow-hidden shadow-float mb-6">
              <img
                src={preview}
                alt="Selected portrait for try-on"
                className="w-full object-cover max-h-80"
              />
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center text-white hover:bg-black/70 transition-colors"
                data-ocid="upload.delete_button"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-3 left-3 bg-green-accent/20 border border-green-accent/40 text-green-accent text-xs font-semibold px-3 py-1 rounded-full backdrop-blur-sm">
                ✓ Ready
              </div>
            </div>
          ) : (
            <button
              type="button"
              onDrop={handleDrop}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`w-full border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all mb-6 ${
                isDragging
                  ? "border-primary bg-primary/5 scale-[0.99]"
                  : "border-border hover:border-primary/50 hover:bg-muted/50"
              }`}
              data-ocid="upload.dropzone"
            >
              <div className="w-16 h-16 rounded-2xl gradient-lavender-pink flex items-center justify-center mx-auto mb-4">
                {activeTab === "camera" ? (
                  <Camera className="w-8 h-8 text-white" />
                ) : (
                  <ImagePlus className="w-8 h-8 text-white" />
                )}
              </div>
              <p className="font-semibold mb-1">
                {activeTab === "camera" ? "Open camera" : "Drop your file here"}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                or click to browse
              </p>
              <p className="text-xs text-muted-foreground">
                JPG, PNG, WEBP up to 10MB
              </p>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture={activeTab === "camera" ? "environment" : undefined}
            onChange={handleFileChange}
            className="hidden"
            data-ocid="upload.input"
          />

          <div className="space-y-3">
            {preview ? (
              <Button
                onClick={() => {
                  if (preview) onPhotoUploaded(preview);
                }}
                className="w-full pill gradient-lavender-pink border-0 text-white font-bold h-12 text-base hover:opacity-90 transition-opacity"
                data-ocid="upload.primary_button"
              >
                Select Outfit →
              </Button>
            ) : (
              <Button
                onClick={() => fileInputRef.current?.click()}
                className="w-full pill gradient-lavender-pink border-0 text-white font-bold h-12 text-base hover:opacity-90 transition-opacity"
                data-ocid="upload.upload_button"
              >
                {activeTab === "camera" ? (
                  <>
                    <Camera className="w-5 h-5 mr-2" /> Take a Photo
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5 mr-2" /> Upload from Gallery
                  </>
                )}
              </Button>
            )}
          </div>

          <div className="mt-6 bg-muted/50 rounded-2xl p-4">
            <p className="text-xs font-semibold mb-2">
              📸 Tips for best results
            </p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              <li>• Stand against a plain background</li>
              <li>• Full body visible from head to toe</li>
              <li>• Good lighting, no shadows</li>
              <li>• Wear fitted clothing for accurate mapping</li>
            </ul>
          </div>
        </>
      )}

      {/* ── Paste Link tab ─────────────────────── */}
      {activeTab === "link" && (
        <div className="space-y-6">
          <PasteLinkInput onImported={handleImported} />

          {/* Freshly imported product */}
          {freshImport && (
            <div className="animate-slide-up">
              <p className="text-xs font-semibold text-green-accent mb-2">
                ✓ Imported successfully!
              </p>
              <ImportedProductCard
                product={freshImport}
                onTryOn={onImportedProductTryOn}
                index={0}
              />
            </div>
          )}

          {/* Recent imports */}
          {recentImports.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-bold">Recent Imports</p>
                <span className="text-xs text-muted-foreground">
                  {recentImports.length}/5
                </span>
              </div>
              <div className="space-y-3">
                {recentImports.map((imp, i) => (
                  <ImportedProductCard
                    key={imp.id}
                    product={imp}
                    onTryOn={onImportedProductTryOn}
                    onRemove={(id) => {
                      const filtered = recentImports.filter((p) => p.id !== id);
                      localStorage.setItem(
                        "fittry_imports",
                        JSON.stringify(filtered),
                      );
                      onImportsUpdated(filtered);
                      if (freshImport?.id === id) setFreshImport(null);
                    }}
                    index={i}
                  />
                ))}
              </div>
            </div>
          )}

          {recentImports.length === 0 && !freshImport && (
            <div
              className="text-center py-8 text-muted-foreground"
              data-ocid="imports.empty_state"
            >
              <Link2 className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No imports yet</p>
              <p className="text-xs mt-0.5">
                Paste a product link above to get started
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
