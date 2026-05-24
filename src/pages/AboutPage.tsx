import { APP_VERSION } from '../utils/defaults'

const TECH_STACK = [
  { name: 'React 19', desc: 'UI framework', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { name: 'Vite 7', desc: 'Build tool', color: 'bg-purple-500/15 text-purple-400 border-purple-500/30' },
  { name: 'Tailwind CSS v4', desc: 'Styling', color: 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30' },
  { name: 'TypeScript', desc: 'Language', color: 'bg-blue-500/15 text-blue-400 border-blue-500/30' },
  { name: 'ECharts 6', desc: 'Chart library', color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30' },
  { name: 'Chart.js 4', desc: 'Chart library', color: 'bg-rose-500/15 text-rose-400 border-rose-500/30' },
  { name: 'Plotly.js 3', desc: 'Chart library', color: 'bg-amber-500/15 text-amber-400 border-amber-500/30' },
  { name: 'React Router', desc: 'Page navigation', color: 'bg-red-500/15 text-red-400 border-red-500/30' },
]

const DIMENSIONS = [
  {
    title: 'Render Performance',
    desc: 'Init-to-ready time measured via library-specific callbacks (ECharts `finished`, Chart.js ref, Plotly `onAfterPlot` + rAF fallback). Reported in milliseconds.',
    icon: '⏱',
  },
  {
    title: 'Interaction FPS',
    desc: 'Average and minimum FPS during zoom/pan interactions, tracked via `requestAnimationFrame` timestamps. Higher is better; min FPS indicates worst-case frame drops.',
    icon: '🎞',
  },
  {
    title: 'Memory Heap Delta',
    desc: 'Browser `performance.memory.usedJSHeapSize` delta before and after chart creation. Available only in Chrome/Chromium. Measures the JS heap cost of rendering.',
    icon: '💾',
  },
  {
    title: 'Code Cost (LOC)',
    desc: 'Lines of configuration code required to produce each chart type per library. Serves as a proxy for developer experience and learning curve.',
    icon: '📝',
  },
]

const STEPS = [
  { step: '1', title: 'Choose type & size', desc: 'Select chart type and data size on the Benchmark page' },
  { step: '2', title: 'Start & interact', desc: 'Press Start (or Enter) to render, then zoom/pan to measure FPS' },
  { step: '3', title: 'Compare & save', desc: 'Review metrics in the dashboard, save results to History for comparison' },
]

const SHORTCUTS = [
  { key: 'Enter', desc: 'Start benchmark (when focused on input)' },
  { key: '↻', desc: 'Randomize seed' },
]

export function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">About</h1>
        <p className="text-sm text-gray-400 mt-1">
          Multi-dimensional chart library performance & effect evaluation
        </p>
        <p className="text-xs text-gray-600 mt-1">v{APP_VERSION}</p>
      </div>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">What is this?</h2>
        <p className="text-sm text-gray-400 leading-relaxed">
          Chart Benchmark is a tool for evaluating chart libraries under controlled,
          reproducible conditions. Using the same data source and hardware, it
          compares ECharts, Chart.js, and Plotly.js across rendering speed,
          interaction smoothness, memory consumption, and code complexity. The goal
          is to provide developers with objective, quantifiable references for
          chart library selection.
        </p>
      </section>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Quick Start</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STEPS.map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                {s.step}
              </div>
              <div>
                <div className="text-sm text-gray-300 font-medium">{s.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-gray-800 border border-gray-700 text-[10px] font-mono text-gray-300">
                {s.key}
              </kbd>
              <span className="text-xs text-gray-500">{s.desc}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Evaluation Dimensions</h2>
        <div className="space-y-4">
          {DIMENSIONS.map((d) => (
            <div key={d.title} className="flex gap-3">
              <span className="text-lg">{d.icon}</span>
              <div>
                <div className="text-sm text-gray-300 font-medium">{d.title}</div>
                <div className="text-xs text-gray-500 mt-0.5">{d.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Tech Stack</h2>
        <div className="flex flex-wrap gap-2">
          {TECH_STACK.map((t) => (
            <span key={t.name} className={`px-2.5 py-1 rounded-lg text-xs font-medium border ${t.color}`}>
              {t.name}
            </span>
          ))}
        </div>
      </section>

      <section className="rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Limitations</h2>
        <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
          <li>Memory metrics require Chrome/Chromium (`performance.memory` API)</li>
          <li>FPS is measured via interaction (zoom/pan), not passive animation</li>
          <li>Results vary by browser, OS, hardware, and background processes</li>
          <li>Server-side libraries (Matplotlib, Seaborn) are planned for a future backend stage</li>
        </ul>
      </section>
    </div>
  )
}