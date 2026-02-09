"use client"

import { Signal, Wifi, BatteryCharging, Shield, Fingerprint } from "lucide-react"

export function StatusBar() {
  return (
    <div className="flex items-center justify-between text-xs px-1" data-tauri-drag-region>
      <div className="flex items-center gap-1.5">
        {/* Premium glowing indicator */}
        <span className="w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse-gold shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
        <span className="text-[10px] tracking-[0.3em] font-light text-metallic-gold font-mono">NEXUS</span>
        <span className="text-[8px] text-[#555] font-mono">PRO</span>
      </div>

      <div className="flex items-center gap-2.5 text-[#4a4540]">
        {/* Security indicator with gold accent */}
        <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-[#0a0a08] border border-[#2a2520]/50">
          <Shield className="w-2.5 h-2.5 text-[#d4af37]/70" strokeWidth={1.5} />
          <Fingerprint className="w-2.5 h-2.5 text-[#50c878]/70" strokeWidth={1.5} />
        </div>

        <div className="flex items-center gap-0.5">
          <Signal className="w-3 h-3 text-[#888]" strokeWidth={1.5} />
          <span className="text-[7px] font-mono text-[#666]">5G+</span>
        </div>

        <Wifi className="w-3 h-3 text-[#888]" strokeWidth={1.5} />

        <div className="flex items-center gap-1 pl-1 border-l border-[#222]">
          <span className="text-[8px] font-mono text-[#50c878]">100</span>
          <BatteryCharging className="w-3.5 h-3.5 text-[#50c878]" strokeWidth={1.5} />
        </div>
      </div>
    </div>
  )
}
