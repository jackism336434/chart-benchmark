# Report & History Pages Improvement — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add selection-based comparison + trend analysis to Report page, and sort/filter to History page.

**Architecture:** Two independend feature areas (Report and History) sharing only the `history.ts` utility and `MetricBarChart` pattern. Report gets a two-tab layout with grouped bar charts and SVG trend line charts. History gets filter/sort controls. A `createdAt` field is added to history entries for reliable sorting.

**Tech Stack:** React, TypeScript, Tailwind CSS v4, pure SVG for trend charts (no new dependencies)

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Modify | `src/utils/history.ts` | Add `createdAt` field, add `sortEntries` helper |
| Create | `src/components/MetricGroupedBarChart.tsx` | Grouped bar chart for comparing N entries |
| Create | `src/components/TrendLineChart.tsx` | Pure SVG line chart for trend analysis |
| Modify | `src/components/ReportPage.tsx` (full rewrite) | Two-tab layout: selection compare + trend analysis |
| Modify | `src/components/HistoryPage.tsx` (rewrite) | Add filter dropdown + sort dropdown |
| No change | `src/components/MetricBarChart.tsx` | Keep as-is, used in other contexts |

---

### Task 1: Add `createdAt` field and `sortEntries` helper to history utility

**Files:**
- Modify: `src/utils/history.ts`

- [ ] **Step 1: Add `createdAt` to HistoryEntry and saveHistoryEntry**

Add `createdAt: string` to the `HistoryEntry` interface. In `saveHistoryEntry`, set `createdAt: new Date().toISOString()` on the entry before saving.

```typescript
export interface HistoryEntry {
  id: string
  chartType: string
  dataSize: number
  seed: number
  timestamp: string
  createdAt: string
  libraries: {
    name: string
    renderTime: number | null
    avgFPS: number | null
    minFPS: number | null
    memoryDeltaMB: number | null
  }[]
}
```

Update `saveHistoryEntry`:
```typescript
export function saveHistoryEntry(entry: Omit<HistoryEntry, 'createdAt'>) {
  const withCreatedAt = { ...entry, createdAt: new Date().toISOString() }
  const entries = loadHistory()
  entries.unshift(withCreatedAt)
  if (entries.length > 100) entries.length = 100
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}
```

Add `sortEntries` helper:
```typescript
export type SortKey = 'newest' | 'oldest' | 'size-desc' | 'size-asc'

export function sortEntries(entries: HistoryEntry[], key: SortKey): HistoryEntry[] {
  const sorted = [...entries]
  switch (key) {
    case 'newest':
      sorted.sort((a, b) => getTimestamp(b) - getTimestamp(a))
      break
    case 'oldest':
      sorted.sort((a, b) => getTimestamp(a) - getTimestamp(b))
      break
    case 'size-desc':
      sorted.sort((a, b) => b.dataSize - a.dataSize)
      break
    case 'size-asc':
      sorted.sort((a, b) => a.dataSize - b.dataSize)
      break
  }
  return sorted
}

function getTimestamp(entry: HistoryEntry): number {
  if (entry.createdAt) return new Date(entry.createdAt).getTime()
  return parseInt(entry.id, 10) || 0
}
```

- [ ] **Step 2: Fix backward compatibility**

Entries loaded from localStorage that lack `createdAt` should not crash. The `getTimestamp` fallback handles this by parsing `entry.id` (which starts with `Date.now()`). No migration step needed — `createdAt` is optional in practice. Update the interface to make it optional for backward compat:

```typescript
export interface HistoryEntry {
  id: string
  chartType: string
  dataSize: number
  seed: number
  timestamp: string
  createdAt?: string
  libraries: { ... }[]
}
```

And in `saveHistoryEntry`, always set it:
```typescript
export function saveHistoryEntry(entry: Omit<HistoryEntry, 'createdAt'>) {
  const withCreatedAt: HistoryEntry = { ...entry, createdAt: new Date().toISOString() }
  ...
}
```

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 4: Commit**

```bash
git add src/utils/history.ts
git commit -m "feat: add createdAt field and sortEntries helper to history utility"
```

---

### Task 2: Create MetricGroupedBarChart component

**Files:**
- Create: `src/components/MetricGroupedBarChart.tsx`

- [ ] **Step 1: Implement MetricGroupedBarChart**

This component renders grouped bars where each group represents a history entry and each bar within the group represents a library.

