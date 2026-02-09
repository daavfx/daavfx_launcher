"use client"

import { Brain, TrendingUp, Database, Terminal, Bot, LineChart, Server, Code2 } from "lucide-react"

const apps = [
  {
    icon: Brain,
    label: "Neural",
    gradient: "from-[#d4af37] to-[#aa8c2c]",
    glow: "shadow-[0_0_15px_rgba(212,175,55,0.3)]",
  },
  {
    icon: TrendingUp,
    label: "Trading",
    gradient: "from-[#50c878] to-[#3a9259]",
    glow: "shadow-[0_0_15px_rgba(80,200,120,0.25)]",
  },
  {
    icon: Database,
    label: "DataOps",
    gradient: "from-[#7ab8c9] to-[#5c8a97]",
    glow: "shadow-[0_0_15px_rgba(122,184,201,0.25)]",
  },
  {
    icon: Terminal,
    label: "Shell",
    gradient: "from-[#444] to-[#222]",
    glow: "shadow-[0_0_15px_rgba(100,100,100,0.2)]",
    border: "border-[#d4af37]/30",
  },
  {
    icon: Bot,
    label: "Agents",
    gradient: "from-[#c0c0c0] to-[#888]",
    glow: "shadow-[0_0_15px_rgba(192,192,192,0.25)]",
  },
  {
    icon: LineChart,
    label: "Metrics",
    gradient: "from-[#cd7f32] to-[#a0522d]",
    glow: "shadow-[0_0_15px_rgba(205,127,50,0.25)]",
  },
  {
    icon: Server,
    label: "Infra",
    gradient: "from-[#8b4553] to-[#6b3344]",
    glow: "shadow-[0_0_15px_rgba(139,69,83,0.25)]",
  },
  {
    icon: Code2,
    label: "IDE",
    gradient: "from-[#333] to-[#1a1a1a]",
    glow: "shadow-[0_0_15px_rgba(80,80,80,0.2)]",
    border: "border-[#c0c0c0]/30",
  },
]

export function AppGrid() {
  return (
    <div className="space-y-2">
      {/* Section header with gold accent */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[#d4af37]" />
          <p className="text-[8px] text-[#555] tracking-[0.25em] font-mono uppercase">Applications</p>
        </div>
        <span className="text-[7px] text-[#d4af37]/70 font-mono">8 Active</span>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {apps.map((app) => (
          <button key={app.label} className="flex flex-col items-center gap-1.5 group">
            <div
              className={`w-12 h-12 bg-gradient-to-br ${app.gradient} rounded-2xl flex items-center justify-center border ${app.border || "border-white/10"} transition-all duration-300 group-hover:scale-105 group-active:scale-95 group-hover:${app.glow} relative overflow-hidden`}
            >
              {/* Premium inner highlight */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent opacity-60" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

              <app.icon className="w-5 h-5 text-white relative z-10 drop-shadow-lg" strokeWidth={1.5} />
            </div>
            <span className="text-[8px] text-[#555] font-mono tracking-wide group-hover:text-[#888] transition-colors">
              {app.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
