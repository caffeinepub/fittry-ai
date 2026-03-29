export type Platform = "Amazon" | "Myntra" | "Flipkart" | "Ajio";

export interface Outfit {
  id: string;
  name: string;
  brand: string;
  platform: Platform;
  price: string;
  image: string;
  category: string;
  tags: string[];
}

export interface TryOnResult {
  outfitId: string;
  userPhoto: string;
  resultImage: string;
  timestamp: number;
}

export type Screen = "home" | "tryon" | "favorites" | "more";
