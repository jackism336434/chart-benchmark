import { useState, useMemo, useCallback, useEffect, lazy, Suspense } from 'react'
import { generateBizData, generateLineData, generateScatterData, generateOHLCV } from '../data/dataGenerator'
import type { ChartType, AnyChartData } from './charts/types'
import { ZoomSync } from './charts/types'
import type { BusinessRecord, TimeSeriesPoint, XYPoint, OHLCV } from '../data/types'
import { ChartContainer } from './ChartContainer'
import { ControlPanel } from './ControlPanel'
import { ErrorBoundary } from './ErrorBoundary'
import { PerfDashboard } from './PerfDashboard'
import { DEFAULT_PERF } from '../hooks/usePerf'
import type { PerfMetrics } from '../hooks/usePerf'
import { saveHistoryEntry } from '../utils/history'

const EChartsChart = lazy(() =>
  import('./charts/EChartsChart').then((m) => ({ default: m.EChartsChart }))
)
const ChartJSChart = lazy(() =>
  import('./charts/ChartJSChart').then((m) => ({ default: m.ChartJSChart }))
)
const PlotlyChart = lazy(() =>
  import('./charts/PlotlyChart').then((m) => ({ default: m.PlotlyChart }))
)

const LIBRARY_CONFIG = [
  { name: 'ECharts', color: '#10b981', accent: 'emerald' as const },
  { name: 'Chart.js', color: '#3b82f6', accent: 'blue' as const },
  { name: 'Plotly', color: '#a855f7', accent: 'purple' as const },
]

function formatPointCount(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return String(n)
}

function computePointCount(chartType: ChartType, data: AnyChartData | null): number {
  if (!data) return 0
  switch (chartType) {
    case 'business':
      return (data as BusinessRecord[]).length
    case 'line':
      return (data as TimeSeriesPoint[][]).reduce((sum, s) => sum + s.length, 0)
    case 'scatter':
      return (data as XYPoint[][]).reduce((sum, g) => sum + g.length, 0)
    case 'market':
      return (data as OHLCV[]).length
  }
}

