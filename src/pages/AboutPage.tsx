const TECH_STACK = [
  { name: 'React 19', desc: 'UI framework' },
  { name: 'Vite 7', desc: 'Build tool' },
  { name: 'Tailwind CSS v4', desc: 'Styling' },
  { name: 'TypeScript', desc: 'Language' },
  { name: 'ECharts 6', desc: 'Chart library' },
  { name: 'Chart.js 4', desc: 'Chart library' },
  { name: 'Plotly.js 3', desc: 'Chart library' },
  { name: 'React Router', desc: 'Page navigation' },
]

const DIMENSIONS = [
  {
    title: 'Render Performance',
    desc: 'Init-to-ready time measured via library-specific callbacks (ECharts `finished`, Chart.js ref, Plotly `onAfterPlot` + rAF fallback). Reported in milliseconds.',
  },
  {
    title: 'Interaction FPS',
    desc: 'Average and minimum FPS during zoom/pan interactions, tracked via `requestAnimationFrame` timestamps. Higher is better; min FPS indicates worst-case frame drops.',
  },
  {
 title: 'Memory Heap Delta',
    desc: 'Browser `performance.memory.usedJSHeapSize` delta before and after chart creation. Available only in Chrome/Chromium. Measures the JS heap cost of rendering.',
  },
  {
    title: 'Code Cost (LOC)',
    desc: 'Lines of configuration code required to produce each chart type per library. Serves as a proxy for developer experience and learning curve.',
  },
]

export function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold">About</h1>
        <p className="text-sm text-gray-400 mt-1">
          Multi-dimensional chart library performance & effect evaluation
        </p>
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
        <h2 className="text-sm font-medium text-gray-300 mb-3">Evaluation Dimensions</h2>
        <div className="space-y-4">
          {DIMENSIONS.map((d) => (
            <div key={d.title}>
              <div className="text-sm text-gray-300 font-medium">{d.title}</div>
              <div className="text-xs text-gray-500 mt-0.5">{d.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8 rounded-lg border border-gray-800 bg-gray-900/60 p-5">
        <h2 className="text-sm font-medium text-gray-300 mb-3">Tech Stack</h2>
        <div className="grid grid-cols-2 gap-2">
          {TECH_STACK.map((t) => (
            <div key={t.name} className="flex items-center gap-2">
              <span className="text-sm text-gray-300 font-medium">{t.name}</span>
              <span className="text-xs text-gray-600">{t.desc}</span>
            </div>
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