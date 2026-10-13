"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  ShieldCheck,
  Compass,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";

type AuthMode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    signInAsGuest,
  } = useAuth();

  const [mode, setMode] = useState<AuthMode>("signin");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Auto redirect if already signed in
  useEffect(() => {
    if (user) {
      if (user.onboardingCompleted) {
        router.push("/chat");
      } else {
        router.push("/onboarding");
      }
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (mode === "forgot") {
      setIsLoading(true);
      const res = await sendPasswordReset(email.trim());
      setIsLoading(false);
      if (res.success) {
        setSuccessMessage(
          "A password reset link has been dispatched to your email address."
        );
      } else {
        setErrorMessage(res.error || "Unable to send password reset email.");
      }
      return;
    }

    if (!password || password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (mode === "signup") {
      if (!name.trim()) {
        setErrorMessage("Please provide your name.");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("Passwords do not match. Please verify.");
        return;
      }

      setIsLoading(true);
      const res = await signUpWithEmail(name.trim(), email.trim(), password);
      setIsLoading(false);
      if (res.success) {
        router.push("/onboarding");
      } else {
        setErrorMessage(res.error || "Failed to create account.");
      }
    } else {
      // Sign in
      setIsLoading(true);
      const res = await signInWithEmail(email.trim(), password);
      setIsLoading(false);
      if (!res.success) {
        setErrorMessage(
          res.error || "Failed to sign in. Please check your credentials."
        );
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMessage(null);
    setIsLoading(true);
    const res = await signInWithGoogle();
    setIsLoading(false);
    if (!res.success && res.error) {
      setErrorMessage(res.error);
    }
  };

  const handleGuestExplore = async () => {
    await signInAsGuest();
    router.push("/onboarding");
  };

  return (
    <div className="min-h-screen w-full bg-[#F7F5F0] text-[#252720] flex flex-col justify-between font-sans selection:bg-[#EAEDE1]">
      {/* Top Header */}
      <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl tracking-tight text-[#252720] font-normal">
            LUNA AI
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#777C55]" />
        </Link>

        <Link
          href="/"
          className="text-xs text-[#77786F] hover:text-[#252720] transition-colors"
        >
          Back to overview
        </Link>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl mx-auto px-6 py-8 md:py-16 w-full grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Left Column: LUNA Branding & Introduction */}
        <div className="lg:col-span-6 flex flex-col items-start">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAEDE1] text-[#777C55] text-xs font-medium mb-6 border border-[#777C55]/20">
            <span className="w-1.5 h-1.5 rounded-full bg-[#777C55]" />
            Your space to think
          </div>

          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#252720] leading-[1.15] font-normal mb-5 tracking-tight">
            A little more clarity. <br />
            <span className="text-[#77786F]">A little less noise.</span>
          </h1>

          <p className="text-base sm:text-lg text-[#77786F] max-w-md leading-relaxed mb-10">
            Your space to think is waiting.
          </p>

          {/* Subtle Visual Motif */}
          <div className="w-full max-w-md p-6 rounded-2xl bg-white border border-[#E7E4DC] shadow-[0_1px_3px_rgba(37,39,32,0.04)] space-y-4 hidden sm:block">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#EAEDE1] flex items-center justify-center text-[#777C55]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-[#252720]">Personalized & Grounded</p>
                <p className="text-[11px] text-[#77786F]">Adapts to your pace and language</p>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E7E4DC] flex items-center justify-between text-xs text-[#77786F]">
              <span className="flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-[#777C55]" />
                Deep web research
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#777C55]" />
                Private & secure
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Authentication Card */}
        <div className="lg:col-span-6 flex justify-center">
          <div className="w-full max-w-md bg-white rounded-2xl border border-[#E7E4DC] p-8 sm:p-10 shadow-[0_4px_24px_rgba(37,39,32,0.06)]">
            {/* Mode Switcher Header */}
            <div className="mb-8">
              <h2 className="font-serif text-2xl text-[#252720] font-normal mb-2">
                {mode === "signin"
                  ? "Welcome back"
                  : mode === "signup"
                  ? "Create your account"
                  : "Reset your password"}
              </h2>
              <p className="text-xs text-[#77786F]">
                {mode === "signin"
                  ? "Enter your details to access your space."
                  : mode === "signup"
                  ? "A quiet space to think, learn, and explore."
                  : "We'll send a recovery link to your inbox."}
              </p>
            </div>

            {/* Error & Success Messages */}
            {errorMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-[#B95F4B]/10 border border-[#B95F4B]/20 text-[#B95F4B] text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-3.5 rounded-lg bg-[#8DA58A]/15 border border-[#8DA58A]/30 text-[#5E6341] text-xs flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{successMessage}</span>
              </div>
            )}

            {/* Main Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-[#252720] mb-1.5">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex"
                    required
                    className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#E7E4DC] bg-[#F7F5F0]/30 text-[#252720] placeholder-[#77786F]/50 focus:outline-none focus:border-[#777C55] focus:bg-white transition-colors"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#252720] mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full px-3.5 py-2.5 text-xs rounded-lg border border-[#E7E4DC] bg-[#F7F5F0]/30 text-[#252720] placeholder-[#77786F]/50 focus:outline-none focus:border-[#777C55] focus:bg-white transition-colors"
                />
              </div>

              {mode !== "forgot" && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[#252720]">
                      Password
                    </label>
                    {mode === "signin" && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode("forgot");
                          setErrorMessage(null);
                          setSuccessMessage(null);
                        }}
                        className="text-[11px] text-[#777C55] hover:text-[#5E6341] transition-colors"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 6 characters"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-lg border border-[#E7E4DC] bg-[#F7F5F0]/30 text-[#252720] placeholder-[#77786F]/50 focus:outline-none focus:border-[#777C55] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77786F] hover:text-[#252720] transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              {mode === "signup" && (
                <div>
                  <label className="block text-xs font-medium text-[#252720] mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      required
                      className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-lg border border-[#E7E4DC] bg-[#F7F5F0]/30 text-[#252720] placeholder-[#77786F]/50 focus:outline-none focus:border-[#777C55] focus:bg-white transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#77786F] hover:text-[#252720] transition-colors"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-3.5 h-3.5" />
                      ) : (
                        <Eye className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 mt-2 rounded-lg bg-[#777C55] hover:bg-[#5E6341] text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Please wait...</span>
                  </>
                ) : (
                  <>
                    <span>
                      {mode === "signin"
                        ? "Sign In"
                        : mode === "signup"
                        ? "Create Account"
                        : "Send Reset Link"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            {/* Social & Alternative Options */}
            {mode !== "forgot" && (
              <>
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-[#E7E4DC]" />
                  </div>
                  <span className="relative px-3 bg-white text-[11px] text-[#77786F]">
                    or continue with
                  </span>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    className="w-full py-2.5 px-4 rounded-lg bg-white border border-[#E7E4DC] hover:bg-[#F7F5F0] text-xs font-medium text-[#252720] transition-colors flex items-center justify-center gap-2.5"
                  >
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestExplore}
                    className="w-full py-2 px-4 rounded-lg text-[11px] text-[#77786F] hover:text-[#252720] transition-colors"
                  >
                    Explore as guest without an account
                  </button>
                </div>
              </>
            )}

            {/* Bottom Mode Switcher Link */}
            <div className="mt-8 pt-6 border-t border-[#E7E4DC] text-center text-xs text-[#77786F]">
              {mode === "signin" ? (
                <p>
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signup");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#777C55] font-medium hover:underline"
                  >
                    Create one
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?{" "}
                  <button
                    type="button"
                    onClick={() => {
                      setMode("signin");
                      setErrorMessage(null);
                      setSuccessMessage(null);
                    }}
                    className="text-[#777C55] font-medium hover:underline"
                  >
                    Sign in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto px-6 py-6 text-center text-[11px] text-[#77786F]">
        LUNA AI · Your space to think · Minimal, calm, and private.
      </footer>
    </div>
  );
}
