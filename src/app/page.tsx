"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, MessageSquare, Compass, Sliders, Globe } from "lucide-react";
import Prism from "@/components/ui/Prism";
import { useAuth } from "@/lib/auth/AuthContext";

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-[#F7F5F0] text-[#252720] flex flex-col font-sans selection:bg-[#EAEDE1]">
      {/* Minimal Elegant Header */}
      <header className="sticky top-0 z-30 bg-[#F7F5F0]/90 backdrop-blur-md border-b border-[#E7E4DC]">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <span className="font-serif text-2xl tracking-tight text-[#252720] font-normal">
              LUNA AI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#777C55] opacity-80" />
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-[15px] text-[#77786F]">
            <a
              href="#features"
              className="hover:text-[#252720] transition-colors duration-200"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="hover:text-[#252720] transition-colors duration-200"
            >
              How it works
            </a>
            {user ? (
              <Link
                href="/chat"
                className="hover:text-[#252720] transition-colors duration-200"
              >
                Continue chat
              </Link>
            ) : (
              <Link
                href="/login"
                className="hover:text-[#252720] transition-colors duration-200"
              >
                Sign in
              </Link>
            )}
          </nav>

          <div className="flex items-center gap-3">
            <Link
              href={user ? "/chat" : "/login"}
              className="px-5 py-2.5 rounded-md bg-[#777C55] hover:bg-[#5E6341] text-white text-[14px] font-medium transition-colors duration-200 flex items-center gap-2 shadow-[0_1px_2px_rgba(37,39,32,0.08)]"
            >
              <span>{user ? "Open Assistant" : "Start a conversation"}</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 md:pt-28 md:pb-36 overflow-hidden border-b border-[#E7E4DC]">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 flex flex-col items-start z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#EAEDE1] text-[#777C55] text-xs font-medium tracking-wide mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#777C55]" />
              Your space to think
            </div>

            <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#252720] leading-[1.12] mb-6 tracking-tight">
              A little more clarity. <br />
              <span className="text-[#77786F]">A little less noise.</span>
            </h1>

            <p className="text-lg sm:text-xl text-[#77786F] max-w-xl leading-relaxed mb-10 font-normal">
              A personal AI companion for the questions you&apos;re curious about, the things
              you&apos;re learning, and the ideas you&apos;re figuring out.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={user ? "/chat" : "/login"}
                className="px-6 py-3.5 rounded-md bg-[#777C55] hover:bg-[#5E6341] text-white text-[15px] font-medium transition-colors duration-200 flex items-center gap-2.5 shadow-sm"
              >
                <span>Start a conversation</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="px-6 py-3.5 rounded-md bg-white hover:bg-[#EAEDE1]/50 text-[#252720] text-[15px] font-medium border border-[#E7E4DC] transition-colors duration-200"
              >
                Explore LUNA
              </a>
            </div>

            {/* Language indicator */}
            <div className="mt-12 flex items-center gap-3 text-xs text-[#77786F]">
              <Globe className="w-4 h-4 text-[#777C55]" />
              <span>Available in English, हिन्दी (Hindi), and తెలుగు (Telugu)</span>
            </div>
          </div>

          {/* Understated Visual with React Bits Prism */}
          <div className="lg:col-span-5 relative flex items-center justify-center">
            <div className="relative w-full max-w-[380px] aspect-square rounded-2xl bg-white border border-[#E7E4DC] p-6 shadow-[0_4px_24px_-4px_rgba(37,39,32,0.04)] flex flex-col items-center justify-center">
              <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-90">
                <Prism className="w-full h-full" lightMode={true} scale={1.1} />
              </div>

              {/* Ambient quote overlay */}
              <div className="relative z-10 w-full mt-auto p-4 bg-[#F7F5F0]/85 backdrop-blur-md rounded-lg border border-[#E7E4DC] text-center">
                <p className="text-xs text-[#77786F] italic">
                  &ldquo;A companion that listens carefully and explains at your pace.&rdquo;
                </p>
                <div className="mt-2 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#8DA58A] animate-pulse" />
                  <span className="text-[11px] font-medium text-[#252720] tracking-wide uppercase">
                    Active & Thoughtful
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Section: 01, 02, 03 with whitespace & dividers */}
      <section id="features" className="py-24 md:py-32 border-b border-[#E7E4DC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#777C55] mb-2">
              Capabilities
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#252720] font-normal leading-tight">
              Designed for thoughtful exploration.
            </h2>
          </div>

          <div className="space-y-12">
            {/* 01 */}
            <div className="pt-10 border-t border-[#E7E4DC] grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-3">
                <span className="font-serif text-3xl text-[#777C55] font-light">
                  01
                </span>
                <h3 className="font-serif text-2xl text-[#252720] mt-2 font-normal">
                  Talk naturally
                </h3>
              </div>
              <div className="md:col-span-6">
                <p className="text-base text-[#77786F] leading-relaxed">
                  Have a voice or text conversation with LUNA. Express your questions
                  freely or speak directly with an expressive AI video avatar that adapts
                  to your tone and conversational tempo.
                </p>
              </div>
              <div className="md:col-span-3 flex md:justify-end">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#77786F] bg-white px-3 py-1.5 rounded border border-[#E7E4DC]">
                  <MessageSquare className="w-3.5 h-3.5 text-[#777C55]" />
                  Voice & Video Avatar
                </span>
              </div>
            </div>

            {/* 02 */}
            <div className="pt-10 border-t border-[#E7E4DC] grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-3">
                <span className="font-serif text-3xl text-[#777C55] font-light">
                  02
                </span>
                <h3 className="font-serif text-2xl text-[#252720] mt-2 font-normal">
                  Explore deeper
                </h3>
              </div>
              <div className="md:col-span-6">
                <p className="text-base text-[#77786F] leading-relaxed">
                  Investigate difficult questions using real web research and citations.
                  LUNA retrieves genuine sources, cross-references perspectives, and
                  presents clear takeaways with clickable citations.
                </p>
              </div>
              <div className="md:col-span-3 flex md:justify-end">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#77786F] bg-white px-3 py-1.5 rounded border border-[#E7E4DC]">
                  <Compass className="w-3.5 h-3.5 text-[#777C55]" />
                  Verified Citations
                </span>
              </div>
            </div>

            {/* 03 */}
            <div className="pt-10 border-t border-[#E7E4DC] grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              <div className="md:col-span-3">
                <span className="font-serif text-3xl text-[#777C55] font-light">
                  03
                </span>
                <h3 className="font-serif text-2xl text-[#252720] mt-2 font-normal">
                  Make it yours
                </h3>
              </div>
              <div className="md:col-span-6">
                <p className="text-base text-[#77786F] leading-relaxed">
                  Personalize explanations, language, and communication preferences.
                  Choose between beginner-friendly breakdowns or technical depth, switch
                  seamlessly between English, Hindi, and Telugu, and adjust anytime.
                </p>
              </div>
              <div className="md:col-span-3 flex md:justify-end">
                <span className="inline-flex items-center gap-1.5 text-xs text-[#77786F] bg-white px-3 py-1.5 rounded border border-[#E7E4DC]">
                  <Sliders className="w-3.5 h-3.5 text-[#777C55]" />
                  Personalized Engine
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-24 md:py-32 bg-white border-b border-[#E7E4DC]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16">
            <p className="text-xs font-semibold tracking-wider uppercase text-[#777C55] mb-2">
              Workflow
            </p>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#252720] font-normal">
              How LUNA works with you
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-lg bg-[#F7F5F0] border border-[#E7E4DC] flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#777C55]">
                  Step 1
                </span>
                <h3 className="font-serif text-xl text-[#252720] mt-3 mb-3 font-normal">
                  Tell LUNA what matters to you.
                </h3>
                <p className="text-sm text-[#77786F] leading-relaxed">
                  Complete a calm, 1-minute onboarding with your preferred learning level,
                  communication style, and primary language.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-lg bg-[#F7F5F0] border border-[#E7E4DC] flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#777C55]">
                  Step 2
                </span>
                <h3 className="font-serif text-xl text-[#252720] mt-3 mb-3 font-normal">
                  Start a conversation.
                </h3>
                <p className="text-sm text-[#77786F] leading-relaxed">
                  Ask by typing, using your microphone, or launching an interactive video
                  session with the Tavus AI avatar.
                </p>
              </div>
            </div>

            <div className="p-8 rounded-lg bg-[#F7F5F0] border border-[#E7E4DC] flex flex-col justify-between">
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-[#777C55]">
                  Step 3
                </span>
                <h3 className="font-serif text-xl text-[#252720] mt-3 mb-3 font-normal">
                  Explore ideas and learn.
                </h3>
                <p className="text-sm text-[#77786F] leading-relaxed">
                  Dig into complex concepts step-by-step, review real web citations, and
                  resume your previous conversations anytime.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 md:py-32 bg-[#F7F5F0] text-center border-b border-[#E7E4DC]">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="font-serif text-3xl sm:text-5xl text-[#252720] font-normal mb-6">
            Ready to think things through?
          </h2>
          <p className="text-lg text-[#77786F] mb-10 max-w-xl mx-auto">
            Step into your personal conversational sanctuary. No noise, no distractions—just
            clarity.
          </p>
          <Link
            href={user ? "/chat" : "/login"}
            className="inline-flex items-center gap-2.5 px-8 py-4 rounded-md bg-[#777C55] hover:bg-[#5E6341] text-white text-[16px] font-medium transition-colors duration-200 shadow-sm"
          >
            <span>Meet LUNA</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-white text-xs text-[#77786F]">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-serif text-lg text-[#252720] font-normal">LUNA AI</span>
            <span className="text-[#E7E4DC]">|</span>
            <span>Your space to think.</span>
          </div>

          <div className="flex items-center gap-6">
            <span>English · हिन्दी · తెలుగు</span>
            <span className="text-[#E7E4DC]">|</span>
            <span>Privacy</span>
            <span>Terms</span>
            <span>Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
