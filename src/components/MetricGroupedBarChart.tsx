interface BarItem {
  name: string
  value: number | null
  color: string
}

interface BarGroup {
  label: string
  bars: BarItem[]
}

interface MetricGroupedBarChartProps {
  title: string
  unit: string
  groups: BarGroup[]
}

export function MetricGroupedBarChart({ title, unit, groups }: MetricGroupedBarChartProps) {
  const allValues = groups.flatMap((g) => g.bars.map((b) => b.value ?? 0))
  const absMax = Math.max(...allValues.map(Math.abs), 1)
  const hasNegative = allValues.some((v) => v < 0)

  return (
    <div className="space-y-2">
      <div className="text-xs text-gray-500 uppercase tracking-wider">{title}</div>
      {groups.map((group) => (
        <div key={group.label} className="space-y-1">
          <div className="text-[10px] text-gray-600 font-mono">{group.label}</div>
          {group.bars.map((bar) => {
            const abs = Math.abs(bar.value ?? 0)
            const pct = (abs / absMax) * 100
            const isNeg = bar.value != null && bar.value < 0
            const barColor = isNeg ? '#ef4444' : bar.color
            return (
              <div key={bar.name} className="flex items-center gap-2">
                <span className="text-[10px] text-gray-500 w-16 truncate">{bar.name}</span>
                <div className="flex-1 relative h-1.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: bar.value != null ? `${pct}%` : '0%',
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
                <span className={`text-[10px] font-mono w-20 text-right ${isNeg ? 'text-red-400' : 'text-gray-400'}`}>
                  {bar.value != null ? `${bar.value.toFixed(1)} ${unit}` : '\u2014'}
                </span>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}