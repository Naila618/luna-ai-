"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import { UserPreferences } from "@/types";

const QUESTIONS = [
  {
    id: 1,
    title: "What would you like help with?",
    description: "Choose any that apply to what you want to explore.",
    type: "multi",
    options: [
      "Learning and studying.",
      "Programming and technology.",
      "Career development.",
      "Research and discovering ideas.",
      "Writing and creativity.",
      "Everyday questions.",
      "A mixture of everything.",
    ],
  },
  {
    id: 2,
    title: "Preferred explanation style",
    description: "How would you like LUNA to explain things to you?",
    type: "single",
    options: [
      "Simple and beginner-friendly.",
      "Clear explanations with examples.",
      "Detailed and technical.",
      "Short and direct.",
    ],
  },
  {
    id: 3,
    title: "Preferred communication method",
    description: "Choose your primary way of interacting.",
    type: "single",
    options: ["Voice.", "Text.", "Both."],
  },
  {
    id: 4,
    title: "Preferred language",
    description: "Which language feels most natural for you to think in?",
    type: "single",
    options: [
      "English.",
      "Hindi.",
      "Telugu.",
      "The ability to switch languages.",
    ],
  },
  {
    id: 5,
    title: "Preferred conversational style",
    description: "What temperament should your companion adopt?",
    type: "single",
    options: [
      "Friendly and casual.",
      "Calm and thoughtful.",
      "Professional and structured.",
      "Curious and exploratory.",
    ],
  },
  {
    id: 6,
    title: "What matters most in an answer?",
    description: "Tell us what you value most when receiving a response.",
    type: "single",
    options: [
      "A quick answer.",
      "Understanding the reasoning.",
      "Practical examples.",
      "Exploring multiple perspectives.",
    ],
  },
  {
    id: 7,
    title: "How should LUNA explain difficult topics?",
    description: "Select the learning structure that suits you best.",
    type: "single",
    options: [
      "Step by step.",
      "Summary first, details afterward.",
      "Answer first, explanation afterward.",
      "Research with reliable sources when appropriate.",
    ],
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading, savePreferences, signInAsGuest } = useAuth();

  const [step, setStep] = useState(1);
  const totalSteps = 9; // 1-7 questions, 8 optional note, 9 summary

  // User responses
  const [helpTopics, setHelpTopics] = useState<string[]>([]);
  const [explanationDepth, setExplanationDepth] = useState<string>("");
  const [communicationMedium, setCommunicationMedium] = useState<string>("");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("");
  const [conversationalStyle, setConversationalStyle] = useState<string>("");
  const [answerPriority, setAnswerPriority] = useState<string>("");
  const [difficultApproach, setDifficultApproach] = useState<string>("");
  const [additionalNotes, setAdditionalNotes] = useState<string>("");

  const [validationError, setValidationError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      signInAsGuest();
    }
  }, [user, loading, signInAsGuest]);

  const toggleTopic = (topic: string) => {
    setValidationError(null);
    if (topic === "A mixture of everything.") {
      if (helpTopics.includes(topic)) {
        setHelpTopics([]);
      } else {
        setHelpTopics(["A mixture of everything."]);
      }
      return;
    }
    const filtered = helpTopics.filter((t) => t !== "A mixture of everything.");
    if (filtered.includes(topic)) {
      setHelpTopics(filtered.filter((t) => t !== topic));
    } else {
      setHelpTopics([...filtered, topic]);
    }
  };

  const handleNext = () => {
    setValidationError(null);

    if (step === 1 && helpTopics.length === 0) {
      setValidationError("Please select at least one focus topic.");
      return;
    }
    if (step === 2 && !explanationDepth) {
      setValidationError("Please select an explanation style.");
      return;
    }
    if (step === 3 && !communicationMedium) {
      setValidationError("Please select a communication method.");
      return;
    }
    if (step === 4 && !preferredLanguage) {
      setValidationError("Please select a language preference.");
      return;
    }
    if (step === 5 && !conversationalStyle) {
      setValidationError("Please choose a conversational style.");
      return;
    }
    if (step === 6 && !answerPriority) {
      setValidationError("Please select what matters most in an answer.");
      return;
    }
    if (step === 7 && !difficultApproach) {
      setValidationError("Please choose how LUNA should explain difficult topics.");
      return;
    }

    setStep((prev) => prev + 1);
  };

  const handleBack = () => {
    setValidationError(null);
    if (step > 1) {
      setStep((prev) => prev - 1);
    }
  };

  const handleComplete = async () => {
    setIsSaving(true);
    const finalPreferences: UserPreferences = {
      helpTopics: helpTopics.length > 0 ? helpTopics : ["A mixture of everything."],
      explanationDepth: explanationDepth || "Clear explanations with examples.",
      communicationMedium: communicationMedium || "Both.",
      preferredLanguage: preferredLanguage || "English.",
      conversationalStyle: conversationalStyle || "Calm and thoughtful.",
      answerPriority: answerPriority || "Understanding the reasoning.",
      difficultApproach: difficultApproach || "Step by step.",
      additionalNotes: additionalNotes.trim() || undefined,
      completedAt: new Date().toISOString(),
    };

    try {
      await savePreferences(finalPreferences);
      router.push("/chat");
    } catch (e) {
      console.error("Failed to save onboarding preferences:", e);
      setIsSaving(false);
    }
  };

  const currentQ = QUESTIONS.find((q) => q.id === step);

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#252720] flex flex-col font-sans selection:bg-[#EAEDE1]">
      {/* Top Bar with Progress */}
      <header className="w-full max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="font-serif text-2xl tracking-tight text-[#252720] font-normal">
            LUNA AI
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#777C55]" />
        </Link>

        {step <= 8 && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#77786F] font-mono">
              Step {step} of 8
            </span>
            <div className="w-24 sm:w-32 h-1.5 rounded-full bg-[#E7E4DC] overflow-hidden">
              <div
                className="h-full bg-[#777C55] transition-all duration-300 rounded-full"
                style={{ width: `${(step / 8) * 100}%` }}
              />
            </div>
          </div>
        )}
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-2xl mx-auto px-6 py-8 md:py-12 w-full flex flex-col justify-center">
        {/* Onboarding Heading (consistent on all questions) */}
        {step <= 8 && (
          <div className="mb-8 text-center sm:text-left">
            <h1 className="font-serif text-3xl sm:text-4xl text-[#252720] font-normal mb-2 tracking-tight">
              Let&apos;s make LUNA feel more like you.
            </h1>
            <p className="text-sm text-[#77786F]">
              A few quick questions will help us adapt to your preferences.
            </p>
          </div>
        )}

        {/* Validation Alert */}
        {validationError && (
          <div className="mb-6 p-3 rounded-lg bg-[#B95F4B]/10 border border-[#B95F4B]/20 text-[#B95F4B] text-xs">
            {validationError}
          </div>
        )}

        {/* Question Card 1-7 */}
        {currentQ && (
          <div className="bg-white rounded-2xl border border-[#E7E4DC] p-6 sm:p-8 shadow-[0_2px_12px_rgba(37,39,32,0.04)] mb-8">
            <div className="mb-6">
              <h2 className="text-lg sm:text-xl font-medium text-[#252720] mb-1">
                {currentQ.title}
              </h2>
              <p className="text-xs text-[#77786F]">{currentQ.description}</p>
            </div>

            <div className="space-y-2.5">
              {currentQ.options.map((opt) => {
                const isSelected =
                  currentQ.id === 1
                    ? helpTopics.includes(opt)
                    : currentQ.id === 2
                    ? explanationDepth === opt
                    : currentQ.id === 3
                    ? communicationMedium === opt
                    : currentQ.id === 4
                    ? preferredLanguage === opt
                    : currentQ.id === 5
                    ? conversationalStyle === opt
                    : currentQ.id === 6
                    ? answerPriority === opt
                    : difficultApproach === opt;

                return (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => {
                      if (currentQ.id === 1) toggleTopic(opt);
                      else if (currentQ.id === 2) setExplanationDepth(opt);
                      else if (currentQ.id === 3) setCommunicationMedium(opt);
                      else if (currentQ.id === 4) setPreferredLanguage(opt);
                      else if (currentQ.id === 5) setConversationalStyle(opt);
                      else if (currentQ.id === 6) setAnswerPriority(opt);
                      else if (currentQ.id === 7) setDifficultApproach(opt);
                      setValidationError(null);
                    }}
                    className={`w-full p-4 rounded-xl text-left text-xs font-normal transition-all flex items-center justify-between border ${
                      isSelected
                        ? "bg-[#EAEDE1] border-[#777C55] text-[#252720] font-medium"
                        : "bg-white border-[#E7E4DC] text-[#252720] hover:border-[#777C55]/50 hover:bg-[#F7F5F0]/50"
                    }`}
                  >
                    <span>{opt}</span>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center transition-colors ${
                        isSelected
                          ? "border-[#777C55] bg-[#777C55] text-white"
                          : "border-[#E7E4DC]"
                      }`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 8: Optional Additional Notes */}
        {step === 8 && (
          <div className="bg-white rounded-2xl border border-[#E7E4DC] p-6 sm:p-8 shadow-[0_2px_12px_rgba(37,39,32,0.04)] mb-8">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-medium text-[#252720] mb-1">
                Any additional preference?
              </h2>
              <p className="text-xs text-[#77786F]">
                Optional: Mention specific topics you study, your profession, or how you think best.
              </p>
            </div>

            <textarea
              rows={4}
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="e.g. I am a software engineer learning distributed systems. Keep analogies concise."
              className="w-full p-3.5 text-xs rounded-xl border border-[#E7E4DC] bg-[#F7F5F0]/30 text-[#252720] placeholder-[#77786F]/50 focus:outline-none focus:border-[#777C55] focus:bg-white transition-colors"
            />
          </div>
        )}

        {/* Step 9: Final Summary & "Meet My LUNA" */}
        {step === 9 && (
          <div className="bg-white rounded-2xl border border-[#E7E4DC] p-6 sm:p-10 shadow-[0_2px_12px_rgba(37,39,32,0.04)] mb-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EAEDE1] text-[#777C55] mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h2 className="font-serif text-3xl text-[#252720] font-normal mb-2 tracking-tight">
                Your LUNA is ready.
              </h2>
              <p className="text-xs text-[#77786F]">
                Here is a summary of how LUNA will adapt to you.
              </p>
            </div>

            <div className="space-y-3 mb-8 text-xs">
              <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E7E4DC] flex justify-between">
                <span className="text-[#77786F]">Focus Topics</span>
                <span className="font-medium text-[#252720] text-right truncate max-w-[240px]">
                  {helpTopics.join(", ") || "General exploration"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E7E4DC] flex justify-between">
                <span className="text-[#77786F]">Explanation Style</span>
                <span className="font-medium text-[#252720]">
                  {explanationDepth || "Clear explanations with examples"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E7E4DC] flex justify-between">
                <span className="text-[#77786F]">Communication</span>
                <span className="font-medium text-[#252720]">
                  {communicationMedium || "Both"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E7E4DC] flex justify-between">
                <span className="text-[#77786F]">Language</span>
                <span className="font-medium text-[#252720]">
                  {preferredLanguage || "English"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E7E4DC] flex justify-between">
                <span className="text-[#77786F]">Conversational Style</span>
                <span className="font-medium text-[#252720]">
                  {conversationalStyle || "Calm and thoughtful"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E7E4DC] flex justify-between">
                <span className="text-[#77786F]">Answer Priority</span>
                <span className="font-medium text-[#252720]">
                  {answerPriority || "Understanding the reasoning"}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E7E4DC] flex justify-between">
                <span className="text-[#77786F]">Difficult Concepts</span>
                <span className="font-medium text-[#252720]">
                  {difficultApproach || "Step by step"}
                </span>
              </div>

              {additionalNotes.trim() && (
                <div className="p-3.5 rounded-xl bg-[#F7F5F0] border border-[#E7E4DC]">
                  <span className="text-[#77786F] block mb-1">Custom Notes</span>
                  <span className="font-medium text-[#252720]">
                    {additionalNotes}
                  </span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={handleComplete}
              disabled={isSaving}
              className="w-full py-3.5 px-6 rounded-xl bg-[#777C55] hover:bg-[#5E6341] text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Preparing your space...</span>
                </>
              ) : (
                <>
                  <span>Meet My LUNA</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Navigation Controls (Steps 1-8) */}
        {step <= 8 && (
          <div className="flex items-center justify-between">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-xs font-medium text-[#77786F] hover:text-[#252720] transition-colors flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            ) : (
              <div />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-lg bg-[#777C55] hover:bg-[#5E6341] text-white text-xs font-medium transition-colors flex items-center gap-2 shadow-sm"
            >
              <span>Continue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-4xl mx-auto px-6 py-6 text-center text-[11px] text-[#77786F]">
        Preferences can be changed anytime in Settings.
      </footer>
    </div>
  );
}
