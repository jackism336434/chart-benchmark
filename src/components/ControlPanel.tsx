import { useState, useEffect } from 'react'
import type { ChartType } from './charts/types'

interface ControlPanelProps {
  chartType: ChartType
  series: number
  groups: number
  initialSize?: number
  canSave?: boolean
  saved?: boolean
  onStart: (size: number, seed: number, series: number, groups: number) => void
  onReset: () => void
  onSave?: () => void
  onChartTypeChange: (type: ChartType) => void
}

const TYPE_LABELS: Record<ChartType, string> = {
  business: 'Business',
  line: 'Line',
  scatter: 'Scatter',
  market: 'Market',
}

const TYPES: ChartType[] = ['business', 'line', 'scatter', 'market']

const numberInputCls =
  'px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/80 ' +
  'text-gray-200 font-mono text-center ' +
  'focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/40 ' +
  'transition-all duration-150 ' +
  '[appearance:textfield] ' +
  '[&::-webkit-outer-spin-button]:appearance-none ' +
  '[&::-webkit-inner-spin-button]:appearance-none'

const labelCls = 'text-[10px] uppercase tracking-wider text-gray-600'

export function ControlPanel({
  chartType,
  series,
  groups,
  initialSize,
  canSave,
  saved,
  onStart,
  onReset,
  onSave,
  onChartTypeChange,
}: ControlPanelProps) {
  const [inputSize, setInputSize] = useState(String(initialSize ?? 10000))
  const [inputSeed, setInputSeed] = useState('42')
  const [inputSeries, setInputSeries] = useState(String(series))
  const [inputGroups, setInputGroups] = useState(String(groups))

  useEffect(() => {
    setInputSeries(String(series))
    setInputGroups(String(groups))
    const max = chartType === 'market' ? 500 : 100000
    const current = Number(inputSize)
    if (!isNaN(current) && current > max) {
      setInputSize(String(max))
    }
  }, [chartType])

  const parsedSize = Number(inputSize)
  const parsedSeed = Number(inputSeed)
  const parsedSeries = Number(inputSeries)
  const parsedGroups = Number(inputGroups)
  const maxSize = chartType === 'market' ? 500 : 100000
  const breakerActive = parsedSize > 200000 && (chartType === 'line' || chartType === 'scatter')
  const warning = parsedSize > 50000 && parsedSize <= 200000 && (chartType === 'line' || chartType === 'scatter')
  const valid =
    inputSize.trim() !== '' &&
    inputSeed.trim() !== '' &&
    !isNaN(parsedSize) &&
    parsedSize >= 1 &&
    parsedSize <= maxSize &&
    !isNaN(parsedSeed) &&
    !breakerActive &&
    (chartType !== 'line' || (parsedSeries >= 1 && parsedSeries <= 5)) &&
    (chartType !== 'scatter' || (parsedGroups >= 1 && parsedGroups <= 6))

  const sliderValue = isNaN(parsedSize)
    ? 1000
    : Math.max(1000, Math.min(parsedSize, maxSize))

  const handleStart = () => {
    if (!valid) return
    onStart(parsedSize, parsedSeed, parsedSeries, parsedGroups)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && valid) handleStart()
  }

  return (
    <div className="flex flex-wrap items-end gap-6 px-6 py-4 border-b border-gray-800 bg-gray-900/50">
      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>Chart Type</span>
        <div className="flex items-center rounded-lg border border-gray-700 overflow-hidden">
          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() => onChartTypeChange(type)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                chartType === type
                  ? 'bg-emerald-500/20 text-emerald-400 border-x border-emerald-500/40'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              {TYPE_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>Data Size</span>
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={1000}
            max={maxSize}
            step={1000}
            value={sliderValue}
            onChange={(e) => setInputSize(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-48 h-1 rounded-full appearance-none bg-gray-700 cursor-pointer accent-emerald-500
              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-3.5
              [&::-webkit-slider-thumb]:h-3.5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-emerald-500
              [&::-webkit-slider-thumb]:shadow-lg
              [&::-webkit-slider-thumb]:shadow-emerald-500/30
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:hover:scale-110"
          />
          <input
            type="text"
            inputMode="numeric"
            value={inputSize}
            onChange={(e) => setInputSize(e.target.value)}
            className={`${numberInputCls} w-24 text-xs`}
            onKeyDown={handleKeyDown}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={labelCls}>Seed</span>
        <div className="flex items-center gap-1">
          <input
            type="text"
            inputMode="numeric"
            value={inputSeed}
            onChange={(e) => setInputSeed(e.target.value)}
            className={`${numberInputCls} w-16 text-sm`}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={() => setInputSeed(String(Math.floor(Math.random() * 9999) + 1))}
            className="px-2 py-1.5 rounded-lg bg-gray-800 border border-gray-700/80 text-gray-400 hover:text-emerald-400 hover:border-emerald-500/40 transition-colors"
            title="Randomize seed"
          >
            ↻
          </button>
        </div>
      </div>

      {chartType === 'line' && (
        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Series</span>
          <input
            type="text"
            inputMode="numeric"
            value={inputSeries}
            onChange={(e) => setInputSeries(e.target.value)}
            className={`${numberInputCls} w-16 text-sm`}
            onKeyDown={handleKeyDown}
          />
        </div>
      )}
      {chartType === 'scatter' && (
        <div className="flex flex-col gap-1.5">
          <span className={labelCls}>Groups</span>
          <input
            type="text"
            inputMode="numeric"
            value={inputGroups}
            onChange={(e) => setInputGroups(e.target.value)}
            className={`${numberInputCls} w-16 text-sm`}
            onKeyDown={handleKeyDown}
          />
        </div>
      )}

      {warning && (
        <span className="text-xs text-amber-400/80">
          High data count may cause lag
        </span>
      )}
      {breakerActive && (
        <span className="text-xs text-red-400/80">
          Circuit breaker: max 200K for line/scatter
        </span>
      )}

      <button
        onClick={onReset}
        className="px-4 py-1.5 rounded-lg text-sm font-medium text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
      >
        Reset
      </button>
      {canSave && onSave && (
        <button
          onClick={onSave}
          className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            saved
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
              : 'text-gray-400 hover:text-white hover:bg-gray-800 border border-gray-700/80'
          }`}
        >
          {saved ? '✓ Saved' : 'Save'}
        </button>
      )}
      <button
        onClick={handleStart}
        disabled={!valid}
        className={`ml-auto px-5 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 ${
          valid
            ? 'bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-500/20'
            : 'bg-gray-800 text-gray-600 cursor-not-allowed'
        }`}
      >
        Start
      </button>
    </div>
  )
}
