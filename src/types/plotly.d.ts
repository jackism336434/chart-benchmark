declare module 'plotly.js-dist-min' {
  import Plotly from 'plotly.js'
  export default Plotly
}

declare module 'react-plotly.js/factory' {
  import type { Component } from 'react'
  type PlotParams = {
    data: Array<Record<string, unknown>>
    layout?: Record<string, unknown>
    config?: Record<string, unknown>
    divId?: string
    onAfterPlot?: () => void
    onRelayout?: (event: Record<string, unknown>) => void
    useResizeHandler?: boolean
    style?: React.CSSProperties
    [key: string]: unknown
  }
  export default function createPlotlyComponent(plotly: unknown): React.ComponentType<PlotParams>
}