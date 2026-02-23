import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Megaphone, Cpu, Settings, ChevronRight, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useJobsStore } from '@/store'

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Overview', exact: true },
  { to: '/campaigns', icon: Megaphone, label: 'Campaigns' },
  { to: '/jobs', icon: Cpu, label: 'Job Engine' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

export function Sidebar() {
  const { jobs } = useJobsStore()
  const activeJobs = jobs.filter((j) => j.status === 'processing' || j.status === 'pending').length

  return (
    <aside className="flex flex-col w-64 min-h-screen bg-zinc-950/90 border-r border-zinc-800/60 backdrop-blur-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-zinc-800/60">
        <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-glow-brand">
          <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
        </div>
        <div>
          <span className="font-display font-bold text-zinc-100 text-lg leading-none">amgo</span>
          <span className="block text-zinc-500 text-xs font-mono">intelligence</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-3 space-y-0.5">
        <div className="px-3 py-2 mb-1">
          <span className="text-xs font-mono uppercase tracking-widest text-zinc-600">Navigation</span>
        </div>
        {navItems.map(({ to, icon: Icon, label, exact }) => (
          <NavLink
            key={to}
            to={to}
            end={exact}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group',
                isActive
                  ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                  : 'text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/60'
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-400' : 'text-zinc-600 group-hover:text-zinc-400')}
                />
                <span className="flex-1">{label}</span>
                {label === 'Job Engine' && activeJobs > 0 && (
                  <span className="text-xs bg-brand-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-mono">
                    {activeJobs}
                  </span>
                )}
                {isActive && <ChevronRight className="w-3.5 h-3.5 text-brand-400/60" />}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-zinc-800/60">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-zinc-800/40 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-violet-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-zinc-200 font-medium truncate">Vikram Patel</p>
            <p className="text-xs text-zinc-600 truncate">Admin</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
