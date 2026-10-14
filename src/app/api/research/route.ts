import { NextRequest, NextResponse } from "next/server";
import { Citation } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const { query, language = "en", geminiApiKey } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Search query is required." }, { status: 400 });
    }

    const tavilyKey = process.env.TAVILY_API_KEY;
    const braveKey = process.env.BRAVE_SEARCH_API_KEY;

    let citations: Citation[] = [];
    let summary = "";
    let providerName = "";

    // 1. Tavily Search API
    if (tavilyKey) {
      try {
        const tavilyRes = await fetch("https://api.tavily.com/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            api_key: tavilyKey,
            query: query,
            search_depth: "advanced",
            include_answer: true,
            max_results: 5,
          }),
        });

        if (tavilyRes.ok) {
          const tavilyData = await tavilyRes.json();
          providerName = "Tavily Web Index";
          summary = tavilyData.answer || "";
          citations = (tavilyData.results || []).map((r: any) => ({
            title: r.title || "Source Reference",
            url: r.url || "#",
            snippet: r.content || "",
          }));
        }
      } catch (err) {
        console.warn("Tavily search failed, falling back:", err);
      }
    }

    // 2. Brave Search API if Tavily wasn't configured or failed
    if (!citations.length && braveKey) {
      try {
        const braveRes = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5`,
          {
            headers: {
              Accept: "application/json",
              "X-Subscription-Token": braveKey,
            },
          }
        );

        if (braveRes.ok) {
          const braveData = await braveRes.json();
          providerName = "Brave Search";
          citations = (braveData.web?.results || []).map((r: any) => ({
            title: r.title || "Web Result",
            url: r.url || "#",
            snippet: r.description || "",
          }));
          summary = `Direct web research results from Brave for "${query}".`;
        }
      } catch (err) {
        console.warn("Brave search failed:", err);
      }
    }

    // 3. Gemini Google Search Grounding if Tavily/Brave not configured
    const geminiKey = geminiApiKey || process.env.GEMINI_API_KEY;
    if (!citations.length && geminiKey) {
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: `Perform deep web research on: ${query}. Summarize the core findings clearly.` }] }],
              tools: [{ google_search: {} }],
            }),
          }
        );

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          providerName = "Google Search Index";
          summary = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "";
          const chunks = geminiData.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
          citations = chunks
            .filter((c: any) => c.web?.uri)
            .map((c: any) => ({
              title: c.web.title || "Web Reference",
              url: c.web.uri,
              snippet: "",
            }));
        }
      } catch (err) {
        console.warn("Gemini Search Grounding failed:", err);
      }
    }

    // If no search provider is configured, return clear honest notification per requirements
    if (!tavilyKey && !braveKey && !geminiKey) {
      return NextResponse.json({
        configured: false,
        message:
          "Deep Web Research requires a search provider API key (TAVILY_API_KEY, BRAVE_SEARCH_API_KEY, or GEMINI_API_KEY) in .env.local to query live web sources.",
        query,
        citations: [],
      });
    }

    if (citations.length === 0) {
      return NextResponse.json({
        configured: true,
        message: `No active web citations were found for the query: "${query}". Try refining your search query.`,
        citations: [],
      });
    }

    return NextResponse.json({
      configured: true,
      provider: providerName,
      query,
      summary,
      citations,
    });
  } catch (error: any) {
    console.error("Research API error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while executing web research." },
      { status: 500 }
    );
  }
}
