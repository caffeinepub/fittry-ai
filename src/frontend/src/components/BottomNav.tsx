import { Heart, Home, MoreHorizontal, Scissors } from "lucide-react";
import type { Screen } from "../types";

interface BottomNavProps {
  active: Screen;
  onChange: (screen: Screen) => void;
}

const navItems: {
  screen: Screen;
  icon: React.ReactNode;
  label: string;
  ocid: string;
}[] = [
  {
    screen: "home",
    icon: <Home size={22} />,
    label: "Home",
    ocid: "nav.home.link",
  },
  {
    screen: "tryon",
    icon: <Scissors size={22} />,
    label: "Try On",
    ocid: "nav.tryon.link",
  },
  {
    screen: "favorites",
    icon: <Heart size={22} />,
    label: "Favorites",
    ocid: "nav.favorites.link",
  },
  {
    screen: "more",
    icon: <MoreHorizontal size={22} />,
    label: "More",
    ocid: "nav.more.link",
  },
];

export default function BottomNav({ active, onChange }: BottomNavProps) {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{
        background: "oklch(0.12 0.016 240 / 0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid oklch(0.22 0.022 240 / 0.6)",
      }}
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-16 px-2">
        {navItems.map((item) => {
          const isActive = active === item.screen;
          return (
            <button
              type="button"
              key={item.screen}
              data-ocid={item.ocid}
              onClick={() => onChange(item.screen)}
              className={`flex flex-col items-center gap-0.5 flex-1 py-2 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <span
                className={`transition-all duration-200 ${isActive ? "scale-110" : "scale-100"}`}
              >
                {item.icon}
              </span>
              <span
                className={`text-[10px] font-semibold tracking-wide ${isActive ? "opacity-100" : "opacity-70"}`}
              >
                {item.label}
              </span>
              {isActive && (
                <span className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
