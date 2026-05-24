import { useState, useEffect, useCallback, useMemo } from 'react'
import { loadHistory, type HistoryEntry } from '../utils/history'
import { MetricGroupedBarChart } from '../components/MetricGroupedBarChart'
import { TrendLineChart } from '../components/TrendLineChart'

const LIBRARY_COLORS: Record<string, string> = {
  ECharts: '#10b981',
  'Chart.js': '#3b82f6',
  Plotly: '#a855f7',
}

const CHART_TYPES = ['business', 'line', 'scatter', 'market'] as const
type ChartTypeFilter = 'all' | (typeof CHART_TYPES)[number]

const TABS = ['选择对比', '趋势分析'] as const

export function ReportPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory)
  const [tab, setTab] = useState<(typeof TABS)[number]>('选择对比')

  const refresh = useCallback(() => setEntries(loadHistory()), [])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [refresh])

  const hasData = entries.length > 0

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
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
        <>
          <div className="flex items-center gap-1 mb-6 border-b border-gray-800">
            {TABS.map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? 'border-emerald-400 text-emerald-400'
                    : 'border-transparent text-gray-500 hover:text-gray-300'
                }`}
              >
                {t}
              </button>
            ))}
          </div>

          {tab === '选择对比' ? (
            <SelectionCompare entries={entries} />
          ) : (
            <TrendAnalysis entries={entries} />
          )}
        </>
      )}
    </div>
  )
}

function SelectionCompare({ entries }: { entries: HistoryEntry[] }) {
  const [typeFilter, setTypeFilter] = useState<ChartTypeFilter>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() => {
    if (typeFilter === 'all') return entries
    return entries.filter((e) => e.chartType === typeFilter)
  }, [entries, typeFilter])

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(filtered.map((e) => e.id)))
    }
  }

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const selectedEntries = filtered.filter((e) => selected.has(e.id))
  const showCharts = selectedEntries.length >= 2

  const makeGroups = (metric: 'renderTime' | 'avgFPS' | 'minFPS' | 'memoryDeltaMB') =>
    selectedEntries.map((entry) => ({
      label: `${entry.chartType} ${entry.dataSize >= 1000 ? `${(entry.dataSize / 1000).toFixed(entry.dataSize >= 10000 ? 0 : 1)}K` : entry.dataSize} pts`,
      bars: entry.libraries.map((lib) => ({
        name: lib.name,
        value: lib[metric] as number | null,
        color: LIBRARY_COLORS[lib.name] ?? '#9ca3af',
      })),
    }))

  return (
    <>
      <div className="flex items-center gap-4 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value as ChartTypeFilter)}
          className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        >
          <option value="all">All Types</option>
          {CHART_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <button
          onClick={toggleAll}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-400 hover:text-gray-200 bg-gray-800 border border-gray-700 transition-colors"
        >
          {selected.size === filtered.length ? 'Deselect All' : 'Select All'}
        </button>
        {showCharts && (
          <span className="text-xs text-gray-500">
            {selectedEntries.length} entries selected
          </span>
        )}
      </div>

      <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 mb-6 max-h-64 overflow-auto space-y-1">
        {filtered.map((entry) => (
          <label key={entry.id} className="flex items-center gap-3 px-2 py-1.5 rounded hover:bg-gray-800/60 cursor-pointer">
            <input
              type="checkbox"
              checked={selected.has(entry.id)}
              onChange={() => toggle(entry.id)}
              className="accent-emerald-500"
            />
            <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
              {entry.chartType}
            </span>
            <span className="text-xs text-gray-500 font-mono">
              {entry.dataSize.toLocaleString()} pts
            </span>
            <span className="text-xs text-gray-600 ml-auto">{entry.timestamp}</span>
          </label>
        ))}
      </div>

      {showCharts ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MetricGroupedBarChart title="Render Time" unit="ms" groups={makeGroups('renderTime')} />
          <MetricGroupedBarChart title="Avg FPS" unit="fps" groups={makeGroups('avgFPS')} />
          <MetricGroupedBarChart title="Min FPS" unit="fps" groups={makeGroups('minFPS')} />
          <MetricGroupedBarChart title="Memory Delta" unit="MB" groups={makeGroups('memoryDeltaMB')} />
        </div>
      ) : (
        <div className="text-center py-12 text-gray-600 text-sm">
          Select at least 2 entries to compare
        </div>
      )}
    </>
  )
}

function TrendAnalysis({ entries }: { entries: HistoryEntry[] }) {
  const [chartType, setChartType] = useState<(typeof CHART_TYPES)[number]>(CHART_TYPES[1])

  const filtered = useMemo(() => {
    return entries
      .filter((e) => e.chartType === chartType)
      .sort((a, b) => a.dataSize - b.dataSize)
  }, [entries, chartType])

  const deduplicated = useMemo(() => {
    const map = new Map<number, HistoryEntry>()
    for (const e of filtered) {
      const existing = map.get(e.dataSize)
      if (!existing || (e.createdAt && existing.createdAt && e.createdAt > existing.createdAt)) {
        map.set(e.dataSize, e)
      }
    }
    return [...map.values()].sort((a, b) => a.dataSize - b.dataSize)
  }, [filtered])

  const metrics = ['renderTime', 'avgFPS', 'minFPS', 'memoryDeltaMB'] as const
  const metricLabels: Record<string, string> = {
    renderTime: 'Render Time',
    avgFPS: 'Avg FPS',
    minFPS: 'Min FPS',
    memoryDeltaMB: 'Memory Delta',
  }
  const metricUnits: Record<string, string> = {
    renderTime: 'ms',
    avgFPS: 'fps',
    minFPS: 'fps',
    memoryDeltaMB: 'MB',
  }

  const hasEnough = deduplicated.length >= 2

  return (
    <>
      <div className="flex items-center gap-4 mb-6">
        <select
          value={chartType}
          onChange={(e) => setChartType(e.target.value as typeof CHART_TYPES[number])}
          className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
        >
          {CHART_TYPES.map((t) => (
            <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
          ))}
        </select>
        <span className="text-xs text-gray-500">
          {deduplicated.length} data point{deduplicated.length !== 1 ? 's' : ''} for {chartType}
        </span>
      </div>

      {hasEnough ? (
        <div className="space-y-6">
          {metrics.map((metric) => (
            <TrendLineChart
              key={metric}
              title={`${metricLabels[metric]} vs Data Size`}
              unit={metricUnits[metric]}
              xLabel="Data Size"
              series={['ECharts', 'Chart.js', 'Plotly'].map((libName) => ({
                name: libName,
                color: LIBRARY_COLORS[libName],
                points: deduplicated.map((entry) => {
                  const lib = entry.libraries.find((l) => l.name === libName)
                  return {
                    x: entry.dataSize,
                    y: lib ? (lib[metric] as number | null) : null,
                  }
                }),
              }))}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-3 opacity-30">📈</div>
          <h2 className="text-lg font-medium text-gray-400">Not enough data</h2>
          <p className="text-sm text-gray-600 mt-2">
            Need at least 2 {chartType} benchmarks with different data sizes for trend analysis.
          </p>
        </div>
      )}
    </>
  )
}