"use client";

import { motion } from "framer-motion";

interface AuraOrbProps {
  isListening: boolean;
  isSpeaking: boolean;
}

export default function AuraOrb({ isListening, isSpeaking }: AuraOrbProps) {
  // Determine animation state
  const isAnimating = isListening || isSpeaking;

  return (
    <div className="relative flex items-center justify-center w-full max-w-[500px] aspect-square">
      {/* Outer Glow / Pulse */}
      <motion.div
        animate={{
          scale: isAnimating ? [1, 1.3, 1] : 1,
          opacity: isAnimating ? [0.4, 0.8, 0.4] : 0.2,
        }}
        transition={{
          duration: isSpeaking ? 1.5 : 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`absolute inset-0 rounded-full blur-[80px] ${
          isSpeaking 
            ? "bg-blue-500" 
            : isListening 
              ? "bg-emerald-500" 
              : "bg-white/20"
        }`}
      />

      {/* Inner Core */}
      <motion.div
        animate={{
          scale: isAnimating ? [0.95, 1.1, 0.95] : 1,
        }}
        transition={{
          duration: isSpeaking ? 0.8 : 1.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className={`relative w-64 h-64 md:w-80 md:h-80 rounded-full shadow-2xl backdrop-blur-md border border-white/20 flex flex-col items-center justify-center overflow-hidden transition-colors duration-500 ${
          isSpeaking
            ? "bg-blue-500/10 border-blue-400/50"
            : isListening
              ? "bg-emerald-500/10 border-emerald-400/50"
              : "bg-white/5 border-white/10"
        }`}
      >
        {/* Core highlight & gradients */}
        <div className={`absolute inset-0 bg-gradient-to-br opacity-50 transition-colors duration-500 ${
           isSpeaking 
             ? "from-cyan-400 via-blue-500 to-indigo-600" 
             : isListening 
               ? "from-green-400 via-emerald-500 to-teal-600" 
               : "from-white/10 to-transparent"
        }`} />
        <div className="absolute inset-2 rounded-full border-t border-white/40 opacity-50" />
        <div className="absolute inset-4 rounded-full bg-white/10 blur-xl" />
        
        {/* State Text Overlay (optional, for explicit feedback) */}
        {!isListening && !isSpeaking && (
          <span className="relative z-10 text-white/50 tracking-widest text-sm font-medium uppercase">
            Tap to connect
          </span>
        )}
      </motion.div>
    </div>
  );
}
