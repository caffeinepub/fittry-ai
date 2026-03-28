import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Moon, Sparkles, Sun, Zap } from "lucide-react";
import type { AppState } from "../types";

interface HeaderProps {
  theme: "dark" | "light";
  onToggleTheme: () => void;
  onNavigate: (page: AppState) => void;
  triesLeft: number;
  isPremium: boolean;
  onUpgrade: () => void;
}

export default function Header({
  theme,
  onToggleTheme,
  onNavigate,
  triesLeft,
  isPremium,
  onUpgrade,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="mx-auto max-w-[430px] px-4 h-14 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="flex items-center gap-2 font-bold text-lg"
          data-ocid="nav.link"
        >
          <div className="w-7 h-7 rounded-lg gradient-lavender-pink flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="gradient-text">FitTry AI</span>
        </button>

        <div className="flex items-center gap-2">
          {!isPremium && (
            <button
              type="button"
              onClick={onUpgrade}
              className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 transition-colors"
              data-ocid="header.upgrade_button"
            >
              <Zap className="w-3 h-3" />
              <span>{triesLeft}/3</span>
            </button>
          )}
          {isPremium && (
            <Badge className="text-xs bg-gradient-to-r from-lavender to-pink-accent text-white border-0 pill px-2.5">
              PRO
            </Badge>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleTheme}
            className="w-8 h-8"
            data-ocid="header.toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-4 h-4" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </Button>

          <Button
            size="sm"
            onClick={() => onNavigate("upload")}
            className="pill text-xs px-4 gradient-lavender-pink border-0 text-white font-semibold hover:opacity-90 transition-opacity"
            data-ocid="header.primary_button"
          >
            Try Free
          </Button>
        </div>
      </div>
    </header>
  );
}
