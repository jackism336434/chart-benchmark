import { useState, type ReactElement } from 'react'
import { PerfContext, DEFAULT_PERF, type PerfMetrics } from '../hooks/usePerf'

interface ChartContainerProps {
  library: string
  started?: boolean
  pointCount?: number
  onMetricsChange?: (metrics: PerfMetrics) => void
  children: ReactElement
}

function formatPtCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return String(n)
}

export function ChartContainer({ library, started, pointCount, onMetricsChange, children }: ChartContainerProps) {
  const [metrics, setMetricsState] = useState<PerfMetrics>(DEFAULT_PERF)
  const rendering = started && metrics.renderTime == null

  const setMetrics = (partial: Partial<PerfMetrics>) => {
    setMetricsState((prev) => {
      const next = { ...prev, ...partial }
      onMetricsChange?.(next)
      return next
    })
  }

  return (
    <PerfContext.Provider value={{ setMetrics }}>
      <div className="flex flex-col rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-300">{library}</span>
            {pointCount != null && pointCount > 0 && (
              <span className="text-[10px] text-gray-600 font-mono">{formatPtCount(pointCount)} pts</span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {rendering && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
            )}
            {metrics.renderTime != null && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
                {metrics.renderTime.toFixed(1)} ms
              </span>
            )}
            {metrics.avgFPS != null && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 font-mono">
                {metrics.avgFPS} fps
              </span>
            )}
            {metrics.memoryAfter != null && metrics.memoryBefore != null && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-400 font-mono">
                {((metrics.memoryAfter - metrics.memoryBefore) / 1024 / 1024).toFixed(1)} MB
              </span>
            )}
          </div>
        </div>
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </PerfContext.Provider>
  )
}