"use client"

import type React from "react"
import { useState } from "react"
import { Sparkles, Send, Loader2 } from "lucide-react"

export function AiWidget() {
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState("Ready. Ask anything.")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim() || loading) return

    setLoading(true)
    setResponse("Analyzing...")

    setTimeout(() => {
      setResponse(`Complete: "${query.slice(0, 18)}..."`)
      setLoading(false)
      setQuery("")
    }, 1500)
  }

  return (
    <div className="bg-gradient-to-b from-[#0c0c0a] to-[#080808] rounded-2xl p-2.5 border border-[#1a1816] h-full relative overflow-hidden group">
      <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-1.5 mb-2 relative">
        <Sparkles className="w-3 h-3 text-[#d4af37]" strokeWidth={1.5} />
        <span className="text-[7px] text-[#555] font-mono tracking-[0.15em]">NEXUS AI</span>
        <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#d4af37] animate-pulse-gold shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
      </div>

      <div className="bg-[#0a0a08] rounded-lg px-2 py-1.5 border border-[#d4af37]/15 mb-2 min-h-[28px] flex items-center relative">
        <p className="text-[8px] text-[#888] font-mono leading-relaxed">
          {loading ? <Loader2 className="w-3 h-3 animate-spin text-[#d4af37]" /> : response}
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-1.5 bg-[#0a0a08] rounded-lg px-2 py-1.5 border border-[#252520] relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask AI..."
            className="flex-1 bg-transparent text-[8px] text-[#c0c0c0] placeholder:text-[#444] outline-none font-mono"
          />
          <button
            type="submit"
            disabled={loading}
            className="text-[#d4af37] hover:text-[#f4d03f] transition-colors disabled:opacity-50"
          >
            <Send className="w-3 h-3" strokeWidth={1.5} />
          </button>
        </div>
      </form>
    </div>
  )
}
