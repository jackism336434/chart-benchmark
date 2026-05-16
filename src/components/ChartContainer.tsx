import { useState, type ReactElement } from 'react'
import { PerfContext } from '../hooks/usePerf'

interface ChartContainerProps {
  library: string
  children: ReactElement
}

export function ChartContainer({ library, children }: ChartContainerProps) {
  const [perfMs, setPerfMs] = useState<number | null>(null)

  return (
    <PerfContext.Provider value={{ setPerf: setPerfMs }}>
      <div className="flex flex-col rounded-lg overflow-hidden border border-gray-800 bg-gray-900">
        <div className="flex items-center justify-between px-4 py-2 border-b border-gray-800">
          <span className="text-sm font-medium text-gray-300">{library}</span>
          {perfMs != null && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-mono">
              {perfMs.toFixed(1)} ms
            </span>
          )}
        </div>
        <div className="flex-1 min-h-0">
          {children}
        </div>
      </div>
    </PerfContext.Provider>
  )
}
