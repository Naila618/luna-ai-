"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Compass,
  Video,
  Mic,
  MicOff,
  Send,
  Sliders,
  LogOut,
  Globe,
  Trash2,
  Edit2,
  Check,
  X,
  ExternalLink,
  ChevronRight,
  Menu,
  Sparkles,
  Loader2,
  Copy,
  BookOpen,
  Key,
} from "lucide-react";
import { useAuth } from "@/lib/auth/AuthContext";
import {
  Conversation,
  Message,
  SupportedLanguage,
  Citation,
} from "@/types";
import {
  loadUserConversations,
  createNewConversation,
  updateConversationTitle,
  deleteConversation,
  appendMessageToConversation,
} from "@/lib/storage";
import { SUPPORTED_LANGUAGES, getTranslation } from "@/lib/i18n";
import TavusVideoWorkspace from "@/components/video/TavusVideoWorkspace";

const TAVUS_DEPLOYMENT_URL =
  process.env.NEXT_PUBLIC_TAVUS_DEPLOYMENT_URL ||
  "https://maker.tavus.io/deployments/a53a81d3-78c1-4fba-bd15-2421a96e51d4";

export default function ChatPage() {
  const router = useRouter();
  const { user, loading: authLoading, preferences, signOutUser } = useAuth();

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>("en");
  const [isResearchMode, setIsResearchMode] = useState<boolean>(false);
  const [showVideoModal, setShowVideoModal] = useState<boolean>(false);

  // Input states
  const [inputText, setInputText] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isListeningMic, setIsListeningMic] = useState(false);

  // Mobile sidebar drawer
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Rename conversation state
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [tempTitle, setTempTitle] = useState("");

  // Contextual Research Panel
  const [activeCitations, setActiveCitations] = useState<Citation[] | null>(null);
  const [showResearchDrawer, setShowResearchDrawer] = useState(false);

  // Copy feedback
  const [copiedMsgId, setCopiedMsgId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auth guard & redirect
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [user, authLoading, router]);

  // Load language preference from user profile
  useEffect(() => {
    if (preferences?.preferredLanguage) {
      const lower = preferences.preferredLanguage.toLowerCase();
      if (lower.includes("hindi")) setSelectedLanguage("hi");
      else if (lower.includes("telugu")) setSelectedLanguage("te");
      else setSelectedLanguage("en");
    }
  }, [preferences]);

  // Load conversations on user ready
  useEffect(() => {
    if (user?.uid) {
      const list = loadUserConversations(user.uid);
      if (list.length > 0) {
        setConversations(list);
        setActiveConvId(list[0].id);
        setIsResearchMode(list[0].isResearch);
      } else {
        const fresh = createNewConversation(user.uid, selectedLanguage, false);
        setConversations([fresh]);
        setActiveConvId(fresh.id);
      }
    }
  }, [user?.uid]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversations, activeConvId, isSending]);

  const activeConversation = conversations.find((c) => c.id === activeConvId);

  // Handle New Conversation
  const handleNewConversation = (research: boolean = false) => {
    if (!user) return;
    const fresh = createNewConversation(user.uid, selectedLanguage, research);
    setConversations((prev) => [fresh, ...prev]);
    setActiveConvId(fresh.id);
    setIsResearchMode(research);
    setInputText("");
    setActiveCitations(null);
    setShowResearchDrawer(false);
    setMobileSidebarOpen(false);
  };

  // Switch Conversation
  const handleSelectConversation = (conv: Conversation) => {
    setActiveConvId(conv.id);
    setIsResearchMode(conv.isResearch);
    if (conv.language) {
      setSelectedLanguage(conv.language);
    }
    const lastWithCitations = [...conv.messages]
      .reverse()
      .find((m) => m.citations && m.citations.length > 0);
    if (lastWithCitations?.citations) {
      setActiveCitations(lastWithCitations.citations);
    } else {
      setActiveCitations(null);
      setShowResearchDrawer(false);
    }
    setMobileSidebarOpen(false);
  };

  // Rename Conversation
  const handleSaveRename = (convId: string) => {
    if (!user || !tempTitle.trim()) {
      setEditingTitleId(null);
      return;
    }
    const updated = updateConversationTitle(user.uid, convId, tempTitle.trim());
    setConversations(updated);
    setEditingTitleId(null);
  };

  // Delete Conversation
  const handleDeleteConv = (e: React.MouseEvent, convId: string) => {
    e.stopPropagation();
    if (!user) return;
    const updated = deleteConversation(user.uid, convId);
    setConversations(updated);
    if (activeConvId === convId) {
      if (updated.length > 0) {
        setActiveConvId(updated[0].id);
      } else {
        const fresh = createNewConversation(user.uid, selectedLanguage, false);
        setConversations([fresh]);
        setActiveConvId(fresh.id);
      }
    }
  };

  // Send Message
  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !user || !activeConvId || isSending) return;

    setInputText("");
    setIsSending(true);

    const userMessage: Message = {
      id: "usr_" + Date.now().toString(),
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
      isResearch: isResearchMode,
      language: selectedLanguage,
    };

    // Append to local state
    let updatedList = appendMessageToConversation(user.uid, activeConvId, userMessage);
    setConversations(updatedList);

    try {
      let citationsResult: Citation[] | undefined = undefined;

      const localGeminiKey =
        typeof window !== "undefined"
          ? localStorage.getItem("luna_gemini_api_key") || undefined
          : undefined;

      // If in Research Mode, run deep web research API first
      if (isResearchMode) {
        try {
          const resRes = await fetch("/api/research", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: text,
              language: selectedLanguage,
              geminiApiKey: localGeminiKey,
            }),
          });
          const resData = await resRes.json();
          if (resData.citations && resData.citations.length > 0) {
            citationsResult = resData.citations;
            setActiveCitations(citationsResult || null);
            setShowResearchDrawer(true);
          }
        } catch (e) {
          console.warn("Research fetch failed:", e);
        }
      }

      // Call assistant chat API with personalization context
      const chatRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [
            ...(activeConversation?.messages || []).map((m) => ({
              role: m.role,
              content: m.content,
            })),
            { role: "user", content: text },
          ],
          preferences,
          language: selectedLanguage,
          isResearch: isResearchMode,
          geminiApiKey: localGeminiKey,
        }),
      });

      const chatData = await chatRes.json();
      const replyContent =
        chatData.content ||
        "I have processed your thought and am ready to dive deeper.";

      const assistantMessage: Message = {
        id: "ast_" + Date.now().toString(),
        role: "assistant",
        content: replyContent,
        createdAt: new Date().toISOString(),
        citations: citationsResult,
        isResearch: isResearchMode,
        language: selectedLanguage,
      };

      updatedList = appendMessageToConversation(user.uid, activeConvId, assistantMessage);
      setConversations(updatedList);
    } catch (err) {
      console.error("Failed to generate response:", err);
      const errMsg: Message = {
        id: "err_" + Date.now().toString(),
        role: "assistant",
        content:
          "I experienced a brief connection interruption. Please try asking again.",
        createdAt: new Date().toISOString(),
      };
      updatedList = appendMessageToConversation(user.uid, activeConvId, errMsg);
      setConversations(updatedList);
    } finally {
      setIsSending(false);
    }
  };

  // Toggle Microphone for Speech-To-Text
  const handleToggleMic = () => {
    if (typeof window === "undefined") return;

    if (isListeningMic) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListeningMic(false);
      return;
    }

    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Speech recognition is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.lang =
      selectedLanguage === "hi"
        ? "hi-IN"
        : selectedLanguage === "te"
        ? "te-IN"
        : "en-US";

    rec.onstart = () => {
      setIsListeningMic(true);
    };

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results)
        .map((r: any) => r[0].transcript)
        .join("");
      setInputText(transcript);
    };

    rec.onerror = () => {
      setIsListeningMic(false);
    };

    rec.onend = () => {
      setIsListeningMic(false);
    };

    recognitionRef.current = rec;
    rec.start();
  };

  // Copy helper
  const handleCopyText = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedMsgId(id);
    setTimeout(() => setCopiedMsgId(null), 1800);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#F7F5F0] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#777C55]" />
      </div>
    );
  }

  return (
    <div className="h-screen bg-[#F7F5F0] text-[#252720] flex overflow-hidden font-sans selection:bg-[#EAEDE1]">
      {/* SIDEBAR (Desktop Minimal) */}
      <aside className="hidden md:flex w-72 bg-[#F7F5F0] border-r border-[#E7E4DC] flex-col justify-between shrink-0">
        {/* Brand & New Chat */}
        <div className="p-5 border-b border-[#E7E4DC]">
          <Link href="/" className="flex items-center gap-2 mb-5">
            <span className="font-serif text-xl tracking-tight text-[#252720]">
              LUNA AI
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#777C55]" />
          </Link>

          <button
            type="button"
            onClick={() => handleNewConversation(false)}
            className="w-full py-2.5 px-3.5 rounded-md bg-[#777C55] hover:bg-[#5E6341] text-white text-xs font-medium transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>New conversation</span>
          </button>
        </div>

        {/* Recent Conversations */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 text-[11px] font-semibold uppercase tracking-wider text-[#77786F] mb-2">
            Recent Conversations
          </p>

          {conversations.length === 0 ? (
            <p className="px-3 text-xs text-[#77786F] italic">No conversations yet.</p>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeConvId;
              const isEditing = editingTitleId === c.id;

              return (
                <div
                  key={c.id}
                  onClick={() => !isEditing && handleSelectConversation(c)}
                  className={`group w-full px-3 py-2 rounded-md text-xs transition-colors flex items-center justify-between cursor-pointer ${
                    isActive
                      ? "bg-[#EAEDE1] text-[#252720] font-medium"
                      : "text-[#77786F] hover:bg-white hover:text-[#252720]"
                  }`}
                >
                  {isEditing ? (
                    <div className="flex items-center gap-1 w-full" onClick={(e) => e.stopPropagation()}>
                      <input
                        type="text"
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        autoFocus
                        className="w-full px-1.5 py-0.5 text-xs bg-white border border-[#777C55] rounded"
                      />
                      <button
                        onClick={() => handleSaveRename(c.id)}
                        className="p-1 text-[#777C55] hover:bg-[#F7F5F0] rounded"
                      >
                        <Check className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => setEditingTitleId(null)}
                        className="p-1 text-[#B95F4B] hover:bg-[#F7F5F0] rounded"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 truncate pr-2">
                        {c.isResearch ? (
                          <Compass className="w-3.5 h-3.5 text-[#777C55] shrink-0" />
                        ) : (
                          <span className="w-1.5 h-1.5 rounded-full bg-[#77786F]/40 shrink-0" />
                        )}
                        <span className="truncate">{c.title}</span>
                      </div>

                      <div className="hidden group-hover:flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingTitleId(c.id);
                            setTempTitle(c.title);
                          }}
                          className="p-1 hover:text-[#777C55]"
                          title="Rename"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleDeleteConv(e, c.id)}
                          className="p-1 hover:text-[#B95F4B]"
                          title="Delete"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Sidebar: Language & User Profile */}
        <div className="p-4 border-t border-[#E7E4DC] bg-white space-y-3">
          {/* Language Selector */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-[#77786F] flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#777C55]" />
              <span>Language</span>
            </span>
            <div className="flex items-center gap-1 bg-[#F7F5F0] p-1 rounded border border-[#E7E4DC]">
              {SUPPORTED_LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    selectedLanguage === lang.code
                      ? "bg-[#777C55] text-white"
                      : "text-[#77786F] hover:text-[#252720]"
                  }`}
                >
                  {lang.code.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Preferences link */}
          <Link
            href="/settings"
            className="flex items-center justify-between py-1.5 text-xs text-[#77786F] hover:text-[#252720] transition-colors"
          >
            <span className="flex items-center gap-2">
              <Sliders className="w-3.5 h-3.5 text-[#777C55]" />
              <span>Preferences</span>
            </span>
            <ChevronRight className="w-3.5 h-3.5 opacity-50" />
          </Link>

          {/* User & Sign out */}
          <div className="pt-2 border-t border-[#E7E4DC] flex items-center justify-between text-xs">
            <div className="truncate max-w-[130px]">
              <p className="font-medium text-[#252720] truncate">
                {user?.displayName || "You"}
              </p>
              <p className="text-[11px] text-[#77786F] truncate">{user?.email}</p>
            </div>
            <button
              type="button"
              onClick={signOutUser}
              className="p-1.5 rounded hover:bg-[#F7F5F0] text-[#77786F] hover:text-[#B95F4B] transition-colors"
              title="Sign out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/30 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* MAIN CONVERSATION WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F7F5F0] relative">
        {/* Top Header */}
        <header className="h-16 border-b border-[#E7E4DC] bg-white px-4 md:px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 truncate">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="md:hidden p-1.5 text-[#77786F] hover:text-[#252720]"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="truncate">
              <h1 className="text-sm font-medium text-[#252720] truncate">
                {activeConversation?.title || "Conversation"}
              </h1>
              <div className="flex items-center gap-2 text-[11px] text-[#77786F]">
                <span>
                  {isResearchMode ? "Research Mode" : "Standard Conversation"}
                </span>
                <span>·</span>
                <span className="capitalize">
                  {selectedLanguage === "hi"
                    ? "हिन्दी"
                    : selectedLanguage === "te"
                    ? "తెలుగు"
                    : "English"}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Video Call Launch CTA */}
            <a
              href={TAVUS_DEPLOYMENT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-md bg-[#EAEDE1] hover:bg-[#DCE2CE] text-[#5E6341] text-xs font-medium transition-colors flex items-center gap-1.5 border border-[#777C55]/30 cursor-pointer shadow-sm active:scale-95"
              title="Launch Tavus video call"
            >
              <Video className="w-3.5 h-3.5 text-[#777C55]" />
              <span className="hidden sm:inline">Video Call</span>
            </a>

            {/* Research Drawer toggle button if citations available */}
            {activeCitations && (
              <button
                type="button"
                onClick={() => setShowResearchDrawer(!showResearchDrawer)}
                className="px-3 py-1.5 rounded-md bg-white border border-[#E7E4DC] text-[#777C55] text-xs font-medium hover:bg-[#F7F5F0] flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>{activeCitations.length} Sources</span>
              </button>
            )}
          </div>
        </header>

        {/* Conversation Stream */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-16 py-8">
          {(!activeConversation || activeConversation.messages.length === 0) ? (
            /* Welcome / Empty State outside the conversation history */
            <div className="max-w-2xl mx-auto py-24 text-center select-none">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#EAEDE1] text-[#777C55] mb-5">
                <Sparkles className="w-5 h-5" />
              </div>

              <h2 className="font-serif text-3xl sm:text-4xl text-[#252720] font-normal mb-3 tracking-tight">
                What would you like to think through today?
              </h2>
              <p className="text-sm text-[#77786F] max-w-md mx-auto leading-relaxed">
                A personal space for learning, reasoning, and exploring ideas.
              </p>
            </div>
          ) : (
            /* Active Messages List */
            <div className="max-w-3xl mx-auto space-y-6">
              {activeConversation.messages.map((msg) => {
                const isUser = msg.role === "user";
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isUser ? "items-end" : "items-start"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[11px] text-[#77786F]">
                      <span className="font-medium">
                        {isUser ? user?.displayName || "You" : "LUNA"}
                      </span>
                      {msg.isResearch && (
                        <span className="px-1.5 py-0.2 rounded bg-[#EAEDE1] text-[#777C55] text-[10px]">
                          Research
                        </span>
                      )}
                    </div>

                    <div
                      className={`relative group max-w-[90%] sm:max-w-[85%] rounded-lg p-4 text-sm leading-relaxed ${
                        isUser
                          ? "bg-[#EAEDE1] text-[#252720] border border-[#777C55]/30 rounded-tr-none"
                          : "bg-white text-[#252720] border border-[#E7E4DC] rounded-tl-none shadow-subtle"
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>

                      {/* Interactive guidance if provider key is missing */}
                      {!isUser && msg.content.includes("GEMINI_API_KEY") && (
                        <div className="mt-3 pt-3 border-t border-[#E7E4DC] flex flex-wrap items-center gap-2">
                          <Link
                            href="/settings#api-keys"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-[#777C55] hover:bg-[#5E6341] text-white text-xs font-medium transition-colors shadow-sm"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Configure Gemini Key in Settings</span>
                          </Link>
                          <span className="text-[11px] text-[#77786F]">
                            Takes 10 seconds · Stored securely in your browser
                          </span>
                        </div>
                      )}

                      {/* Sources pill if message has citations */}
                      {msg.citations && msg.citations.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-[#E7E4DC] flex flex-wrap gap-2">
                          <span className="text-[11px] font-medium text-[#77786F] flex items-center gap-1">
                            <Compass className="w-3 h-3 text-[#777C55]" />
                            Sources:
                          </span>
                          {msg.citations.map((cite, idx) => (
                            <a
                              key={idx}
                              href={cite.url}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] text-[#777C55] hover:text-[#5E6341] bg-[#F7F5F0] px-2 py-0.5 rounded border border-[#E7E4DC] transition-colors"
                            >
                              <span className="truncate max-w-[140px]">{cite.title}</span>
                              <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                            </a>
                          ))}
                        </div>
                      )}

                      {/* Copy action */}
                      {!isUser && (
                        <button
                          type="button"
                          onClick={() => handleCopyText(msg.id, msg.content)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 p-1 text-[#77786F] hover:text-[#252720]"
                          title="Copy text"
                        >
                          {copiedMsgId === msg.id ? (
                            <Check className="w-3.5 h-3.5 text-[#8DA58A]" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Waiting indicator */}
              {isSending && (
                <div className="flex items-start gap-2 text-[#77786F] text-xs">
                  <div className="p-3 bg-white rounded-lg border border-[#E7E4DC] flex items-center gap-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#777C55]" />
                    <span>LUNA is reflecting...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* INPUT COMPOSER AREA */}
        <div className="p-4 sm:p-6 bg-[#F7F5F0] border-t border-[#E7E4DC]">
          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl bg-white border border-[#E7E4DC] p-3 shadow-subtle focus-within:border-[#777C55] transition-colors">
              {/* Text Area */}
              <textarea
                rows={2}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder={
                  isResearchMode
                    ? "Enter a deep topic or question to research across the web..."
                    : selectedLanguage === "hi"
                    ? "कुछ भी पूछें, किसी विचार पर बात करें..."
                    : selectedLanguage === "te"
                    ? "ఏదైనా అడగండి లేదా మీ ఆలోచనలను పంచుకోండి..."
                    : "Ask anything, explore an idea, or paste text..."
                }
                className="w-full bg-transparent border-none text-sm text-[#252720] placeholder-[#77786F]/60 resize-none focus:outline-none"
              />

              {/* Action Buttons Toolbar */}
              <div className="flex items-center justify-between pt-2 border-t border-[#E7E4DC]/60 mt-1">
                <div className="flex items-center gap-2">
                  {/* Research Mode Toggle */}
                  <button
                    type="button"
                    onClick={() => setIsResearchMode(!isResearchMode)}
                    className={`px-2.5 py-1 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                      isResearchMode
                        ? "bg-[#EAEDE1] text-[#777C55] border border-[#777C55]/40"
                        : "text-[#77786F] hover:bg-[#F7F5F0]"
                    }`}
                  >
                    <Compass className="w-3.5 h-3.5" />
                    <span>Research Mode</span>
                  </button>

                  {/* Mic Speech-to-text button */}
                  <button
                    type="button"
                    onClick={handleToggleMic}
                    className={`p-1.5 rounded transition-colors ${
                      isListeningMic
                        ? "bg-[#B95F4B] text-white animate-pulse"
                        : "text-[#77786F] hover:bg-[#F7F5F0]"
                    }`}
                    title={isListeningMic ? "Stop listening" : "Speak through microphone"}
                  >
                    {isListeningMic ? (
                      <MicOff className="w-4 h-4" />
                    ) : (
                      <Mic className="w-4 h-4" />
                    )}
                  </button>
                </div>

                {/* Send Button */}
                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={!inputText.trim() || isSending}
                  className="px-4 py-1.5 rounded-md bg-[#777C55] hover:bg-[#5E6341] disabled:opacity-40 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                >
                  <span>Send</span>
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <p className="text-[11px] text-center text-[#77786F]/70 mt-2">
              LUNA adapts to your pace. Press Enter to send, Shift + Enter for new lines.
            </p>
          </div>
        </div>
      </main>

      {/* CONTEXTUAL RESEARCH PANEL (Slides in when citations are active) */}
      {showResearchDrawer && activeCitations && (
        <aside className="w-80 bg-white border-l border-[#E7E4DC] flex flex-col justify-between shrink-0 h-full z-20">
          <div className="p-4 border-b border-[#E7E4DC] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#777C55]" />
              <span className="text-xs font-medium text-[#252720]">
                Research Sources ({activeCitations.length})
              </span>
            </div>
            <button
              onClick={() => setShowResearchDrawer(false)}
              className="p-1 text-[#77786F] hover:text-[#252720]"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {activeCitations.map((cite, i) => (
              <div
                key={i}
                className="p-3 rounded-md bg-[#F7F5F0] border border-[#E7E4DC] text-xs space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-medium text-[#252720] leading-snug">
                    {cite.title}
                  </h4>
                  <a
                    href={cite.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#777C55] hover:text-[#5E6341] shrink-0"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
                {cite.snippet && (
                  <p className="text-[#77786F] leading-relaxed line-clamp-3">
                    {cite.snippet}
                  </p>
                )}
                <p className="text-[10px] text-[#77786F]/70 truncate">{cite.url}</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#E7E4DC] bg-[#F7F5F0]/40 text-[11px] text-[#77786F]">
            Verified external references retrieved for this conversation.
          </div>
        </aside>
      )}

      {/* TAVUS VIDEO WORKSPACE MODAL */}
      {showVideoModal && (
        <TavusVideoWorkspace
          onClose={() => setShowVideoModal(false)}
          language={selectedLanguage}
          contextPrompt={`User preferences: ${JSON.stringify(preferences || {})}`}
        />
      )}
    </div>
  );
}
