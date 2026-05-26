import {
  Menu,
  LogOut,
  LayoutDashboard,
  BrainCircuit,
  Truck,
  Boxes,
  Users2,
  AlertTriangle,
  FileBarChart2,
  Settings,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useState, type PropsWithChildren } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/command-center', label: 'AI Command Center', icon: BrainCircuit },
  { to: '/receiving', label: 'Receiving', icon: Truck },
  { to: '/inventory', label: 'Inventory', icon: Boxes },
  { to: '/labor', label: 'Labor', icon: Users2 },
  { to: '/downtime', label: 'Downtime', icon: AlertTriangle },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const { currentUser, mode, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-warehouse-shell">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close menu overlay"
          className="fixed inset-0 z-30 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 border-r border-white/10 bg-slate-950/95 p-6 backdrop-blur-xl transition-transform duration-300 lg:static lg:translate-x-0 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">NEXUS AI</p>
              <h1 className="mt-3 font-display text-2xl text-white">AI Shift Manager</h1>
              <p className="mt-2 text-sm text-slate-400">Warehouse operations command center</p>
            </div>
            <button
              type="button"
              className="rounded-full border border-white/10 p-2 text-slate-200 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-8 rounded-[28px] border border-cyan-400/15 bg-cyan-400/5 p-4">
            <p className="text-sm text-slate-300">{currentUser?.displayName}</p>
            <p className="mt-1 text-xs text-slate-400">{currentUser?.email}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone={mode === 'demo' ? 'warning' : 'success'}>
                {mode === 'demo' ? 'Demo mode' : 'Supabase live'}
              </Badge>
              <Badge tone="accent">{currentUser?.role}</Badge>
            </div>
          </div>

          <nav className="mt-8 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition duration-200 ${
                      isActive
                        ? 'border border-cyan-400/30 bg-cyan-400/12 text-white shadow-[0_0_0_1px_rgba(34,211,238,0.08)]'
                        : 'border border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    }`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:border-fuchsia-400/30 hover:bg-fuchsia-400/10"
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/72 px-4 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex items-center justify-between gap-4">
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-100 lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-4 w-4" />
                Menu
              </button>
              <div className="hidden lg:block">
                <p className="text-sm text-slate-300">
                  Watch labor, downtime, receiving, inventory, and throughput before the shift gets away from the floor.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">Demo warehouse</Badge>
                <Badge tone="default">Mobile-ready</Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
};
