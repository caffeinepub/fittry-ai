import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Bot,
  Check,
  Code2,
  CreditCard,
  ExternalLink,
  Globe,
  Link2,
  Mail,
  ShoppingBag,
  Smartphone,
  Star,
  Tag,
  TrendingUp,
  Zap,
} from "lucide-react";
import { motion } from "motion/react";
import type { AppState } from "../types";

interface SalesPageProps {
  onBack: () => void;
  onNavigate: (page: AppState) => void;
}

const highlights = [
  {
    icon: Bot,
    label: "AI-Powered Try-On",
    desc: "Realistic body mapping & cloth fitting",
  },
  {
    icon: ShoppingBag,
    label: "4 Platforms Integrated",
    desc: "Amazon, Myntra, Flipkart, Ajio",
  },
  {
    icon: CreditCard,
    label: "Freemium Monetization",
    desc: "Built-in premium upgrade flow",
  },
  {
    icon: Link2,
    label: "Affiliate Revenue",
    desc: "Ready-to-use affiliate link system",
  },
  {
    icon: Smartphone,
    label: "Mobile-First PWA",
    desc: "Install on Android/iOS like a native app",
  },
  {
    icon: Code2,
    label: "Full Source Code",
    desc: "React + Motoko, ready to deploy",
  },
];

const included = [
  "Complete source code (React + Motoko)",
  "AI try-on simulation engine",
  "Amazon, Myntra, Flipkart, Ajio integrations",
  "Premium subscription upgrade flow",
  "HD download upsell system",
  "Affiliate link infrastructure",
  "Deployed & live on Internet Computer",
  "Mobile-first PWA (installable)",
  "Dark & light mode themes",
  "Product import via URL paste",
];

const stats = [
  { value: "4", label: "E-commerce platforms" },
  { value: "3s", label: "Avg try-on speed" },
  { value: "HD", label: "Output quality" },
  { value: "∞", label: "Scalability on ICP" },
];

export default function SalesPage({ onBack, onNavigate }: SalesPageProps) {
  const mailtoLink = `mailto:?subject=${encodeURIComponent("Interested in buying FitTry AI")}&body=${encodeURIComponent("Hi, I am interested in purchasing FitTry AI. Please share more details.")}`;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-[430px] px-4 pb-16">
        {/* Back button */}
        <div className="pt-4 pb-2">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-ocid="sales.link"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to App
          </button>
        </div>

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="py-8 text-center"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4 border border-primary/20">
            <Star className="w-3 h-3 fill-primary" />
            Premium AI App — For Sale
          </div>
          <h1 className="text-3xl font-bold mb-3 leading-tight">
            <span className="gradient-text">FitTry AI</span>
            <br />
            <span className="text-foreground">is For Sale</span>
          </h1>
          <p className="text-muted-foreground text-sm leading-relaxed mb-2">
            Own a ready-to-launch AI fashion app. Let users virtually try on
            clothes before they buy — a complete, live product with monetization
            built in.
          </p>
          <p className="text-xs text-muted-foreground/70">
            Live on Internet Computer · No server costs · Full ownership
            transfer
          </p>
        </motion.div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-4 gap-2 mb-6"
        >
          {stats.map((s) => (
            <div
              key={s.label}
              className="bg-card border border-border rounded-xl p-3 text-center"
            >
              <div className="text-lg font-bold gradient-text">{s.value}</div>
              <div className="text-[10px] text-muted-foreground leading-tight mt-0.5">
                {s.label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Highlights grid */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            What You Get
          </h2>
          <div className="grid grid-cols-2 gap-3">
            {highlights.map((h, i) => (
              <motion.div
                key={h.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: 0.2 + i * 0.05 }}
                className="bg-card border border-border rounded-xl p-3.5"
                data-ocid={`sales.item.${i + 1}`}
              >
                <div className="w-8 h-8 rounded-lg gradient-lavender-pink flex items-center justify-center mb-2">
                  <h.icon className="w-4 h-4 text-white" />
                </div>
                <div className="text-xs font-semibold mb-0.5">{h.label}</div>
                <div className="text-[11px] text-muted-foreground">
                  {h.desc}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* What's included checklist */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="mb-6"
        >
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
            What's Included
          </h2>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-2.5">
            {included.map((item) => (
              <div key={item} className="flex items-start gap-2.5">
                <div className="w-4 h-4 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-2.5 h-2.5 text-primary" />
                </div>
                <span className="text-sm">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Asking price */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-6"
        >
          <div className="relative overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-pink-accent/10 p-5">
            <div className="absolute top-3 right-3">
              <Tag className="w-5 h-5 text-primary/40" />
            </div>
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Asking Price
              </span>
            </div>
            <div className="text-2xl font-bold gradient-text mb-1">
              ₹15,000 – ₹50,000
            </div>
            <div className="text-sm text-muted-foreground mb-3">
              $200 – $600 USD · Negotiable
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                <Zap className="w-2.5 h-2.5" /> Instant handover
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] bg-primary/10 text-primary px-2 py-1 rounded-full border border-primary/20">
                <Globe className="w-2.5 h-2.5" /> Already live & deployed
              </span>
            </div>
          </div>
        </motion.div>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
          className="space-y-3"
        >
          <a href={mailtoLink} className="block">
            <Button
              className="w-full pill gradient-lavender-pink border-0 text-white font-semibold text-sm h-12 hover:opacity-90 transition-opacity"
              data-ocid="sales.primary_button"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact to Buy
            </Button>
          </a>
          <Button
            variant="outline"
            className="w-full pill border-border text-foreground font-semibold text-sm h-12 hover:bg-muted transition-colors"
            onClick={() => onNavigate("home")}
            data-ocid="sales.secondary_button"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Live Demo
          </Button>
        </motion.div>

        {/* Footer note */}
        <p className="text-center text-xs text-muted-foreground/60 mt-8">
          Price is negotiable. Contact via email to discuss terms, transfer
          process, and support.
        </p>
      </div>
    </div>
  );
}
