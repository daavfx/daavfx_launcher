"use client"

import { Home, LayoutGrid, Settings, Terminal } from "lucide-react"

interface BottomNavProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

const navItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "apps", icon: LayoutGrid, label: "Apps" },
  { id: "logs", icon: Terminal, label: "Logs" },
  { id: "settings", icon: Settings, label: "Config" },
]

export function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  return (
    <div className="relative py-2 mt-1.5">
      {/* Top border with gold accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-[1px] bg-gradient-to-r from-transparent via-[#d4af37]/30 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-[#1a1816]" />

      <div className="flex items-center justify-around pt-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 px-4 py-1.5 rounded-xl transition-all duration-300 relative ${activeTab === item.id ? "text-[#d4af37]" : "text-[#555] hover:text-[#888]"
              }`}
          >
            {/* Active indicator glow */}
            {activeTab === item.id && (
              <div className="absolute inset-0 bg-[#d4af37]/10 rounded-xl border border-[#d4af37]/20" />
            )}

            <item.icon
              className={`w-5 h-5 relative z-10 transition-all ${activeTab === item.id ? "drop-shadow-[0_0_8px_rgba(212,175,55,0.5)]" : ""}`}
              strokeWidth={activeTab === item.id ? 1.8 : 1.5}
            />
            <span className="text-[7px] font-mono tracking-wider relative z-10">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
