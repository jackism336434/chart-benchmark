import { useEffect } from 'react'
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
  autoOpen: boolean
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
  autoOpen,
}: PerfDashboardProps) {
  useEffect(() => {
    if (autoOpen) onToggle()
  }, [autoOpen, onToggle])

  return (
    <div
      className={`border-t border-gray-800 bg-gray-900/80 transition-all duration-300 flex-shrink-0 ${
        open ? 'h-80' : 'h-10'
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full h-10 flex items-center justify-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors"
      >
        <span className="uppercase tracking-wider font-medium">Performance Dashboard</span>
        <span className="text-[10px]">{open ? '\u25BC' : '\u25B2'}</span>
      </button>

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
            <MetricBarChart
              title="Avg FPS"
              unit="fps"
              libraries={libraries.map((lib) => ({
                name: lib.name,
                value: lib.metrics.avgFPS,
                color: lib.color,
              }))}
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