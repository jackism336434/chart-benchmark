import { useRef, useEffect, useMemo, useContext } from 'react'
import { Chart as ChartJSType, registerables } from 'chart.js'
import zoomPlugin from 'chartjs-plugin-zoom'
import {
  CandlestickController,
  CandlestickElement,
} from 'chartjs-chart-financial'
import { Chart } from 'react-chartjs-2'
import {
  toChartJSBarData,
  toChartJSLineData,
  toChartJSScatterData,
  toChartJSCandlestickData,
} from '../shared/formatData'
import { PerfContext, getMemorySnapshot } from '../../hooks/usePerf'
import { useFPSTracker } from '../../hooks/useFPSTracker'
import type { ChartProps } from './types'
import type { BusinessRecord, TimeSeriesPoint, XYPoint, OHLCV } from '../../data/types'

ChartJSType.register(
  ...registerables,
  zoomPlugin,
  CandlestickController,
  CandlestickElement,
)

interface ZoomableChart {
  zoomScale(scale: string, range: { min: number; max: number }): void
}

function BarChart({ data }: { data: BusinessRecord[] }) {
  const t0Ref = useRef(performance.now())
  const memoryBeforeRef = useRef(getMemorySnapshot())
  const measuredRef = useRef(false)
  const perf = useContext(PerfContext)
  const fpsTracker = useFPSTracker()
  const chartData = useMemo(() => toChartJSBarData(data), [data])

  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      animation: false as const,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { labels: { color: '#9ca3af' } },
        tooltip: { enabled: true },
      },
      scales: {
        x: {
          display: true,
          ticks: { color: '#9ca3af', maxRotation: 45 },
          grid: { color: '#1f2937' },
        },
        y: {
          display: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#1f2937' },
        },
      },
    }),
    [],
  )

  return (
    <div
      className="w-full h-full"
      onMouseDown={() => fpsTracker.start()}
      onMouseUp={() => {
        fpsTracker.stop()
        const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
        perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
      }}
    >
      <Chart
        type="bar"
        ref={(ref) => {
          if (ref && !measuredRef.current) {
            measuredRef.current = true
            const ms = performance.now() - t0Ref.current
            const memoryAfter = getMemorySnapshot()
            perf?.setMetrics({
              renderTime: ms,
              memoryBefore: memoryBeforeRef.current,
              memoryAfter,
            })
          }
        }}
        data={chartData}
        options={options}
      />
    </div>
  )
}

function LineChart({
  data,
  zoomSync,
}: {
  data: TimeSeriesPoint[][]
  zoomSync: ChartProps['zoomSync']
}) {
  const t0Ref = useRef(performance.now())
  const memoryBeforeRef = useRef(getMemorySnapshot())
  const chartRef = useRef<ChartJSType<'line', number[], string> | null>(null)
  const externalRef = useRef(false)
  const dataLenRef = useRef(data[0]?.length ?? 1)
  const measuredRef = useRef(false)
  const perf = useContext(PerfContext)
  const fpsTracker = useFPSTracker()
  const fpsActiveRef = useRef(false)

  dataLenRef.current = data[0]?.length ?? 1

  const chartData = useMemo(() => toChartJSLineData(data), [data])

  useEffect(() => {
    return zoomSync.register('chartjs', (start, end) => {
      const chart = chartRef.current
      if (!chart) return
      externalRef.current = true
      const total = dataLenRef.current
      const min = (start / 100) * (total - 1)
      const max = (end / 100) * (total - 1)
      ;(chart as unknown as ZoomableChart).zoomScale('x', { min, max })
    })
  }, [zoomSync])

  const options = useMemo(() => {
    const zoomHandler = () => {
      const chart = chartRef.current
      if (!chart || externalRef.current) {
        externalRef.current = false
        return
      }
      const { min, max } = chart.scales.x
      const total = dataLenRef.current
      const start = (min / (total - 1)) * 100
      const end = (max / (total - 1)) * 100
      zoomSync.notify('chartjs', start, end)
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false as const,
      interaction: { mode: 'index' as const, intersect: false },
      plugins: {
        legend: { labels: { color: '#9ca3af' } },
        tooltip: { enabled: true },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x' as const,
            onPanStart: () => {
              fpsActiveRef.current = true
              fpsTracker.start()
              return false
            },
            onPanComplete: () => {
              fpsActiveRef.current = false
              fpsTracker.stop()
              const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
              perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
            },
            onPan: zoomHandler,
          },
          zoom: {
            drag: { enabled: true },
            mode: 'x' as const,
            onZoomStart: () => {
              fpsActiveRef.current = true
              fpsTracker.start()
              return false
            },
            onZoomComplete: () => {
              fpsActiveRef.current = false
              fpsTracker.stop()
              const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
              perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
            },
            onZoom: zoomHandler,
          },
        },
      },
      scales: {
        x: {
          display: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#1f2937' },
        },
        y: {
          display: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#1f2937' },
        },
      },
    }
  }, [zoomSync])

  return (
    <div className="w-full h-full">
      <Chart
        type="line"
        ref={(ref) => {
          chartRef.current = ref ?? null
          if (ref && !measuredRef.current) {
            measuredRef.current = true
            const ms = performance.now() - t0Ref.current
            const memoryAfter = getMemorySnapshot()
            perf?.setMetrics({
              renderTime: ms,
              memoryBefore: memoryBeforeRef.current,
              memoryAfter,
            })
          }
        }}
        data={chartData}
        options={options}
      />
    </div>
  )
}

