import { Input } from "@/components/ui/input";
import { Link2, Loader2, X } from "lucide-react";
import { useRef, useState } from "react";
import { mockProductFromUrl } from "../data/ecommerce";
import type { ImportedProduct } from "../types";

interface PasteLinkInputProps {
  onImported: (product: ImportedProduct) => void;
}

export default function PasteLinkInput({ onImported }: PasteLinkInputProps) {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleImport = () => {
    const trimmed = url.trim();
    if (!trimmed) return;
    const mock = mockProductFromUrl(trimmed);
    if (!mock) {
      setError("Paste a link from Amazon, Myntra, Flipkart, or Ajio.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const product: ImportedProduct = {
        ...mock,
        id: `import_${Date.now()}`,
        importedAt: Date.now(),
      };
      onImported(product);
      setUrl("");
    }, 1500);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleImport();
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Link2 className="w-4 h-4" />
          )}
        </div>
        <Input
          ref={inputRef}
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Paste Amazon, Myntra, Flipkart or Ajio link…"
          disabled={loading}
          className="pl-9 pr-9 rounded-2xl h-12 bg-muted border-border text-sm placeholder:text-muted-foreground/60 focus-visible:ring-primary"
          data-ocid="paste-link.input"
        />
        {url && !loading && (
          <button
            type="button"
            onClick={() => {
              setUrl("");
              setError(null);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="paste-link.delete_button"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {error && (
        <p
          className="text-xs text-destructive flex items-center gap-1"
          data-ocid="paste-link.error_state"
        >
          <span>⚠</span> {error}
        </p>
      )}

      {/* Platform hint chips */}
      <div className="flex gap-2 flex-wrap">
        {(
          [
            { label: "Amazon", color: "#FF9900" },
            { label: "Myntra", color: "#FF3F6C" },
            { label: "Flipkart", color: "#2874F0" },
            { label: "AJIO", color: "#E31B23" },
          ] as const
        ).map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => {
              const demo =
                p.label === "Amazon"
                  ? "https://amazon.in/dp/demo"
                  : p.label === "Myntra"
                    ? "https://myntra.com/product/demo"
                    : p.label === "Flipkart"
                      ? "https://flipkart.com/item/demo"
                      : "https://ajio.com/item/demo";
              setUrl(demo);
              setError(null);
              inputRef.current?.focus();
            }}
            className="flex items-center gap-1 text-[10px] font-semibold px-2.5 py-1 rounded-full border transition-all hover:opacity-80"
            style={{
              borderColor: `${p.color}50`,
              color: p.color,
              background: `${p.color}15`,
            }}
            data-ocid="paste-link.tab"
          >
            {p.label}
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={handleImport}
        disabled={!url.trim() || loading}
        className="w-full pill gradient-lavender-pink border-0 text-white font-bold h-11 text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        data-ocid="paste-link.primary_button"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" /> Importing…
          </>
        ) : (
          <>Import Outfit</>
        )}
      </button>
    </div>
  );
}
