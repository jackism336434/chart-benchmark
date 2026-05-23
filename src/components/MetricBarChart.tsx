interface MetricBarChartProps {
  title: string
  unit: string
  libraries: { name: string; value: number | null; color: string }[]
  hint?: string
}

export function MetricBarChart({ title, unit, libraries, hint }: MetricBarChartProps) {
  const absMax = Math.max(...libraries.map((l) => Math.abs(l.value ?? 0)), 1)
  const hasNegative = libraries.some((l) => l.value != null && l.value < 0)

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{title}</div>
      {hint && libraries.every((l) => l.value == null) && (
        <p className="text-[10px] text-gray-600 italic">{hint}</p>
      )}
      {libraries.map((lib) => {
        const abs = Math.abs(lib.value ?? 0)
        const pct = (abs / absMax) * 100
        const isNeg = lib.value != null && lib.value < 0
        const barColor = isNeg ? '#ef4444' : lib.color
        return (
          <div key={lib.name} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{lib.name}</span>
              <span className={`font-mono ${isNeg ? 'text-red-400' : 'text-gray-300'}`}>
                {lib.value != null ? `${lib.value.toFixed(1)} ${unit}` : '\u2014'}
              </span>
            </div>
            <div className="relative h-2 rounded-full bg-gray-800 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: lib.value != null ? `${pct}%` : '0%',
                  backgroundColor: barColor,
                  opacity: isNeg ? 0.7 : 1,
                }}
              />
              {hasNegative && (
                <div className="absolute inset-x-0 top-0 h-full flex items-center justify-center">
                  <div className="w-px h-full bg-gray-500/40" />
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
