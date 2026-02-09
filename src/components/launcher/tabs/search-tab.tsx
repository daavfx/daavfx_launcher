"use client"

import { useState, useMemo } from "react"
import {
  Search,
  Clock,
  Star,
  ArrowRight,
  Brain,
  TrendingUp,
  Database,
  Terminal,
  Bot,
  LineChart,
  Server,
  Code2,
  Sparkles,
} from "lucide-react"

const allApps = [
  { icon: Brain, label: "Neural", category: "AI/ML", description: "Deep Learning Workspace" },
  { icon: TrendingUp, label: "Trading", category: "Finance", description: "Quantitative Analysis" },
  { icon: Database, label: "DataOps", category: "Data", description: "Pipeline Management" },
  { icon: Terminal, label: "Shell", category: "System", description: "Advanced Terminal" },
  { icon: Bot, label: "Agents", category: "AI/ML", description: "AI Orchestration" },
  { icon: LineChart, label: "Metrics", category: "Analytics", description: "System Analytics" },
  { icon: Server, label: "Infra", category: "DevOps", description: "Infrastructure" },
  { icon: Code2, label: "IDE", category: "Dev", description: "Development Env" },
]

const recentSearches = ["docker containers", "gpu utilization", "api endpoints", "model training"]

export function SearchTab() {
  const [query, setQuery] = useState("")

  const filteredApps = useMemo(() => {
    if (!query) return allApps
    return allApps.filter(
      (app) =>
        app.label.toLowerCase().includes(query.toLowerCase()) ||
        app.category.toLowerCase().includes(query.toLowerCase()) ||
        app.description.toLowerCase().includes(query.toLowerCase()),
    )
  }, [query])

  return (
    <div className="space-y-3 animate-slide-up">
      <div className="relative group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#d4af37]/10 via-transparent to-[#d4af37]/10 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity blur-xl" />
        <Search
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#555] group-focus-within:text-[#d4af37] transition-colors"
          strokeWidth={1.5}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search apps, commands, settings..."
          className="w-full bg-gradient-to-b from-[#0c0c0a] to-[#080808] border border-[#1a1816] rounded-2xl pl-10 pr-4 py-3 text-sm text-[#c0c0c0] placeholder:text-[#444] font-mono focus:outline-none focus:border-[#d4af37]/40 transition-all relative"
          autoFocus
        />
      </div>

      {!query && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 px-1">
            <Clock className="w-2.5 h-2.5 text-[#555]" strokeWidth={1.5} />
            <p className="text-[8px] text-[#555] font-mono tracking-[0.2em]">RECENT</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {recentSearches.map((term) => (
              <button
                key={term}
                onClick={() => setQuery(term)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-b from-[#0c0c0a] to-[#080808] border border-[#1a1816] rounded-xl text-[9px] text-[#666] font-mono hover:border-[#d4af37]/30 hover:text-[#c0c0c0] transition-all group"
              >
                <Sparkles
                  className="w-2 h-2 text-[#555] group-hover:text-[#d4af37] transition-colors"
                  strokeWidth={1.5}
                />
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-1.5">
            <span className="w-1 h-1 rounded-full bg-[#d4af37]" />
            <p className="text-[8px] text-[#555] font-mono tracking-[0.2em]">{query ? "RESULTS" : "ALL APPS"}</p>
          </div>
          <span className="text-[8px] text-[#d4af37]/70 font-mono">{filteredApps.length}</span>
        </div>

        <div className="space-y-1.5">
          {filteredApps.map((app) => (
            <button
              key={app.label}
              className="w-full flex items-center gap-3 p-2.5 bg-gradient-to-b from-[#0c0c0a] to-[#080808] border border-[#1a1816] rounded-xl hover:border-[#d4af37]/25 transition-all group relative overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="w-9 h-9 bg-gradient-to-br from-[#151512] to-[#0a0a08] rounded-xl flex items-center justify-center border border-[#252520] group-hover:border-[#d4af37]/30 transition-colors relative">
                <app.icon
                  className="w-4 h-4 text-[#888] group-hover:text-[#d4af37] transition-colors"
                  strokeWidth={1.5}
                />
              </div>
              <div className="flex-1 text-left relative">
                <p className="text-[10px] text-[#c0c0c0] font-mono">{app.label}</p>
                <p className="text-[8px] text-[#555]">{app.description}</p>
              </div>
              <div className="flex items-center gap-2 relative">
                <span className="text-[7px] text-[#555] font-mono px-1.5 py-0.5 bg-[#0a0a08] border border-[#1a1816] rounded">
                  {app.category}
                </span>
                <ArrowRight
                  className="w-3 h-3 text-[#333] group-hover:text-[#d4af37] transition-colors"
                  strokeWidth={1.5}
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-1.5 px-1">
          <span className="w-1 h-1 rounded-full bg-[#c0c0c0]" />
          <p className="text-[8px] text-[#555] font-mono tracking-[0.2em]">QUICK ACTIONS</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button className="flex items-center gap-2 p-2.5 bg-gradient-to-b from-[#0c0c0a] to-[#080808] border border-[#d4af37]/20 rounded-xl hover:border-[#d4af37]/40 hover:shadow-gold-sm transition-all group">
            <Star className="w-3.5 h-3.5 text-[#d4af37]" strokeWidth={1.5} />
            <span className="text-[9px] text-[#888] font-mono group-hover:text-[#c0c0c0] transition-colors">
              Favorites
            </span>
          </button>
          <button className="flex items-center gap-2 p-2.5 bg-gradient-to-b from-[#0c0c0a] to-[#080808] border border-[#50c878]/20 rounded-xl hover:border-[#50c878]/40 transition-all group">
            <Clock className="w-3.5 h-3.5 text-[#50c878]" strokeWidth={1.5} />
            <span className="text-[9px] text-[#888] font-mono group-hover:text-[#c0c0c0] transition-colors">
              Recent
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}
