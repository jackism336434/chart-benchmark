import { useState, useEffect } from 'react'

const THEME_KEY = 'chart-benchmark-theme'
const DEFAULT_SIZE_KEY = 'chart-benchmark-default-size'
const HISTORY_KEY = 'chart-benchmark-history'

function loadTheme(): 'dark' | 'light' {
  try {
    return (localStorage.getItem(THEME_KEY) as 'dark' | 'light') || 'dark'
  } catch {
    return 'dark'
  }
}

function saveTheme(theme: 'dark' | 'light') {
  localStorage.setItem(THEME_KEY, theme)
}

function loadDefaultSize(): number {
  try {
    return Number(localStorage.getItem(DEFAULT_SIZE_KEY)) || 10000
  } catch {
    return 10000
  }
}

function saveDefaultSize(size: number) {
  localStorage.setItem(DEFAULT_SIZE_KEY, String(size))
}

export function SettingsPage() {
  const [theme, setTheme] = useState(loadTheme)
  const [defaultSize, setDefaultSize] = useState(loadDefaultSize)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    saveTheme(theme)
    saveDefaultSize(defaultSize)
  }, [theme, defaultSize])

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 1500)
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
                onClick={() => setTheme('dark')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  theme === 'dark'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-gray-800 text-gray-500 border border-gray-700 hover:text-gray-300'
                }`}
              >
                Dark
              </button>
              <button
                onClick={() => setTheme('light')}
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
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Default data size</div>
              <div className="text-xs text-gray-600 mt-0.5">Starting value for the data size slider</div>
            </div>
            <input
              type="number"
              value={defaultSize}
              onChange={(e) => setDefaultSize(Number(e.target.value))}
              className="w-24 px-3 py-1.5 rounded-lg bg-gray-800 border border-gray-700 text-gray-200 font-mono text-sm text-center focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </section>

        <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
          <h2 className="text-sm font-medium text-gray-300 mb-4">Data</h2>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400">Clear local storage</div>
              <div className="text-xs text-gray-600 mt-0.5">Remove all saved benchmark history and settings</div>
            </div>
            <button
              onClick={() => {
                if (confirm('Clear all locally stored data? This cannot be undone.')) {
                  localStorage.removeItem(HISTORY_KEY)
                  localStorage.removeItem(THEME_KEY)
                  localStorage.removeItem(DEFAULT_SIZE_KEY)
                  setTheme('dark')
                  setDefaultSize(10000)
                }
              }}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 border border-red-500/30 hover:bg-red-500/10 transition-colors"
            >
              Clear All Data
            </button>
          </div>
        </section>

        <button
          onClick={handleSave}
          className="px-5 py-2 rounded-lg text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-500 active:scale-95 shadow-lg shadow-emerald-500/20 transition-all duration-150"
        >
          {saved ? '✓ Saved' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}