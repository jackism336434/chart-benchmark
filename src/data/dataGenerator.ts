import { createRNG, range, gaussian } from './random'
import type {
  BusinessRecord,
  TimeSeriesPoint,
  XYPoint,
  OHLCV,
  BizDataConfig,
  LineDataConfig,
  ScatterDataConfig,
  OHLCVDataConfig,
} from './types'

const CATEGORIES = ['Electronics', 'Apparel', 'Home & Garden', 'Sports'] as const

const DEFAULT_BIZ: BizDataConfig = { seed: 42 }
const DEFAULT_LINE: LineDataConfig = { seed: 42, count: 10_000, series: 2, noise: 15 }
const DEFAULT_SCATTER: ScatterDataConfig = { seed: 42, count: 10_000, groups: 3 }
const DEFAULT_OHLCV: OHLCVDataConfig = { seed: 42, count: 250, startPrice: 100, volatility: 2 }

function fmtDate(offset: number, start = new Date('2025-01-01')): string {
  const d = new Date(start)
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

export function generateBizData(partial?: Partial<BizDataConfig>): BusinessRecord[] {
  const { seed } = { ...DEFAULT_BIZ, ...partial }
  const rng = createRNG(seed)
  const records: BusinessRecord[] = []

  for (let i = 0; i < 100; i++) {
    const category = CATEGORIES[i % CATEGORIES.length]
    const day = Math.floor(i / CATEGORIES.length)
    const base = 5_000 + (category.charCodeAt(0) % 4) * 3_000
    const seasonal = Math.sin((day / 30) * Math.PI * 2) * 2_000
    const revenue = Math.round(base + seasonal + gaussian(rng, 0, 800))
    const expenses = Math.round(revenue * range(rng, 0.55, 0.75))
    records.push({
      date: fmtDate(day * 7),
      category,
      revenue,
      expenses,
      profit: revenue - expenses,
      unitsSold: Math.round(revenue / range(rng, 80, 200)),
    })
  }

  return records
}

export function generateLineData(partial?: Partial<LineDataConfig>): TimeSeriesPoint[][] {
  const config = { ...DEFAULT_LINE, ...partial }
  const rng = createRNG(config.seed)
  const result: TimeSeriesPoint[][] = []

  for (let s = 0; s < config.series; s++) {
    const phase = (s / config.series) * Math.PI * 2
    const series: TimeSeriesPoint[] = []
    for (let i = 0; i < config.count; i++) {
      const t = i / config.count
      const signal = Math.sin(t * Math.PI * 6 + phase) * 50 + t * 80
      const noise = gaussian(rng, 0, config.noise)
      series.push({
        date: fmtDate(i, new Date('2025-01-01')),
        value: Math.round((signal + noise) * 100) / 100,
      })
    }
    result.push(series)
  }

  return result
}

export function generateScatterData(partial?: Partial<ScatterDataConfig>): XYPoint[][] {
  const config = { ...DEFAULT_SCATTER, ...partial }
  const rng = createRNG(config.seed)
  const result: XYPoint[][] = []

  const centroids = Array.from({ length: config.groups }, () => ({
    cx: range(rng, 20, 80),
    cy: range(rng, 20, 80),
  }))

  const perGroup = Math.ceil(config.count / config.groups)
  for (let g = 0; g < config.groups; g++) {
    const group: XYPoint[] = []
    for (let i = 0; i < perGroup; i++) {
      group.push({
        x: Math.round(gaussian(rng, centroids[g].cx, 8) * 100) / 100,
        y: Math.round(gaussian(rng, centroids[g].cy, 8) * 100) / 100,
      })
    }
    result.push(group)
  }

  return result
}

export function generateOHLCV(partial?: Partial<OHLCVDataConfig>): OHLCV[] {
  const config = { ...DEFAULT_OHLCV, ...partial }
  const rng = createRNG(config.seed)
  const result: OHLCV[] = []

  let prevClose = config.startPrice
  for (let i = 0; i < config.count; i++) {
    const change = gaussian(rng, 0, config.volatility)
    const close = Math.round((prevClose + change) * 100) / 100

    const intradayRange = Math.abs(gaussian(rng, 0, config.volatility * 0.8))
    const open = Math.round((prevClose + gaussian(rng, 0, config.volatility * 0.3)) * 100) / 100
    const high = Math.round((Math.max(open, close) + intradayRange) * 100) / 100
    const low = Math.round((Math.min(open, close) - intradayRange) * 100) / 100
    const volume = Math.round(range(rng, 500_000, 5_000_000))

    result.push({ date: fmtDate(i), open, high, low, close, volume })
    prevClose = close
  }

  return result
}
