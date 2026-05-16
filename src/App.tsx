import { SandboxBoard } from './components/SandboxBoard'

function App() {
  return (
    <div className="h-screen flex flex-col bg-gray-950 text-white">
      <header className="flex-shrink-0 border-b border-gray-800 px-6 py-4">
        <h1 className="text-xl font-bold tracking-tight">Chart Benchmark</h1>
        <p className="text-sm text-gray-400 mt-1">
          Multi-dimensional chart library performance & effect evaluation
        </p>
      </header>
      <main className="flex-1 min-h-0">
        <SandboxBoard />
      </main>
    </div>
  )
}

export default App