function CandlestickChart({
  data,
  zoomSync,
}: {
  data: OHLCV[]
  zoomSync: ChartProps['zoomSync']
}) {
  const t0Ref = useRef(performance.now())
  const memoryBeforeRef = useRef(getMemorySnapshot())
  const chartRef = useRef<ChartJSType<'candlestick', { x: number; o: number; h: number; l: number; c: number }[], unknown> | null>(null)
  const externalRef = useRef(false)
  const dataLenRef = useRef(data.length)
  const measuredRef = useRef(false)
  const perf = useContext(PerfContext)
  const fpsTracker = useFPSTracker()
  const fpsActiveRef = useRef(false)

  dataLenRef.current = data.length

  const chartData = useMemo(() => toChartJSCandlestickData(data), [data])

  useEffect(() => {
    return zoomSync.register('chartjs', (start, end) => {
      const chart = chartRef.current
      if (!chart) return
      externalRef.current = true
      const total = dataLenRef.current
      const min = (start / 100) * (total - 1)
      const max = (end / 100) * (total - 1)
      ;(chart as unknown as ZoomableChart).zoomScale('x', { min, max })
    })
  }, [zoomSync])

  const options = useMemo(() => {
    const zoomHandler = () => {
      const chart = chartRef.current
      if (!chart || externalRef.current) {
        externalRef.current = false
        return
      }
      const { min, max } = chart.scales.x
      const total = dataLenRef.current
      const start = (min / (total - 1)) * 100
      const end = (max / (total - 1)) * 100
      zoomSync.notify('chartjs', start, end)
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false as const,
      plugins: {
        legend: { labels: { color: '#9ca3af' } },
        tooltip: { enabled: true },
        zoom: {
          pan: {
            enabled: true,
            mode: 'x' as const,
            onPanStart: () => {
              fpsActiveRef.current = true
              fpsTracker.start()
              return false
            },
            onPanComplete: () => {
              fpsActiveRef.current = false
              fpsTracker.stop()
              const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
              perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
            },
            onPan: zoomHandler,
          },
          zoom: {
            drag: { enabled: true },
            mode: 'x' as const,
            onZoomStart: () => {
              fpsActiveRef.current = true
              fpsTracker.start()
              return false
            },
            onZoomComplete: () => {
              fpsActiveRef.current = false
              fpsTracker.stop()
              const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
              perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
            },
            onZoom: zoomHandler,
          },
        },
      },
      scales: {
        x: {
          type: 'linear' as const,
          display: true,
          ticks: {
            color: '#9ca3af',
            callback: (value: string | number) =>
              typeof value === 'number' ? data[value]?.date ?? value : value,
          },
          grid: { color: '#1f2937' },
        },
        y: {
          display: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#1f2937' },
        },
      },
    }
  }, [zoomSync, data])

  return (
    <div className="w-full h-full">
      <Chart
        type="candlestick"
        ref={(ref) => {
          chartRef.current = ref ?? null
          if (ref && !measuredRef.current) {
            measuredRef.current = true
            const ms = performance.now() - t0Ref.current
            const memoryAfter = getMemorySnapshot()
            perf?.setMetrics({
              renderTime: ms,
              memoryBefore: memoryBeforeRef.current,
              memoryAfter,
            })
          }
        }}
        data={chartData}
        options={options}
      />
    </div>
  )
}

