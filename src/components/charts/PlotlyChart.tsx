import { useRef, useEffect, useMemo, useContext, useCallback } from 'react'
import Plotly from 'plotly.js-dist-min'
import createPlotlyComponent from 'react-plotly.js/factory'
import {
  toPlotlyBarData,
  toPlotlyLineData,
  toPlotlyScatterData,
  toPlotlyCandlestickData,
} from '../shared/formatData'
import { PerfContext, getMemorySnapshot } from '../../hooks/usePerf'
import { useFPSTracker } from '../../hooks/useFPSTracker'
import type { ChartProps } from './types'
import type { BusinessRecord, TimeSeriesPoint, XYPoint, OHLCV } from '../../data/types'

const Plot = createPlotlyComponent(Plotly)

export function PlotlyChart({ data, zoomSync, chartType }: ChartProps) {
  const t0Ref = useRef(performance.now())
  const memoryBeforeRef = useRef(getMemorySnapshot())
  const measuredRef = useRef(false)
  const rafRef = useRef(0)
  const containerIdRef = useRef(`plotly-${Math.random().toString(36).slice(2, 9)}`)
  const perf = useContext(PerfContext)
  const fpsTracker = useFPSTracker()
  const enableZoom = chartType !== 'business'

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

  const { plotData, layout, config } = useMemo(() => {
    const baseLayout = {
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      font: { color: '#9ca3af' },
      margin: { l: 50, r: 20, t: 30, b: 50 },
      xaxis: { gridcolor: '#1f2937' },
      yaxis: { gridcolor: '#1f2937' },
      showlegend: true,
      legend: { font: { color: '#9ca3af' } },
    }

    switch (chartType) {
      case 'business':
        return {
          plotData: toPlotlyBarData(data as BusinessRecord[]),
          layout: { ...baseLayout, barmode: 'group' as const },
          config: { responsive: true, displayModeBar: false },
        }
      case 'line':
        return {
          plotData: toPlotlyLineData(data as TimeSeriesPoint[][]),
          layout: {
            ...baseLayout,
            xaxis: { ...baseLayout.xaxis, rangeslider: { visible: false } },
          },
          config: { responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'] as const },
        }
      case 'scatter':
        return {
          plotData: toPlotlyScatterData(data as XYPoint[][]),
          layout: baseLayout,
          config: { responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'] as const },
        }
      case 'market':
        return {
          plotData: toPlotlyCandlestickData(data as OHLCV[]),
          layout: {
            ...baseLayout,
            xaxis: { ...baseLayout.xaxis, rangeslider: { visible: false } },
          },
          config: { responsive: true, displayModeBar: true, modeBarButtonsToRemove: ['toImage', 'sendDataToCloud'] as const },
        }
    }
  }, [data, chartType])

  const measure = useCallback(() => {
    if (!measuredRef.current) {
      measuredRef.current = true
      const memoryAfter = getMemorySnapshot()
      perf?.setMetrics({
        renderTime: performance.now() - t0Ref.current,
        memoryBefore: memoryBeforeRef.current,
        memoryAfter,
      })
    }
  }, [perf])

  const handleAfterPlot = useCallback(() => {
    measure()
  }, [measure])

  useEffect(() => {
    if (measuredRef.current) return
    let raf1 = requestAnimationFrame(() => {
      let raf2 = requestAnimationFrame(() => {
        measure()
      })
      rafRef.current = raf2
    })
    rafRef.current = raf1
    return () => cancelAnimationFrame(rafRef.current)
  }, [data, chartType, measure])

  useEffect(() => {
    if (!enableZoom) return
    return zoomSync.register('plotly', (startPct, endPct) => {
      const el = document.getElementById(containerIdRef.current)
      if (!el) return
      const xaxis = (el as any)._fullLayout?.xaxis
      if (!xaxis) return
      const min = xaxis._rl?.[0] ?? xaxis.range?.[0] ?? 0
      const max = xaxis._rl?.[1] ?? xaxis.range?.[1] ?? 100
      const rangeMin = min + (max - min) * (startPct / 100)
      const rangeMax = min + (max - min) * (endPct / 100)
      Plotly.relayout(el, { 'xaxis.range': [rangeMin, rangeMax] })
    })
  }, [zoomSync, data, enableZoom])

  const handleRelayout = useCallback((event: Record<string, unknown>) => {
    if (!enableZoom) return
    if ('xaxis.range[0]' in event && 'xaxis.range[1]' in event) {
      const el = document.getElementById(containerIdRef.current)
      if (!el) return
      const xaxis = (el as any)._fullLayout?.xaxis
      if (!xaxis) return
      const fullMin = xaxis._rl?.[0] ?? xaxis.range?.[0] ?? 0
      const fullMax = xaxis._rl?.[1] ?? xaxis.range?.[1] ?? 100
      const total = fullMax - fullMin
      if (total === 0) return
      const rangeMin = event['xaxis.range[0]'] as number
      const rangeMax = event['xaxis.range[1]'] as number
      const startPct = ((rangeMin - fullMin) / total) * 100
      const endPct = ((rangeMax - fullMin) / total) * 100
      zoomSync.notify('plotly', Math.max(0, startPct), Math.min(100, endPct))
    }
  }, [zoomSync, enableZoom])

  return (
    <div
      className="w-full h-full"
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <Plot
        divId={containerIdRef.current}
        data={plotData}
        layout={layout}
        config={config}
        onAfterPlot={handleAfterPlot}
        onRelayout={handleRelayout}
        useResizeHandler
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  )
}