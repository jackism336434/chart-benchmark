import { useRef, useEffect, useMemo, useContext, useCallback } from 'react'
import * as echarts from 'echarts'
import {
  toEChartsBarOption,
  toEChartsLineOption,
  toEChartsScatterOption,
  toEChartsCandlestickOption,
} from '../shared/formatData'
import { PerfContext, getMemorySnapshot } from '../../hooks/usePerf'
import { useFPSTracker } from '../../hooks/useFPSTracker'
import type { ChartProps } from './types'
import type { BusinessRecord, TimeSeriesPoint, XYPoint, OHLCV } from '../../data/types'

export function EChartsChart({ data, zoomSync, chartType }: ChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<echarts.ECharts | null>(null)
  const externalRef = useRef(false)
  const measuredRef = useRef(false)
  const fpsTrackingRef = useRef(false)
  const perf = useContext(PerfContext)
  const enableZoom = chartType !== 'business'
  const fpsTracker = useFPSTracker()

  const option = useMemo(() => {
    switch (chartType) {
      case 'business':
        return toEChartsBarOption(data as BusinessRecord[])
      case 'line':
        return toEChartsLineOption(data as TimeSeriesPoint[][])
      case 'scatter':
        return toEChartsScatterOption(data as XYPoint[][])
      case 'market':
        return toEChartsCandlestickOption(data as OHLCV[])
    }
  }, [data, chartType])

  useEffect(() => {
    if (!containerRef.current) return

    const memoryBefore = getMemorySnapshot()
    const t0 = performance.now()
    const chart = echarts.init(containerRef.current)
    chartRef.current = chart

    chart.on('finished', () => {
      if (!measuredRef.current) {
        measuredRef.current = true
        const memoryAfter = getMemorySnapshot()
        perf?.setMetrics({
          renderTime: performance.now() - t0,
          memoryBefore,
          memoryAfter,
        })
      }
      if (fpsTrackingRef.current) {
        fpsTrackingRef.current = false
        fpsTracker.stop()
        const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
        if (avgFPS !== null) {
          perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
        }
      }
    })

    if (enableZoom) {
      chart.on('datazoom', (params: unknown) => {
        if (externalRef.current) {
          externalRef.current = false
          return
        }
        if (!fpsTrackingRef.current) {
          fpsTrackingRef.current = true
          fpsTracker.start()
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

  const handleMouseDown = useCallback(() => {
    fpsTracker.start()
  }, [fpsTracker])

  const handleMouseUp = useCallback(() => {
    fpsTracker.stop()
    const { avgFPS, minFPS, fpsSamples } = fpsTracker.getMetrics()
    if (avgFPS !== null) {
      perf?.setMetrics({ avgFPS, minFPS, fpsSamples })
    }
  }, [fpsTracker, perf])

  return <div ref={containerRef} className="w-full h-full" onMouseDown={handleMouseDown} onMouseUp={handleMouseUp} />
}