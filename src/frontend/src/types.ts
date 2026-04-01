export type Platform = "Amazon" | "Myntra" | "Flipkart" | "Ajio";
export type Gender = "Women" | "Men";
export type Category =
  | "All"
  | "Casual"
  | "Formal"
  | "Traditional"
  | "Western"
  | "Sports"
  | "Party";

export interface Outfit {
  id: string;
  name: string;
  brand: string;
  price: string;
  category: Category;
  gender: Gender;
  emoji: string;
  color: string;
}

export type Screen =
  | "home"
  | "tryon"
  | "favorites"
  | "gallery"
  | "more"
  | "server"
  | "videogen";
