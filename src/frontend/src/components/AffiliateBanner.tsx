import { ExternalLink, ShoppingBag } from "lucide-react";
import type { ImportedProduct } from "../types";

interface AffiliateBannerProps {
  product: ImportedProduct;
}

export default function AffiliateBanner({ product }: AffiliateBannerProps) {
  return (
    <div
      className="rounded-2xl border overflow-hidden mb-4"
      style={{ borderColor: `${product.color}40` }}
      data-ocid="affiliate.banner"
    >
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{ background: `${product.color}12` }}
      >
        {/* Left */}
        <div className="flex-1 min-w-0">
          <p className="text-xs text-muted-foreground">Love this look?</p>
          <p className="text-sm font-bold truncate">{product.name}</p>
          <p className="text-base font-black" style={{ color: product.color }}>
            {product.price}
          </p>
        </div>

        {/* CTA */}
        <a
          href={product.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-xs font-bold px-4 py-2.5 rounded-xl text-white whitespace-nowrap flex-shrink-0 hover:opacity-90 transition-opacity"
          style={{ background: product.color }}
          data-ocid="affiliate.primary_button"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          Shop on {product.badge}
          <ExternalLink className="w-3 h-3 opacity-80" />
        </a>
      </div>

      {/* Affiliate disclaimer */}
      <div className="px-4 py-1 bg-muted/30">
        <p className="text-[9px] text-muted-foreground/60 italic">
          Affiliate link — we may earn a commission at no extra cost to you.
        </p>
      </div>
    </div>
  );
}
