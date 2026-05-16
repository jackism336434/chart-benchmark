import { createContext } from 'react'

export const PerfContext = createContext<{
  setPerf: (ms: number) => void
} | null>(null)
