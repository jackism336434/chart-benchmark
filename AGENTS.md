# AGENTS.md — Chart Benchmark

## Project
Multi-dimensional chart library performance & effect evaluation system. See `README.md` for full plan.

## Architecture
- **Frontend:** Vite + React + Tailwind CSS v4 + React Router (multi-page SPA with sidebar navigation)
- **Backend:** Python FastAPI (stage 4 — evaluates Matplotlib/Seaborn server-side)
- **Key modules:** data generator, sandbox render board (ECharts / Chart.js / Plotly.js side-by-side), performance monitor (FPS / render time / memory), code comparison panel, history & report pages

## Implemented features
- **Data generator:** Business (100 records), Line (up to 200K points, multi-series), Scatter (up to 200K, multi-group), OHLCV (up to 500 candlestick bars)
- **3 chart libraries:** ECharts, Chart.js, Plotly.js — lazy-loaded with code splitting (manualChunks)
- **4 chart types:** Business (bar), Line, Scatter, Market (candlestick)
- **Zoom sync:** Cross-library dataZoom synchronization (ECharts ↔ Chart.js ↔ Plotly)
- **Performance metrics:** Render time (via `finished` event / ref callback), FPS (interaction-based via rAF tracker), memory heap delta (Chrome `performance.memory`)
- **Performance dashboard:** Collapsible bottom panel with MetricCards, MetricBarCharts, auto-open on first render, min FPS metric
- **Code panel:** Prismjs syntax-highlighted side-by-side config comparison for all 3 libraries
- **Circuit breaker:** Warning at >50K data points, blocks rendering at >200K for line/scatter
- **ECharts optimizations:** `large: true` + `largeThreshold: 5000` for line/scatter at scale
- **Code splitting:** ECharts (~1.1MB), Chart.js (~257KB), Plotly (~4.8MB) in separate chunks
- **Multi-page navigation:** React Router with collapsible sidebar, 5 pages: Benchmark, Report, History, Settings, About
- **Save to history:** Save benchmark results to localStorage, view in History page
- **Comparison report:** Bar chart comparison of saved benchmark runs
- **Rendering indicator:** Pulsing green dot while chart renders, point count in header
- **Dark scrollbars:** Custom WebKit + Firefox scrollbar styling
- **Enter key support:** Press Enter in any input to start benchmark

## Pages
- `/` or `/benchmark` — Benchmark page (SandboxBoard with live rendering)
- `/report` — Comparison Report (bar charts from saved history)
- `/history` — Past benchmark runs stored in localStorage
- `/settings` — Theme preference, default size, clear data
- `/about` — Project description, evaluation dimensions, tech stack

## Key file map
- `src/App.tsx` — Router setup with BrowserRouter + LayoutShell
- `src/components/LayoutShell.tsx` — Sidebar + Outlet layout
- `src/components/Sidebar.tsx` — Collapsible sidebar navigation with NavLink
- `src/components/SandboxBoard.tsx` — Main benchmark layout, orchestrates all 3 libraries + dashboard + save
- `src/components/ChartContainer.tsx` — Per-library container with metrics badges + rendering indicator + point count
- `src/components/ControlPanel.tsx` — Chart type, data size slider, seed, start/save/reset buttons, circuit breaker
- `src/components/PerfDashboard.tsx` — N-library dashboard with MetricCard, MetricBarChart, CodePanel
- `src/components/MetricBarChart.tsx` — Bar chart with negative values (red), hints for unmeasured metrics
- `src/components/CodePanel.tsx` — Syntax-highlighted code comparison with LOC count
- `src/components/charts/` — EChartsChart, ChartJSChart, PlotlyChart (lazy-loaded)
- `src/components/shared/formatData.ts` — All data-to-option formatters + code snippet generators
- `src/pages/` — BenchmarkPage, ReportPage, HistoryPage, SettingsPage, AboutPage
- `src/utils/history.ts` — localStorage CRUD for benchmark history entries
- `src/hooks/usePerf.ts` — PerfMetrics type, PerfContext, getMemorySnapshot
- `src/hooks/useFPSTracker.ts` — rAF-based FPS measurement hook
- `src/data/` — Random RNG, data generator, types (BusinessRecord, TimeSeriesPoint, XYPoint, OHLCV)
- `vite.config.ts` — manualChunks for echarts/chartjs/plotly splitting

## Lint / typecheck
- `npx tsc -b --noEmit` — TypeScript check
- `npx vite build` — Production build verification
