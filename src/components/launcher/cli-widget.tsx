"use client"

import type React from "react"
import { useState } from "react"
import { Terminal, ChevronRight } from "lucide-react"

export function CliWidget() {
  const [command, setCommand] = useState("")
  const [history, setHistory] = useState([
    { type: "output", text: "nexus v3.0.1 ready" },
    { type: "output", text: "7 services online" },
  ])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    setHistory((prev) => [
      ...prev.slice(-2),
      { type: "input", text: command },
      { type: "output", text: `exec: ${command}` },
    ])
    setCommand("")
  }

  return (
    <div className="bg-gradient-to-b from-[#0c0c0a] to-[#080808] rounded-2xl p-2.5 border border-[#1a1816] h-full relative overflow-hidden group">
      <div className="absolute inset-0 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity" />

      <div className="flex items-center gap-1.5 mb-2 relative">
        <Terminal className="w-3 h-3 text-[#d4af37]" strokeWidth={1.5} />
        <span className="text-[7px] text-[#555] font-mono tracking-[0.15em]">TERMINAL</span>
        <div className="ml-auto flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#50c878]/80" />
        </div>
      </div>

      <div className="font-mono text-[8px] space-y-0.5 mb-2 h-8 overflow-hidden relative">
        {history.slice(-3).map((line, i) => (
          <p key={i} className={line.type === "input" ? "text-[#d4af37]" : "text-[#555]"}>
            <span className="text-[#50c878] mr-1">{line.type === "input" ? "›" : "$"}</span>
            {line.text}
          </p>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex items-center gap-1.5 bg-[#0a0a08] rounded-lg px-2 py-1.5 border border-[#252520] relative">
          <ChevronRight className="w-2.5 h-2.5 text-[#d4af37]" strokeWidth={2} />
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            placeholder="command..."
            className="flex-1 bg-transparent text-[8px] text-[#c0c0c0] placeholder:text-[#444] outline-none font-mono"
          />
        </div>
      </form>
    </div>
  )
}
