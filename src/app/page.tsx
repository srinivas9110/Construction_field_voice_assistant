"use client";

import { useState, useRef, useEffect } from "react";
import { Mic, Square } from "lucide-react";
import ProjectStats, { PROJECTS } from "@/components/ProjectStats";
import AuraOrb from "@/components/AuraOrb";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [agreedCount, setAgreedCount] = useState(0);
  const [declinedCount, setDeclinedCount] = useState(0);
  const [currentSiteId, setCurrentSiteId] = useState("riverwood");

  const isConnectedRef = useRef(false);
  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  const hasRecordedInterest = useRef(false);
  const shouldEndAfterSpeaking = useRef(false);

  // Keep conversational context in memory instead of showing on screen
  const getInitialHistory = (siteId: string) => {
    const site = PROJECTS.find(p => p.id === siteId) || PROJECTS[0];
    return [
      { role: "system", content: `You are Aura, an AI Voice Agent for Riverwood Projects LLP. Speak naturally in Hinglish. You are talking about ${site.name} in ${site.location}. Progress: ${site.progress}. Be helpful.` },
      { role: "ai", content: `Namaste! I'm Aura from Riverwood Projects. It's great to connect! Talking about ${site.name} in ${site.location}—we've reached ${site.progress}. Would you like to visit?` }
    ];
  };

  const conversationHistory = useRef(getInitialHistory("riverwood"));

  // Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const silenceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Better for Hinglish

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          clearSilenceTimer();
          handleVoiceInput(transcript);
        };

        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          // If we are still connected but not speaking, we might have timed out without input.
          // Start silence timer to prompt them.
          if (isConnectedRef.current && !isSpeakingRef.current) {
            startSilenceTimer();
          }
        };

        // Track isSpeaking reliably inside the recognition closures
        recognitionRef.current = recognition;
      }
    }
  }, [isConnected]); // Re-bind on connection change so closures get fresh state properly

  // Need a ref for closures
  const isSpeakingRef = useRef(false);
  useEffect(() => {
    isSpeakingRef.current = isSpeaking;
  }, [isSpeaking]);

  const startSilenceTimer = () => {
    clearSilenceTimer();
    silenceTimerRef.current = setTimeout(() => {
      if (isConnectedRef.current && !isSpeakingRef.current) {
        console.log("User silence detected. Prompting...");
        const promptText = "Are you still there? I'd love to know if you're interested in visiting Riverwood Estate.";
        conversationHistory.current.push({ role: "ai", content: promptText });
        speakWithElevenLabs(promptText);
      }
    }, 5000); // 5 seconds of silence
  };

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };

  const startListening = () => {
    if (recognitionRef.current && isConnectedRef.current) {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        clearSilenceTimer();
      } catch (e) {
        console.error("Microphone already active or failed:", e);
      }
    }
  };

  const handleVoiceInput = async (text: string) => {
    setIsListening(false);
    clearSilenceTimer();
    
    // 1. Save user context
    conversationHistory.current.push({ role: "user", content: text });

    // 2. Fetch LLM response
    setIsSpeaking(true);
    
    const currentSite = PROJECTS.find(p => p.id === currentSiteId);
    
    try {
      const res = await fetch('/api/llm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: conversationHistory.current,
          siteData: currentSite
        })
      });

      const data = await res.json();
      
      if (data.result) {
        // Update stats if present and not already recorded this session
        if (!hasRecordedInterest.current) {
          if (data.status === "agreed") {
            setAgreedCount(prev => prev + 1);
            hasRecordedInterest.current = true;
          } else if (data.status === "declined") {
            setDeclinedCount(prev => prev + 1);
            hasRecordedInterest.current = true;
          }
        }

        if (data.shouldEnd) {
          shouldEndAfterSpeaking.current = true;
        }

        conversationHistory.current.push({ role: "ai", content: data.result });
        // 3. Trigger ElevenLabs Flash v2.5 TTS
        await speakWithElevenLabs(data.result);
      } else {
        setIsSpeaking(false);
        startListening(); // Fallback to listening if LLM fails silently
      }
    } catch (error) {
      console.error("LLM Error", error);
      setIsSpeaking(false);
      startListening(); // Fallback
    }
  };

  const speakWithElevenLabs = async (text: string) => {
    console.log("Calling TTS API for text:", text);
    try {
      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, voiceId: "21m00Tcm4TlvDq8ikWAM" })
      });

      if (!response.ok) {
        try {
          const errData = await response.json();
          const apiError = typeof errData.error === 'string' ? JSON.parse(errData.error) : errData.error;
          alert(`ElevenLabs Error: ${apiError?.detail?.message || errData.detail || "API Authentication Failed"}`);
        } catch(e) {}
        setTimeout(() => setIsSpeaking(false), 2000);
        return;
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        setTimeout(() => setIsSpeaking(false), 2000);
        return;
      }
      
      const audioUrl = URL.createObjectURL(blob);
      const audio = new Audio(audioUrl);
      
      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        
        // If the AI signaled the end of conversation, disconnect automatically
        if (shouldEndAfterSpeaking.current) {
          handleToggleAgent();
          return;
        }

        // Start listening immediately after speaking finishes
        if (isConnectedRef.current) {
          startListening();
        }
      };

      audio.onerror = () => {
        setTimeout(() => setIsSpeaking(false), 2000);
      };
      
      audio.play().catch(() => {
        setTimeout(() => setIsSpeaking(false), 2000);
      });
      
    } catch (error) {
       console.error("Critical frontend TTS fetch error:", error);
       setTimeout(() => setIsSpeaking(false), 2000);
    }
  };

  const handleToggleAgent = () => {
    if (isConnected) {
      // End Conversation completely
      setIsConnected(false);
      isConnectedRef.current = false;
      setIsSpeaking(false);
      setIsListening(false);
      clearSilenceTimer();
      recognitionRef.current?.stop();
      
      // Reset session flags and history for next caller
      hasRecordedInterest.current = false;
      shouldEndAfterSpeaking.current = false;
      conversationHistory.current = getInitialHistory(currentSiteId);
    } else {
      // Connect and Start the conversation
      setIsConnected(true);
      isConnectedRef.current = true;
      const initialGreeting = conversationHistory.current[1].content;
      console.log("Starting agent with greeting:", initialGreeting);
      
      setIsSpeaking(true);
      speakWithElevenLabs(initialGreeting);
    }
  };


  const handleSelectProject = (id: string) => {
    if (isConnected) return; // Prevent switching during call
    setCurrentSiteId(id);
    conversationHistory.current = getInitialHistory(id);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0a0f1a] via-[#111827] to-[#1f2937] overflow-hidden">
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[100px]" />
      
      {/* Dashboard Layout */}
      <div className="relative z-10 container mx-auto p-4 md:p-8 h-screen max-h-screen flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar (Stats) */}
        <motion.div 
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          className="w-full md:w-80 flex-shrink-0 h-full overflow-hidden hidden md:block z-20"
        >
           <ProjectStats 
             agreed={agreedCount} 
             declined={declinedCount} 
             currentSiteId={currentSiteId}
             onSelectProject={handleSelectProject}
           />
        </motion.div>

        {/* Center Canvas (Aura Orb & Interaction) */}
        <div className="flex-1 flex flex-col items-center justify-center relative min-h-[500px]">
          
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-center mb-12 space-y-2 relative z-20"
          >
            <h1 className="text-4xl font-light tracking-widest text-white/90">AURA</h1>
            <p className="text-sm text-white/50 tracking-wider">Riverwood AI Voice Agent</p>
          </motion.div>
          
          <motion.button 
            type="button"
            onClick={handleToggleAgent}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="focus:outline-none rounded-full group transition-transform z-20"
            aria-label="Toggle Agent"
          >
             <AuraOrb isListening={isListening} isSpeaking={isSpeaking} />
          </motion.button>
          
          <div className="mt-16 relative z-20 flex flex-col items-center">
             <motion.button
                layout
                onClick={handleToggleAgent}
                className={`flex items-center gap-3 px-8 py-4 rounded-full font-medium transition-all ${
                  isConnected
                    ? "bg-red-500/20 text-red-500 border border-red-500/50 hover:bg-red-500/30"
                    : "glass text-white/80 hover:bg-white/10"
                }`}
             >
                {isConnected ? (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                    <Square className="w-5 h-5 fill-currentColor" />
                    End Conversation
                  </motion.div>
                ) : (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3">
                    <Mic className="w-5 h-5" />
                    Tap to connect
                  </motion.div>
                )}
             </motion.button>
             <AnimatePresence>
               {isConnected && (
                 <motion.p 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: 10 }}
                   className="mt-4 text-sm text-white/50 animate-pulse"
                 >
                   {isSpeaking ? "Aura is speaking..." : isListening ? "Listening..." : "Processing..."}
                 </motion.p>
               )}
             </AnimatePresence>
          </div>

        </div>
      </div>
    </main>
  );
}
