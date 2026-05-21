interface MetricCardProps {
  label: string
  value: string | null
  unit: string
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'purple'
}

const COLOR_MAP: Record<string, string> = {
  emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  blue: 'bg-blue-500/15 text-blue-400 border-blue-500/20',
  amber: 'bg-amber-500/15 text-amber-400 border-amber-500/20',
  red: 'bg-red-500/15 text-red-400 border-red-500/20',
  purple: 'bg-purple-500/15 text-purple-400 border-purple-500/20',
}

export function MetricCard({ label, value, unit, color }: MetricCardProps) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${COLOR_MAP[color]}`}>
      <div className="text-[10px] uppercase tracking-wider opacity-70 mb-1">{label}</div>
      <div className="text-xl font-mono font-bold">
        {value ?? '\u2014'} <span className="text-xs font-normal opacity-60">{unit}</span>
      </div>
    </div>
  )
}