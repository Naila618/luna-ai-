"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  User,
  Sliders,
  Shield,
  KeyRound,
  LogOut,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  RefreshCw,
  Key,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { saveUserConversations } from "@/lib/storage";
import { SUPPORTED_LANGUAGES } from "@/lib/i18n";
import { UserPreferences } from "@/types";

export default function SettingsPage() {
  const router = useRouter();
  const {
    user,
    loading: authLoading,
    preferences,
    savePreferences,
    resetPreferences,
    sendPasswordReset,
    signOutUser,
  } = useAuth();

  const [preferredLanguage, setPreferredLanguage] = useState(
    preferences?.preferredLanguage || "English."
  );
  const [explanationDepth, setExplanationDepth] = useState(
    preferences?.explanationDepth || "Clear, with examples."
  );
  const [conversationalStyle, setConversationalStyle] = useState(
    preferences?.conversationalStyle || "Calm and thoughtful."
  );
  const [communicationMedium, setCommunicationMedium] = useState(
    preferences?.communicationMedium || "Both."
  );
  const [answerPriority, setAnswerPriority] = useState(
    preferences?.answerPriority || "Understanding the reasoning."
  );
  const [difficultApproach, setDifficultApproach] = useState(
    preferences?.difficultApproach || "Step by step."
  );
  const [additionalNotes, setAdditionalNotes] = useState(
    preferences?.additionalNotes || ""
  );

  const [feedback, setFeedback] = useState<{ type: "success" | "error"; msg: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Gemini API key configuration state
  const [geminiApiKey, setGeminiApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);
  const [keyTestStatus, setKeyTestStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [keySavedFeedback, setKeySavedFeedback] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("luna_gemini_api_key") || "";
      setGeminiApiKey(saved);
    }
  }, []);

  const handleSaveGeminiKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      if (geminiApiKey.trim()) {
        localStorage.setItem("luna_gemini_api_key", geminiApiKey.trim());
      } else {
        localStorage.removeItem("luna_gemini_api_key");
      }
      setKeySavedFeedback(true);
      setTimeout(() => setKeySavedFeedback(false), 3000);
    }
  };

  const handleTestGeminiKey = async () => {
    setTestingKey(true);
    setKeyTestStatus(null);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: "Hello Luna, verify connection." }],
          geminiApiKey: geminiApiKey.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (data.provider === "gemini") {
        setKeyTestStatus({
          success: true,
          msg: `Connected successfully to Google Gemini (${data.model || "gemini-2.5-flash"}).`,
        });
      } else if (data.provider === "openrouter" || data.provider === "openai") {
        setKeyTestStatus({
          success: true,
          msg: `Connected via ${data.provider} (${data.model || ""}).`,
        });
      } else {
        setKeyTestStatus({
          success: false,
          msg: data.content || "Provider could not be reached. Please check your key.",
        });
      }
    } catch (e: any) {
      setKeyTestStatus({
        success: false,
        msg: e.message || "Failed to contact chat API.",
      });
    } finally {
      setTestingKey(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (preferences) {
      if (preferences.preferredLanguage) setPreferredLanguage(preferences.preferredLanguage);
      if (preferences.explanationDepth) setExplanationDepth(preferences.explanationDepth);
      if (preferences.conversationalStyle) setConversationalStyle(preferences.conversationalStyle);
      if (preferences.communicationMedium) setCommunicationMedium(preferences.communicationMedium);
      if (preferences.answerPriority) setAnswerPriority(preferences.answerPriority);
      if (preferences.difficultApproach) setDifficultApproach(preferences.difficultApproach);
      if (preferences.additionalNotes) setAdditionalNotes(preferences.additionalNotes);
    }
  }, [preferences]);

  const handleSavePreferences = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setFeedback(null);

    const updated: UserPreferences = {
      helpTopics: preferences?.helpTopics || ["A mixture of everything."],
      explanationDepth,
      communicationMedium,
      preferredLanguage,
      conversationalStyle,
      answerPriority,
      difficultApproach,
      additionalNotes: additionalNotes.trim() || undefined,
    };

    await savePreferences(updated);
    setIsSaving(false);
    setFeedback({ type: "success", msg: "Personalization preferences updated successfully." });
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleClearAllHistory = () => {
    if (!user) return;
    if (confirm("Are you sure you want to permanently clear all conversation history?")) {
      saveUserConversations(user.uid, []);
      setFeedback({ type: "success", msg: "All conversation history has been cleared." });
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleResetOnboarding = async () => {
    if (confirm("Do you want to reset your onboarding answers and retake the questions?")) {
      await resetPreferences();
      router.push("/onboarding");
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    const res = await sendPasswordReset(user.email);
    if (res.success) {
      setFeedback({
        type: "success",
        msg: `A password reset link has been dispatched to ${user.email}.`,
      });
    } else {
      setFeedback({ type: "error", msg: res.error || "Unable to send reset email." });
    }
    setTimeout(() => setFeedback(null), 4000);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#777C55]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#252720] font-sans selection:bg-[#EAEDE1] p-6 md:p-12">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-[#E7E4DC]">
          <Link
            href="/chat"
            className="inline-flex items-center gap-2 text-xs text-[#77786F] hover:text-[#252720] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to chat</span>
          </Link>

          <span className="font-serif text-lg text-[#252720]">LUNA AI</span>
        </div>

        <div>
          <h1 className="font-serif text-3xl text-[#252720] font-normal">
            Preferences & Settings
          </h1>
          <p className="text-xs text-[#77786F] mt-1">
            Manage your companion tone, language, privacy, and profile details.
          </p>
        </div>

        {/* Feedback Alert */}
        {feedback && (
          <div
            className={`p-3.5 rounded-md text-xs flex items-center gap-2 border ${
              feedback.type === "success"
                ? "bg-[#8DA58A]/15 border-[#8DA58A]/30 text-[#40563E]"
                : "bg-[#B95F4B]/10 border-[#B95F4B]/20 text-[#B95F4B]"
            }`}
          >
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-[#5F785C]" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{feedback.msg}</span>
          </div>
        )}

        {/* SECTION 1: PROFILE */}
        <section className="bg-white p-6 rounded-lg border border-[#E7E4DC] space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777C55]">
            <User className="w-4 h-4" />
            <span>Your Profile</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-[#77786F] mb-1">Display Name</label>
              <div className="p-2.5 rounded bg-[#F7F5F0] border border-[#E7E4DC] text-[#252720] font-medium">
                {user?.displayName || "Friend"}
              </div>
            </div>

            <div>
              <label className="block text-[#77786F] mb-1">Email Address</label>
              <div className="p-2.5 rounded bg-[#F7F5F0] border border-[#E7E4DC] text-[#252720]">
                {user?.email || "Local Guest User"}
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: PERSONALIZATION PREFERENCES */}
        <form
          onSubmit={handleSavePreferences}
          className="bg-white p-6 rounded-lg border border-[#E7E4DC] space-y-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777C55]">
              <Sliders className="w-4 h-4" />
              <span>Personalization</span>
            </div>
            <button
              type="button"
              onClick={handleResetOnboarding}
              className="text-xs text-[#77786F] hover:text-[#777C55] flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Retake Onboarding</span>
            </button>
          </div>

          <div className="space-y-4 text-xs">
            <div>
              <label className="block text-[#252720] font-medium mb-1.5">
                Preferred Language
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full p-2.5 rounded border border-[#E7E4DC] bg-[#F7F5F0]/40 text-[#252720] focus:border-[#777C55]"
              >
                <option value="English.">English</option>
                <option value="Hindi.">हिन्दी (Hindi)</option>
                <option value="Telugu.">తెలుగు (Telugu)</option>
                <option value="Let me switch whenever I want.">Let me switch anytime</option>
              </select>
            </div>

            <div>
              <label className="block text-[#252720] font-medium mb-1.5">
                Explanation Depth
              </label>
              <select
                value={explanationDepth}
                onChange={(e) => setExplanationDepth(e.target.value)}
                className="w-full p-2.5 rounded border border-[#E7E4DC] bg-[#F7F5F0]/40 text-[#252720] focus:border-[#777C55]"
              >
                <option value="Simple and beginner-friendly.">Simple and beginner-friendly</option>
                <option value="Clear, with examples.">Clear, with examples</option>
                <option value="Detailed and technical.">Detailed and technical</option>
                <option value="Short and direct.">Short and direct</option>
              </select>
            </div>

            <div>
              <label className="block text-[#252720] font-medium mb-1.5">
                Conversational Style
              </label>
              <select
                value={conversationalStyle}
                onChange={(e) => setConversationalStyle(e.target.value)}
                className="w-full p-2.5 rounded border border-[#E7E4DC] bg-[#F7F5F0]/40 text-[#252720] focus:border-[#777C55]"
              >
                <option value="Friendly and casual.">Friendly and casual</option>
                <option value="Calm and thoughtful.">Calm and thoughtful</option>
                <option value="Professional and structured.">Professional and structured</option>
                <option value="Curious and exploratory.">Curious and exploratory</option>
              </select>
            </div>

            <div>
              <label className="block text-[#252720] font-medium mb-1.5">
                Communication Medium
              </label>
              <select
                value={communicationMedium}
                onChange={(e) => setCommunicationMedium(e.target.value)}
                className="w-full p-2.5 rounded border border-[#E7E4DC] bg-[#F7F5F0]/40 text-[#252720] focus:border-[#777C55]"
              >
                <option value="Both, depending on the situation.">Both (Voice and Text)</option>
                <option value="Voice conversations.">Voice conversations</option>
                <option value="Text conversations.">Text conversations</option>
              </select>
            </div>

            <div>
              <label className="block text-[#252720] font-medium mb-1.5">
                Answer Priority
              </label>
              <select
                value={answerPriority}
                onChange={(e) => setAnswerPriority(e.target.value)}
                className="w-full p-2.5 rounded border border-[#E7E4DC] bg-[#F7F5F0]/40 text-[#252720] focus:border-[#777C55]"
              >
                <option value="A quick answer.">A quick answer</option>
                <option value="Understanding the reasoning.">Understanding the reasoning</option>
                <option value="Practical examples.">Practical examples</option>
                <option value="Exploring multiple perspectives.">Exploring multiple perspectives</option>
              </select>
            </div>

            <div>
              <label className="block text-[#252720] font-medium mb-1.5">
                Difficult Topics Approach
              </label>
              <select
                value={difficultApproach}
                onChange={(e) => setDifficultApproach(e.target.value)}
                className="w-full p-2.5 rounded border border-[#E7E4DC] bg-[#F7F5F0]/40 text-[#252720] focus:border-[#777C55]"
              >
                <option value="Step by step.">Step by step</option>
                <option value="Summary first, details afterward.">Summary first, details afterward</option>
                <option value="Answer first, explanation afterward.">Answer first, explanation afterward</option>
                <option value="Research with reliable sources when appropriate.">Research with reliable sources</option>
              </select>
            </div>

            <div>
              <label className="block text-[#252720] font-medium mb-1.5">
                Additional Preferences & Notes
              </label>
              <textarea
                rows={3}
                value={additionalNotes}
                onChange={(e) => setAdditionalNotes(e.target.value)}
                placeholder="Custom context, interests, or style instructions..."
                className="w-full p-2.5 rounded border border-[#E7E4DC] bg-[#F7F5F0]/40 text-[#252720] placeholder-[#77786F]/50 focus:border-[#777C55]"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="py-2.5 px-4 rounded bg-[#777C55] hover:bg-[#5E6341] text-white text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
            <span>Save Preferences</span>
          </button>
        </form>

        {/* SECTION 3: AI INTELLIGENCE ENGINE & API KEYS */}
        <section
          id="api-keys"
          className="bg-white p-6 rounded-lg border border-[#E7E4DC] space-y-4 scroll-mt-6"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777C55]">
              <Key className="w-4 h-4" />
              <span>AI Intelligence Engine (Gemini)</span>
            </div>
            {geminiApiKey.trim() && (
              <span className="px-2 py-0.5 rounded text-[10px] bg-[#EAEDE1] text-[#5E6341] font-medium border border-[#777C55]/30">
                Custom Key Saved
              </span>
            )}
          </div>

          <p className="text-xs text-[#77786F] leading-relaxed">
            LUNA is powered by Google Gemini (e.g. Gemini 2.5 Flash). You can enter your Gemini API key below to enable chat and research immediately on both local development and live web preview.
          </p>

          <form onSubmit={handleSaveGeminiKey} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-[#252720] mb-1">
                Gemini API Key
              </label>
              <div className="relative">
                <input
                  type={showKey ? "text" : "password"}
                  value={geminiApiKey}
                  onChange={(e) => {
                    setGeminiApiKey(e.target.value);
                    setKeyTestStatus(null);
                  }}
                  placeholder="Paste your Gemini API key (e.g. AIzaSy... or AQ.Ab8...)"
                  className="w-full p-2.5 pr-20 rounded border border-[#E7E4DC] bg-[#F7F5F0]/40 text-xs text-[#252720] placeholder-[#77786F]/50 focus:border-[#777C55] font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowKey(!showKey)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#77786F] hover:text-[#252720] px-1.5 py-0.5"
                >
                  {showKey ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            {keyTestStatus && (
              <div
                className={`p-3 rounded text-xs flex items-start gap-2 ${
                  keyTestStatus.success
                    ? "bg-[#EAEDE1] text-[#5E6341] border border-[#777C55]/30"
                    : "bg-[#B95F4B]/10 text-[#B95F4B] border border-[#B95F4B]/30"
                }`}
              >
                {keyTestStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                )}
                <span>{keyTestStatus.msg}</span>
              </div>
            )}

            {keySavedFeedback && (
              <div className="p-2.5 rounded bg-[#EAEDE1] text-[#5E6341] text-xs flex items-center gap-1.5 border border-[#777C55]/30">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>API key saved to browser storage.</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="submit"
                className="py-2 px-3.5 rounded bg-[#777C55] hover:bg-[#5E6341] text-white text-xs font-medium transition-colors shadow-sm"
              >
                Save Key
              </button>

              <button
                type="button"
                onClick={handleTestGeminiKey}
                disabled={testingKey}
                className="py-2 px-3.5 rounded border border-[#E7E4DC] bg-white hover:bg-[#F7F5F0] text-[#252720] text-xs font-medium transition-colors flex items-center gap-1.5"
              >
                {testingKey ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5 text-[#777C55]" />
                )}
                <span>{testingKey ? "Testing..." : "Test Connection"}</span>
              </button>

              {geminiApiKey.trim() && (
                <button
                  type="button"
                  onClick={() => {
                    setGeminiApiKey("");
                    if (typeof window !== "undefined") {
                      localStorage.removeItem("luna_gemini_api_key");
                    }
                    setKeyTestStatus(null);
                  }}
                  className="py-2 px-2.5 text-xs text-[#B95F4B] hover:underline"
                >
                  Clear Key
                </button>
              )}
            </div>
          </form>

          {/* Vercel instructions callout */}
          <div className="mt-3 p-3.5 rounded bg-[#F7F5F0] border border-[#E7E4DC] text-xs space-y-1.5 text-[#77786F]">
            <div className="font-medium text-[#252720] flex items-center gap-1.5">
              <span>🚀 Permanent Vercel Live Deployment Setup</span>
            </div>
            <p>
              To enable Gemini for all visitors on your live website without needing them to enter a key:
            </p>
            <ol className="list-decimal list-inside space-y-1 pl-1 text-[11px]">
              <li>Open your <strong>Vercel Project Dashboard</strong></li>
              <li>Go to <strong>Settings</strong> &rarr; <strong>Environment Variables</strong></li>
              <li>Add Name: <code className="bg-white px-1 py-0.5 rounded border border-[#E7E4DC] text-[#252720]">GEMINI_API_KEY</code></li>
              <li>Add Value: paste your Gemini API key</li>
              <li>Click <strong>Save</strong> and Redeploy your project!</li>
            </ol>
          </div>
        </section>

        {/* SECTION 4: PRIVACY & HISTORY */}
        <section className="bg-white p-6 rounded-lg border border-[#E7E4DC] space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777C55]">
            <Shield className="w-4 h-4" />
            <span>Privacy & Data</span>
          </div>

          <p className="text-xs text-[#77786F]">
            Your conversation history is securely partitioned to your account and never shared.
          </p>

          <div className="pt-2">
            <button
              type="button"
              onClick={handleClearAllHistory}
              className="py-2 px-3 rounded border border-[#B95F4B]/30 bg-[#B95F4B]/10 hover:bg-[#B95F4B]/20 text-[#B95F4B] text-xs font-medium transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All Conversation History</span>
            </button>
          </div>
        </section>

        {/* SECTION 4: ACCOUNT ACTIONS */}
        <section className="bg-white p-6 rounded-lg border border-[#E7E4DC] space-y-4">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#777C55]">
            <KeyRound className="w-4 h-4" />
            <span>Account</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            {user?.email && (
              <button
                type="button"
                onClick={handlePasswordReset}
                className="py-2 px-3 rounded border border-[#E7E4DC] hover:bg-[#F7F5F0] text-xs text-[#252720] transition-colors"
              >
                Send Password Reset Email
              </button>
            )}

            <button
              type="button"
              onClick={signOutUser}
              className="py-2 px-3.5 rounded bg-[#F7F5F0] hover:bg-[#E7E4DC] text-xs text-[#B95F4B] font-medium transition-colors flex items-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign out</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}
