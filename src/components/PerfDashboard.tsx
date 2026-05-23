import { useCallback } from 'react'
import type { PerfMetrics } from '../hooks/usePerf'
import { MetricCard } from './MetricCard'
import { MetricBarChart } from './MetricBarChart'
import { CodePanel } from './CodePanel'
import { getEChartsCodeSnippet, getChartJSCodeSnippet, getPlotlyCodeSnippet } from './shared/formatData'

interface LibraryEntry {
  name: string
  metrics: PerfMetrics
  color: string
  accent: 'emerald' | 'blue' | 'amber' | 'red' | 'purple'
}

interface PerfDashboardProps {
  libraries: LibraryEntry[]
  chartType: string
  open: boolean
  onToggle: () => void
  memoryAvailable: boolean
}

function memoryDelta(m: PerfMetrics): number | null {
  if (m.memoryAfter != null && m.memoryBefore != null) {
    return (m.memoryAfter - m.memoryBefore) / 1024 / 1024
  }
  return null
}

const SNIPPET_MAP: Record<string, (t: string) => string> = {
  ECharts: getEChartsCodeSnippet,
  'Chart.js': getChartJSCodeSnippet,
  Plotly: getPlotlyCodeSnippet,
}

export function PerfDashboard({
  libraries,
  chartType,
  open,
  onToggle,
  memoryAvailable,
}: PerfDashboardProps) {
  const handleExport = useCallback(() => {
    const report = {
      chartType,
      timestamp: new Date().toISOString(),
      libraries: libraries.map((lib) => ({
        name: lib.name,
        renderTime: lib.metrics.renderTime,
        avgFPS: lib.metrics.avgFPS,
        minFPS: lib.metrics.minFPS,
        memoryDeltaMB: memoryDelta(lib.metrics),
      })),
    }
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `benchmark-${chartType}-${Date.now()}.json`
    a.click()
    URL.revokeObjectURL(url)
  }, [chartType, libraries])

  return (
    <div
      className={`border-t border-gray-800 bg-gray-900/80 transition-all duration-300 flex-shrink-0 ${
        open ? 'h-80' : 'h-10'
      }`}
    >
      <div className="h-10 flex items-center justify-center gap-3 shrink-0">
        <button
          onClick={onToggle}
          className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          <span className="uppercase tracking-wider font-medium">Performance Dashboard</span>
          <span className="text-[10px]">{open ? '\u25BC' : '\u25B2'}</span>
        </button>
        {open && (
          <button
            onClick={handleExport}
            className="text-[10px] uppercase tracking-wider text-gray-500 hover:text-gray-300 transition-colors border border-gray-700 px-2 py-0.5 rounded"
          >
            Export JSON
          </button>
        )}
      </div>

      {open && (
        <div className="h-[calc(100%-2.5rem)] overflow-auto px-6 py-3 grid grid-cols-12 gap-4">
          <div className="col-span-3 space-y-3">
            {libraries.map((lib) => (
              <MetricCard
                key={lib.name}
                label={`${lib.name} Render`}
                value={lib.metrics.renderTime?.toFixed(1) ?? null}
                unit="ms"
                color={lib.accent}
              />
            ))}
          </div>

          <div className="col-span-4 space-y-4">
            <MetricBarChart
              title="Render Time"
              unit="ms"
              libraries={libraries.map((lib) => ({
                name: lib.name,
                value: lib.metrics.renderTime,
                color: lib.color,
              }))}
            />
            <MetricBarChart
              title="Memory Delta"
              unit="MB"
              libraries={libraries.map((lib) => ({
                name: lib.name,
                value: memoryDelta(lib.metrics),
                color: lib.color,
              }))}
            />
            {!memoryAvailable && (
              <p className="text-[10px] text-amber-400/70">&#9888; Memory metrics require Chrome/Chromium</p>
            )}
            {memoryAvailable && (
              <p className="text-[10px] text-gray-600">Measures global JS heap delta. Negative = GC reclaimed more than allocated.</p>
            )}
            <MetricBarChart
              title="Avg FPS"
              unit="fps"
              libraries={libraries.map((lib) => ({
                name: lib.name,
                value: lib.metrics.avgFPS,
                color: lib.color,
              }))}
              hint={libraries.every((lib) => lib.metrics.avgFPS == null) ? 'Drag/zoom on charts to measure' : undefined}
            />
            <MetricBarChart
              title="Min FPS"
              unit="fps"
              libraries={libraries.map((lib) => ({
                name: lib.name,
                value: lib.metrics.minFPS,
                color: lib.color,
              }))}
            />
          </div>

          <div className="col-span-5">
            <CodePanel
              chartType={chartType}
              libraries={libraries.map((lib) => ({
                name: lib.name,
                code: SNIPPET_MAP[lib.name]?.(chartType) ?? '',
                accent: lib.accent,
              }))}
            />
          </div>
        </div>
      )}
    </div>
  )
}