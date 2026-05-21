import type { BusinessRecord, TimeSeriesPoint, XYPoint, OHLCV } from '../../data/types'

const COLORS = ['#5470c6', '#91cc75', '#fac858', '#ee6666', '#73c0de']

function unique<T>(arr: T[]): T[] {
  return [...new Set(arr)]
}

// ── ECharts formatters ──

export function toEChartsBarOption(data: BusinessRecord[]) {
  const dates = unique(data.map((r) => r.date)).sort()
  const categories = unique(data.map((r) => r.category))

  return {
    animation: false,
    dataZoom: [] as Array<unknown>,
    tooltip: { trigger: 'axis' as const },
    legend: {
      data: categories,
      top: 0,
      textStyle: { color: '#9ca3af' },
    },
    grid: { left: 60, right: 20, top: 36, bottom: 40 },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: { color: '#9ca3af', rotate: 45 },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    series: categories.map((cat, i) => ({
      type: 'bar' as const,
      name: cat,
      data: dates.map((date) => {
        const record = data.find((r) => r.date === date && r.category === cat)
        return record ? record.revenue : 0
      }),
      color: COLORS[i % COLORS.length],
    })),
  }
}

export function toEChartsLineOption(data: TimeSeriesPoint[][]) {
  const dates = data[0].map((p) => p.date)

  return {
    animation: false,
    dataZoom: [
      { type: 'slider' as const, start: 0, end: 100 },
      { type: 'inside' as const },
    ],
    tooltip: { trigger: 'axis' as const },
    legend: {
      data: data.map((_, i) => `Series ${i + 1}`),
      top: 0,
      textStyle: { color: '#9ca3af' },
    },
    grid: { left: 60, right: 20, top: 36, bottom: 60 },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: { color: '#9ca3af' },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    series: data.map((s, i) => ({
      type: 'line' as const,
      name: `Series ${i + 1}`,
      data: s.map((p) => p.value),
      smooth: true,
      large: s.length > 5000,
      largeThreshold: 5000,
    })),
  }
}

