import Prism from 'prismjs'
import 'prismjs/themes/prism-tomorrow.css'
import 'prismjs/components/prism-javascript'

interface LibraryCode {
  name: string
  code: string
  accent: 'emerald' | 'blue' | 'amber' | 'red' | 'purple'
}

interface CodePanelProps {
  chartType: string
  libraries: LibraryCode[]
}

const ACCENT_MAP: Record<string, string> = {
  emerald: 'text-emerald-400',
  blue: 'text-blue-400',
  amber: 'text-amber-400',
  red: 'text-red-400',
  purple: 'text-purple-400',
}

export function CodePanel({ chartType, libraries }: CodePanelProps) {
  return (
    <div className={`grid gap-2 h-full ${libraries.length === 3 ? 'grid-cols-3' : 'grid-cols-2'}`}>
      {libraries.map(({ name, code, accent }) => {
        const highlighted = Prism.highlight(
          code || '// No data',
          Prism.languages.javascript,
          'javascript'
        )
        return (
          <div
            key={name}
            className="flex flex-col rounded-lg border border-gray-800 bg-gray-950 overflow-hidden"
          >
            <div className={`px-3 py-1.5 text-xs font-medium border-b border-gray-800 ${ACCENT_MAP[accent]}`}>
              {name} \u2014 {chartType}
            </div>
            <pre className="flex-1 overflow-auto p-3 text-[10px] leading-relaxed font-mono" style={{ margin: 0 }}>
              <code dangerouslySetInnerHTML={{ __html: highlighted }} />
            </pre>
          </div>
        )
      })}
    </div>
  )
}