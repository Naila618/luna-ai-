import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { context, language = "en" } = await req.json();

    const tavusKey = process.env.TAVUS_API_KEY;
    const replicaId = process.env.TAVUS_REPLICA_ID;
    const personaId = process.env.TAVUS_PERSONA_ID;
    const deploymentId =
      process.env.TAVUS_DEPLOYMENT_ID || "a53a81d3-78c1-4fba-bd15-2421a96e51d4";
    const deploymentUrl =
      process.env.TAVUS_DEPLOYMENT_URL ||
      "https://maker.tavus.io/deployments/a53a81d3-78c1-4fba-bd15-2421a96e51d4";

    // 1. If Tavus API Key is provided, attempt server-side session creation
    if (tavusKey) {
      try {
        const payload: Record<string, any> = {
          conversation_name: "LUNA AI Companion Session",
          conversational_context:
            context ||
            `You are LUNA, a calm, thoughtful, personal AI companion. Your primary tagline is 'Your space to think.' Keep explanations natural, grounded, and polite. Current language: ${language}.`,
        };

        if (replicaId) payload.replica_id = replicaId;
        if (personaId) payload.persona_id = personaId;

        // Try deployment-specific conversation endpoint first if deploymentId exists
        const endpoint = deploymentId
          ? `https://tavusapi.com/v2/deployments/${deploymentId}/conversations`
          : "https://tavusapi.com/v2/conversations";

        const tavusRes = await fetch(endpoint, {
          method: "POST",
          headers: {
            "x-api-key": tavusKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (tavusRes.ok) {
          const data = await tavusRes.json();
          return NextResponse.json({
            configured: true,
            deployment_id: deploymentId,
            conversation_id: data.conversation_id,
            conversation_url: data.conversation_url || deploymentUrl,
            status: data.status || "active",
            is_direct_api: true,
          });
        }
      } catch (apiErr) {
        console.warn("Tavus API v2 call error, falling back to Maker deployment:", apiErr);
      }
    }

    // 2. Use existing Tavus Maker Deployment (https://maker.tavus.io/deployments/a53a81d3-78c1-4fba-bd15-2421a96e51d4)
    if (deploymentUrl || deploymentId) {
      return NextResponse.json({
        configured: true,
        deployment_id: deploymentId,
        deployment_url: deploymentUrl,
        conversation_url: deploymentUrl,
        status: "ready",
        is_maker_deployment: true,
      });
    }

    return NextResponse.json({
      configured: false,
      message:
        "Tavus Video Avatar is not configured. Add TAVUS_DEPLOYMENT_URL or TAVUS_API_KEY in .env.local to launch live video avatar streaming.",
    });
  } catch (error: any) {
    console.error("Tavus session creation exception:", error);
    return NextResponse.json(
      { error: "Internal server error while initializing video avatar." },
      { status: 500 }
    );
  }
}
