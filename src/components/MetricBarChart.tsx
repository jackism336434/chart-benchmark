interface MetricBarChartProps {
  title: string
  unit: string
  libraries: { name: string; value: number | null; color: string }[]
}

export function MetricBarChart({ title, unit, libraries }: MetricBarChartProps) {
  const maxValue = Math.max(...libraries.map((l) => l.value ?? 0), 1)

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{title}</div>
      {libraries.map((lib) => (
        <div key={lib.name} className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{lib.name}</span>
            <span className="font-mono text-gray-300">
              {lib.value != null ? `${lib.value.toFixed(1)} ${unit}` : '\u2014'}
            </span>
          </div>
          <div className="h-2 rounded-full bg-gray-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: lib.value != null ? `${(lib.value / maxValue) * 100}%` : '0%',
                backgroundColor: lib.color,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
