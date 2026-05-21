import { useState, useMemo, useCallback, lazy, Suspense } from 'react'
import { generateBizData, generateLineData, generateScatterData, generateOHLCV } from '../data/dataGenerator'
import type { ChartType } from './charts/types'
import { ZoomSync } from './charts/types'
import { EChartsChart } from './charts/EChartsChart'
import { ChartJSChart } from './charts/ChartJSChart'
import { ChartContainer } from './ChartContainer'
import { ControlPanel } from './ControlPanel'
import { PerfDashboard } from './PerfDashboard'
import { DEFAULT_PERF } from '../hooks/usePerf'
import type { PerfMetrics } from '../hooks/usePerf'

const PlotlyChart = lazy(() =>
  import('./charts/PlotlyChart').then((m) => ({ default: m.PlotlyChart }))
)

const LIBRARY_CONFIG = [
  { name: 'ECharts', color: '#10b981', accent: 'emerald' as const },
  { name: 'Chart.js', color: '#3b82f6', accent: 'blue' as const },
  { name: 'Plotly', color: '#a855f7', accent: 'purple' as const },
]

export function SandboxBoard() {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [renderSize, setRenderSize] = useState(10000)
  const [renderSeed, setRenderSeed] = useState(42)
  const [started, setStarted] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const [metrics, setMetricsState] = useState<PerfMetrics[]>([
    DEFAULT_PERF,
    DEFAULT_PERF,
    DEFAULT_PERF,
  ])
  const [dashboardOpen, setDashboardOpen] = useState(false)

  const zoomSync = useMemo(() => new ZoomSync(), [])

  const data = useMemo(() => {
    if (!started) return null
    switch (chartType) {
      case 'business':
        return generateBizData({ seed: renderSeed })
      case 'line':
        return generateLineData({ count: renderSize, seed: renderSeed, series: 2 })
      case 'scatter':
        return generateScatterData({ count: renderSize, seed: renderSeed, groups: 3 })
      case 'market':
        return generateOHLCV({ count: Math.min(renderSize, 500), seed: renderSeed })
    }
  }, [started, chartType, renderSize, renderSeed])

  const updateMetrics = useCallback((index: number, m: PerfMetrics) => {
    setMetricsState((prev) => {
      const next = [...prev]
      next[index] = m
      return next
    })
  }, [])

  const handleStart = useCallback((size: number, seed: number) => {
    setRenderSize(size)
    setRenderSeed(seed)
    setRenderKey((k) => k + 1)
    setMetricsState([DEFAULT_PERF, DEFAULT_PERF, DEFAULT_PERF])
    setStarted(true)
  }, [])

  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type)
    setStarted(false)
  }, [])

  const hasAnyRenderTime = metrics.some((m) => m.renderTime != null)

  return (
    <div className="flex flex-col h-full">
      <ControlPanel
        chartType={chartType}
        onStart={handleStart}
        onChartTypeChange={handleChartTypeChange}
      />

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-3 gap-4 min-h-0">
        {started && data ? (
          <>
            <ChartContainer
              key={`echarts-${chartType}-${renderSize}-${renderSeed}-${renderKey}`}
              library={LIBRARY_CONFIG[0].name}
              onMetricsChange={(m) => updateMetrics(0, m)}
            >
              <EChartsChart
                data={data}
                zoomSync={zoomSync}
                chartType={chartType}
              />
            </ChartContainer>
            <ChartContainer
              key={`chartjs-${chartType}-${renderSize}-${renderSeed}-${renderKey}`}
              library={LIBRARY_CONFIG[1].name}
              onMetricsChange={(m) => updateMetrics(1, m)}
            >
              <ChartJSChart
                data={data}
                zoomSync={zoomSync}
                chartType={chartType}
              />
            </ChartContainer>
            <ChartContainer
              key={`plotly-${chartType}-${renderSize}-${renderSeed}-${renderKey}`}
              library={LIBRARY_CONFIG[2].name}
              onMetricsChange={(m) => updateMetrics(2, m)}
            >
              <Suspense fallback={<div className="flex items-center justify-center h-full text-gray-600 text-sm animate-pulse">Loading Plotly...</div>}>
                <PlotlyChart
                  data={data}
                  zoomSync={zoomSync}
                  chartType={chartType}
                />
              </Suspense>
            </ChartContainer>
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
        autoOpen={hasAnyRenderTime && !dashboardOpen}
      />
    </div>
  )
}