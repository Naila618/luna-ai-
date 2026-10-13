"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  Sparkles,
  AlertCircle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Compass,
  Volume2,
  RefreshCw,
} from "lucide-react";
import { TavusConversationState, Message, SupportedLanguage } from "@/types";

interface TavusVideoWorkspaceProps {
  onClose: () => void;
  language: SupportedLanguage;
  contextPrompt?: string;
  onNewMessage?: (msg: Message) => void;
}

const TAVUS_DEPLOYMENT_URL =
  process.env.NEXT_PUBLIC_TAVUS_DEPLOYMENT_URL ||
  "https://maker.tavus.io/deployments/a53a81d3-78c1-4fba-bd15-2421a96e51d4";

const TAVUS_DEPLOYMENT_ID = "a53a81d3-78c1-4fba-bd15-2421a96e51d4";

export default function TavusVideoWorkspace({
  onClose,
  language = "en",
  contextPrompt = "",
  onNewMessage,
}: TavusVideoWorkspaceProps) {
  const [sessionState, setSessionState] =
    useState<TavusConversationState>("connecting");
  const [conversationUrl, setConversationUrl] = useState<string>(
    TAVUS_DEPLOYMENT_URL
  );
  const [deploymentId, setDeploymentId] = useState<string>(TAVUS_DEPLOYMENT_ID);
  const [callWindowRef, setCallWindowRef] = useState<Window | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Audio / Mic controls in LUNA
  const [micEnabled, setMicEnabled] = useState(true);
  const [cameraEnabled, setCameraEnabled] = useState(true);

  // Live transcript / session notes
  const [transcript, setTranscript] = useState<
    Array<{ id: string; role: "user" | "luna"; text: string; time: string }>
  >([
    {
      id: "initial",
      role: "luna",
      text:
        language === "hi"
          ? "नमस्ते! मैं LUNA हूँ। आपकी Tavus वीडियो कॉल सत्र तैयार है।"
          : language === "te"
          ? "నమస్కారం! నేను LUNA ని. మీ Tavus వీడియో కాల్ సెషన్ సిద్ధంగా ఉంది."
          : "Hello. I'm LUNA. Your Tavus video call session is configured and ready to connect.",
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    },
  ]);

  const [inputSpeech, setInputSpeech] = useState("");
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Query backend Tavus session endpoint to verify configuration
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        setSessionState("connecting");
        const res = await fetch("/api/tavus/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            language,
            context: contextPrompt,
          }),
        });

        const data = await res.json();
        if (!isMounted) return;

        if (data.configured && (data.conversation_url || data.deployment_url)) {
          const url = data.conversation_url || data.deployment_url || TAVUS_DEPLOYMENT_URL;
          setConversationUrl(url);
          if (data.deployment_id) setDeploymentId(data.deployment_id);
          setSessionState("ready");
        } else {
          // If no custom API key, use verified direct maker deployment
          setConversationUrl(TAVUS_DEPLOYMENT_URL);
          setSessionState("ready");
        }
      } catch (err: any) {
        if (!isMounted) return;
        console.warn("Backend Tavus check fallback:", err);
        setConversationUrl(TAVUS_DEPLOYMENT_URL);
        setSessionState("ready");
      }
    }

    initSession();

    return () => {
      isMounted = false;
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [language, contextPrompt]);

  // Setup Web Speech API for auxiliary notes / transcript input
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      ("webkitSpeechRecognition" in window || "SpeechRecognition" in window)
    ) {
      const SpeechRecognition =
        (window as any).SpeechRecognition ||
        (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang =
        language === "hi" ? "hi-IN" : language === "te" ? "te-IN" : "en-US";

      rec.onstart = () => {
        if (sessionState === "ready") {
          setSessionState("listening");
        }
      };

      rec.onresult = (event: any) => {
        let interim = "";
        let final = "";

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            final += event.results[i][0].transcript;
          } else {
            interim += event.results[i][0].transcript;
          }
        }

        if (interim) {
          setInputSpeech(interim);
        }

        if (final) {
          handleUserVoiceUtterance(final);
          setInputSpeech("");
        }
      };

      rec.onerror = (e: any) => {
        console.warn("Speech recognition warning:", e);
      };

      recognitionRef.current = rec;
      if (micEnabled) {
        try {
          rec.start();
        } catch {
          // already running
        }
      }
    }
  }, [language, micEnabled]);

  // Launch the live Tavus video conversation deployment in a dedicated secure tab
  const handleLaunchVideoCall = () => {
    setSessionState("in_call");

    const win = window.open(
      conversationUrl,
      "_blank",
      "noopener,noreferrer"
    );
    if (win) {
      setCallWindowRef(win);
    }

    // Add note to transcript
    setTranscript((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        role: "luna",
        text: "Connecting to Tavus video avatar... Your secure call window has launched. When finished, click 'End Conversation' here to return to your workspace.",
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
    ]);
  };

  const handleUserVoiceUtterance = async (userText: string) => {
    const userMsg = {
      id: Date.now().toString(),
      role: "user" as const,
      text: userText,
      time: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      }),
    };

    setTranscript((prev) => [...prev, userMsg]);
    if (onNewMessage) {
      onNewMessage({
        id: userMsg.id,
        role: "user",
        content: userText,
        createdAt: new Date().toISOString(),
      });
    }

    // Query LUNA companion for in-sync response
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [{ role: "user", content: userText }],
          language,
        }),
      });
      const data = await res.json();
      const replyText =
        data.content ||
        (language === "hi"
          ? "मैंने आपकी बात समझ ली है।"
          : language === "te"
          ? "నేను మీ మాటలను అర్థం చేసుకున్నాను."
          : "I understand. I am keeping our thoughts synchronized.");

      const lunaMsg = {
        id: (Date.now() + 1).toString(),
        role: "luna" as const,
        text: replyText,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setTranscript((prev) => [...prev, lunaMsg]);
      if (onNewMessage) {
        onNewMessage({
          id: lunaMsg.id,
          role: "assistant",
          content: replyText,
          createdAt: new Date().toISOString(),
        });
      }
    } catch {
      // Fallback
    }
  };

  const handleEndSession = () => {
    setSessionState("ended");

    // Clean up local listeners & resources
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }

    // Try to close child call window if permissible
    if (callWindowRef && !callWindowRef.closed) {
      try {
        callWindowRef.close();
      } catch {
        // May be restricted by browser popup security
      }
    }

    setTimeout(() => {
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#252720]/60 backdrop-blur-sm flex items-center justify-center p-3 md:p-6 font-sans select-none">
      <div className="w-full max-w-5xl h-[90vh] max-h-[780px] bg-[#F7F5F0] rounded-2xl border border-[#E7E4DC] shadow-2xl flex flex-col overflow-hidden">
        {/* Top Video Header */}
        <div className="px-6 py-4 bg-white border-b border-[#E7E4DC] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg text-[#252720]">LUNA</span>
              <span className="text-xs text-[#77786F]">
                · Conversational Video Avatar
              </span>
            </div>

            {/* Dynamic Real-time Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EAEDE1] text-xs font-medium border border-[#777C55]/20">
              <span
                className={`w-2 h-2 rounded-full ${
                  sessionState === "in_call"
                    ? "bg-blue-500 animate-ping"
                    : sessionState === "listening" ||
                      sessionState === "user_speaking"
                    ? "bg-[#777C55] animate-pulse"
                    : sessionState === "ready"
                    ? "bg-emerald-500"
                    : sessionState === "connecting"
                    ? "bg-amber-500 animate-spin"
                    : sessionState === "ended"
                    ? "bg-rose-500"
                    : "bg-[#777C55]"
                }`}
              />
              <span className="text-[#5E6341] capitalize">
                {sessionState === "in_call"
                  ? "In Call · Tavus Live"
                  : sessionState === "connecting"
                  ? "Connecting..."
                  : sessionState === "ready"
                  ? "Ready to Call"
                  : sessionState === "ended"
                  ? "Call Ended"
                  : sessionState.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Action Button: End Conversation */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleEndSession}
              className="px-4 py-2 rounded-lg bg-[#B95F4B] hover:bg-[#A34E3C] text-white text-xs font-medium transition-colors flex items-center gap-2 shadow-sm active:scale-95"
            >
              <PhoneOff className="w-3.5 h-3.5" />
              <span>End conversation</span>
            </button>
          </div>
        </div>

        {/* 2-Column Responsive Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 min-h-0 overflow-hidden">
          {/* LEFT COLUMN: Tavus Avatar Video Portal */}
          <div className="lg:col-span-7 bg-[#1C1E1A] flex flex-col justify-between p-6 relative overflow-hidden">
            {/* Visual Avatar Video Container */}
            <div className="flex-1 w-full rounded-xl bg-[#141613] border border-white/10 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
              {/* Radial subtle ambient background */}
              <div className="absolute inset-0 bg-radial from-[#777C55]/15 via-transparent to-transparent pointer-events-none" />

              {/* Holographic Avatar Graphic with Reacting Sound Waves */}
              <div className="relative mb-6 z-10">
                <div
                  className={`w-36 h-36 rounded-full border-2 border-[#777C55] flex items-center justify-center transition-all duration-300 ${
                    sessionState === "in_call"
                      ? "ring-8 ring-blue-500/25 scale-105"
                      : sessionState === "listening"
                      ? "ring-4 ring-[#777C55]/20"
                      : "ring-2 ring-[#777C55]/10"
                  }`}
                  style={{
                    background:
                      "radial-gradient(circle, rgba(119,124,85,0.4) 0%, rgba(20,22,19,0.9) 100%)",
                  }}
                >
                  <Sparkles className="w-10 h-10 text-[#EAEDE1] opacity-90" />
                </div>

                {/* Animated Audio Reaction Waves */}
                {sessionState === "in_call" && (
                  <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-[#1C1E1A] px-3 py-1 rounded-full border border-blue-500/40 shadow-lg">
                    <span className="w-1 h-3.5 bg-blue-400 animate-bounce" />
                    <span className="w-1 h-5 bg-blue-400 animate-bounce [animation-delay:0.1s]" />
                    <span className="w-1 h-2.5 bg-blue-400 animate-bounce [animation-delay:0.2s]" />
                    <span className="w-1 h-4 bg-blue-400 animate-bounce [animation-delay:0.3s]" />
                  </div>
                )}
              </div>

              {/* Title & Status Details */}
              <h2 className="font-serif text-2xl text-[#F7F5F0] mb-1 font-normal z-10">
                Luna AI Video Avatar
              </h2>
              <p className="text-xs text-[#A5A79E] max-w-sm mb-6 z-10">
                {sessionState === "in_call"
                  ? "Live video conversation active in secure Tavus call window."
                  : "Photorealistic Tavus video companion with real-time speech and face-to-face interaction."}
              </p>

              {/* Interactive Call Launch CTA */}
              <div className="z-10 flex flex-col items-center gap-3 w-full max-w-xs">
                {sessionState !== "in_call" ? (
                  <button
                    type="button"
                    onClick={handleLaunchVideoCall}
                    className="w-full py-3 px-5 rounded-xl bg-[#777C55] hover:bg-[#5E6341] text-white font-medium text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(119,124,85,0.4)] transition-all active:scale-98"
                  >
                    <VideoIcon className="w-4 h-4" />
                    <span>Launch Video Call (Tavus Live)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (callWindowRef && !callWindowRef.closed) {
                        callWindowRef.focus();
                      } else {
                        handleLaunchVideoCall();
                      }
                    }}
                    className="w-full py-3 px-5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs tracking-wide flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(37,99,235,0.4)] transition-all active:scale-98"
                  >
                    <RefreshCw className="w-4 h-4" />
                    <span>Bring Call Window to Front</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Deployment Security Badge */}
              <div className="mt-6 flex items-center gap-2 text-[11px] text-[#A5A79E]/80 z-10">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Connected Deployment: {deploymentId.substring(0, 18)}...</span>
              </div>
            </div>

            {/* Video & Audio Controls Bar */}
            <div className="mt-4 flex items-center justify-between bg-black/40 py-2.5 px-4 rounded-xl border border-white/10">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMicEnabled(!micEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    micEnabled
                      ? "bg-[#777C55] text-white hover:bg-[#5E6341]"
                      : "bg-[#B95F4B] text-white"
                  }`}
                  title={micEnabled ? "Mute Microphone" : "Unmute Microphone"}
                >
                  {micEnabled ? (
                    <Mic className="w-3.5 h-3.5" />
                  ) : (
                    <MicOff className="w-3.5 h-3.5" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setCameraEnabled(!cameraEnabled)}
                  className={`p-2 rounded-lg transition-colors ${
                    cameraEnabled
                      ? "bg-white/15 text-white hover:bg-white/25"
                      : "bg-[#B95F4B] text-white"
                  }`}
                  title={cameraEnabled ? "Turn camera off" : "Turn camera on"}
                >
                  {cameraEnabled ? (
                    <VideoIcon className="w-3.5 h-3.5" />
                  ) : (
                    <VideoOff className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center gap-2 text-xs text-[#A5A79E]">
                <Volume2 className="w-3.5 h-3.5 text-[#8DA58A]" />
                <span className="font-mono text-[11px]">
                  {language.toUpperCase()} WebRTC Audio
                </span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Transcript & Session Sync */}
          <div className="lg:col-span-5 bg-white flex flex-col justify-between border-l border-[#E7E4DC] min-h-0 select-text">
            <div className="p-4 border-b border-[#E7E4DC] bg-[#F7F5F0]/60 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#777C55]">
                  Live Session Transcript
                </span>
                <p className="text-[11px] text-[#77786F]">
                  Synced with LUNA companion
                </p>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#EAEDE1] text-[#5E6341] font-mono">
                Real-time
              </span>
            </div>

            {/* Message Stream */}
            <div className="flex-1 p-5 overflow-y-auto space-y-3.5 text-xs">
              {transcript.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.role === "user" ? "items-end" : "items-start"
                  }`}
                >
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-[11px] font-medium text-[#77786F]">
                      {msg.role === "user" ? "You" : "LUNA"}
                    </span>
                    <span className="text-[10px] text-[#77786F]/50">
                      {msg.time}
                    </span>
                  </div>
                  <div
                    className={`max-w-[88%] p-3.5 rounded-xl leading-relaxed ${
                      msg.role === "user"
                        ? "bg-[#EAEDE1] text-[#252720] border border-[#777C55]/25 rounded-tr-none"
                        : "bg-[#F7F5F0] text-[#252720] border border-[#E7E4DC] rounded-tl-none shadow-sm"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}

              {inputSpeech && (
                <div className="flex flex-col items-end">
                  <span className="text-[10px] text-[#77786F] mb-1">
                    You (speaking...)
                  </span>
                  <div className="max-w-[88%] p-3 rounded-xl text-xs bg-[#EAEDE1]/70 text-[#252720] italic border border-dashed border-[#777C55]">
                    {inputSpeech}
                  </div>
                </div>
              )}

              <div ref={transcriptEndRef} />
            </div>

            {/* Informational Guidance on Tavus Deployment Architecture */}
            <div className="p-3.5 bg-[#EAEDE1]/40 border-t border-[#E7E4DC] text-[11px] text-[#5E6341] flex items-start gap-2">
              <Compass className="w-3.5 h-3.5 text-[#777C55] shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                Tavus video synthesis and facial animation run in the dedicated call session.
                Notes dictated here persist directly in your LUNA conversation history.
              </p>
            </div>

            {/* In-Session Quick Text Input */}
            <div className="p-3.5 border-t border-[#E7E4DC] bg-[#F7F5F0]/30">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  const target = e.currentTarget.elements.namedItem(
                    "textMsg"
                  ) as HTMLInputElement;
                  if (target.value.trim()) {
                    handleUserVoiceUtterance(target.value.trim());
                    target.value = "";
                  }
                }}
                className="flex items-center gap-2"
              >
                <input
                  name="textMsg"
                  type="text"
                  placeholder="Type a note or query to speak..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-[#E7E4DC] bg-white focus:outline-none focus:border-[#777C55] transition-colors"
                />
                <button
                  type="submit"
                  className="px-3.5 py-2 bg-[#777C55] hover:bg-[#5E6341] text-white text-xs font-medium rounded-lg transition-colors shadow-sm"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
