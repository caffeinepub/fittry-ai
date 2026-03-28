import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Check, Crown, X } from "lucide-react";

interface PremiumModalProps {
  open: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const BENEFITS = [
  "Unlimited Try-Ons",
  "HD Downloads",
  "AI Style Suggestions",
  "Priority Processing",
  "Exclusive Designer Collections",
];

export default function PremiumModal({
  open,
  onClose,
  onUpgrade,
}: PremiumModalProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-[380px] mx-auto rounded-3xl border-border bg-card p-0 overflow-hidden"
        data-ocid="premium.modal"
      >
        <div className="gradient-lavender-pink p-6 text-center relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            data-ocid="premium.close_button"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-3">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-white text-xl font-bold">
              FitTry Pro
            </DialogTitle>
          </DialogHeader>
          <p className="text-white/80 text-sm mt-1">
            You've used all your free tries today
          </p>
        </div>

        <div className="p-6">
          <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Everything in Pro
          </p>
          <ul className="space-y-3 mb-6">
            {BENEFITS.map((b) => (
              <li key={b} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-green-accent/20 border border-green-accent/40 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3 h-3 text-green-accent" />
                </span>
                <span className="text-sm">{b}</span>
              </li>
            ))}
          </ul>

          <div className="text-center mb-4">
            <div className="flex items-baseline justify-center gap-1">
              <span className="text-3xl font-black">$9.99</span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Cancel anytime
            </p>
          </div>

          <Button
            onClick={onUpgrade}
            className="w-full pill gradient-lavender-pink border-0 text-white font-bold text-base h-12 hover:opacity-90 transition-opacity"
            data-ocid="premium.confirm_button"
          >
            Go Pro Now 🚀
          </Button>
          <button
            type="button"
            onClick={onClose}
            className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors"
            data-ocid="premium.cancel_button"
          >
            Maybe later
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
