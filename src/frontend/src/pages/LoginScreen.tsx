import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function LoginScreen() {
  const { login } = useLocalAuth();
  const [mode, setMode] = useState<"email" | "mobile">("mobile");
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const startCooldown = () => {
    setCooldown(30);
    timerRef.current = setInterval(() => {
      setCooldown((c) => {
        if (c <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return c - 1;
      });
    }, 1000);
  };

  const handleGetOTP = () => {
    setError("");
    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }
    if (mode === "email" && !/^[^@]+@[^@]+\.[^@]+$/.test(contact)) {
      setError("Enter a valid email address.");
      return;
    }
    if (mode === "mobile" && !/^\d{10}$/.test(contact)) {
      setError("Enter a valid 10-digit mobile number.");
      return;
    }
    const generated = generateOTP();
    setOtp(generated);
    setStep("otp");
    startCooldown();
  };

  const handleVerify = () => {
    if (otpInput === otp) {
      login({ name: name.trim(), contact, contactType: mode });
    } else {
      setError("Incorrect OTP. Please try again.");
    }
  };

  const handleResend = () => {
    const generated = generateOTP();
    setOtp(generated);
    setOtpInput("");
    setError("");
    startCooldown();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] px-6 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-violet-600/10 blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 rounded-full bg-violet-800/10 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-sm"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-violet-600/20 border border-violet-500/30 mb-4">
            <span className="text-4xl">👗</span>
          </div>
          <h1 className="text-3xl font-bold font-display text-white mb-1">
            FitTry AI
          </h1>
          <p className="text-slate-400 text-sm">Virtual Try-On Powered by AI</p>
        </div>

        <AnimatePresence mode="wait">
          {step === "form" ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-4"
            >
              <div className="flex bg-slate-800/60 rounded-2xl p-1 border border-slate-700/50">
                <button
                  type="button"
                  onClick={() => {
                    setMode("mobile");
                    setContact("");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    mode === "mobile"
                      ? "bg-violet-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                  data-ocid="login.tab"
                >
                  📱 Mobile
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMode("email");
                    setContact("");
                    setError("");
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    mode === "email"
                      ? "bg-violet-600 text-white shadow-lg"
                      : "text-slate-400 hover:text-white"
                  }`}
                  data-ocid="login.tab"
                >
                  ✉️ Email
                </button>
              </div>

              <Input
                placeholder="Your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-500 h-12 rounded-xl"
                data-ocid="login.input"
              />

              <Input
                placeholder={
                  mode === "mobile" ? "10-digit mobile number" : "Email address"
                }
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                type={mode === "email" ? "email" : "tel"}
                inputMode={mode === "mobile" ? "numeric" : "email"}
                maxLength={mode === "mobile" ? 10 : undefined}
                className="bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-500 h-12 rounded-xl"
                data-ocid="login.input"
              />

              {error && (
                <p
                  className="text-red-400 text-sm"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-base"
                onClick={handleGetOTP}
                data-ocid="login.submit_button"
              >
                Get OTP →
              </Button>
            </motion.div>
          ) : (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-4"
            >
              <div className="bg-slate-800/60 border border-green-500/30 rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-slate-400 text-xs">
                    OTP sent to {contact}
                  </span>
                  <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-1 rounded-full border border-green-500/30">
                    ✓ DLT APPROVED
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-slate-500 text-xs mb-1">
                    Your verification code
                  </p>
                  <p className="text-3xl font-bold font-display tracking-widest text-white">
                    {otp}
                  </p>
                </div>
              </div>

              <Input
                placeholder="Enter 6-digit OTP"
                value={otpInput}
                onChange={(e) => setOtpInput(e.target.value)}
                inputMode="numeric"
                maxLength={6}
                className="bg-slate-800/60 border-slate-700/50 text-white placeholder:text-slate-500 h-12 rounded-xl text-center text-2xl tracking-widest"
                data-ocid="login.input"
              />

              {error && (
                <p
                  className="text-red-400 text-sm"
                  data-ocid="login.error_state"
                >
                  {error}
                </p>
              )}

              <Button
                className="w-full h-12 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-semibold text-base"
                onClick={handleVerify}
                data-ocid="login.submit_button"
              >
                Verify & Login
              </Button>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    setStep("form");
                    setError("");
                  }}
                  className="text-slate-400 text-sm hover:text-white"
                >
                  ← Change {mode === "mobile" ? "number" : "email"}
                </button>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={cooldown > 0}
                  className="text-violet-400 text-sm disabled:text-slate-500"
                  data-ocid="login.button"
                >
                  {cooldown > 0 ? `Resend in ${cooldown}s` : "Resend OTP"}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
