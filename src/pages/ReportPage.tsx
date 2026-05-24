import { useState, useEffect, useCallback } from 'react'
import { loadHistory, type HistoryEntry } from '../utils/history'
import { MetricBarChart } from '../components/MetricBarChart'

const LIBRARY_COLORS: Record<string, string> = {
  ECharts: '#10b981',
  'Chart.js': '#3b82f6',
  Plotly: '#a855f7',
}

export function ReportPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory)

  const refresh = useCallback(() => setEntries(loadHistory()), [])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [refresh])

  const hasData = entries.length > 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Comparison Report</h1>
        <p className="text-sm text-gray-400 mt-1">
          Side-by-side metric comparison across chart libraries
        </p>
      </div>

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4 opacity-30">📊</div>
          <h2 className="text-lg font-medium text-gray-400">No benchmark data yet</h2>
          <p className="text-sm text-gray-600 mt-2">
            Run benchmarks on the <a href="/benchmark" className="text-emerald-400 hover:underline">Benchmark page</a>, save results, then come back here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {entries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                  {entry.chartType}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {entry.dataSize.toLocaleString()} pts
                </span>
                <span className="text-xs text-gray-600">{entry.timestamp}</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <MetricBarChart
                  title="Render Time (ms)"
                  unit="ms"
                  libraries={entry.libraries.map((lib) => ({
                    name: lib.name,
                    value: lib.renderTime,
                    color: LIBRARY_COLORS[lib.name] ?? '#9ca3af',
                  }))}
                />
                <MetricBarChart
                  title="Avg FPS"
                  unit="fps"
                  libraries={entry.libraries.map((lib) => ({
                    name: lib.name,
                    value: lib.avgFPS,
                    color: LIBRARY_COLORS[lib.name] ?? '#9ca3af',
                  }))}
                />
                <MetricBarChart
                  title="Min FPS"
                  unit="fps"
                  libraries={entry.libraries.map((lib) => ({
                    name: lib.name,
                    value: lib.minFPS,
                    color: LIBRARY_COLORS[lib.name] ?? '#9ca3af',
                  }))}
                />
                <MetricBarChart
                  title="Memory Delta (MB)"
                  unit="MB"
                  libraries={entry.libraries.map((lib) => ({
                    name: lib.name,
                    value: lib.memoryDeltaMB,
                    color: LIBRARY_COLORS[lib.name] ?? '#9ca3af',
                  }))}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}