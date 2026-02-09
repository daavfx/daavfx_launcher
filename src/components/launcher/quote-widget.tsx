"use client"

export function QuoteWidget() {
  return (
    <div className="bg-[#12141f] rounded-2xl p-3 border border-[#1e2030] relative">
      <span className="absolute top-2 right-3 text-3xl text-[#1e2030] font-serif">"</span>
      <p className="text-[10px] text-muted-foreground leading-relaxed italic pr-6">
        "The future belongs to those who believe in their dreams."
      </p>
      <p className="text-[9px] text-cyan-400 mt-1.5">— Eleanor Roosevelt</p>
    </div>
  )
}
