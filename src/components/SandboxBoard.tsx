import { useState, useMemo, useCallback } from 'react'
import { generateBizData, generateLineData, generateOHLCV } from '../data/dataGenerator'
import type { ChartType } from './charts/types'
import { ZoomSync } from './charts/types'
import { EChartsChart } from './charts/EChartsChart'
import { ChartJSChart } from './charts/ChartJSChart'
import { ChartContainer } from './ChartContainer'
import { ControlPanel } from './ControlPanel'

export function SandboxBoard() {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [renderSize, setRenderSize] = useState(10000)
  const [renderSeed, setRenderSeed] = useState(42)
  const [started, setStarted] = useState(false)
  const [renderKey, setRenderKey] = useState(0)

  const zoomSync = useMemo(() => new ZoomSync(), [])

  const data = useMemo(() => {
    if (!started) return null
    switch (chartType) {
      case 'business':
        return generateBizData({ seed: renderSeed })
      case 'line':
        return generateLineData({ count: renderSize, seed: renderSeed, series: 2 })
      case 'market':
        return generateOHLCV({ count: Math.min(renderSize, 500), seed: renderSeed })
    }
  }, [started, chartType, renderSize, renderSeed])

  const handleStart = useCallback((size: number, seed: number) => {
    setRenderSize(size)
    setRenderSeed(seed)
    setRenderKey((k) => k + 1)
    setStarted(true)
  }, [])

  const handleChartTypeChange = useCallback((type: ChartType) => {
    setChartType(type)
    setStarted(false)
  }, [])

  return (
    <div className="flex flex-col h-full">
      <ControlPanel
        chartType={chartType}
        onStart={handleStart}
        onChartTypeChange={handleChartTypeChange}
      />

      <div className="flex-1 p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {started && data ? (
          <>
            <ChartContainer
              key={`echarts-${chartType}-${renderSize}-${renderSeed}-${renderKey}`}
              library="ECharts"
            >
              <EChartsChart
                data={data}
                zoomSync={zoomSync}
                chartType={chartType}
              />
            </ChartContainer>
            <ChartContainer
              key={`chartjs-${chartType}-${renderSize}-${renderSeed}-${renderKey}`}
              library="Chart.js"
            >
              <ChartJSChart
                data={data}
                zoomSync={zoomSync}
                chartType={chartType}
              />
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
    </div>
  )
}
