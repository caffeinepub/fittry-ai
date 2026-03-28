export type AppState =
  | "home"
  | "upload"
  | "outfit-selector"
  | "processing"
  | "result"
  | "sales";

export interface Outfit {
  id: string;
  name: string;
  category: string;
  brand: string;
  price: string;
  image: string | null;
  aiMatch?: number;
  source?: "myntra" | "amazon" | "flipkart" | "ajio";
  buyLink?: string;
}

export interface FreemiumState {
  triesUsed: number;
  date: string;
  isPremium: boolean;
}

export type EcommPlatform = "amazon" | "myntra" | "flipkart" | "ajio";

export interface ImportedProduct {
  id: string;
  url: string;
  platform: EcommPlatform;
  name: string;
  price: string;
  badge: string;
  color: string;
  importedAt: number;
}
