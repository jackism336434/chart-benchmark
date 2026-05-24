export const APP_VERSION = '0.1.0'

export const STORAGE_KEYS = {
  theme: 'chart-benchmark-theme',
  defaultSize: 'chart-benchmark-default-size',
  defaultChartType: 'chart-benchmark-default-chart-type',
  history: 'chart-benchmark-history',
} as const

export const DEFAULT_SIZE = 10000
export const DEFAULT_CHART_TYPE = 'line'

export function loadTheme(): 'dark' | 'light' {
  try {
    return (localStorage.getItem(STORAGE_KEYS.theme) as 'dark' | 'light') || 'dark'
  } catch {
    return 'dark'
  }
}

export function saveTheme(theme: 'dark' | 'light') {
  localStorage.setItem(STORAGE_KEYS.theme, theme)
}

export function loadDefaultSize(): number {
  try {
    return Number(localStorage.getItem(STORAGE_KEYS.defaultSize)) || DEFAULT_SIZE
  } catch {
    return DEFAULT_SIZE
  }
}

export function saveDefaultSize(size: number) {
  localStorage.setItem(STORAGE_KEYS.defaultSize, String(size))
}

export function loadDefaultChartType(): string {
  try {
    return localStorage.getItem(STORAGE_KEYS.defaultChartType) || DEFAULT_CHART_TYPE
  } catch {
    return DEFAULT_CHART_TYPE
  }
}

export function saveDefaultChartType(type: string) {
  localStorage.setItem(STORAGE_KEYS.defaultChartType, type)
}

export function getHistoryStats(): { count: number; sizeKB: number } {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.history)
    if (!raw) return { count: 0, sizeKB: 0 }
    const entries = JSON.parse(raw)
    const bytes = new Blob([raw]).size
    return { count: entries.length, sizeKB: Math.round(bytes / 1024 * 10) / 10 }
  } catch {
    return { count: 0, sizeKB: 0 }
  }
}