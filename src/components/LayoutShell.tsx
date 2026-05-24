import { useState } from 'react'
import { Outlet } from 'react-router'
import { Sidebar } from './Sidebar'

export function LayoutShell() {
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="h-screen flex bg-gray-950 text-white">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
      <main className="flex-1 min-w-0 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}