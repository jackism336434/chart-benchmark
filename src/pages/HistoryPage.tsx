import { useState, useEffect, useCallback, useMemo } from 'react'
import { loadHistory, deleteHistoryEntry, clearHistory, sortEntries, type HistoryEntry, type SortKey } from '../utils/history'

const CHART_TYPES = ['all', 'business', 'line', 'scatter', 'market'] as const
type ChartTypeFilter = (typeof CHART_TYPES)[number]

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'size-desc', label: 'Size: Large → Small' },
  { value: 'size-asc', label: 'Size: Small → Large' },
]

export function HistoryPage() {
  const [entries, setEntries] = useState<HistoryEntry[]>(loadHistory)
  const [typeFilter, setTypeFilter] = useState<ChartTypeFilter>('all')
  const [sortBy, setSortBy] = useState<SortKey>('newest')

  const refresh = useCallback(() => setEntries(loadHistory()), [])

  useEffect(() => {
    const handler = () => refresh()
    window.addEventListener('storage', handler)
    return () => window.removeEventListener('storage', handler)
  }, [refresh])

  const handleClear = () => {
    if (confirm('Clear all benchmark history? This cannot be undone.')) {
      clearHistory()
      refresh()
    }
  }

  const handleDelete = (id: string) => {
    deleteHistoryEntry(id)
    refresh()
  }

  const displayEntries = useMemo(() => {
    let filtered = entries
    if (typeFilter !== 'all') {
      filtered = filtered.filter((e) => e.chartType === typeFilter)
    }
    return sortEntries(filtered, sortBy)
  }, [entries, typeFilter, sortBy])

  const hasData = entries.length > 0

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">History</h1>
          <p className="text-sm text-gray-400 mt-1">
            Past benchmark runs stored locally
          </p>
        </div>
        {hasData && (
          <button
            onClick={handleClear}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
          >
            Clear All
          </button>
        )}
      </div>

      {hasData && (
        <div className="flex items-center gap-4 mb-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as ChartTypeFilter)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            {CHART_TYPES.map((t) => (
              <option key={t} value={t}>
                {t === 'all' ? 'All Types' : t.charAt(0).toUpperCase() + t.slice(1)}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortKey)}
            className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="text-xs text-gray-600">
            {displayEntries.length} record{displayEntries.length !== 1 ? 's' : ''}
          </span>
        </div>
      )}

      {!hasData ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-5xl mb-4 opacity-30">📜</div>
          <h2 className="text-lg font-medium text-gray-400">No history yet</h2>
          <p className="text-sm text-gray-600 mt-2">
            Run benchmarks on the <a href="/benchmark" className="text-emerald-400 hover:underline">Benchmark page</a> and save results to see them here.
          </p>
        </div>
      ) : displayEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="text-4xl mb-3 opacity-30">🔍</div>
          <h2 className="text-lg font-medium text-gray-400">No matching records</h2>
          <p className="text-sm text-gray-600 mt-2">
            Try changing the filter or run more benchmarks.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayEntries.map((entry) => (
            <div key={entry.id} className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400">
                    {entry.chartType}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {entry.dataSize.toLocaleString()} pts · seed {entry.seed}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-gray-600">{entry.timestamp}</span>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-gray-600 hover:text-red-400 transition-colors text-xs"
                    title="Delete"
                  >
                    ✕
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                {entry.libraries.map((lib) => (
                  <div key={lib.name} className="space-y-1">
                    <div className="text-xs font-medium text-gray-400">{lib.name}</div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-[11px]">
                      <span className="text-gray-600">Render</span>
                      <span className="font-mono text-gray-300">{lib.renderTime != null ? `${lib.renderTime.toFixed(1)} ms` : '—'}</span>
                      <span className="text-gray-600">Avg FPS</span>
                      <span className="font-mono text-gray-300">{lib.avgFPS != null ? `${lib.avgFPS} fps` : '—'}</span>
                      <span className="text-gray-600">Min FPS</span>
                      <span className="font-mono text-gray-300">{lib.minFPS != null ? `${lib.minFPS} fps` : '—'}</span>
                      <span className="text-gray-600">Memory</span>
                      <span className="font-mono text-gray-300">{lib.memoryDeltaMB != null ? `${lib.memoryDeltaMB.toFixed(1)} MB` : '—'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}