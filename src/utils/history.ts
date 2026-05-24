export interface HistoryEntry {
  id: string
  chartType: string
  dataSize: number
  seed: number
  timestamp: string
  createdAt?: string
  libraries: {
    name: string
    renderTime: number | null
    avgFPS: number | null
    minFPS: number | null
    memoryDeltaMB: number | null
  }[]
}

export type SortKey = 'newest' | 'oldest' | 'size-desc' | 'size-asc'

const STORAGE_KEY = 'chart-benchmark-history'

export function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function saveHistoryEntry(entry: Omit<HistoryEntry, 'createdAt'>) {
  const entries = loadHistory()
  entries.unshift({ ...entry, createdAt: new Date().toISOString() })
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

export function sortEntries(entries: HistoryEntry[], key: SortKey): HistoryEntry[] {
  const sorted = [...entries]
  switch (key) {
    case 'newest':
      sorted.sort((a, b) => getTimestamp(b) - getTimestamp(a))
      break
    case 'oldest':
      sorted.sort((a, b) => getTimestamp(a) - getTimestamp(b))
      break
    case 'size-desc':
      sorted.sort((a, b) => b.dataSize - a.dataSize)
      break
    case 'size-asc':
      sorted.sort((a, b) => a.dataSize - b.dataSize)
      break
  }
  return sorted
}

function getTimestamp(entry: HistoryEntry): number {
  if (entry.createdAt) return new Date(entry.createdAt).getTime()
  return parseInt(entry.id, 10) || 0
}