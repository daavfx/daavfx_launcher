"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, Gem } from "lucide-react"

export function MarketsWidget() {
  const [markets, setMarkets] = useState([
    { symbol: "BTC", price: 67432, change: 2.4 },
    { symbol: "ETH", price: 3521, change: -0.8 },
    { symbol: "SOL", price: 142, change: 5.2 },
  ])

  useEffect(() => {
    const interval = setInterval(() => {
      setMarkets((prev) =>
        prev.map((m) => ({
          ...m,
          price: m.price + (Math.random() - 0.5) * m.price * 0.001,
          change: m.change + (Math.random() - 0.5) * 0.2,
        })),
      )
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-b from-[#0c0c0a] to-[#080808] rounded-2xl p-2.5 border border-[#1a1816] relative overflow-hidden group">
      {/* Gold shimmer on hover */}
      <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center justify-between mb-2 relative">
        <div className="flex items-center gap-1.5">
          <Gem className="w-2.5 h-2.5 text-[#d4af37]" strokeWidth={1.5} />
          <p className="text-[7px] text-[#555] tracking-[0.2em] font-mono">MARKETS</p>
        </div>
        <span className="w-1.5 h-1.5 rounded-full bg-[#50c878] animate-pulse shadow-[0_0_6px_rgba(80,200,120,0.5)]" />
      </div>

      <div className="space-y-1.5 relative">
        {markets.map((m) => (
          <div key={m.symbol} className="flex items-center justify-between group/row">
            <span className="text-[9px] text-[#666] font-mono w-8">{m.symbol}</span>
            <span className="text-[9px] text-[#c0c0c0] font-mono font-medium">
              ${m.price.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </span>
            <span
              className={`text-[8px] font-mono flex items-center gap-0.5 w-12 justify-end ${m.change >= 0 ? "text-[#50c878]" : "text-[#cd5c5c]"}`}
            >
              {m.change >= 0 ? <TrendingUp className="w-2 h-2" /> : <TrendingDown className="w-2 h-2" />}
              {m.change >= 0 ? "+" : ""}
              {m.change.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
