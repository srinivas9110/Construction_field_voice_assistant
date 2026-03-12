import { MapPin, ShieldCheck, Home, Target, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export const PROJECTS = [
  {
    id: "riverwood",
    name: "Riverwood Estate",
    location: "Sector 7, Kharkhauda",
    acreage: "25 Acres",
    approval: "DDJAY Approved",
    progress: "80% Boundary Walls",
    advantage: "Near IMT Kharkhauda"
  },
  {
    id: "greenwood",
    name: "Greenwood Villas",
    location: "Sector 15, Sonipat",
    acreage: "12 Acres",
    approval: "HRERA Certified",
    progress: "40% Foundation Work",
    advantage: "Close to Highway"
  }
];

export default function ProjectStats({ 
  agreed = 0, 
  declined = 0, 
  currentSiteId = "riverwood",
  onSelectProject 
}: { 
  agreed?: number; 
  declined?: number; 
  currentSiteId?: string;
  onSelectProject: (id: string) => void;
}) {
  const currentProject = PROJECTS.find(p => p.id === currentSiteId) || PROJECTS[0];

  return (
    <aside className="w-full md:w-80 h-full glass rounded-3xl p-6 flex flex-col gap-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500" />
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold tracking-tight text-white/90">Select Project</h2>
        <div className="space-y-2">
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              onClick={() => onSelectProject(project.id)}
              className={`w-full p-3 rounded-xl border transition-all flex items-center justify-between group ${
                currentSiteId === project.id 
                  ? "bg-white/10 border-white/20" 
                  : "bg-transparent border-white/5 hover:bg-white/5"
              }`}
            >
              <div className="text-left">
                <p className={`text-sm font-medium ${currentSiteId === project.id ? "text-white" : "text-white/60"}`}>
                  {project.name}
                </p>
                <p className="text-[10px] text-white/40">{project.location}</p>
              </div>
              <ChevronRight className={`w-4 h-4 transition-transform ${
                currentSiteId === project.id ? "text-blue-400 translate-x-0" : "text-white/20 group-hover:translate-x-1"
              }`} />
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-white/10 w-full" />

      <AnimatePresence mode="wait">
        <motion.div 
          key={currentProject.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex-1 flex flex-col gap-4"
        >
          <StatCard 
            icon={<Target className="w-5 h-5 text-emerald-400" />}
            title="Customer Interest"
            value={`${agreed}`}
            subtitle="Interested in Visit"
          />
          <StatCard 
            icon={<ShieldCheck className="w-5 h-5 text-blue-400" />}
            title="Approval"
            value={currentProject.approval}
            subtitle="Govt. Certified"
          />
          <StatCard 
            icon={<Home className="w-5 h-5 text-purple-400" />}
            title="Construction"
            value={currentProject.progress}
            subtitle="Current Status"
          />
        </motion.div>
      </AnimatePresence>

      <div className="mt-auto pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <span className="text-sm text-white/50">Status</span>
          <span className="text-sm font-medium text-emerald-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Syncing
          </span>
        </div>
      </div>
    </aside>
  );
}

function StatCard({ icon, title, value, subtitle }: { icon: React.ReactNode, title: string, value: string, subtitle: string }) {
  return (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
      <div className="flex items-start gap-4">
        <div className="p-2 rounded-xl bg-white/5">
          {icon}
        </div>
        <div>
          <p className="text-xs text-white/50 uppercase tracking-wider font-medium">{title}</p>
          <p className="text-lg font-medium mt-0.5">{value}</p>
          <p className="text-xs text-white/40 mt-1">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
