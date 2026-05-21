import type { BusinessRecord, TimeSeriesPoint, XYPoint, OHLCV } from '../../data/types'

export type ChartType = 'business' | 'line' | 'scatter' | 'market'

export type AnyChartData = BusinessRecord[] | TimeSeriesPoint[][] | XYPoint[][] | OHLCV[]

export type ZoomHandler = (start: number, end: number) => void

export class ZoomSync {
  private handlers = new Map<string, ZoomHandler>()

  register(source: string, handler: ZoomHandler) {
    this.handlers.set(source, handler)
    return () => {
      this.handlers.delete(source)
    }
  }

  notify(source: string, start: number, end: number) {
    this.handlers.forEach((handler, key) => {
      if (key !== source) handler(start, end)
    })
  }
}

export interface ChartProps {
  data: AnyChartData
  zoomSync: ZoomSync
  chartType: ChartType
}