export function SandboxBoard() {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [renderSize, setRenderSize] = useState(10000)
  const [renderSeed, setRenderSeed] = useState(42)
  const [series, setSeries] = useState(2)
  const [groups, setGroups] = useState(3)
  const [started, setStarted] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const [metrics, setMetricsState] = useState<PerfMetrics[]>([
    DEFAULT_PERF,
    DEFAULT_PERF,
    DEFAULT_PERF,
  ])
  const [dashboardOpen, setDashboardOpen] = useState(false)
  const [autoOpened, setAutoOpened] = useState(false)

  const zoomSync = useMemo(() => new ZoomSync(), [])
  const memoryAvailable = typeof (performance as any).memory !== 'undefined'
  const hasAnyRenderTime = metrics.some((m) => m.renderTime != null)

  useEffect(() => {
    if (hasAnyRenderTime && !autoOpened) {
      setAutoOpened(true)
      setDashboardOpen(true)
    }
  }, [hasAnyRenderTime, autoOpened])

  const data = useMemo(() => {
    if (!started) return null
    switch (chartType) {
      case 'business':
        return generateBizData({ seed: renderSeed })
      case 'line':
        return generateLineData({ count: renderSize, seed: renderSeed, series })
      case 'scatter':
        return generateScatterData({ count: renderSize, seed: renderSeed, groups })
      case 'market':
        return generateOHLCV({ count: Math.min(renderSize, 500), seed: renderSeed })
    }
  }, [started, chartType, renderSize, renderSeed, series, groups])

  const updateMetrics = useCallback((index: number, m: PerfMetrics) => {
    setMetricsState((prev) => {
      const next = [...prev]
      next[index] = m
      return next
    })
  }, [])

  const handleStart = useCallback((size: number, seed: number, series: number, groups: number) => {
    setRenderSize(size)
    setRenderSeed(seed)
    setSeries(series)
    setGroups(groups)
    setRenderKey((k) => k + 1)
    setMetricsState([DEFAULT_PERF, DEFAULT_PERF, DEFAULT_PERF])
    setStarted(true)
  }, [])

  const handleReset = useCallback(() => {
    setStarted(false)
    setMetricsState([DEFAULT_PERF, DEFAULT_PERF, DEFAULT_PERF])
    setAutoOpened(false)
  }, [])

  const [saved, setSaved] = useState(false)
  const handleSave = useCallback(() => {
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      chartType,
      dataSize: renderSize,
      seed: renderSeed,
      timestamp: new Date().toLocaleString(),
      libraries: LIBRARY_CONFIG.map((lib, i) => {
        const m = metrics[i]
        const delta = m.memoryAfter != null && m.memoryBefore != null
          ? (m.memoryAfter - m.memoryBefore) / 1024 / 1024
          : null
        return {
          name: lib.name,
          renderTime: m.renderTime,
          avgFPS: m.avgFPS,
          minFPS: m.minFPS,
          memoryDeltaMB: delta,
        }
      }),
    }
    saveHistoryEntry(entry)
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
  }, [chartType, renderSize, renderSeed, metrics])

  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type)
    setSeries(2)
    setGroups(3)
    setStarted(false)
  }, [])

  const pointCount = computePointCount(chartType, data)
  const ptLabel = pointCount > 0 ? ` (${formatPointCount(pointCount)} pts)` : ''

  const mkFallback = (name: string) => (
    <div className="flex items-center justify-center h-full text-gray-600 text-sm animate-pulse">
      Loading {name}{ptLabel}...
    </div>
  )

  const canSave = started && hasAnyRenderTime

  return (
    <div className="flex flex-col h-full">
      <ControlPanel
        chartType={chartType}
        series={series}
        groups={groups}
        canSave={canSave}
        saved={saved}
        onStart={handleStart}
        onReset={handleReset}
        onSave={handleSave}
        onChartTypeChange={handleChartTypeChange}
      />

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {started && data ? (
          <>
            <ErrorBoundary library="ECharts">
              <ChartContainer
                key={`echarts-${chartType}-${renderSize}-${renderSeed}-${renderKey}`}
                library={LIBRARY_CONFIG[0].name}
                started={started}
                pointCount={pointCount}
                onMetricsChange={(m) => updateMetrics(0, m)}
              >
                <Suspense fallback={mkFallback('ECharts')}>
                  <EChartsChart
                    data={data}
                    zoomSync={zoomSync}
                    chartType={chartType}
                  />
                </Suspense>
              </ChartContainer>
            </ErrorBoundary>
            <ErrorBoundary library="Chart.js">
              <ChartContainer
                key={`chartjs-${chartType}-${renderSize}-${renderSeed}-${renderKey}`}
                library={LIBRARY_CONFIG[1].name}
                started={started}
                pointCount={pointCount}
                onMetricsChange={(m) => updateMetrics(1, m)}
              >
                <Suspense fallback={mkFallback('Chart.js')}>
                  <ChartJSChart
                    data={data}
                    zoomSync={zoomSync}
                    chartType={chartType}
                  />
                </Suspense>
              </ChartContainer>
            </ErrorBoundary>
            <ErrorBoundary library="Plotly">
              <ChartContainer
                key={`plotly-${chartType}-${renderSize}-${renderSeed}-${renderKey}`}
                library={LIBRARY_CONFIG[2].name}
                started={started}
                pointCount={pointCount}
                onMetricsChange={(m) => updateMetrics(2, m)}
              >
                <Suspense fallback={mkFallback('Plotly')}>
                  <PlotlyChart
                    data={data}
                    zoomSync={zoomSync}
                    chartType={chartType}
                  />
                </Suspense>
              </ChartContainer>
            </ErrorBoundary>
          </>
        ) : (
          <div className="col-span-full flex items-center justify-center h-full">
            <div className="text-center space-y-2">
              <p className="text-gray-500 text-sm">
                Configure parameters and press
              </p>
              <span className="inline-block px-3 py-1 rounded-lg bg-emerald-600 text-white text-sm font-semibold">
                Start
              </span>
              <p className="text-gray-500 text-sm">to render</p>
            </div>
          </div>
        )}
      </div>

      <PerfDashboard
        libraries={LIBRARY_CONFIG.map((lib, i) => ({
          name: lib.name,
          metrics: metrics[i],
          color: lib.color,
          accent: lib.accent,
        }))}
        chartType={chartType}
        open={dashboardOpen}
        onToggle={() => setDashboardOpen((o) => !o)}
        memoryAvailable={memoryAvailable}
      />
    </div>
  )
}