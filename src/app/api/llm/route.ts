import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { messages, siteData } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages array" }, { status: 400 });
    }

    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    const siteName = siteData?.name || "Riverwood Estate";
    const siteLocation = siteData?.location || "Sector 7, Kharkhauda";
    const siteProgress = siteData?.progress || "80% Boundary Walls";
    
    // Detection Logic: Favor Hindi/Hinglish if common keywords are detected as whole words
    const hindiKeywords = ["han", "nahi", "thik", "kaise", "kya", "aap", "hu", "hai", "kar", "ho", "ji", "bilkul"];
    const containsHindiKeywords = hindiKeywords.some(word => 
      new RegExp(`\\b${word}\\b`, 'i').test(lastMessage)
    );
    
    // Check if the message is predominantly English (Latin characters, common punctuation)
    const matchesEnglishPattern = /^[a-zA-Z0-9\s?!.,']+$/.test(lastMessage);
    const isEnglish = matchesEnglishPattern && !containsHindiKeywords;
    
    let reply = "";
    let status = "neutral";
    let shouldEnd = false;

    // Check if we've already tried to convince
    const hasTriedToConvince = messages.some(m => m.role === "ai" && (m.content.includes("missing") || m.content.includes("khona")));

    // Exit Intent: "no", "nothing else", "shut up", "bye"
    const exitIntent = lastMessage.includes("nothing else") || lastMessage.includes("no more") || (lastMessage.includes("no") && messages.length > 5);

    if (lastMessage.includes("thank") || lastMessage.includes("shukriya") || lastMessage.includes("dhanyawad") || lastMessage.includes("bye") || exitIntent) {
      reply = isEnglish 
        ? `You're welcome! Looking forward to seeing you at ${siteName}. Have a great day!`
        : `Ji shukriya! Humein aapka ${siteName} par intezaar rahega. Apna khayal rakhein!`;
      shouldEnd = true;
    } else if (lastMessage.includes("han") || lastMessage.includes("yes") || lastMessage.includes("jarur") || lastMessage.includes("sure") || lastMessage.includes("ok") || lastMessage.includes("thik")) {
      status = "agreed";
      reply = isEnglish 
        ? `Excellent! I'll have our team call you to confirm the schedule for ${siteName}. You'll be glad to see the ${siteProgress} progress. Anything else?`
        : `Bahut badiya! Main hamare team को बोलती हूँ आपको ${siteName} के लिए schedule confirm करने के लिए call करें। आप ${siteProgress} progress देख कर खुश होंगे। और कुछ?`;
    } else if (lastMessage.includes("nahi") || lastMessage.includes("no") || lastMessage.includes("not now") || lastMessage.includes("busy")) {
      if (!hasTriedToConvince) {
        reply = isEnglish
          ? `I understand you're busy, but you're missing something really special at ${siteName}! The ${siteProgress} and the location at ${siteLocation} are huge advantages. Are you sure?`
          : `Main samajh sakti hoon, par aap ${siteName} ki ek bahut acchi opportunity miss kar rahe hain! ${siteProgress} tayaar hain aur ${siteLocation} ki location amazing hai. Kya aap sure hain?`;
      } else {
        status = "declined";
        reply = isEnglish
          ? "I respect that. Let us know whenever you're free. Have a nice day!"
          : "Theek hai, main samajh gayi. Jab bhi aap free hon batayiye. Aapka din shubh ho!";
        shouldEnd = true;
      }
    } else if (lastMessage.includes("price") || lastMessage.includes("kitna") || lastMessage.includes("cost") || lastMessage.includes("rate")) {
      reply = isEnglish
        ? `Our sales manager will call you back with pricing for ${siteName}. By the way, road leveling at ${siteLocation} is 100% complete! What's your budget?`
        : `Pricing ke liye hamare sales manager aapko call back karenge. Waise, ${siteLocation} mein road leveling 100% ho gayi hai! Aapka budget kya hai?`;
    } else if (lastMessage.includes("hi") || lastMessage.includes("hello") || lastMessage.includes("namaste")) {
      reply = isEnglish
        ? `Hello! I'm Aura. Great to connect! Construction at ${siteName} (${siteLocation}) is moving fast. Would you like to visit?`
        : `Namaste! Main Aura hoon. ${siteName} (${siteLocation}) mein kaam bahut tezi se chal raha hai. Kya aap visit karna chahenge?`;
    } else {
      reply = isEnglish
        ? `I understand. Work is progressing very fast at ${siteName}. Are you planning a site visit?`
        : `Ji bilkul. ${siteName} mein kaam bahut tezi se chal raha hai. Aap site visit plan kar rahe hain kya?`;
    }

    return NextResponse.json({ result: reply, status, shouldEnd });

  } catch (error) {
    console.error("LLM API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
