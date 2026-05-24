# Settings & About Pages Improvement Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Improve Settings page (remove redundant Save, connect defaults to Benchmark, add history stats) and About page (version info, tech stack badges, quick start guide + shortcuts).

**Architecture:** Settings changes involve connecting localStorage defaults to SandboxBoard/ControlPanel via new props. About changes are UI-only. Both pages are independent and can be implemented in parallel.

**Tech Stack:** React, TypeScript, Tailwind CSS v4 (no new dependencies)

---

## File Structure

| Action | File | Purpose |
|--------|------|---------|
| Create | `src/utils/defaults.ts` | Shared constants and helpers for default settings (keys + load/save) |
| Modify | `src/pages/SettingsPage.tsx` | Remove Save button, add default chart type, add history stats |
| Modify | `src/components/SandboxBoard.tsx` | Read default size and chart type from localStorage |
| Modify | `src/components/ControlPanel.tsx` | Accept and use initial size prop |
| Modify | `src/pages/AboutPage.tsx` | Add version, badges, quick start section |
| Modify | `src/components/Sidebar.tsx` | Read version from shared constant |

---

### Task 1: Create shared defaults utility

**Files:**
- Create: `src/utils/defaults.ts`

- [ ] **Step 1: Create `src/utils/defaults.ts`**

Centralize all localStorage keys and default value helpers. This avoids duplicating key strings across Settings/SandboxBoard.

```typescript
export const STORAGE_KEYS = {
  theme: 'chart-benchmark-theme',
  defaultSize: 'chart-benchmark-default-size',
  defaultChartType: 'chart-benchmark-default-chart-type',
  history: 'chart-benchmark-history',
} as const

export const DEFAULT_SIZE = 10000
export const DEFAULT_CHART_TYPE = 'line'

export function loadTheme(): 'dark' | 'light' {
  try {
    return (localStorage.getItem(STORAGE_KEYS.theme) as 'dark' | 'light') || 'dark'
  } catch {
    return 'dark'
  }
}

export function saveTheme(theme: 'dark' | 'light') {
  localStorage.setItem(STORAGE_KEYS.theme, theme)
}

export function loadDefaultSize(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEYS.defaultSize)) || DEFAULT_SIZE
  } catch {
    return DEFAULT_SIZE
  }
}

export function saveDefaultSize(size: number) {
  localStorage.setItem(STORAGE_KEYS.defaultSize, String(size))
}

export function loadDefaultChartType(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.defaultChartType) || DEFAULT_CHART_TYPE
  } catch {
    return DEFAULT_CHART_TYPE
  }
}

export function saveDefaultChartType(type: string) {
  localStorage.setItem(STORAGE_KEYS.defaultChartType, type)
}

export function getHistoryStats(): { count: number; sizeKB: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history)
    if (!raw) return { count: 0, sizeKB: 0 }
    const entries = JSON.parse(raw)
    const bytes = new Blob([raw]).size
    return { count: entries.length, sizeKB: Math.round(bytes / 1024 * 10) / 10 }
  } catch {
    return { count: 0, sizeKB: 0 }
  }
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/utils/defaults.ts
git commit -m "feat: add shared defaults utility with localStorage helpers"
```

---

### Task 2: Rewrite SettingsPage — remove Save, add chart type, add history stats

**Files:**
- Modify: `src/pages/SettingsPage.tsx`

- [ ] **Step 1: Rewrite SettingsPage**

Remove the Save button and `saved` state (settings auto-save). Add default chart type selector. Add history stats section. Use `defaults.ts` helpers instead of inline localStorage keys.

