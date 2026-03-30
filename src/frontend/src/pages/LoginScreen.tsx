import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  ArrowLeft,
  CheckCircle2,
  Mail,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { useLocalAuth } from "../hooks/useLocalAuth";

type LoginMethod = "email" | "mobile";

function isValidEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e);
}
function isValidMobile(m: string) {
  return /^\d{10}$/.test(m);
}
function generateOTP(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function LoginScreen() {
  const { login } = useLocalAuth();
  const [isSignup, setIsSignup] = useState(true);
  const [method, setMethod] = useState<LoginMethod>("email");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [mobile, setMobile] = useState("");
  const [error, setError] = useState("");

  const [step, setStep] = useState<"form" | "otp">("form");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const validate = () => {
    if (isSignup && !name.trim()) {
      setError("Full name is required");
      return false;
    }
    if (method === "email" && !isValidEmail(email)) {
      setError("Enter a valid email address");
      return false;
    }
    if (method === "mobile" && !isValidMobile(mobile)) {
      setError("Enter a valid 10-digit mobile number");
      return false;
    }
    setError("");
    return true;
  };

  const handleSubmit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setOtpInput("");
    setOtpError("");
    setResendCooldown(30);
    setStep("otp");
  };

  const handleVerifyOtp = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (otpInput.trim() === generatedOtp) {
      login({
        name: isSignup
          ? name.trim()
          : method === "email"
            ? email.split("@")[0]
            : `User_${mobile.slice(-4)}`,
        email: method === "email" ? email.trim() : `${mobile}@mobile.app`,
        mobile: method === "mobile" ? mobile.trim() : "",
      });
    } else {
      setOtpError("Invalid OTP. Please try again.");
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    const otp = generateOTP();
    setGeneratedOtp(otp);
    setOtpInput("");
    setOtpError("");
    setResendCooldown(30);
  };

  const contactDisplay = method === "email" ? email : mobile;

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-10"
      style={{ background: "oklch(0.08 0.015 240)" }}
    >
      <AnimatePresence mode="wait">
        {step === "form" ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-sm flex flex-col items-center gap-6"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.5, ease: "backOut" }}
              className="w-20 h-20 rounded-3xl gradient-blue flex items-center justify-center shadow-glow-blue"
            >
              <Sparkles size={38} className="text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h1 className="text-4xl font-display font-bold gradient-blue-text">
                FitTry AI
              </h1>
              <p className="text-base text-muted-foreground mt-1">
                Your AI-powered virtual wardrobe
              </p>
            </motion.div>

            {/* Method Toggle */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="w-full flex rounded-2xl p-1 gap-1"
              style={{ background: "oklch(0.14 0.018 240)" }}
            >
              <button
                type="button"
                onClick={() => {
                  setMethod("email");
                  setError("");
                }}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background:
                    method === "email" ? "oklch(0.45 0.18 240)" : "transparent",
                  color: method === "email" ? "white" : "oklch(0.6 0.05 240)",
                }}
              >
                <Mail size={15} />
                Email
              </button>
              <button
                type="button"
                onClick={() => {
                  setMethod("mobile");
                  setError("");
                }}
                className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl text-sm font-semibold transition-all"
                style={{
                  background:
                    method === "mobile"
                      ? "oklch(0.45 0.18 240)"
                      : "transparent",
                  color: method === "mobile" ? "white" : "oklch(0.6 0.05 240)",
                }}
              >
                <Phone size={15} />
                Mobile
              </button>
            </motion.div>

            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onSubmit={handleSubmit}
              className="w-full space-y-4"
            >
              {isSignup && (
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm text-foreground/80">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    data-ocid="login.input"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setError("");
                    }}
                    className="h-12 rounded-xl"
                    style={{
                      background: "oklch(0.14 0.018 240)",
                      border: "1px solid oklch(0.26 0.022 240 / 0.7)",
                    }}
                  />
                </div>
              )}

              <AnimatePresence mode="wait">
                {method === "email" ? (
                  <motion.div
                    key="email"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-1.5"
                  >
                    <Label
                      htmlFor="email"
                      className="text-sm text-foreground/80"
                    >
                      Email Address
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      data-ocid="login.input"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setError("");
                      }}
                      className="h-12 rounded-xl"
                      style={{
                        background: "oklch(0.14 0.018 240)",
                        border: "1px solid oklch(0.26 0.022 240 / 0.7)",
                      }}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="mobile"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.25 }}
                    className="space-y-1.5"
                  >
                    <Label
                      htmlFor="mobile"
                      className="text-sm text-foreground/80"
                    >
                      Mobile Number
                    </Label>
                    <Input
                      id="mobile"
                      type="tel"
                      data-ocid="login.input"
                      placeholder="10-digit mobile number"
                      value={mobile}
                      onChange={(e) => {
                        setMobile(
                          e.target.value.replace(/\D/g, "").slice(0, 10),
                        );
                        setError("");
                      }}
                      className="h-12 rounded-xl"
                      style={{
                        background: "oklch(0.14 0.018 240)",
                        border: "1px solid oklch(0.26 0.022 240 / 0.7)",
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {error && (
                <p
                  data-ocid="login.error_state"
                  className="text-xs"
                  style={{ color: "oklch(0.65 0.22 25)" }}
                >
                  {error}
                </p>
              )}

              <Button
                type="submit"
                data-ocid="login.primary_button"
                className="w-full h-13 text-base font-semibold rounded-2xl gradient-blue text-white border-0 shadow-glow-blue"
              >
                <Sparkles size={18} className="mr-2" />
                {isSignup ? "Get Started" : "Continue"}
              </Button>
            </motion.form>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-muted-foreground text-center"
            >
              {isSignup ? "Already have an account?" : "New here?"}{" "}
              <button
                type="button"
                data-ocid="login.toggle"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setError("");
                }}
                className="text-primary font-semibold hover:underline"
              >
                {isSignup ? "Login" : "Sign up"}
              </button>
            </motion.p>
          </motion.div>
        ) : (
          <motion.div
            key="otp"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="w-full max-w-sm flex flex-col gap-6"
          >
            <button
              type="button"
              data-ocid="otp.cancel_button"
              onClick={() => setStep("form")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors self-start"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <div className="text-center">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                style={{ background: "oklch(0.18 0.05 150)" }}
              >
                <ShieldCheck
                  size={30}
                  style={{ color: "oklch(0.75 0.18 150)" }}
                />
              </div>
              <h2 className="text-2xl font-display font-bold text-foreground">
                Verify Your Identity
              </h2>
              <p className="text-sm text-muted-foreground mt-2">
                OTP sent to{" "}
                <span className="text-foreground font-medium">
                  {contactDisplay}
                </span>
              </p>
            </div>

            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.15 }}
              className="rounded-2xl p-5"
              style={{
                background: "oklch(0.12 0.025 150 / 0.5)",
                border: "1px solid oklch(0.45 0.12 150 / 0.5)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: "oklch(0.18 0.06 150)" }}
                  >
                    <CheckCircle2
                      size={14}
                      style={{ color: "oklch(0.75 0.18 150)" }}
                    />
                  </div>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: "oklch(0.75 0.18 150)" }}
                  >
                    DLT Approved
                  </span>
                </div>
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-medium"
                  style={{
                    background: "oklch(0.18 0.06 150)",
                    color: "oklch(0.75 0.18 150)",
                  }}
                >
                  {method === "email" ? "Email" : "SMS"}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mb-2">
                FitTry AI — Your verification code:
              </p>
              <p
                className="text-4xl font-mono font-bold tracking-widest text-center py-2"
                style={{ color: "oklch(0.75 0.18 150)" }}
              >
                {generatedOtp}
              </p>
              <p
                className="text-center text-xs mt-2"
                style={{ color: "oklch(0.55 0.08 150)" }}
              >
                Demo OTP — No real {method === "email" ? "email" : "SMS"} sent
              </p>
            </motion.div>

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-sm text-foreground/80">
                  Enter 6-Digit OTP
                </Label>
                <Input
                  data-ocid="otp.input"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  placeholder="Enter OTP"
                  value={otpInput}
                  onChange={(e) => {
                    setOtpInput(e.target.value.replace(/\D/g, "").slice(0, 6));
                    setOtpError("");
                  }}
                  className="h-14 rounded-xl text-2xl text-center tracking-widest font-mono"
                  style={{
                    background: "oklch(0.14 0.018 240)",
                    border: otpError
                      ? "1px solid oklch(0.55 0.22 25)"
                      : "1px solid oklch(0.26 0.022 240 / 0.7)",
                  }}
                />
                {otpError && (
                  <p
                    data-ocid="otp.error_state"
                    className="text-xs"
                    style={{ color: "oklch(0.65 0.22 25)" }}
                  >
                    {otpError}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                data-ocid="otp.submit_button"
                disabled={otpInput.length < 6}
                className="w-full h-12 text-base font-semibold rounded-2xl gradient-blue text-white border-0 shadow-glow-blue disabled:opacity-50"
              >
                <ShieldCheck size={18} className="mr-2" />
                Verify OTP
              </Button>
            </form>

            <div className="text-center">
              <button
                type="button"
                data-ocid="otp.secondary_button"
                onClick={handleResend}
                disabled={resendCooldown > 0}
                className="flex items-center gap-1.5 mx-auto text-sm disabled:text-muted-foreground transition-colors"
                style={{
                  color:
                    resendCooldown > 0 ? undefined : "oklch(0.65 0.15 240)",
                }}
              >
                <RefreshCw
                  size={14}
                  className={
                    resendCooldown > 0
                      ? ""
                      : "hover:rotate-180 transition-transform duration-300"
                  }
                />
                {resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : "Resend OTP"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
