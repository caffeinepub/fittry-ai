import type { EcommPlatform, ImportedProduct } from "../types";

export const PLATFORM_META: Record<
  EcommPlatform,
  {
    badge: string;
    color: string;
    emoji: string;
    products: { name: string; price: string }[];
  }
> = {
  amazon: {
    badge: "Amazon",
    color: "#FF9900",
    emoji: "📦",
    products: [
      { name: "Amazon Fashion Ethnic Wear", price: "₹1,299" },
      { name: "Amazon Basics Casual Shirt", price: "₹999" },
      { name: "Amazon Fashion Printed Kurta", price: "₹1,149" },
      { name: "Amazon Exclusive Denim Jacket", price: "₹1,799" },
    ],
  },
  myntra: {
    badge: "Myntra",
    color: "#FF3F6C",
    emoji: "🛍️",
    products: [
      { name: "Myntra Trending Kurta Set", price: "₹899" },
      { name: "Myntra Studio Coord Set", price: "₹1,399" },
      { name: "Myntra Floral Maxi Dress", price: "₹1,099" },
      { name: "Myntra Active Jogger Set", price: "₹749" },
    ],
  },
  flipkart: {
    badge: "Flipkart",
    color: "#2874F0",
    emoji: "⚡",
    products: [
      { name: "Flipkart Exclusive Dress", price: "₹749" },
      { name: "Flipkart Trendy Palazzo Set", price: "₹649" },
      { name: "Flipkart Fashion Anarkali", price: "₹999" },
      { name: "Flipkart Premium Blazer", price: "₹1,599" },
    ],
  },
  ajio: {
    badge: "AJIO",
    color: "#E31B23",
    emoji: "✨",
    products: [
      { name: "AJIO Studio Co-ord Set", price: "₹1,599" },
      { name: "AJIO Originals Boho Dress", price: "₹1,299" },
      { name: "AJIO Luxe Embroidered Top", price: "₹1,899" },
      { name: "AJIO Classic Linen Suit", price: "₹2,199" },
    ],
  },
};

export function detectPlatform(url: string): EcommPlatform | null {
  const lower = url.toLowerCase();
  if (lower.includes("amazon")) return "amazon";
  if (lower.includes("myntra")) return "myntra";
  if (lower.includes("flipkart")) return "flipkart";
  if (lower.includes("ajio")) return "ajio";
  return null;
}

/** Extract a slug hint from the URL path to vary product names */
function slugHint(url: string): number {
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    hash = (hash * 31 + url.charCodeAt(i)) & 0xffffffff;
  }
  return Math.abs(hash);
}

export function mockProductFromUrl(
  url: string,
): Omit<ImportedProduct, "id" | "importedAt"> | null {
  const platform = detectPlatform(url);
  if (!platform) return null;
  const meta = PLATFORM_META[platform];
  const idx = slugHint(url) % meta.products.length;
  const product = meta.products[idx];
  return {
    url,
    platform,
    name: product.name,
    price: product.price,
    badge: meta.badge,
    color: meta.color,
  };
}

const LS_KEY = "fittry_imports";

export function loadImports(): ImportedProduct[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as ImportedProduct[]) : [];
  } catch {
    return [];
  }
}

export function saveImport(product: ImportedProduct): ImportedProduct[] {
  const existing = loadImports().filter((p) => p.url !== product.url);
  const updated = [product, ...existing].slice(0, 5);
  localStorage.setItem(LS_KEY, JSON.stringify(updated));
  return updated;
}
