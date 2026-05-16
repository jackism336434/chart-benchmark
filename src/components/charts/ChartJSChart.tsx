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
  toChartJSCandlestickData,
} from '../shared/formatData'
import { PerfContext } from '../../hooks/usePerf'
import type { ChartProps } from './types'
import type { BusinessRecord, TimeSeriesPoint, OHLCV } from '../../data/types'

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
  const measuredRef = useRef(false)
  const perf = useContext(PerfContext)
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
    <div className="w-full h-full">
      <Chart
        type="bar"
        ref={(ref) => {
          if (ref && !measuredRef.current) {
            measuredRef.current = true
            perf?.setPerf(performance.now() - t0Ref.current)
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
  const chartRef = useRef<ChartJSType<'line', number[], string> | null>(null)
  const externalRef = useRef(false)
  const dataLenRef = useRef(data[0]?.length ?? 1)
  const measuredRef = useRef(false)
  const perf = useContext(PerfContext)

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
            onPan: zoomHandler,
          },
          zoom: {
            drag: { enabled: true },
            mode: 'x' as const,
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
            perf?.setPerf(performance.now() - t0Ref.current)
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
  const chartRef = useRef<ChartJSType<'candlestick', { x: number; o: number; h: number; l: number; c: number }[], unknown> | null>(null)
  const externalRef = useRef(false)
  const dataLenRef = useRef(data.length)
  const measuredRef = useRef(false)
  const perf = useContext(PerfContext)

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
            onPan: zoomHandler,
          },
          zoom: {
            drag: { enabled: true },
            mode: 'x' as const,
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
            perf?.setPerf(performance.now() - t0Ref.current)
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
    case 'market':
      return <CandlestickChart data={data as OHLCV[]} zoomSync={zoomSync} />
  }
}
