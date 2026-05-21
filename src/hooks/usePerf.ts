import { createContext } from 'react'

export interface PerfMetrics {
  renderTime: number | null
  memoryBefore: number | null
  memoryAfter: number | null
  avgFPS: number | null
  minFPS: number | null
  fpsSamples: number[]
}

export const DEFAULT_PERF: PerfMetrics = {
  renderTime: null,
  memoryBefore: null,
  memoryAfter: null,
  avgFPS: null,
  minFPS: null,
  fpsSamples: [],
}

export const PerfContext = createContext<{
  setMetrics: (m: Partial<PerfMetrics>) => void
} | null>(null)

export function getMemorySnapshot(): number | null {
  const perf = performance as { memory?: { usedJSHeapSize: number } }
  return perf.memory?.usedJSHeapSize ?? null
}