```tsx
interface BarItem {
  name: string
  value: number | null
  color: string
}

interface BarGroup {
  label: string
  bars: BarItem[]
}

interface MetricGroupedBarChartProps {
  title: string
  unit: string
  groups: BarGroup[]
}

export function MetricGroupedBarChart({ title, unit, groups }: MetricGroupedBarChartProps) {
  const allValues = groups.flatMap((g) => g.bars.map((b) => b.value ?? 0))
  const absMax = Math.max(...allValues.map(Math.abs), 1)
  const hasNegative = allValues.some((v) => v < 0)

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{title}</div>
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <div className="text-[10px] text-gray-600 font-mono">{group.label}</div>
          {group.bars.map((bar) => {
            const abs = Math.abs(bar.value ?? 0)
            const pct = (abs / absMax) * 100
            const isNeg = bar.value != null && bar.value < 0
            const barColor = isNeg ? '#ef4444' : bar.color
            return (
              <div key={bar.name} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-16 truncate">{bar.name}</span>
                <div className="flex-1 relative h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: bar.value != null ? `${pct}%` : '0%',
                      backgroundColor: barColor,
                      opacity: isNeg ? 0.7 : 1,
                    }}
                  />
                  {hasNegative && (
                    <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
                      <div className="w-px h-full bg-gray-500/40" />
                    </div>
                  )}
                </div>
                <span className={`text-[10px] font-mono w-20 text-right ${isNeg ? 'text-red-400' : 'text-gray-400'}`}>
                  {bar.value != null ? `${bar.value.toFixed(1)} ${unit}` : '\u2014'}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/MetricGroupedBarChart.tsx
git commit -m "feat: add MetricGroupedBarChart component for grouped comparison"
```

---

### Task 3: Create TrendLineChart component

**Files:**
- Create: `src/components/TrendLineChart.tsx`

- [ ] **Step 1: Implement TrendLineChart**

Pure SVG line chart for trend analysis. Renders axes, grid lines, data lines with dots, and a legend.

```tsx
interface DataPoint {
  x: number
  y: number | null
}

interface SeriesConfig {
  name: string
  color: string
  points: DataPoint[]
}

interface TrendLineChartProps {
  title: string
  unit: string
  xLabel: string
  series: SeriesConfig[]
}

const CHART_PADDING = { top: 20, right: 16, bottom: 32, left: 56 }

function niceScale(min: number, max: number, ticks: number): number[] {
  const range = max - min || 1
  const rough = range / ticks
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const residual = rough / mag
  const step = (residual < 2 ? 2 : residual < 5 ? 5 : 10) * mag
  const start = Math.floor(min / step) * step
  const result: number[] = []
  for (let v = start; v <= max + step * 0.5; v += step) {
    result.push(v)
    if (result.length > 20) break
  }
  return result
}

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return n.toFixed(n % 1 === 0 ? 0 : 1)
}

export function TrendLineChart({ title, unit, xLabel, series }: TrendLineChartProps) {
  const allX = [...new Set(series.flatMap((s) => s.points.map((p) => p.x)))].sort((a, b) => a - b)
  const allY = series.flatMap((s) => s.points.filter((p) => p.y != null).map((p) => p.y!))
  const hasData = allX.length > 0 && allY.length > 0

  if (!hasData) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">{title}</div>
        <div className="text-xs text-gray-600 italic">Not enough data for trend line</div>
      </div>
    )
  }

  const xMin = Math.min(...allX)
  const xMax = Math.max(...allX)
  const yMin = Math.min(...allY) < 0 ? Math.min(...allY) : 0
  const yMax = Math.max(...allY) * 1.1 || 1

  const xTicks = niceScale(xMin, xMax, 5)
  const yTicks = niceScale(yMin, yMax, 4)

  const viewBoxWidth = 400
  const viewBoxHeight = 200
  const plotW = viewBoxWidth - CHART_PADDING.left - CHART_PADDING.right
  const plotH = viewBoxHeight - CHART_PADDING.top - CHART_PADDING.bottom

  const mapX = (v: number) => CHART_PADDING.left + ((v - xMin) / (xMax - xMin || 1)) * plotW
  const mapY = (v: number) => CHART_PADDING.top + plotH - ((v - (yTicks[0] ?? 0)) / ((yTicks[yTicks.length - 1] ?? yMax) - (yTicks[0] ?? 0) || 1)) * plotH

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{title}</div>
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full" style={{ maxHeight: '220px' }}>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={CHART_PADDING.left} y1={mapY(tick)} x2={viewBoxWidth - CHART_PADDING.right} y2={mapY(tick)} stroke="#1f2937" />
            <text x={CHART_PADDING.left - 6} y={mapY(tick)} textAnchor="end" dominantBaseline="middle" fill="#6b7280" fontSize="9" fontFamily="monospace">
              {formatNum(tick)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text key={tick} x={mapX(tick)} y={viewBoxHeight - CHART_PADDING.bottom + 20} textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="monospace">
            {formatNum(tick)}
          </text>
        ))}
        {series.map((s) => {
          const validPts = s.points.filter((p) => p.y != null) as { x: number; y: number }[]
          if (validPts.length < 2) return null
          const pathD = validPts
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${mapX(p.x).toFixed(1)},${mapY(p.y).toFixed(1)}`)
            .join(' ')
          return (
            <g key={s.name}>
              <path d={pathD} fill="none" stroke={s.color} strokeWidth="2" />
              {validPts.map((p) => (
                <circle key={`${p.x}`} cx={mapX(p.x)} cy={mapY(p.y)} r="3" fill={s.color} />
              ))}
            </g>
          )
        })}
      </svg>
      <div className="flex items-center justify-center gap-4 mt-2">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-gray-400">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/TrendLineChart.tsx
