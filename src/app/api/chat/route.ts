import { NextRequest, NextResponse } from "next/server";
import { UserPreferences, SupportedLanguage } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { messages, preferences, language = "en", isResearch = false } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages array is required." }, { status: 400 });
    }

    const lastUserMessage = messages[messages.length - 1]?.content || "";

    // Build personalized system instructions based on onboarding preferences
    const systemPrompt = buildSystemPrompt(preferences, language, isResearch);

    // 1. Try OpenRouter API if configured (Primary)
    const openrouterKey = process.env.OPENROUTER_API_KEY;
    if (openrouterKey) {
      try {
        const model = process.env.OPENROUTER_MODEL || "google/gemini-2.0-flash-001";
        const openrouterRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openrouterKey}`,
            "HTTP-Referer": "http://localhost:3000",
            "X-Title": "LUNA AI",
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((m: any) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
              })),
            ],
            temperature: 0.7,
            max_tokens: 1200,
          }),
        });

        if (openrouterRes.ok) {
          const data = await openrouterRes.json();
          const responseText = data.choices?.[0]?.message?.content || "";
          if (responseText) {
            return NextResponse.json({
              content: responseText.trim(),
              provider: "openrouter",
              model,
            });
          }
        } else {
          const errText = await openrouterRes.text();
          console.warn("OpenRouter API error:", openrouterRes.status, errText);
        }
      } catch (e) {
        console.warn("OpenRouter call failed, falling back:", e);
      }
    }

    // 2. Try Google Gemini API if configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      const geminiModels = ["gemini-2.5-flash", "gemini-flash-latest", "gemini-2.5-pro"];
      for (const gemModel of geminiModels) {
        try {
          // Format conversation history for Gemini multi-turn format
          const contents = [
            ...messages.slice(0, -1).map((m: any) => ({
              role: m.role === "user" ? "user" : "model",
              parts: [{ text: m.content || "" }],
            })),
            {
              role: "user",
              parts: [{ text: lastUserMessage }],
            },
          ];

          const geminiRes = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/${gemModel}:generateContent?key=${geminiKey}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                systemInstruction: {
                  parts: [{ text: systemPrompt }],
                },
                contents,
                generationConfig: {
                  temperature: 0.7,
                  maxOutputTokens: 1200,
                },
              }),
            }
          );

          if (geminiRes.ok) {
            const geminiData = await geminiRes.json();
            const responseText =
              geminiData?.candidates?.[0]?.content?.parts?.[0]?.text || "";
            if (responseText) {
              return NextResponse.json({
                content: responseText.trim(),
                provider: "gemini",
                model: gemModel,
              });
            }
          } else {
            console.warn(`Gemini (${gemModel}) error:`, geminiRes.status);
          }
        } catch (e) {
          console.warn(`Gemini (${gemModel}) call error:`, e);
        }
      }
    }

    // 3. Try OpenAI API if configured
    const openaiKey = process.env.OPENAI_API_KEY;
    if (openaiKey) {
      try {
        const openAiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemPrompt },
              ...messages.map((m: any) => ({
                role: m.role === "user" ? "user" : "assistant",
                content: m.content,
              })),
            ],
            temperature: 0.7,
          }),
        });
        if (openAiRes.ok) {
          const openAiData = await openAiRes.json();
          const responseText = openAiData.choices?.[0]?.message?.content || "";
          if (responseText) {
            return NextResponse.json({
              content: responseText.trim(),
              provider: "openai",
            });
          }
        }
      } catch (e) {
        console.warn("OpenAI call failed, checking fallback:", e);
      }
    }

    // Honest notification if AI services cannot be reached
    return NextResponse.json({
      content:
        language === "hi"
          ? "मैं इस समय अपने भाषा मॉडल से संपर्क नहीं कर पा रही हूँ। कृपया सुनिश्चित करें कि आपकी API कुंजी सक्रिय है।"
          : language === "te"
          ? "నేను ప్రస్తుతం AI మోడల్‌తో కనెక్ట్ అవ్వలేకపోతున్నాను. దయచేసి API కీ యాక్టివ్‌గా ఉందో లేదో తనిఖీ చేయండి."
          : "I am unable to reach the AI language provider right now. Please verify your GEMINI_API_KEY or OPENROUTER_API_KEY in .env.local.",
      provider: "system-notice",
    });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred while processing message." },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(
  prefs?: UserPreferences,
  lang: SupportedLanguage = "en",
  isResearch: boolean = false
): string {
  const parts: string[] = [
    "You are LUNA, a thoughtful, calm, personalized personal AI companion.",
    "Tagline: 'Your space to think.'",
    "Tone: Grounded, warm, uncluttered, authentic, human-centered. Avoid corporate clichés, sycophancy, or robotic bullet spam unless requested.",
  ];

  if (lang === "hi") {
    parts.push(
      "LANGUAGE REQUIREMENT: Respond in natural, polite Hindi (Devanagari script), keeping technical terms accessible or transliterated naturally."
    );
  } else if (lang === "te") {
    parts.push(
      "LANGUAGE REQUIREMENT: Respond in natural, polite Telugu script, ensuring calm and clear phrasing."
    );
  } else {
    parts.push("LANGUAGE REQUIREMENT: Respond in natural, clear English.");
  }

  if (prefs) {
    if (prefs.explanationDepth) {
      parts.push(`Explanation preference: ${prefs.explanationDepth}.`);
    }
    if (prefs.conversationalStyle) {
      parts.push(`Conversation style: ${prefs.conversationalStyle}.`);
    }
    if (prefs.answerPriority) {
      parts.push(`Answer focus: ${prefs.answerPriority}.`);
    }
    if (prefs.difficultApproach) {
      parts.push(`Handling difficult concepts: ${prefs.difficultApproach}.`);
    }
    if (prefs.helpTopics && prefs.helpTopics.length > 0) {
      parts.push(`User focus interests: ${prefs.helpTopics.join(", ")}.`);
    }
    if (prefs.additionalNotes) {
      parts.push(`User's custom notes: ${prefs.additionalNotes}.`);
    }
  }

  if (isResearch) {
    parts.push(
      "MODE: Deep Research. Provide thoughtful citations, balanced perspectives, and objective reasoning."
    );
  }

  return parts.join(" ");
}

