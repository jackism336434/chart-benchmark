import { useState, Suspense, type ReactElement } from 'react'
import { PerfContext, DEFAULT_PERF, type PerfMetrics } from '../hooks/usePerf'

interface ChartContainerProps {
  library: string
  onMetricsChange?: (metrics: PerfMetrics) => void
  children: ReactElement
}

export function ChartContainer({ library, onMetricsChange, children }: ChartContainerProps) {
  const [metrics, setMetricsState] = useState<PerfMetrics>(DEFAULT_PERF)

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
          <span className="text-sm font-medium text-gray-300">{library}</span>
          <div className="flex items-center gap-3">
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
          <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-600 text-sm animate-pulse">Loading chart...</div>}>
            {children}
          </Suspense>
        </div>
      </div>
    </PerfContext.Provider>
  )
}