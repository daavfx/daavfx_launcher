"use client"

import { useState, useEffect } from "react"
import { Cpu, HardDrive, Activity, Thermometer, Zap } from "lucide-react"

export function SystemMetrics() {
  const [metrics, setMetrics] = useState({
    cpu: 51,
    gpu: 34,
    mem: 57,
    net: 139,
    temp: 41,
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics({
        cpu: Math.floor(Math.random() * 30) + 40,
        gpu: Math.floor(Math.random() * 40) + 20,
        mem: Math.floor(Math.random() * 20) + 50,
        net: Math.floor(Math.random() * 100) + 100,
        temp: Math.floor(Math.random() * 10) + 38,
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const items = [
    {
      icon: Cpu,
      label: "CPU",
      value: `${metrics.cpu}%`,
      gradient: "from-[#d4af37]/20 to-[#d4af37]/5",
      border: "border-[#d4af37]/20",
      iconColor: "text-[#d4af37]",
      valueColor: "text-[#d4af37]",
    },
    {
      icon: Zap,
      label: "GPU",
      value: `${metrics.gpu}%`,
      gradient: "from-[#c0c0c0]/15 to-[#c0c0c0]/5",
      border: "border-[#c0c0c0]/20",
      iconColor: "text-[#c0c0c0]",
      valueColor: "text-[#c0c0c0]",
    },
    {
      icon: HardDrive,
      label: "MEM",
      value: `${metrics.mem}%`,
      gradient: "from-[#5c8a97]/20 to-[#5c8a97]/5",
      border: "border-[#5c8a97]/20",
      iconColor: "text-[#7ab8c9]",
      valueColor: "text-[#7ab8c9]",
    },
    {
      icon: Activity,
      label: "NET",
      value: `${metrics.net}k`,
      gradient: "from-[#50c878]/15 to-[#50c878]/5",
      border: "border-[#50c878]/20",
      iconColor: "text-[#50c878]",
      valueColor: "text-[#50c878]",
    },
    {
      icon: Thermometer,
      label: "TMP",
      value: `${metrics.temp}°`,
      gradient: "from-[#cd7f32]/20 to-[#cd7f32]/5",
      border: "border-[#cd7f32]/20",
      iconColor: "text-[#cd7f32]",
      valueColor: "text-[#cd7f32]",
    },
  ]

  return (
    <div className="grid grid-cols-5 gap-1.5">
      {items.map((item) => (
        <div
          key={item.label}
          className={`bg-gradient-to-b ${item.gradient} rounded-xl p-1.5 border ${item.border} flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-gold-sm group relative overflow-hidden`}
        >
          {/* Subtle shimmer effect */}
          <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

          <div className="flex items-center gap-0.5 mb-0.5 relative">
            <item.icon className={`w-2.5 h-2.5 ${item.iconColor}`} strokeWidth={1.5} />
            <span className="text-[6px] text-[#555] font-mono tracking-wider">{item.label}</span>
          </div>
          <span className={`text-[10px] font-mono font-medium ${item.valueColor} relative`}>{item.value}</span>
        </div>
      ))}
    </div>
  )
}
