"use client"

import { useState, useEffect } from "react"
import { Cpu } from "lucide-react"

export function GpuWidget() {
  const [gpuData, setGpuData] = useState({
    util: 67,
    vram: 18.4,
    vramTotal: 24,
    power: 285,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setGpuData({
        util: Math.floor(Math.random() * 40) + 50,
        vram: 16 + Math.random() * 6,
        vramTotal: 24,
        power: Math.floor(Math.random() * 50) + 250,
      })
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-b from-[#0c0c0a] to-[#080808] rounded-2xl p-2.5 border border-[#1a1816] relative overflow-hidden group">
      <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-2 relative">
        <div className="flex items-center gap-1.5">
          <Cpu className="w-2.5 h-2.5 text-[#c0c0c0]" strokeWidth={1.5} />
          <p className="text-[7px] text-[#555] tracking-[0.15em] font-mono">RTX 4090</p>
        </div>
        <span className="text-[7px] text-[#d4af37] font-mono">{gpuData.power}W</span>
      </div>

      <div className="space-y-2 relative">
        <div className="flex items-center justify-between">
          <span className="text-[7px] text-[#555] font-mono w-8">UTIL</span>
          <div className="flex-1 mx-2 h-1.5 bg-[#151515] rounded-full overflow-hidden border border-[#252520]/50">
            <div
              className="h-full bg-gradient-to-r from-[#c0c0c0] via-[#e8e8e8] to-[#c0c0c0] transition-all duration-500 rounded-full"
              style={{ width: `${gpuData.util}%` }}
            />
          </div>
          <span className="text-[8px] text-[#c0c0c0] font-mono w-7 text-right">{gpuData.util}%</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-[7px] text-[#555] font-mono w-8">VRAM</span>
          <div className="flex-1 mx-2 h-1.5 bg-[#151515] rounded-full overflow-hidden border border-[#252520]/50">
            <div
              className="h-full bg-gradient-to-r from-[#d4af37] via-[#f4d03f] to-[#d4af37] transition-all duration-500 rounded-full"
              style={{ width: `${(gpuData.vram / gpuData.vramTotal) * 100}%` }}
            />
          </div>
          <span className="text-[8px] text-[#d4af37] font-mono w-7 text-right">{gpuData.vram.toFixed(1)}G</span>
        </div>
      </div>
    </div>
  )
}
