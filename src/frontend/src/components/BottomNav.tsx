import { Grid3X3, Heart, Home, Menu, ShoppingBag } from "lucide-react";
import type { Screen } from "../types";

interface Props {
  active: Screen;
  onChange: (screen: Screen) => void;
}

interface NavItem {
  id: Screen;
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "tryon", label: "Try On", icon: ShoppingBag },
  { id: "gallery", label: "Gallery", icon: Grid3X3 },
  { id: "favorites", label: "Saved", icon: Heart },
  { id: "more", label: "More", icon: Menu },
];

export default function BottomNav({ active, onChange }: Props) {
  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-slate-900/95 backdrop-blur-xl border-t border-slate-800/60 z-40">
      <div className="flex items-stretch h-16">
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onChange(item.id)}
              className={`flex-1 flex flex-col items-center justify-center gap-1 transition-all relative ${
                isActive
                  ? "text-violet-400"
                  : "text-slate-500 hover:text-slate-300"
              }`}
              data-ocid={`nav.${item.id}.link`}
            >
              <item.icon
                className={`w-5 h-5 transition-transform ${isActive ? "scale-110" : ""}`}
              />
              <span className="text-[10px] font-semibold">{item.label}</span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-violet-400" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
