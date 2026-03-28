import { ExternalLink, ShoppingBag, Sparkles, Trash2 } from "lucide-react";
import { PLATFORM_META } from "../data/ecommerce";
import type { ImportedProduct } from "../types";

interface ImportedProductCardProps {
  product: ImportedProduct;
  onTryOn: (product: ImportedProduct) => void;
  onRemove?: (id: string) => void;
  compact?: boolean;
  index?: number;
}

export default function ImportedProductCard({
  product,
  onTryOn,
  onRemove,
  compact = false,
  index = 0,
}: ImportedProductCardProps) {
  const meta = PLATFORM_META[product.platform];

  return (
    <div
      className="rounded-2xl border border-border bg-card overflow-hidden transition-all duration-200 hover:border-primary/30 hover:shadow-float"
      data-ocid={`imports.item.${index + 1}`}
    >
      {/* Coloured image placeholder */}
      <div
        className="relative w-full aspect-[4/3] flex flex-col items-center justify-center gap-2"
        style={{ background: `${product.color}18` }}
      >
        {/* Platform badge */}
        <div
          className="absolute top-2 left-2 flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full"
          style={{
            background: product.color,
            color: "#fff",
          }}
        >
          {meta.emoji} {product.badge}
        </div>

        {/* Big emoji center */}
        <span className="text-5xl">{meta.emoji}</span>
        <span
          className="text-xs font-semibold"
          style={{ color: product.color }}
        >
          {product.badge} Fashion
        </span>

        {/* Remove button */}
        {onRemove && !compact && (
          <button
            type="button"
            onClick={() => onRemove(product.id)}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/30 text-white/80 hover:bg-black/60 flex items-center justify-center transition-colors"
            data-ocid={`imports.delete_button.${index + 1}`}
          >
            <Trash2 className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className={compact ? "px-3 py-2" : "px-3 pb-3 pt-2"}>
        <p className="font-semibold text-sm leading-tight truncate">
          {product.name}
        </p>
        <p
          className="text-base font-black mt-0.5"
          style={{ color: product.color }}
        >
          {product.price}
        </p>

        {!compact && (
          <div className="flex gap-2 mt-3">
            <button
              type="button"
              onClick={() => onTryOn(product)}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl gradient-lavender-pink text-white hover:opacity-90 transition-opacity"
              data-ocid={`imports.primary_button.${index + 1}`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Try On
            </button>
            <a
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs font-bold py-2 rounded-xl border border-border hover:border-primary/40 hover:bg-primary/5 transition-all"
              data-ocid={`imports.secondary_button.${index + 1}`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Buy Now
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
