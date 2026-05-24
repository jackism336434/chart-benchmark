interface DataPoint {
  x: number
  y: number | null
}

interface SeriesConfig {
  name: string
  color: string
  points: DataPoint[]
}

interface TrendLineChartProps {
  title: string
  unit: string
  xLabel: string
  series: SeriesConfig[]
}

export type { DataPoint, SeriesConfig, TrendLineChartProps }

const CHART_PADDING = { top: 20, right: 16, bottom: 40, left: 56 }

function niceScale(min: number, max: number, ticks: number): number[] {
  const range = max - min || 1
  const rough = range / ticks
  const mag = Math.pow(10, Math.floor(Math.log10(rough)))
  const residual = rough / mag
  const step = (residual < 2 ? 2 : residual < 5 ? 5 : 10) * mag
  const start = Math.floor(min / step) * step
  const result: number[] = []
  for (let v = start; v <= max + step * 0.5; v += step) {
    result.push(v)
    if (result.length > 20) break
  }
  return result
}

function formatNum(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`
  if (n >= 1000) return `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}K`
  return n.toFixed(n % 1 === 0 ? 0 : 1)
}

export function TrendLineChart({ title, unit, xLabel, series }: TrendLineChartProps) {
  const allX = [...new Set(series.flatMap((s) => s.points.map((p) => p.x)))].sort((a, b) => a - b)
  const allY = series.flatMap((s) => s.points.filter((p) => p.y != null).map((p) => p.y!))
  const hasData = allX.length > 0 && allY.length > 0

  if (!hasData) {
    return (
      <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <div className="text-xs text-gray-500 uppercase tracking-wider mb-3">{title}</div>
        <div className="text-xs text-gray-600 italic">Not enough data for trend line</div>
      </div>
    )
  }

  const xMin = Math.min(...allX)
  const xMax = Math.max(...allX)
  const yMin = Math.min(...allY) < 0 ? Math.min(...allY) : 0
  const yMax = Math.max(...allY) * 1.1 || 1

  const xTicks = niceScale(xMin, xMax, 5)
  const yTicks = niceScale(yMin, yMax, 4)

  const viewBoxWidth = 400
  const viewBoxHeight = 200
  const plotW = viewBoxWidth - CHART_PADDING.left - CHART_PADDING.right
  const plotH = viewBoxHeight - CHART_PADDING.top - CHART_PADDING.bottom

  const mapX = (v: number) => CHART_PADDING.left + ((v - xMin) / (xMax - xMin || 1)) * plotW
  const mapY = (v: number) => CHART_PADDING.top + plotH - ((v - (yTicks[0] ?? 0)) / ((yTicks[yTicks.length - 1] ?? yMax) - (yTicks[0] ?? 0) || 1)) * plotH

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/60 p-4">
      <div className="text-xs text-gray-500 uppercase tracking-wider mb-2">{title}</div>
      <svg viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} className="w-full" style={{ maxHeight: '220px' }}>
        <text x={4} y={CHART_PADDING.top - 4} fill="#9ca3af" fontSize="9" fontFamily="monospace">
          {unit}
        </text>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line x1={CHART_PADDING.left} y1={mapY(tick)} x2={viewBoxWidth - CHART_PADDING.right} y2={mapY(tick)} stroke="#1f2937" />
            <text x={CHART_PADDING.left - 6} y={mapY(tick)} textAnchor="end" dominantBaseline="middle" fill="#6b7280" fontSize="9" fontFamily="monospace">
              {formatNum(tick)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <text key={tick} x={mapX(tick)} y={viewBoxHeight - CHART_PADDING.bottom + 20} textAnchor="middle" fill="#6b7280" fontSize="9" fontFamily="monospace">
            {formatNum(tick)}
          </text>
        ))}
        <text x={viewBoxWidth / 2} y={viewBoxHeight - 2} textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">
          {xLabel}
        </text>
        {series.map((s) => {
          const validPts = s.points.filter((p) => p.y != null) as { x: number; y: number }[]
          if (validPts.length < 2) return null
          const pathD = validPts
            .map((p, i) => `${i === 0 ? 'M' : 'L'}${mapX(p.x).toFixed(1)},${mapY(p.y).toFixed(1)}`)
            .join(' ')
          return (
            <g key={s.name}>
              <path d={pathD} fill="none" stroke={s.color} strokeWidth="2" />
              {validPts.map((p) => (
                <circle key={`${p.x}`} cx={mapX(p.x)} cy={mapY(p.y)} r="3" fill={s.color} />
              ))}
            </g>
          )
        })}
      </svg>
      <div className="flex items-center justify-center gap-4 mt-2">
        {series.map((s) => (
          <div key={s.name} className="flex items-center gap-1.5">
            <div className="w-3 h-0.5 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-[10px] text-gray-400">{s.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}