function ScatterChart({
  data,
  zoomSync,
}: {
  data: XYPoint[][]
  zoomSync: ChartProps['zoomSync']
}) {
  const t0Ref = useRef(performance.now())
  const memoryBeforeRef = useRef(getMemorySnapshot())
  const chartRef = useRef<ChartJSType<'scatter', { x: number; y: number }[], unknown> | null>(null)
  const externalRef = useRef(false)
  const measuredRef = useRef(false)
  const perf = useContext(PerfContext)
  const fpsTracker = useFPSTracker()
  const fpsActiveRef = useRef(false)

  const chartData = useMemo(() => toChartJSScatterData(data), [data])

  useEffect(() => {
    return zoomSync.register('chartjs-scatter', (start, end) => {
      const chart = chartRef.current
      if (!chart) return
      externalRef.current = true
      const xScale = chart.scales.x
      const range = xScale.max - xScale.min
      const min = xScale.min + (start / 100) * range
      const max = xScale.min + (end / 100) * range
      ;(chart as unknown as ZoomableChart).zoomScale('x', { min, max })
    })
  }, [zoomSync])

  const options = useMemo(() => {
    const zoomHandler = () => {
      const chart = chartRef.current
      if (!chart || externalRef.current) {
        externalRef.current = false
        return
      }
      const xScale = chart.scales.x
      const range = xScale.max - xScale.min
      const start = ((xScale.min - xScale.min) / range) * 100
      const end = ((xScale.max - xScale.min) / range) * 100
      zoomSync.notify('chartjs-scatter', start, end)
    }

    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: false as const,
      plugins: {
        legend: { labels: { color: '#9ca3af' } },
        tooltip: { enabled: true },
        zoom: {
          pan: {
            enabled: true,
            mode: 'xy' as const,
            onPanStart: () => {
              fpsActiveRef.current = true
              fpsTracker.start()
              return false
            },
            onPanComplete: () => {
              fpsActiveRef.current = false
              fpsTracker.stop()
              const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
              perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
            },
            onPan: zoomHandler,
          },
          zoom: {
            drag: { enabled: true },
            mode: 'xy' as const,
            onZoomStart: () => {
              fpsActiveRef.current = true
              fpsTracker.start()
              return false
            },
            onZoomComplete: () => {
              fpsActiveRef.current = false
              fpsTracker.stop()
              const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
              perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
            },
            onZoom: zoomHandler,
          },
        },
      },
      scales: {
        x: {
          type: 'linear' as const,
          display: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#1f2937' },
        },
        y: {
          type: 'linear' as const,
          display: true,
          ticks: { color: '#9ca3af' },
          grid: { color: '#1f2937' },
        },
      },
    }
  }, [zoomSync])

  return (
    <div className="w-full h-full">
      <Chart
        type="scatter"
        ref={(ref) => {
          chartRef.current = ref ?? null
          if (ref && !measuredRef.current) {
            measuredRef.current = true
            const ms = performance.now() - t0Ref.current
            const memoryAfter = getMemorySnapshot()
            perf?.setMetrics({
              renderTime: ms,
              memoryBefore: memoryBeforeRef.current,
              memoryAfter,
            })
          }
        }}
        data={chartData}
        options={options}
      />
    </div>
  )
}

export function ChartJSChart({ data, zoomSync, chartType }: ChartProps) {
  switch (chartType) {
    case 'business':
      return <BarChart data={data as BusinessRecord[]} />
    case 'line':
      return <LineChart data={data as TimeSeriesPoint[][]} zoomSync={zoomSync} />
    case 'scatter':
      return <ScatterChart data={data as XYPoint[][]} zoomSync={zoomSync} />
    case 'market':
      return <CandlestickChart data={data as OHLCV[]} zoomSync={zoomSync} />
  }
}