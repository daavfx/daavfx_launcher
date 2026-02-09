"use client"

import { useState, useEffect, useRef } from "react"
import { Terminal, Trash2, StopCircle, RefreshCw } from "lucide-react"

interface LogEntry {
    id: string
    label: string
    content: string
    type: "info" | "error" | "warn"
    timestamp: string
}

export function LogsTab() {
    const [logs, setLogs] = useState<LogEntry[]>([
        {
            id: "1",
            label: "System",
            content: "Launcher initialized. Standing by for app deployment...",
            type: "info",
            timestamp: new Date().toLocaleTimeString()
        },
        {
            id: "2",
            label: "AI Node",
            content: "Neural Bridge established on :1337",
            type: "info",
            timestamp: new Date().toLocaleTimeString()
        }
    ])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [logs])

    const clearLogs = () => setLogs([])

    return (
        <div className="h-full flex flex-col gap-3 animate-slide-up px-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-[#d4af37]" />
                    <span className="text-xs font-mono font-bold text-white tracking-widest uppercase">Process Engine Logs</span>
                </div>
                <button
                    onClick={clearLogs}
                    className="p-1.5 hover:bg-white/5 rounded-lg transition-colors group"
                >
                    <Trash2 className="w-3.5 h-3.5 text-white/20 group-hover:text-red-400" />
                </button>
            </div>

            <div
                ref={scrollRef}
                className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-4 font-mono text-[10px] overflow-y-auto scrollbar-hide space-y-2.5 backdrop-blur-md"
            >
                {logs.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center opacity-20 gap-2">
                        <Terminal className="w-8 h-8" />
                        <span>No active log streams</span>
                    </div>
                )}
                {logs.map((log) => (
                    <div key={log.id} className="flex gap-3 group">
                        <span className="text-white/20 tabular-nums whitespace-nowrap">{log.timestamp}</span>
                        <span className={`font-bold whitespace-nowrap ${log.type === "error" ? "text-red-500" :
                                log.type === "warn" ? "text-amber-500" :
                                    "text-emerald-500"
                            }`}>
                            [{log.label}]
                        </span>
                        <p className="text-white/60 leading-relaxed break-all">
                            {log.content}
                        </p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Active Threads</span>
                        <span className="text-sm font-mono text-[#d4af37] font-bold tracking-tighter tabular-nums">04</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                        <RefreshCw className="w-3.5 h-3.5 text-emerald-500 animate-spin-slow" />
                    </div>
                </div>
                <div className="p-3 bg-white/[0.03] border border-white/5 rounded-2xl flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] text-white/20 font-bold uppercase tracking-widest">Mem Load</span>
                        <span className="text-sm font-mono text-[#d4af37] font-bold tracking-tighter tabular-nums">1.2GB</span>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center">
                        <StopCircle className="w-3.5 h-3.5 text-amber-500" />
                    </div>
                </div>
            </div>
        </div>
    )
}
