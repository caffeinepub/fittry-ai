import { BarChart3, Info, Shield, Sparkles, Star } from "lucide-react";
import { motion } from "motion/react";

const STAR_KEYS = ["s1", "s2", "s3", "s4", "s5"];

interface MoreScreenProps {
  tryOnsCompleted: number;
  outfitsSaved: number;
}

export default function MoreScreen({
  tryOnsCompleted,
  outfitsSaved,
}: MoreScreenProps) {
  const year = new Date().getFullYear();

  return (
    <div className="min-h-screen pb-24">
      <header
        className="sticky top-0 z-40 px-4 py-3 flex items-center"
        style={{
          background: "oklch(0.10 0.015 240 / 0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid oklch(0.22 0.022 240 / 0.4)",
        }}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl gradient-blue flex items-center justify-center">
            <Sparkles size={16} className="text-white" />
          </div>
          <span className="font-display font-bold text-lg">More</span>
        </div>
      </header>

      <div className="px-4 pt-6 space-y-5">
        {/* App Identity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl p-6 text-center"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.14 0.018 240) 0%, oklch(0.17 0.025 240) 100%)",
            border: "1px solid oklch(0.30 0.04 265 / 0.4)",
          }}
        >
          <div className="w-20 h-20 rounded-3xl gradient-blue flex items-center justify-center mx-auto mb-4 shadow-glow-blue">
            <Sparkles size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold gradient-blue-text">
            FitTry AI
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Version 1.0.0</p>
          <p className="text-sm text-foreground/80 mt-3 leading-relaxed max-w-xs mx-auto">
            The AI-powered virtual try-on app that lets you see how any outfit
            looks on you before buying.
          </p>
          <div className="flex items-center justify-center gap-1 mt-4">
            {STAR_KEYS.map((k) => (
              <Star
                key={k}
                size={14}
                className="fill-yellow-400 text-yellow-400"
              />
            ))}
            <span className="text-xs text-muted-foreground ml-1">
              5.0 &#183; 100% Free
            </span>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-2xl p-5"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 size={16} className="text-primary" />
            <h3 className="font-semibold">Your Stats</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "oklch(0.17 0.02 240)",
                border: "1px solid oklch(0.22 0.022 240 / 0.5)",
              }}
            >
              <p className="text-3xl font-display font-bold gradient-blue-text">
                {tryOnsCompleted}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Try-Ons Done</p>
            </div>
            <div
              className="rounded-xl p-3 text-center"
              style={{
                background: "oklch(0.17 0.02 240)",
                border: "1px solid oklch(0.22 0.022 240 / 0.5)",
              }}
            >
              <p className="text-3xl font-display font-bold gradient-blue-text">
                {outfitsSaved}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Outfits Saved
              </p>
            </div>
          </div>
        </motion.div>

        {/* About */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl p-5 space-y-3"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <div className="flex items-center gap-2 mb-1">
            <Info size={16} className="text-primary" />
            <h3 className="font-semibold">About FitTry AI</h3>
          </div>
          {[
            {
              title: "AI-Powered Try-On",
              desc: "Advanced body mapping and outfit rendering technology for realistic results.",
            },
            {
              title: "12+ Outfit Brands",
              desc: "Trending outfits from Amazon, Myntra, Flipkart, Ajio and more.",
            },
            {
              title: "Completely Free",
              desc: "Every feature, every outfit, every try-on \u2014 100% free, forever.",
            },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Privacy */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl p-4 flex items-center gap-3"
          style={{
            background: "oklch(0.14 0.018 240)",
            border: "1px solid oklch(0.22 0.022 240 / 0.5)",
          }}
        >
          <Shield size={18} className="text-green-400 flex-shrink-0" />
          <div>
            <p className="text-sm font-semibold">Privacy First</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Your photos are processed locally and never stored on our servers.
            </p>
          </div>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-center pt-2 pb-4"
        >
          <p className="text-xs text-muted-foreground">
            &#169; {year}. Built with &#10084;&#65039; using{" "}
            <a
              href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              caffeine.ai
            </a>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
