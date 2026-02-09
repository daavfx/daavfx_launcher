"use client"

import { useState, useEffect, useRef } from "react"
import {
  TrendingUp,
  LineChart,
  Code2,
  HardDrive,
  Plus,
  BarChart3,
  FolderOpen,
  Star,
  Layers,
  ShieldCheck,
  ExternalLink,
  Layout,
  X,
} from "lucide-react"

const categories = [
  { id: "all", label: "All" },
  { id: "ai", label: "AI/ML" },
  { id: "finance", label: "Finance" },
  { id: "devops", label: "DevOps" },
  { id: "system", label: "System" },
]

const apps = [
  { id: "quantum_bt", icon: LineChart, label: "Quantum BT", category: "finance", status: "running", gradient: "from-[#50c878] to-[#3a9259]", glow: "shadow-[#50c878]/20" },
  { id: "charting", icon: BarChart3, label: "Charting", category: "finance", status: "running", gradient: "from-[#ec4899] to-[#db2777]", glow: "shadow-[#ec4899]/20" },
  { id: "copytrader", icon: TrendingUp, label: "CopyTrade", category: "finance", status: "running", gradient: "from-[#0ea5e9] to-[#0284c7]", glow: "shadow-[#0ea5e9]/20" },
  { id: "dashboard", icon: Layout, label: "Dashboard", category: "finance", status: "running", gradient: "from-[#f59e0b] to-[#d97706]", glow: "shadow-[#f59e0b]/20" },
  { id: "mql_fixer", icon: Code2, label: "MQL Fixer", category: "devops", status: "idle", gradient: "from-[#a855f7] to-[#7e22ce]", glow: "shadow-[#a855f7]/20" },
  { id: "mt4", icon: HardDrive, label: "MT4 Term", category: "system", status: "idle", gradient: "from-[#64748b] to-[#475569]", glow: "shadow-[#64748b]/20" },
  { id: "mt5", icon: HardDrive, label: "MT5 Term", category: "system", status: "idle", gradient: "from-[#64748b] to-[#475569]", glow: "shadow-[#64748b]/20" },
]

import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

async function handleLaunch(appId: string, label: string) {
  try {
    if (appId === "mt4") {
      await invoke("launch_mt4");
    } else if (appId === "mt5") {
      await invoke("launch_mt5");
    } else {
      await invoke("launch_app", { appId });
    }
    toast.success(`Launching ${label}...`);
  } catch (e) {
    console.error("Failed to launch:", e);
    toast.error(`Failed to launch ${label}`);
  }
}

