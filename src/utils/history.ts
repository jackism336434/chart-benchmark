export interface HistoryEntry {
  id: string
  chartType: string
  dataSize: number
  seed: number
  timestamp: string
  libraries: {
    name: string
    renderTime: number | null
    avgFPS: number | null
    minFPS: number | null
    memoryDeltaMB: number | null
  }[]
}

const STORAGE_KEY = 'chart-benchmark-history'

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistoryEntry(entry: HistoryEntry) {
  const entries = loadHistory()
  entries.unshift(entry)
  if (entries.length > 100) entries.length = 100
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function deleteHistoryEntry(id: string) {
  const entries = loadHistory().filter((e) => e.id !== id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function clearHistory() {
  localStorage.removeItem(STORAGE_KEY)
}