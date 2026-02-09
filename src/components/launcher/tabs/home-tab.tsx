"use client"

import { ClockWidget } from "../clock-widget"
import { SystemMetrics } from "../system-metrics"
import { AppGrid } from "../app-grid"
import { MarketsWidget } from "../markets-widget"
import { GpuWidget } from "../gpu-widget"
import { CliWidget } from "../cli-widget"
import { AiWidget } from "../ai-widget"

export function HomeTab() {
  return (
    <div className="space-y-2.5 animate-slide-up">
      <ClockWidget />
      <SystemMetrics />
      <AppGrid />

      <div className="grid grid-cols-2 gap-2">
        <MarketsWidget />
        <GpuWidget />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <CliWidget />
        <AiWidget />
      </div>
    </div>
  )
}
