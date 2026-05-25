# TrendLineChart + History-Report Cross-Link Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development or superpowers:executing-plans to implement this plan.

**Goal:** Add Y-axis unit label and X-axis title to TrendLineChart; add "Compare" button to History records that links to Report page with auto-selection.

**Architecture:** TrendLineChart fix is a single-file edit. History-Report cross-link uses React Router's `useSearchParams` hook.

---

## Task 1: TrendLineChart — render unit and xLabel

**Files:**
- Modify: `src/components/TrendLineChart.tsx`

**Changes:**

1. Fix the destructuring on line 44 to include `unit` and `xLabel`:
```typescript
// Current:
export function TrendLineChart({ title, series }: TrendLineChartProps) {
// Change to:
export function TrendLineChart({ title, unit, xLabel, series }: TrendLineChartProps) {
```

2. Add Y-axis unit label — in the SVG, before the yTicks map, add:
```jsx
<text x={4} y={CHART_PADDING.top - 4} fill="#9ca3af" fontSize="9" fontFamily="monospace">
  {unit}
</text>
```

3. Add X-axis title — after the xTicks map, add:
```jsx
<text x={viewBoxWidth / 2} y={viewBoxHeight - 2} textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">
  {xLabel}
</text>
```

4. Increase bottom padding to make room for xLabel: change CHART_PADDING.bottom from 32 to 40.

**Verify:** `npx tsc -b --noEmit` passes.

**Commit:** `fix: render unit and xLabel in TrendLineChart`

---

## Task 2: History — add Compare button linking to Report

**Files:**
- Modify: `src/pages/HistoryPage.tsx`
- Modify: `src/pages/ReportPage.tsx`

### HistoryPage changes:

Add a "Compare" link next to the delete button on each record. The link goes to `/report?select=<id>`.

In `HistoryPage.tsx`:
1. Import `Link` from `react-router`
2. In each record card, after the timestamp `<span>` and before the delete button, add:
```tsx
<Link
  to={`/report?select=${entry.id}`}
  className="text-emerald-400 hover:text-emerald-300 transition-colors text-xs"
  title="Compare in Report"
>
  Compare
</Link>
```

### ReportPage changes:

In `ReportPage.tsx` -> `SelectionCompare` component:
1. Import `useSearchParams` from `react-router`
2. On mount, read `select` query param and pre-select matching entry IDs
3. Use `useEffect` to set initial selection from URL params

Add to `SelectionCompare`:
```tsx
const [searchParams] = useSearchParams()

useEffect(() => {
  const selectParam = searchParams.get('select')
  if (selectParam && selected.size === 0) {
    const ids = selectParam.split(',')
    const matching = new Set(ids.filter((id) => entries.some((e) => e.id === id)))
    if (matching.size > 0) setSelected(matching)
}, [searchParams, entries])
```

Import `useSearchParams` from `react-router` at the top of ReportPage.

**Verify:** `npx tsc -b --noEmit` passes, `npx vite build` succeeds.

**Commit:** `feat: add Compare link from History to Report with auto-selection`