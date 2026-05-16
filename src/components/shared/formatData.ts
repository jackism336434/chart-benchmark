import type { BusinessRecord, TimeSeriesPoint, OHLCV } from '../../data/types'

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
