# Report & History Pages Improvement Design

Date: 2026-05-24

## Goal

Improve the **Report** and **History** pages with functional completeness:

- **Report**: Add selection-based comparison and trend analysis
- **History**: Add sort and filter controls

## Report Page — Two-Mode Design

### Mode 1: Selection Comparison

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  [选择对比]  [趋势分析]          ← tabs        │
├─────────────────────────────────────────────────┤
│  Filter: [Chart Type ▼]  [✓ All] [✗ None]      │
│  ┌───────────────────────────────────────────┐  │
│  │ ☑ Line 10K pts · seed 42   5/24 14:30  │  │
│  │ ☑ Line 50K pts · seed 42   5/24 14:31  │  │
│  │ ☐ Scatter 10K pts · seed 7  5/24 14:35 │  │
│  └───────────────────────────────────────────┘  │
│  ───── (shown when 2+ selected) ─────            │
│  ┌─ Render Time ─┐  ┌─ Avg FPS ──┐             │
│  │ bar chart      │  │ bar chart   │             │
│  │ (per entry,    │  │             │             │
│  │  E/C/P grouped)│  │             │             │
│  └────────────────┘  └─────────────┘             │
│  ┌─ Min FPS ─────┐  ┌─ Memory ───┐             │
│  │                │  │             │             │
│  └────────────────┘  └─────────────┘             │
└─────────────────────────────────────────────────┘
```

**Mechanics:**

- Entry list shows all history records with checkboxes
- Chart type filter dropdown: All / Business / Line / Scatter / Market
- Select All / Deselect All buttons
- When 2+ entries selected, show 4 MetricBarChart panels below
- Each MetricBarChart: one bar group per selected entry, 3 bars (ECharts / Chart.js / Plotly) per group
- X-axis labels: "{chartType} {dataSize}" (e.g., "Line 10K", "Line 50K")
- Colors: ECharts=#10b981, Chart.js=#3b82f6, Plotly=#a855f7

**MetricGroupedBarChart component:**

New component that renders grouped bars. Props:
```
{ title, unit, groups: { label, bars: {name, value, color}[] }[] }
```

### Mode 2: Trend Analysis

**Layout:**

```
┌─────────────────────────────────────────────────┐
│  [选择对比]  [趋势分析]          ← tabs        │
├─────────────────────────────────────────────────┤
│  Chart Type: [Line ▼]                            │
│  ┌─ Render Time vs Data Size ──────────────────┐ │
│  │   Line chart (3 series: E/C/P)              │ │
│  │   X = dataSize, Y = renderTime              │ │
│  └────────────────────────────────────────────┘ │
│  ┌─ Avg FPS vs Data Size ─────────────────────┐ │
│  │   Line chart (3 series: E/C/P)              │ │
│  └────────────────────────────────────────────┘ │
│  ┌─ Min FPS vs Data Size ─────────────────────┐ │
│  └────────────────────────────────────────────┘ │
│  ┌─ Memory Delta vs Data Size ────────────────┐ │
│  └────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

**Mechanics:**

- Chart type filter: required to pick one type (business/line/scatter/market)
- Filters history entries to the selected type, sorts by dataSize ascending
- Plots 4 trend line charts, each with 3 lines (ECharts/Chart.js/Plotly)
- X-axis: data size (number), Y-axis: metric value

**TrendLineChart component:**

- New component `TrendLineChart`
- Location: `src/components/TrendLineChart.tsx`
- Pure SVG implementation (no external chart library)
- Props: `{ title, unit, xLabel, series: {name, color, points: {x: number, y: number}[]}[] }`
- Draws: axes with tick labels, data lines with dots at data points, legend
- Responsive width, dark theme styling

**Edge cases:**

- Fewer than 2 entries for selected type: show "Need at least 2 records"
- Same dataSize with multiple entries: keep latest per dataSize per library
- Null metric values: skip those data points

## History Page — Sort & Filter

**New controls (top bar):**

1. **Chart type filter**: dropdown (All / Business / Line / Scatter / Market), default All
2. **Sort dropdown**: 
   - Newest first (default)
   - Oldest first
   - Data size (large → small)
   - Data size (small → large)

**Empty state after filtering:** Show "No matching records" message.

**No changes to**: Card layout, delete/clear, localStorage structure.

## Data Model Changes

Add `createdAt` ISO 8601 field to `HistoryEntry` for reliable sorting:

```typescript
interface HistoryEntry {
  id: string
  chartType: string
  dataSize: number
  seed: number
  timestamp: string      // existing locale string (for display)
  createdAt: string      // NEW: ISO 8601 string (for sorting)
  libraries: { ... }[]
}
```

Migration: existing entries without `createdAt` fall back to parsing `id` prefix (contains `Date.now()`).

## Component Architecture

### New Components

1. **`MetricGroupedBarChart`** — `src/components/MetricGroupedBarChart.tsx`
   - Grouped bar chart for comparing multiple history entries
   - Reuse styling patterns from existing `MetricBarChart`

2. **`TrendLineChart`** — `src/components/TrendLineChart.tsx`
   - Pure SVG line chart for trend analysis
   - Responsive, dark-theme styled

### Modified Components

3. **`ReportPage`** — `src/pages/ReportPage.tsx`
   - Add tab switching state, entry selection logic, trend analysis logic
   
4. **`HistoryPage`** — `src/pages/HistoryPage.tsx`
   - Add `filterBy` and `sortBy` state, derive filtered/sorted list

5. **`history.ts`** — `src/utils/history.ts`
   - Add `createdAt` field when creating entries
   - Backward compatibility for entries without this field

## Acceptance Criteria

1. Report page has two tabs working correctly
2. Selection mode: checking 2+ entries renders 4 grouped bar charts
3. Trend mode: selecting chart type renders 4 trend line charts
4. History page has chart type filter and sort dropdowns
5. Filtering and sorting work correctly
6. Empty states show appropriate messages
7. Existing functionality (delete, clear) still works
8. `TrendLineChart` renders with dark theme styling
9. `npx tsc -b --noEmit` passes
10. `npx vite build` succeeds