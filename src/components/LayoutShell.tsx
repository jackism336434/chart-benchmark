import { useState, useEffect } from 'react'
import { Outlet, useLocation } from 'react-router'
import { Sidebar } from './Sidebar'

export function LayoutShell() {
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    setCollapsed(mq.matches)
    const handler = (e: MediaQueryListEvent) => setCollapsed(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  useEffect(() => {
    if (window.innerWidth < 768) {
      setCollapsed(true)
    }
  }, [location.pathname])

  return (
    <div className="h-screen flex bg-gray-950 text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}