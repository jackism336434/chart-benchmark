import { useRef, useEffect, useMemo, useContext } from 'react'
import * as echarts from 'echarts'
import {
  toEChartsBarOption,
  toEChartsLineOption,
  toEChartsCandlestickOption,
} from '../shared/formatData'
import { PerfContext } from '../../hooks/usePerf'
import type { ChartProps } from './types'
import type { BusinessRecord, TimeSeriesPoint, OHLCV } from '../../data/types'

export function EChartsChart({ data, zoomSync, chartType }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const externalRef = useRef(false)
  const measuredRef = useRef(false)
  const perf = useContext(PerfContext)
  const enableZoom = chartType !== 'business'

  const option = useMemo(() => {
    switch (chartType) {
      case 'business':
        return toEChartsBarOption(data as BusinessRecord[])
      case 'line':
        return toEChartsLineOption(data as TimeSeriesPoint[][])
      case 'market':
        return toEChartsCandlestickOption(data as OHLCV[])
    }
  }, [data, chartType])

  useEffect(() => {
    if (!containerRef.current) return

    const t0 = performance.now()
    const chart = echarts.init(containerRef.current)
    chartRef.current = chart

    chart.on('finished', () => {
      if (!measuredRef.current) {
        measuredRef.current = true
        perf?.setPerf(performance.now() - t0)
      }
    })

    if (enableZoom) {
      chart.on('datazoom', (params: unknown) => {
        if (externalRef.current) {
          externalRef.current = false
          return
        }
        const p = params as { batch?: Array<{ start: number; end: number }> }
        if (p.batch) {
          const { start, end } = p.batch[0]
          zoomSync.notify('echarts', start, end)
        }
      })
    }

    chart.setOption(option)

    const handleResize = () => chart.resize()
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.dispose()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    chartRef.current?.setOption(option, { notMerge: true })
  }, [option])

  useEffect(() => {
    if (!enableZoom) return
    return zoomSync.register('echarts', (start, end) => {
      const chart = chartRef.current
      if (!chart) return
      externalRef.current = true
      chart.dispatchAction({ type: 'dataZoom', start, end })
    })
  }, [zoomSync, data, enableZoom])

  return <div ref={containerRef} className="w-full h-full" />
}
