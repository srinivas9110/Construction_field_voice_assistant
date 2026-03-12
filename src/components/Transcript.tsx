import { Send, Mic, Square } from "lucide-react";
import { useState, useRef, useEffect } from "react";

export interface Message {
  role: "system" | "user" | "ai";
  content: string;
}

interface TranscriptProps {
  messages: Message[];
  isListening: boolean;
  isSpeaking: boolean;
  onSendMessage: (msg: string) => void;
  onToggleListening: () => void;
}

export default function Transcript({ 
  messages, 
  isListening, 
  isSpeaking, 
  onSendMessage, 
  onToggleListening 
}: TranscriptProps) {
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    onSendMessage(input.trim());
    setInput("");
  };

  return (
    <div className="flex flex-col h-full w-full glass rounded-3xl overflow-hidden relative">
      {/* Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-black/20 flex items-center justify-between">
        <h3 className="font-medium flex items-center gap-2">
          Live Transcript
          {isSpeaking && <span className="text-xs text-purple-400 animate-pulse ml-2">(Aura is speaking...)</span>}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Powered by Aura Engine</span>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div 
            key={i} 
            className={`flex flex-col ${msg.role === "user" ? "items-end" : "items-start"}`}
          >
            {msg.role !== "system" && (
              <span className="text-xs text-white/40 mb-1 ml-1">
                {msg.role === "user" ? "You" : "Aura"}
              </span>
            )}
            <div 
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                msg.role === "user" 
                  ? "bg-blue-600/50 text-white rounded-tr-sm" 
                  : msg.role === "system"
                    ? "bg-white/5 text-white/60 text-sm italic w-full text-center rounded-xl"
                    : "bg-white/10 text-white rounded-tl-sm"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={endOfMessagesRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-black/20 border-t border-white/10 backdrop-blur-md">
        <form onSubmit={handleSubmit} className="relative flex items-center gap-2">
          <button
            type="button"
            onClick={onToggleListening}
            className={`p-3 rounded-full flex-shrink-0 transition-all ${
              isListening 
                ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                : "bg-white/10 hover:bg-white/20"
            }`}
          >
            {isListening ? <Square className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <div className="relative flex-1">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full bg-white/5 border border-white/10 rounded-full pl-5 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm placeholder:text-white/30"
            />
            <button 
              type="submit"
              disabled={!input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-white/10 disabled:opacity-50 disabled:hover:bg-transparent"
            >
              <Send className="w-4 h-4 text-blue-400" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
