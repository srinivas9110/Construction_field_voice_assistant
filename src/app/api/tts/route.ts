import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { text, voiceId } = await req.json();

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    console.log("Checking API Key...", !!process.env.ELEVENLABS_API_KEY);

    const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY;
    
    // For Riverwood "Aura", we'll choose a specific Voice ID (e.g. Rachel or a custom clone)
    const VOICE_ID = voiceId || process.env.VOICE_ID || "21m00Tcm4TlvDq8ikWAM";

    // If API key is missing, return a clear 401 Unauthorized
    if (!ELEVENLABS_API_KEY || ELEVENLABS_API_KEY.trim() === "your_elevenlabs_api_key_here") {
      console.log("ElevenLabs API Key missing or invalid. Returning 401 Unauthorized.");
      return NextResponse.json({ error: `Missing ElevenLabs API Key. Received: ${ELEVENLABS_API_KEY}` }, { status: 401 });
    }

    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`, {
      method: "POST",
      headers: {
        "Accept": "audio/mpeg",
        "xi-api-key": ELEVENLABS_API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5", // Fast performance model
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
       const errorText = await response.text();
       console.error(`ElevenLabs API Error [Status: ${response.status}]:`, errorText);
       // Return exactly what ElevenLabs returned to the frontend
       return NextResponse.json({ error: errorText, detail: "ElevenLabs API response was not OK." }, { status: response.status });
    }

    const arrayBuffer = await response.arrayBuffer();
    
    // Create streaming response natively preventing CORS since it's same-origin
    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": arrayBuffer.byteLength.toString(),
        "Accept-Ranges": "bytes",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "no-cache"
      }
    });

  } catch (error) {
    console.error("Critical TTS API Error:", error);
    return NextResponse.json({ error: "Internal Server Error in TTS Route." }, { status: 500 });
  }
}
