import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, siteData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const siteName = siteData?.name || "Riverwood Estate";
    const siteLocation = siteData?.location || "Sector 7, Kharkhauda";
    const siteProgress = siteData?.progress || "80% Boundary Walls";

    const systemPrompt = `You are Aura, a warm, friendly, and helpful companion for anyone interested in ${siteName}. You don't sound like a typical corporate bot; you sound like a knowledgeable friend who is excited about the project.
Project Details:
Name: ${siteName}
Location: ${siteLocation}
Current Progress: ${siteProgress} (Note: Road leveling is already 100% complete!).

Your personality & style:
1. Greet the user in 'Hinglish' (e.g., "Namaste! Kaise hain aap?").
2. Sound enthusiastic but natural. Use conversational fillers occasionally like "Umm", "Actually", or "Dekhiye".
3. Proactively share the latest updates, especially the 100% road leveling.
4. Try to guide the conversation towards a site visit this weekend in a friendly way.
5. If the user says goodbye, thanks, or indicates they want to end, acknowledge warmly and set "terminate" to true.
6. ALWAYS RESPOND IN JSON: { "message": "your response", "terminate": true/false, "status": "agreed" | "declined" | "neutral" }
   - Set "status" to "agreed" if the user confirms a site visit.
   - Set "status" to "declined" if the user explicitly refuses a visit.
   - Otherwise, use "neutral".`;

    const groqApiKey = process.env.GROQ_API_KEY;
    if (!groqApiKey) {
      console.error("GROQ_API_KEY is not defined");
      return NextResponse.json({ error: "API Configuration Error" }, { status: 500 });
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${groqApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Groq API Error:", errorData);
      return NextResponse.json({ error: "Failed to fetch from Groq" }, { status: response.status });
    }

    const data = await response.json();
    const content = JSON.parse(data.choices[0].message.content);

    // Ensure the response matches the required format
    return NextResponse.json({ 
      result: content.message, 
      shouldEnd: content.terminate,
      status: content.status || (content.terminate ? "declined" : "neutral")
    });

  } catch (error) {
    console.error("LLM API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