```tsx
import { useState } from 'react'
import { loadTheme, saveTheme, loadDefaultSize, saveDefaultSize, loadDefaultChartType, saveDefaultChartType, getHistoryStats, STORAGE_KEYS } from '../utils/defaults'
import type { ChartType } from '../components/charts/types'

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'business', label: 'Business (Bar)' },
  { value: 'line', label: 'Line' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'market', label: 'Market (Candlestick)' },
]

export function SettingsPage() {
  const [theme, setTheme] = useState(loadTheme)
  const [defaultSize, setDefaultSize] = useState(loadDefaultSize)
  const [defaultChartType, setDefaultChartType] = useState(loadDefaultChartType)
  const [stats, setStats] = useState(getHistoryStats)

  const handleThemeChange = (t: 'dark' | 'light') => {
    setTheme(t)
    saveTheme(t)
  }

  const handleSizeChange = (size: number) => {
    setDefaultSize(size)
    saveDefaultSize(size)
  }

  const handleChartTypeChange = (type: string) => {
    setDefaultChartType(type)
    saveDefaultChartType(type)
  }

  const handleClearAll = () => {
    if (confirm('Clear all locally stored data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEYS.history)
      localStorage.removeItem(STORAGE_KEYS.theme)
      localStorage.removeItem(STORAGE_KEYS.defaultSize)
      localStorage.removeItem(STORAGE_KEYS.defaultChartType)
      setTheme('dark')
      setDefaultSize(10000)
      setDefaultChartType('line')
      setStats({ count: 0, sizeKB: 0 })
    }
  }

  const handleClearHistory = () => {
    if (confirm('Clear all benchmark history? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEYS.history)
      setStats(getHistoryStats())
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure default preferences
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Theme</div>
              <div className="text-xs text-gray-600 mt-0.5">Toggle between dark and light mode</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'
                }`}
              >
                Light
              </button>
            </div>
          </div>
          {theme === 'light' && (
            <p className="text-[10px] text-amber-400/70 mt-2">&#9888; Light theme is not yet implemented. This preference will be saved for future use.</p>
          )}
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">Defaults</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Default data size</div>
                <div className="text-xs text-gray-600 mt-0.5">Starting value for the data size slider</div>
              </div>
              <input
                type="number"
                value={defaultSize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 font-mono text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Default chart type</div>
                <div className="text-xs text-gray-600 mt-0.5">Starting chart type on the Benchmark page</div>
              </div>
              <select
                value={defaultChartType}
                onChange={(e) => handleChartTypeChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {CHART_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">History</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">
                {stats.count} record{stats.count !== 1 ? 's' : ''} saved
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {stats.sizeKB > 0 ? `${stats.sizeKB} KB used in local storage` : 'No storage used'}
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={stats.count === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                stats.count === 0
                  ? 'text-gray-600 border-gray-700 cursor-not-allowed'
                  : 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              Clear History
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">Data</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Reset all settings</div>
              <div className="text-xs text-gray-600 mt-0.5">Remove all locally stored data and reset preferences</div>
            </div>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </section>
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
git add src/pages/SettingsPage.tsx
git commit -m "feat: rewrite Settings page with auto-save, chart type default, history stats"
```

---

### Task 3: Connect default settings to SandboxBoard and ControlPanel

**Files:**
- Modify: `src/components/SandboxBoard.tsx`
- Modify: `src/components/ControlPanel.tsx`

- [ ] **Step 1: Update SandboxBoard to read defaults from localStorage**

In `SandboxBoard.tsx`, change the initial state to read from localStorage defaults:

```typescript
// At the top, add import:
import { loadDefaultSize, loadDefaultChartType } from '../utils/defaults'

// Change these lines:
// const [chartType, setChartType] = useState<ChartType>('line')
// const [renderSize, setRenderSize] = useState(10000)
// To:
const [chartType, setChartType] = useState<ChartType>(loadDefaultChartType() as ChartType)
const [renderSize, setRenderSize] = useState(loadDefaultSize())
```

Also update `handleChartTypeChange` to persist the new chart type:
```typescript
const handleChartTypeChange = useCallback((type: ChartType) => {
  setChartType(type)
  setSeries(2)
  setGroups(3)
  setStarted(false)
}, [])
```
(No change needed here - we don't auto-save chart type on change, only the default from Settings.)

- [ ] **Step 2: Update ControlPanel to accept initial size prop**

Add an `initialSize` prop to ControlPanel and use it as the initial value of `inputSize`:

In the interface, add:
```typescript
interface ControlPanelProps {
  // ...existing props...
  initialSize?: number
}
```

Change:
```typescript
// const [inputSize, setInputSize] = useState('10000')
// To:
const [inputSize, setInputSize] = useState(String(initialSize ?? 10000))
```

- [ ] **Step 3: Pass initialSize from SandboxBoard to ControlPanel**

In `SandboxBoard.tsx`, update the ControlPanel usage to pass `initialSize`:

```tsx
<ControlPanel
  chartType={chartType}
  series={series}
  groups={groups}
  canSave={canSave}
  saved={saved}
  initialSize={renderSize}
  onStart={handleStart}
  onReset={handleReset}
  onSave={handleSave}
  onChartTypeChange={handleChartTypeChange}
/>
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/components/SandboxBoard.tsx src/components/ControlPanel.tsx
git commit -m "feat: connect default settings from localStorage to Benchmark page"
```

---

### Task 4: Rewrite AboutPage — version, badges, quick start

**Files:**
- Modify: `src/pages/AboutPage.tsx`
- Modify: `src/components/Sidebar.tsx` (use shared version constant)

- [ ] **Step 1: Add a shared version constant**

Add to `src/utils/defaults.ts` (created in Task 1):

```typescript
export const APP_VERSION = '0.1.0'
```

- [ ] **Step 2: Update Sidebar to use shared version**

In `src/components/Sidebar.tsx`:
```typescript
// Add import:
import { APP_VERSION } from '../utils/defaults'

// Replace 'v0.1.0 · Multi-lib benchmark' with:
<p className="text-[10px] text-gray-600">
  v{APP_VERSION} · Multi-lib benchmark
</p>
```

- [ ] **Step 3: Rewrite AboutPage**

```tsx
import { APP_VERSION } from '../utils/defaults'

const TECH_STACK = [
  { name: 'React 19', desc: 'UI framework', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { name: 'Vite 7', desc: 'Build tool', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { name: 'Tailwind CSS v4', desc: 'Styling', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  { name: 'TypeScript', desc: 'Language', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { name: 'ECharts 6', desc: 'Chart library', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { name: 'Chart.js 4', desc: 'Chart library', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  { name: 'Plotly.js 3', desc: 'Chart library', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { name: 'React Router', desc: 'Page navigation', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
]

const DIMENSIONS = [
  {
    title: 'Render Performance',
    desc: 'Init-to-ready time measured via library-specific callbacks (ECharts `finished`, Chart.js ref, Plotly `onAfterPlot` + rAF fallback). Reported in milliseconds.',
    icon: '⏱',
  },
  {
    title: 'Interaction FPS',
    desc: 'Average and minimum FPS during zoom/pan interactions, tracked via `requestAnimationFrame` timestamps. Higher is better; min FPS indicates worst-case frame drops.',
    icon: '🎞',
  },
  {
    title: 'Memory Heap Delta',
    desc: 'Browser `performance.memory.usedJSHeapSize` delta before and after chart creation. Available only in Chrome/Chromium. Measures the JS heap cost of rendering.',
    icon: '💾',
  },
  {
    title: 'Code Cost (LOC)',
    desc: 'Lines of configuration code required to produce each chart type per library. Serves as a proxy for developer experience and learning curve.',
    icon: '📝',
  },
]

const STEPS = [
  { step: '1', title: 'Choose type & size', desc: 'Select chart type and data size on the Benchmark page' },
  { step: '2', title: 'Start & interact', desc: 'Press Start (or Enter) to render, then zoom/pan to measure FPS' },
  { step: '3', title: 'Compare & save', desc: 'Review metrics in the dashboard, save results to History for comparison' },
]

const SHORTCUTS = [
  { key: 'Enter', desc: 'Start benchmark (when focused on input)' },
  { key: '↻', desc: 'Randomize seed' },
]

export function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">About</h1>
        <p className="text-sm text-gray-400 mt-1">
          Multi-dimensional chart library performance & effect evaluation
        </p>
        <p className="text-xs text-gray-600 mt-1">v{APP_VERSION}</p>
      </div>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">What is this?</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Chart Benchmark is a tool for evaluating chart libraries under controlled,
          reproducible conditions. Using the same data source and hardware, it
          compares ECharts, Chart.js, and Plotly.js across rendering speed,
          interaction smoothness, memory consumption, and code complexity. The goal
          is to provide developers with objective, quantifiable references for
          chart library selection.
        </p>
      </section>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                {s.step}
              </div>
              <div>
                <div className="text-sm text-gray-300 font-medium">{s.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-[10px] font-mono text-gray-300">
                {s.key}
              </kbd>
              <span className="text-xs text-gray-500">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Evaluation Dimensions</h2>
        <div className="space-y-4">
          {DIMENSIONS.map((d) => (
            <div key={d.title} className="flex gap-3">
              <span className="text-lg">{d.icon}</span>
              <div>
                <div className="text-sm text-gray-300 font-medium">{d.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((t) => (
            <span key={t.name} className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${t.color}`}>
              {t.name}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Limitations</h2>
        <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
          <li>Memory metrics require Chrome/Chromium (`performance.memory` API)</li>
          <li>FPS is measured via interaction (zoom/pan), not passive animation</li>
          <li>Results vary by browser, OS, hardware, and background processes</li>
          <li>Server-side libraries (Matplotlib, Seaborn) are planned for a future backend stage</li>
        </ul>
      </section>
    </div>
  )
}
```

- [ ] **Step 4: Verify TypeScript compiles**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 5: Commit**

```bash
git add src/utils/defaults.ts src/pages/AboutPage.tsx src/components/Sidebar.tsx
git commit -m "feat: improve About page with version, badges, quick start; add shared version constant"
```

---

### Task 5: Remove old inline localStorage helpers from SettingsPage

**Files:**
- Modify: `src/pages/SettingsPage.tsx` (already done in Task 2 — this task verifies no duplicate code)

- [ ] **Step 1: Verify SettingsPage uses defaults.ts exclusively**

Check that `SettingsPage.tsx` no longer has inline `THEME_KEY`, `DEFAULT_SIZE_KEY`, `HISTORY_KEY` constants or inline `loadTheme`/`saveTheme`/`loadDefaultSize`/`saveDefaultSize` functions. They all should come from `src/utils/defaults.ts`.

Also verify `SandboxBoard.tsx` no longer hardcodes `10000` or `'line'` as initial values — they should come from `loadDefaultSize()` and `loadDefaultChartType()`.

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 2: Commit (if any fixes were made)**

```bash
git add -A
git commit -m "refactor: ensure all default settings use shared utility"
```

---

### Task 6: Integration test and production build

**Files:** None (verification only)

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc -b --noEmit`
Expected: no errors

- [ ] **Step 2: Run production build**

Run: `npx vite build`
Expected: successful build with no errors

- [ ] **Step 3: Manual smoke test**

Start dev server with `npm run dev` and verify:
1. Settings page: no Save button, default chart type dropdown works, history stats show
2. Settings page: changing default size, then going to Benchmark shows the new default
3. About page: version number shown, tech stack badges, quick start section
4. Sidebar shows version from shared constant
5. Existing functionality still works (benchmark start/save/reset)

- [ ] **Step 4: Final commit (if any fixes)**

```bash
git add -A
git commit -m "fix: integration fixes for Settings and About page improvements"
```