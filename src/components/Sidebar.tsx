import { NavLink } from 'react-router'

const NAV_ITEMS = [
  { to: '/benchmark', label: 'Benchmark', icon: '⏱' },
  { to: '/report', label: 'Report', icon: '📊' },
  { to: '/history', label: 'History', icon: '📜' },
  { to: '/settings', label: 'Settings', icon: '⚙' },
  { to: '/about', label: 'About', icon: 'ℹ' },
] as const

interface SidebarProps {
  collapsed: boolean
  onToggle: () => void
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const w = collapsed ? 'w-16' : 'w-48'

  return (
    <aside
      className={`${w} flex-shrink-0 flex flex-col border-r border-gray-800 bg-gray-950 transition-all duration-200`}
    >
      <div className={`flex items-center ${collapsed ? 'justify-center' : 'justify-between'} px-4 h-14 border-b border-gray-800`}>
        {!collapsed && (
          <span className="text-sm font-bold tracking-tight text-white">
            Chart Benchmark
          </span>
        )}
        <button
          onClick={onToggle}
          className="p-1.5 rounded-md text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-colors"
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      <nav className="flex-1 py-2 space-y-1">
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 mx-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800/60'
              } ${collapsed ? 'justify-center' : ''}`
            }
            title={collapsed ? label : undefined}
          >
            <span className="text-base">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 px-4 py-3">
        {!collapsed && (
          <p className="text-[10px] text-gray-600">
            v0.1.0 · Multi-lib benchmark
          </p>
        )}
      </div>
    </aside>
  )
}