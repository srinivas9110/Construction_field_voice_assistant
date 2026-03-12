import { Server, Zap, Database, Shield, Activity, Wallet } from "lucide-react";

export default function SubmissionNotePage() {
  return (
    <div className="min-h-screen bg-[#0f1115] text-white p-6 md:p-12 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] mix-blend-screen pointer-events-none" />

      <div className="max-w-4xl mx-auto space-y-12 relative z-10">
        {/* Header */}
        <header className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Architecture Submission Note
          </h1>
          <p className="text-lg text-white/60">
            Technical strategy for the Riverwood AI Voice Agent: Next.js + Vapi + ElevenLabs.
          </p>
        </header>

        {/* Scalability Challenge */}
        <section className="glass p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 rounded-xl border border-blue-500/30">
              <Activity className="w-6 h-6 text-blue-400" />
            </div>
            <h2 className="text-2xl font-semibold">The "1000 Calls" Challenge</h2>
          </div>
          
          <div className="prose prose-invert max-w-none">
            <p className="text-white/70 leading-relaxed">
              Handling 1000 concurrent voice connections targeting sub-500ms latency requires completely bypassing standard HTTP request/response cycles.
            </p>
            
            <h3 className="text-xl font-medium mt-6 mb-4 flex items-center gap-2">
              <Zap className="w-5 h-5 text-yellow-400" /> Streaming WebSocket Architecture
            </h3>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-emerald-400 shrink-0 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                <span><strong>Ingestion (Vapi/LiveKit):</strong> Audio streams are ingested via dedicated WebSocket servers to maintain low-latency, persistent bidirectional communication instead of polling.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-blue-400 shrink-0 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                <span><strong>Message Broker (Redis):</strong> High-throughput buffering is managed via Redis. It acts as an ultra-fast in-memory queue to absorb sudden traffic spikes (e.g., ad campaigns triggering 1000 simultaneous users).</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-indigo-400 shrink-0 shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
                <span><strong>Worker Pool (Celery):</strong> A distributed pool of Celery worker nodes consumes from Redis, processes the LLM prompt (Groq/Llama 3), and instantly streams the response chunk-by-chunk to ElevenLabs Flash v2.5.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-1 w-2 h-2 rounded-full bg-pink-400 shrink-0 shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                <span><strong>Chunked TTS Output:</strong> Instead of waiting for the full sentence, ElevenLabs returns raw audio chunks (`mp3_44100_128`) which are piped directly back to the Vapi WebSocket, achieving ~300ms Time-to-First-Byte (TTFB).</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Cost Estimation */}
        <section className="glass p-8 rounded-3xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-emerald-500/20 rounded-xl border border-emerald-500/30">
              <Wallet className="w-6 h-6 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-semibold">Cost Estimate: 1000 Calls</h2>
          </div>
          
          <div className="space-y-4">
            <p className="text-white/70">
              Estimated cost breakdown for 1000 short calls (average 2 minutes per call).
            </p>

            <div className="grid gap-4 md:grid-cols-3">
              <CostCard 
                title="Vapi / STT Ingestion" 
                cost="$4.00" 
                detail="Deepgram STT & WebRTC routing. ~$0.002/min. 2000 mins = $4.00"
              />
              <CostCard 
                title="LLM (Groq Llama 3 v8B)" 
                cost="$0.20" 
                detail="Ultra-fast inference. ~$0.05/1M tokens. Est. 4M tokens = $0.20"
              />
              <CostCard 
                title="TTS (ElevenLabs Flash)" 
                cost="$12.50" 
                detail="Flash v2.5 model. ~$0.00025 per char. Est 500 chars/call = $12.50"
              />
            </div>

            <div className="pt-6 mt-6 border-t border-white/10 flex items-center justify-between">
              <span className="text-xl font-medium">Total Estimated Cost</span>
              <span className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                ~$16.70
              </span>
            </div>
            <p className="text-xs text-white/30 text-right uppercase tracking-widest mt-2">Scale: 1000 Concurrent Iterations</p>
          </div>
        </section>
      </div>
    </div>
  );
}

function CostCard({ title, cost, detail }: { title: string, cost: string, detail: string }) {
  return (
    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
      <p className="text-sm text-white/50 font-medium mb-2 group-hover:text-white/70 transition-colors">{title}</p>
      <p className="text-3xl font-semibold mb-3 tracking-tight">{cost}</p>
      <p className="text-sm text-white/40 leading-relaxed font-light">{detail}</p>
    </div>
  );
}
