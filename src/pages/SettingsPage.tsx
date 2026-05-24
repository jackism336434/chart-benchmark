import { useState } from 'react'
import { loadTheme, saveTheme, loadDefaultSize, saveDefaultSize, loadDefaultChartType, saveDefaultChartType, getHistoryStats, STORAGE_KEYS, DEFAULT_SIZE } from '../utils/defaults'
import type { ChartType } from '../components/charts/types'

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'business', label: 'Business (Bar)' },
  { value: 'line', label: 'Line' },
  { value: 'scatter', label: 'Scatter' },
  { value: 'market', label: 'Market (Candlestick)' },
]

export function SettingsPage() {
  const [theme, setTheme] = useState(loadTheme)
  const [defaultSize, setDefaultSize] = useState(loadDefaultSize)
  const [defaultChartType, setDefaultChartType] = useState(loadDefaultChartType)
  const [stats, setStats] = useState(getHistoryStats)

  const handleThemeChange = (t: 'dark' | 'light') => {
    setTheme(t)
    saveTheme(t)
  }

  const handleSizeChange = (size: number) => {
    setDefaultSize(size)
    saveDefaultSize(size)
  }

  const handleChartTypeChange = (type: string) => {
    setDefaultChartType(type)
    saveDefaultChartType(type)
  }

  const handleClearAll = () => {
    if (confirm('Clear all locally stored data? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEYS.history)
      localStorage.removeItem(STORAGE_KEYS.theme)
      localStorage.removeItem(STORAGE_KEYS.defaultSize)
      localStorage.removeItem(STORAGE_KEYS.defaultChartType)
      setTheme('dark')
      setDefaultSize(DEFAULT_SIZE)
      setDefaultChartType('line')
      setStats({ count: 0, sizeKB: 0 })
    }
  }

  const handleClearHistory = () => {
    if (confirm('Clear all benchmark history? This cannot be undone.')) {
      localStorage.removeItem(STORAGE_KEYS.history)
      setStats(getHistoryStats())
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-sm text-gray-400 mt-1">
          Configure default preferences
        </p>
      </div>

      <div className="space-y-6">
        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Theme</div>
              <div className="text-xs text-gray-600 mt-0.5">Toggle between dark and light mode</div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleThemeChange('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => handleThemeChange('light')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'light'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'
                }`}
              >
                Light
              </button>
            </div>
          </div>
          {theme === 'light' && (
            <p className="text-[10px] text-amber-400/70 mt-2">&#9888; Light theme is not yet implemented. This preference will be saved for future use.</p>
          )}
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">Defaults</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Default data size</div>
                <div className="text-xs text-gray-600 mt-0.5">Starting value for the data size slider</div>
              </div>
              <input
                type="number"
                value={defaultSize}
                onChange={(e) => handleSizeChange(Number(e.target.value))}
                className="w-24 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 font-mono text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-gray-400">Default chart type</div>
                <div className="text-xs text-gray-600 mt-0.5">Starting chart type on the Benchmark page</div>
              </div>
              <select
                value={defaultChartType}
                onChange={(e) => handleChartTypeChange(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-sm text-gray-300 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
              >
                {CHART_TYPE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">History</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">
                {stats.count} record{stats.count !== 1 ? 's' : ''} saved
              </div>
              <div className="text-xs text-gray-600 mt-0.5">
                {stats.sizeKB > 0 ? `${stats.sizeKB} KB used in local storage` : 'No storage used'}
              </div>
            </div>
            <button
              onClick={handleClearHistory}
              disabled={stats.count === 0}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                stats.count === 0
                  ? 'text-gray-600 border-gray-700 cursor-not-allowed'
                  : 'text-amber-400 border-amber-500/30 hover:bg-amber-500/10'
              }`}
            >
              Clear History
            </button>
          </div>
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">Data</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Reset all settings</div>
              <div className="text-xs text-gray-600 mt-0.5">Remove all locally stored data and reset preferences</div>
            </div>
            <button
              onClick={handleClearAll}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}