export function AppsTab() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; app: typeof apps[0] } | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setContextMenu(null)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleContextMenu = (e: React.MouseEvent, app: typeof apps[0]) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, app })
  }

  const filteredApps = activeCategory === "all" ? apps : apps.filter((app) => app.category === activeCategory)

  const runningCount = apps.filter((a) => a.status === "running").length

  return (
    <div className="space-y-4 animate-slide-up relative px-1">
      {contextMenu && (
        <div
          ref={menuRef}
          className="fixed z-50 w-48 bg-[#1a1816]/95 border border-[#d4af37]/20 rounded-xl shadow-2xl overflow-hidden backdrop-blur-xl"
          style={{ top: contextMenu.y, left: contextMenu.x }}
        >
          <div className="p-2 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-2 px-2 py-1">
              <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${contextMenu.app.gradient} flex items-center justify-center`}>
                <contextMenu.app.icon className="w-3 h-3 text-white" />
              </div>
              <span className="text-[10px] text-white font-mono font-bold tracking-tight">{contextMenu.app.label}</span>
            </div>
          </div>
          <div className="p-1.5 space-y-0.5">
            <button
              onClick={() => {
                handleLaunch(contextMenu.app.id, contextMenu.app.label)
                setContextMenu(null)
              }}
              className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-white/5 text-left group transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#555] group-hover:text-[#d4af37]" />
              <div className="flex flex-col">
                <span className="text-[10px] text-[#c0c0c0] font-mono group-hover:text-white">Open Native</span>
                <span className="text-[8px] text-[#555] font-mono">Spawn system process</span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Categories */}
      <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-4 py-2 rounded-xl text-[10px] font-bold font-mono whitespace-nowrap transition-all duration-300 ${activeCategory === cat.id
              ? "bg-gradient-to-b from-[#d4af37]/30 to-[#d4af37]/10 text-white border border-[#d4af37]/40 shadow-lg shadow-black/40"
              : "bg-white/5 text-white/40 border border-white/5 hover:border-white/10 hover:text-white/60"
              }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37]" />
            <p className="text-[9px] text-white/40 font-mono tracking-[0.2em] font-bold">ALL APPS</p>
          </div>
          <span className="text-[10px] font-mono text-white/20 tabular-nums">{filteredApps.length}</span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {filteredApps.map((app) => (
            <button
              key={app.label}
              onClick={() => handleLaunch(app.id, app.label)}
              onContextMenu={(e) => handleContextMenu(e, app)}
              className="flex flex-col items-center gap-2.5 p-3.5 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:bg-white/[0.08] hover:border-white/[0.1] hover:-translate-y-1 transition-all duration-300 group relative hover:z-50"
            >
              {/* Premium icon container */}
              <div
                className={`w-14 h-14 bg-gradient-to-br ${app.gradient} rounded-[18px] flex items-center justify-center border border-white/20 shadow-2xl ${app.glow} relative group-hover:scale-110 transition-transform duration-500`}
              >
                {/* Gloss effect */}
                <div className="absolute inset-x-0 top-0 h-[45%] bg-gradient-to-b from-white/25 to-white/5 rounded-t-[18px]" />
                {/* Glow ring */}
                <div className="absolute -inset-1 bg-gradient-to-br from-white/10 to-transparent rounded-[22px] blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity" />

                <app.icon className="w-6 h-6 text-white relative z-10 drop-shadow-[0_2px_4px_rgba(0,0,0,0.3)]" strokeWidth={2} />

                {app.status === "running" && (
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center p-0.5 border border-white/10">
                    <div className="w-full h-full bg-[#50c878] rounded-full animate-pulse shadow-[0_0_8px_rgba(80,200,120,0.8)]" />
                  </div>
                )}
              </div>

              <div className="flex flex-col items-center gap-0.5 pointer-events-none">
                <span className="text-[11px] text-white/60 group-hover:text-white font-bold transition-colors">
                  {app.label}
                </span>
                <span className="text-[8px] text-white/20 font-mono uppercase tracking-tighter">
                  {app.category}
                </span>
              </div>

              {/* Card shimmer */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          ))}
        </div>
      </div>

      {/* Featured / Favorites */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-1.5 px-1">
          <Star className="w-3 h-3 text-[#d4af37]" fill="currentColor" strokeWidth={1.5} />
          <p className="text-[9px] text-white/40 font-mono tracking-[0.2em] font-bold uppercase">Quick Access</p>
        </div>
        <div className="flex gap-2">
          {apps.slice(0, 2).map((app) => (
            <button
              key={app.label}
              onClick={() => handleLaunch(app.id, app.label)}
              className="flex-1 flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.05] rounded-2xl hover:bg-white/[0.08] hover:border-[#d4af37]/30 transition-all group"
            >
              <div className={`w-8 h-8 rounded-xl bg-gradient-to-br ${app.gradient} flex items-center justify-center border border-white/10 shadow-lg`}>
                <app.icon className="w-4 h-4 text-white" strokeWidth={2} />
              </div>
              <div className="flex flex-col items-start overflow-hidden">
                <span className="text-[11px] text-white/80 group-hover:text-white font-bold transition-colors truncate w-full">
                  {app.label}
                </span>
                <span className="text-[9px] text-white/30 font-mono truncate">Launch Process</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

