import { BrowserRouter, Routes, Route } from 'react-router'
import { LayoutShell } from './components/LayoutShell'
import { BenchmarkPage } from './pages/BenchmarkPage'
import { ReportPage } from './pages/ReportPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'
import { AboutPage } from './pages/AboutPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<LayoutShell />}>
          <Route index element={<BenchmarkPage />} />
          <Route path="benchmark" element={<BenchmarkPage />} />
          <Route path="report" element={<ReportPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="about" element={<AboutPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App