export function toEChartsCandlestickOption(data: OHLCV[]) {
  const dates = data.map((d) => d.date)

  return {
    animation: false,
    dataZoom: [
      { type: 'slider' as const, start: 0, end: 100 },
      { type: 'inside' as const },
    ],
    tooltip: { trigger: 'axis' as const },
    grid: { left: 60, right: 20, top: 20, bottom: 60 },
    xAxis: {
      type: 'category' as const,
      data: dates,
      axisLabel: { color: '#9ca3af' },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    series: [
      {
        type: 'candlestick' as const,
        data: data.map((d) => [d.open, d.close, d.low, d.high]),
        itemStyle: {
          color: '#26a69a',
          color0: '#ef5350',
          borderColor: '#26a69a',
          borderColor0: '#ef5350',
        },
      },
    ],
  }
}

// ── Chart.js formatters ──

export function toChartJSBarData(data: BusinessRecord[]) {
  const dates = unique(data.map((r) => r.date)).sort()
  const categories = unique(data.map((r) => r.category))

  return {
    labels: dates,
    datasets: categories.map((cat, i) => ({
      label: cat,
      data: dates.map((date) => {
        const record = data.find((r) => r.date === date && r.category === cat)
        return record ? record.revenue : 0
      }),
      backgroundColor: COLORS[i % COLORS.length] + '88',
      borderColor: COLORS[i % COLORS.length],
      borderWidth: 1,
    })),
  }
}

export function toChartJSLineData(data: TimeSeriesPoint[][]) {
  const labels = data[0].map((p) => p.date)

  return {
    labels,
    datasets: data.map((s, i) => ({
      label: `Series ${i + 1}`,
      data: s.map((p) => p.value),
      borderColor: COLORS[i % COLORS.length],
      backgroundColor: COLORS[i % COLORS.length] + '33',
      pointRadius: 0,
      tension: 0.3,
    })),
  }
}

export function toChartJSCandlestickData(data: OHLCV[]) {
  return {
    datasets: [
      {
        label: 'OHLC',
        data: data.map((d, i) => ({
          x: i,
          o: d.open,
          h: d.high,
          l: d.low,
          c: d.close,
        })),
        color: {
          up: '#26a69a',
          down: '#ef5350',
          unchanged: '#999',
        },
      },
    ],
  }
}

export function getEChartsCodeSnippet(chartType: string): string {
  switch (chartType) {
    case 'business':
      return `option = {\n  type: 'bar',\n  tooltip: { trigger: 'axis' },\n  legend: {},\n  xAxis: { type: 'category' },\n  yAxis: { type: 'value' },\n  series: categories.map(cat => ({\n    type: 'bar', name: cat,\n    data: dates.map(d => revenue)\n  }))\n}`
    case 'line':
      return `option = {\n  type: 'line',\n  dataZoom: [{ type: 'slider' }, { type: 'inside' }],\n  tooltip: { trigger: 'axis' },\n  xAxis: { type: 'category' },\n  yAxis: { type: 'value' },\n  series: data.map(s => ({\n    type: 'line', smooth: true\n  }))\n}`
    case 'scatter':
      return `option = {\n  type: 'scatter',\n  dataZoom: [{ type: 'slider' }, { type: 'inside' }],\n  tooltip: { trigger: 'item' },\n  xAxis: { type: 'value' },\n  yAxis: { type: 'value' },\n  series: groups.map((g, i) => ({\n    type: 'scatter',\n    data: g.map(p => [p.x, p.y]),\n    large: totalPoints > 5000\n  }))\n}`
    case 'market':
      return `option = {\n  type: 'candlestick',\n  dataZoom: [{ type: 'slider' }, { type: 'inside' }],\n  series: [{\n    type: 'candlestick',\n    data: items.map(d => [d.open, d.close, d.low, d.high])\n  }]\n}`
    default:
      return ''
  }
}

export function getChartJSCodeSnippet(chartType: string): string {
  switch (chartType) {
    case 'business':
      return `new Chart(ctx, {\n  type: 'bar',\n  data: {\n    labels: dates,\n    datasets: categories.map(cat => ({\n      label: cat,\n      data: revenues\n    }))\n  },\n  options: { responsive: true }\n})`
    case 'line':
      return `new Chart(ctx, {\n  type: 'line',\n  data: {\n    labels: dates,\n    datasets: series.map(s => ({\n      data: s.values, tension: 0.3\n    }))\n  },\n  plugins: [zoomPlugin],\n  options: {\n    plugins: {\n      zoom: { pan: { enabled: true },\n               zoom: { drag: { enabled: true } } }\n    }\n  }\n})`
    case 'scatter':
      return `new Chart(ctx, {\n  type: 'scatter',\n  data: {\n    datasets: groups.map((g, i) => ({\n      data: g.map(p => ({ x: p.x, y: p.y }))\n    }))\n  },\n  plugins: [zoomPlugin],\n  options: {\n    plugins: {\n      zoom: { pan: { enabled: true },\n               zoom: { drag: { enabled: true } } }\n    }\n  }\n})`
    case 'market':
      return `new Chart(ctx, {\n  type: 'candlestick',\n  data: {\n    datasets: [{\n      data: items.map((d, i) =>\n        ({ x: i, o: d.open, h: d.high, l: d.low, c: d.close }))\n    }]\n  },\n  plugins: [zoomPlugin, CandlestickController]\n})`
    default:
      return ''
  }
}

export function toEChartsScatterOption(data: XYPoint[][]) {
  const totalPoints = data.reduce((sum, g) => sum + g.length, 0)
  return {
    animation: false,
    dataZoom: [
      { type: 'slider' as const, start: 0, end: 100 },
      { type: 'inside' as const },
    ],
    tooltip: { trigger: 'item' as const },
    legend: {
      data: data.map((_, i) => `Group ${i + 1}`),
      top: 0,
      textStyle: { color: '#9ca3af' },
    },
    grid: { left: 60, right: 20, top: 36, bottom: 60 },
    xAxis: {
      type: 'value' as const,
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    yAxis: {
      type: 'value' as const,
      axisLabel: { color: '#9ca3af' },
      splitLine: { lineStyle: { color: '#1f2937' } },
    },
    series: data.map((group, i) => ({
      type: 'scatter' as const,
      name: `Group ${i + 1}`,
      data: group.map((p) => [p.x, p.y]),
      large: totalPoints > 5000,
      largeThreshold: 5000,
      symbolSize: totalPoints > 5000 ? 3 : 6,
    })),
  }
}

export function toChartJSScatterData(data: XYPoint[][]) {
  return {
    datasets: data.map((group, i) => ({
      label: `Group ${i + 1}`,
      data: group.map((p) => ({ x: p.x, y: p.y })),
      backgroundColor: COLORS[i % COLORS.length] + '88',
      borderColor: COLORS[i % COLORS.length],
      pointRadius: data.reduce((s, g) => s + g.length, 0) > 5000 ? 1.5 : 3,
    })),
  }
}

// ── Plotly formatters ──

export function toPlotlyBarData(data: BusinessRecord[]) {
  const dates = unique(data.map((r) => r.date)).sort()
  const categories = unique(data.map((r) => r.category))
  return categories.map((cat, i) => ({
    type: 'bar' as const,
    name: cat,
    x: dates,
    y: dates.map((date) => {
      const record = data.find((r) => r.date === date && r.category === cat)
      return record ? record.revenue : 0
    }),
    marker: { color: COLORS[i % COLORS.length] },
  }))
}

export function toPlotlyLineData(data: TimeSeriesPoint[][]) {
  return data.map((s, i) => ({
    type: 'scatter' as const,
    mode: 'lines' as const,
    name: `Series ${i + 1}`,
    x: s.map((p) => p.date),
    y: s.map((p) => p.value),
    line: { color: COLORS[i % COLORS.length], shape: 'spline' as const },
  }))
}

export function toPlotlyScatterData(data: XYPoint[][]) {
  return data.map((group, i) => ({
    type: 'scatter' as const,
    mode: 'markers' as const,
    name: `Group ${i + 1}`,
    x: group.map((p) => p.x),
    y: group.map((p) => p.y),
    marker: {
      color: COLORS[i % COLORS.length],
      size: data.reduce((s, g) => s + g.length, 0) > 5000 ? 2.5 : 5,
      opacity: 0.7,
    },
  }))
}

export function toPlotlyCandlestickData(data: OHLCV[]) {
  return [
    {
      type: 'candlestick' as const,
      name: 'OHLC',
      x: data.map((d) => d.date),
      open: data.map((d) => d.open),
      high: data.map((d) => d.high),
      low: data.map((d) => d.low),
      close: data.map((d) => d.close),
      increasing: { line: { color: '#26a69a' } },
      decreasing: { line: { color: '#ef5350' } },
    },
  ]
}

export function getPlotlyCodeSnippet(chartType: string): string {
  switch (chartType) {
    case 'business':
      return `Plotly.newPlot(el, [\n  { type: 'bar',\n    x: dates,\n    y: revenues,\n    name: category }\n], {\n  barmode: 'group'\n})`
    case 'line':
      return `Plotly.newPlot(el, [\n  { type: 'scatter', mode: 'lines',\n    x: dates, y: values,\n    line: { shape: 'spline' } }\n])`
    case 'scatter':
      return `Plotly.newPlot(el, [\n  { type: 'scatter', mode: 'markers',\n    x: group.x, y: group.y,\n    marker: { size: 5, opacity: 0.7 } }\n])`
    case 'market':
      return `Plotly.newPlot(el, [{\n  type: 'candlestick',\n  x: dates,\n  open: items.map(d => d.open),\n  high: items.map(d => d.high),\n  low: items.map(d => d.low),\n  close: items.map(d => d.close)\n}])`
    default:
      return ''
  }
}
