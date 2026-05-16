export interface BusinessRecord {
  date: string
  category: string
  revenue: number
  expenses: number
  profit: number
  unitsSold: number
}

export interface XYPoint {
  x: number
  y: number
}

export interface TimeSeriesPoint {
  date: string
  value: number
}

export interface OHLCV {
  date: string
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface BizDataConfig {
  seed: number
}

export interface LineDataConfig {
  seed: number
  count: number
  series: number
  noise: number
}

export interface ScatterDataConfig {
  seed: number
  count: number
  groups: number
}

export interface OHLCVDataConfig {
  seed: number
  count: number
  startPrice: number
  volatility: number
}
