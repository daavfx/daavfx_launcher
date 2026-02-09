"use client"

import { Sun, ArrowUp, ArrowDown } from "lucide-react"

export function WeatherWidget() {
  return (
    <div className="bg-[#12141f] rounded-2xl p-3 border border-[#1e2030]">
      <div className="flex items-start justify-between">
        <div>
          <span className="text-3xl font-light text-foreground">23°</span>
          <p className="text-[10px] text-muted-foreground mt-0.5">San Francisco</p>
          <div className="flex items-center gap-2 mt-1 text-[9px] text-muted-foreground">
            <span className="flex items-center text-cyan-400">
              <ArrowUp className="w-2.5 h-2.5" />
              26°
            </span>
            <span className="flex items-center">
              <ArrowDown className="w-2.5 h-2.5" />
              18°
            </span>
          </div>
        </div>
        <Sun className="w-8 h-8 text-amber-400" />
      </div>
    </div>
  )
}