git commit -m "feat: add TrendLineChart SVG component for trend analysis"
```

---

### Task 4: Rewrite ReportPage with two-tab layout

**Files:**
- Modify: `src/pages/ReportPage.tsx` (full rewrite)
- Reference: `src/components/MetricGroupedBarChart.tsx` (Task 2)
- Reference: `src/components/TrendLineChart.tsx` (Task 3)

- [ ] **Step 1: Rewrite ReportPage**

The new ReportPage has two tabs: "选择对比" (Selection Compare) and "趋势分析" (Trend Analysis).

**Selection Compare mode:**
- Shows all history entries with checkboxes
- Chart type filter dropdown
- Select All / Deselect All buttons
- When 2+ entries selected, renders 4 MetricGroupedBarChart panels

**Trend Analysis mode:**
- Chart type dropdown (must pick one type)
- Filters entries to selected type, sorts by dataSize
- Renders 4 TrendLineChart panels (render time, avg FPS, min FPS, memory)
- Each chart has 3 series (ECharts/Chart.js/Plotly)

Full implementation:

```tsx
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
  const [chartType, setChartType] = useState(CHART_TYPES[1])

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
          onChange={(e) => setChartType(e.target.value)}
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/ReportPage.tsx
git commit -m "feat: rewrite ReportPage with selection comparison and trend analysis tabs"
```

---

### Task 5: Update SandboxBoard to use new saveHistoryEntry signature

**Files:**
- Modify: `src/components/SandboxBoard.tsx`

Since `saveHistoryEntry` now expects `Omit<HistoryEntry, 'createdAt'>` instead of `HistoryEntry`, we need to verify the call site in SandboxBoard is compatible. The current call creates an object without `createdAt`, which is correct.

- [ ] **Step 1: Verify SandboxBoard.tsx saveHistoryEntry call**

Check `src/components/SandboxBoard.tsx` line ~117-140. The current `handleSave` creates:
```typescript
const entry = {
  id: `...`,
  chartType,
  dataSize: renderSize,
  seed: renderSeed,
  timestamp: new Date().toLocaleString(),
  libraries: LIBRARY_CONFIG.map(...)
}
```

This does NOT include `createdAt`, which is correct — `saveHistoryEntry` now adds it. No change needed. Verify with TypeScript check.

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 2: (Only if errors) Fix call site**

If TypeScript errors, add `as Omit<HistoryEntry, 'createdAt'>` type assertion or adjust the object shape.

---

### Task 6: Rewrite HistoryPage with sort + filter

**Files:**
- Modify: `src/pages/HistoryPage.tsx`

- [ ] **Step 1: Rewrite HistoryPage**

Add chart type filter dropdown and sort dropdown. Keep all existing functionality (delete, clear, card layout).

```tsx
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
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/pages/HistoryPage.tsx
git commit -m "feat: add chart type filter and sort controls to History page"
```

---

### Task 7: Integration test and production build

**Files:** None (verification only)

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 2: Run production build**

Run: `npx vite build`
Expected: successful build with no errors

- [ ] **Step 3: Manual smoke test**

Start dev server with `npm run dev` and verify:
1. Report page loads with two tabs
2. "选择对比" tab shows entry list with checkboxes, MetricGroupedBarChart renders when 2+ selected
3. "趋势分析" tab shows type selector, TrendLineChart renders for entries with same type
4. History page has filter and sort dropdowns working
5. Existing benchmark functionality still works (start, save, reset)

- [ ] **Step 4: Commit (if any fixes were needed)**

If fixes were applied:
```bash
git add -A
git commit -m "fix: integration fixes for Report and History page improvements"
```