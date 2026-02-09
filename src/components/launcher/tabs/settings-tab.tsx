"use client"

import { useState } from "react"
import {
  Monitor,
  Palette,
  Bell,
  Shield,
  Database,
  Cloud,
  Keyboard,
  Info,
  ChevronRight,
  Moon,
  Wifi,
  HardDrive,
  Cpu,
  User,
  Fingerprint,
  Crown,
} from "lucide-react"

const settingSections = [
  {
    title: "DISPLAY",
    items: [
      { icon: Monitor, label: "Resolution", value: "350×700", action: "select" },
      { icon: Palette, label: "Theme", value: "Obsidian", action: "select" },
      { icon: Moon, label: "Auto Dark Mode", value: true, action: "toggle" },
    ],
  },
  {
    title: "SYSTEM",
    items: [
      { icon: Cpu, label: "Performance Mode", value: "High", action: "select" },
      { icon: HardDrive, label: "Storage", value: "847GB", action: "info" },
      { icon: Wifi, label: "Network", value: "5G+", action: "select" },
    ],
  },
  {
    title: "SECURITY",
    items: [
      { icon: Shield, label: "Firewall", value: true, action: "toggle" },
      { icon: Fingerprint, label: "Biometrics", value: true, action: "toggle" },
      { icon: Database, label: "Vault Sync", value: "Active", action: "select" },
    ],
  },
  {
    title: "INTEGRATIONS",
    items: [
      { icon: Cloud, label: "Cloud Services", value: "3 Active", action: "link" },
      { icon: Keyboard, label: "Shortcuts", value: "Custom", action: "link" },
      { icon: Bell, label: "Notifications", value: true, action: "toggle" },
    ],
  },
]

export function SettingsTab() {
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    "Auto Dark Mode": true,
    Firewall: true,
    Biometrics: true,
    Notifications: true,
  })

  const handleToggle = (label: string) => {
    setToggles((prev) => ({ ...prev, [label]: !prev[label] }))
  }

  return (
    <div className="space-y-3 animate-slide-up">
      {/* <CHANGE> Luxury profile header with gold accents */}
      <div className="flex items-center gap-3 p-3 bg-gradient-to-b from-[#0c0c0a] to-[#080808] border border-[#1a1816] rounded-2xl relative overflow-hidden group">
        {/* Shimmer effect */}
        <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />
        
        {/* Premium avatar */}
        <div className="w-12 h-12 bg-gradient-to-br from-[#d4af37]/30 to-[#aa8c2c]/10 rounded-2xl flex items-center justify-center border border-[#d4af37]/30 relative">
          <User className="w-5 h-5 text-[#d4af37]" strokeWidth={1.5} />
          {/* Pro badge */}
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-[#d4af37] to-[#aa8c2c] rounded-full flex items-center justify-center border border-black">
            <Crown className="w-2 h-2 text-black" strokeWidth={2} fill="currentColor" />
          </div>
        </div>
        <div className="flex-1 relative">
          <p className="text-sm text-metallic-gold font-mono font-light">Administrator</p>
          <p className="text-[9px] text-[#555] font-mono">nexus.local · <span className="text-[#d4af37]">Pro</span></p>
        </div>
        <ChevronRight className="w-4 h-4 text-[#333] relative" strokeWidth={1.5} />
      </div>

      {/* <CHANGE> Premium settings sections */}
      {settingSections.map((section) => (
        <div key={section.title} className="space-y-1.5">
          <div className="flex items-center gap-1.5 px-1">
            <span className="w-1 h-1 rounded-full bg-[#d4af37]/50" />
            <p className="text-[8px] text-[#555] font-mono tracking-[0.2em]">{section.title}</p>
          </div>
          <div className="bg-gradient-to-b from-[#0c0c0a] to-[#080808] border border-[#1a1816] rounded-2xl overflow-hidden divide-y divide-[#1a1816]">
            {section.items.map((item) => (
              <button
                key={item.label}
                onClick={() => item.action === "toggle" && handleToggle(item.label)}
                className="w-full flex items-center gap-3 p-3 hover:bg-[#0f0f0d] transition-colors group"
              >
                <item.icon className="w-4 h-4 text-[#555] group-hover:text-[#888] transition-colors" strokeWidth={1.5} />
                <span className="flex-1 text-left text-[10px] text-[#c0c0c0] font-mono">{item.label}</span>
                {item.action === "toggle" ? (
                  <div className={`w-8 h-4 rounded-full relative transition-all ${toggles[item.label] ? 'bg-gradient-to-r from-[#d4af37] to-[#aa8c2c]' : 'bg-[#222]'}`}>
                    <div className={`absolute top-0.5 w-3 h-3 rounded-full bg-white shadow-md transition-all ${toggles[item.label] ? 'left-4.5 right-0.5 left-auto' : 'left-0.5'}`} 
                         style={{ left: toggles[item.label] ? 'calc(100% - 14px)' : '2px' }} />
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-[9px] text-[#555] font-mono">{String(item.value)}</span>
                    <ChevronRight className="w-3 h-3 text-[#333]" strokeWidth={1.5} />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {/* <CHANGE> Premium system info card */}
      <div className="p-3 bg-gradient-to-b from-[#0c0c0a] to-[#080808] border border-[#1a1816] rounded-2xl relative overflow-hidden">
        {/* Subtle corner accent */}
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-[#d4af37]/5 to-transparent" />
        
        <div className="flex items-center gap-2 mb-3 relative">
          <Info className="w-3 h-3 text-[#d4af37]" strokeWidth={1.5} />
          <span className="text-[8px] text-[#555] font-mono tracking-[0.2em]">SYSTEM INFO</span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-[9px] font-mono relative">
          <div>
            <p className="text-[#555] mb-1">CPU: High Performance</p>
            <p className="text-[#555] mb-1">GPU: Active</p>
            <p className="text-[#555]">Network: 5G+</p>
          </div>
          <div>
            <p className="text-[#555] mb-1">Storage: 847GB</p>
            <p className="text-[#555] mb-1">Theme: Obsidian</p>
            <p className="text-[#555]">Resolution: 350×700</p>
          </div>
        </div>
      </div>
    </div>
  )
}
