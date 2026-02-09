"use client"

import { useState, useEffect } from "react"

export function ClockWidget() {
  const [time, setTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const hours = time.getHours().toString().padStart(2, "0")
  const minutes = time.getMinutes().toString().padStart(2, "0")
  const seconds = time.getSeconds().toString().padStart(2, "0")

  const dayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"]
  const monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

  return (
    <div className="text-center py-3 relative">
      {/* Subtle glow behind time */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-32 h-16 bg-[#d4af37]/5 blur-3xl rounded-full" />
      </div>

      <div className="flex items-baseline justify-center font-mono relative">
        {/* Main time with metallic gold effect */}
        <span className="text-[52px] font-extralight tracking-tight text-metallic-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.15)]">
          {hours}
        </span>
        <span className="text-[52px] font-extralight text-[#d4af37]/40 mx-0.5 animate-pulse-gold">:</span>
        <span className="text-[52px] font-extralight tracking-tight text-metallic-gold drop-shadow-[0_0_20px_rgba(212,175,55,0.15)]">
          {minutes}
        </span>
        {/* Seconds with silver accent */}
        <span className="text-sm text-[#888] ml-1 font-light tracking-wider">{seconds}</span>
      </div>

      {/* Date with refined styling */}
      <div className="flex items-center justify-center gap-2 mt-1">
        <span className="w-8 h-[1px] bg-gradient-to-r from-transparent to-[#333]" />
        <p className="text-[9px] text-[#555] tracking-[0.35em] font-mono font-light">
          {dayNames[time.getDay()]} · {monthNames[time.getMonth()]} {time.getDate()}
        </p>
        <span className="w-8 h-[1px] bg-gradient-to-l from-transparent to-[#333]" />
      </div>
    </div>
  )
}
