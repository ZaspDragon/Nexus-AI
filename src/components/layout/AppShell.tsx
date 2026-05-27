import {
  AlertTriangle,
  BrainCircuit,
  ChevronLeft,
  ChevronRight,
  FileBarChart2,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Truck,
  Users2,
  Warehouse,
  Waypoints,
  X,
} from 'lucide-react';
import { useState, type PropsWithChildren } from 'react';
import { NavLink } from 'react-router-dom';
import { useAppData } from '../../hooks/useAppData';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/command-center', label: 'AI Command Center', icon: BrainCircuit },
  { to: '/receiving', label: 'Receiving', icon: Truck },
  { to: '/inventory', label: 'Inventory', icon: Warehouse },
  { to: '/labor', label: 'Labor', icon: Users2 },
  { to: '/downtime', label: 'Downtime', icon: AlertTriangle },
  { to: '/reports', label: 'Reports', icon: FileBarChart2 },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export const AppShell = ({ children }: PropsWithChildren) => {
  const { currentUser, mode, logout } = useAuth();
  const {
    facilityOptions,
    selectedFacilityId,
    setSelectedFacilityId,
    shiftOptions,
    selectedShift,
    setSelectedShift,
    selectedWarehouse,
    commandFeed,
  } = useAppData();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const activeCriticalCount = commandFeed.filter((item) => item.priority === 'Critical' || item.priority === 'High').length;

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

      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside
          className={`fixed inset-y-0 left-0 z-40 border-r border-white/10 bg-slate-950/96 p-4 backdrop-blur-xl transition-all duration-300 lg:static lg:translate-x-0 ${
            sidebarCollapsed ? 'lg:w-[104px]' : 'w-80'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
        >
          <div className="flex items-center justify-between">
            <div className={sidebarCollapsed ? 'lg:hidden' : ''}>
              <p className="text-xs uppercase tracking-[0.35em] text-cyan-300/70">NEXUS AI</p>
              <h1 className="mt-3 font-display text-2xl text-white">AI Shift Manager</h1>
              <p className="mt-2 text-sm text-slate-400">Warehouse Command Center</p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="hidden rounded-full border border-white/10 p-2 text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 lg:inline-flex"
                onClick={() => setSidebarCollapsed((previous) => !previous)}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                {sidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
              </button>
              <button
                type="button"
                className="rounded-full border border-white/10 p-2 text-slate-200 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className={`mt-6 space-y-4 ${sidebarCollapsed ? 'lg:hidden' : ''}`}>
            <div className="rounded-[26px] border border-cyan-400/15 bg-cyan-400/8 p-4">
              <label className="form-field">
                <span>Facility</span>
                <select
                  value={selectedFacilityId}
                  onChange={(event) => setSelectedFacilityId(event.target.value as typeof selectedFacilityId)}
                >
                  {facilityOptions.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.label} - {facility.region}
                    </option>
                  ))}
                </select>
              </label>
              <label className="form-field mt-3">
                <span>Shift</span>
                <select value={selectedShift} onChange={(event) => setSelectedShift(event.target.value as typeof selectedShift)}>
                  {shiftOptions.map((shift) => (
                    <option key={shift} value={shift}>
                      {shift}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <div className="rounded-[26px] border border-white/10 bg-white/5 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-white">{currentUser?.displayName}</p>
                  <p className="mt-1 text-xs text-slate-400">{currentUser?.email}</p>
                </div>
                <Badge tone={mode === 'demo' ? 'warning' : 'success'}>
                  {mode === 'demo' ? 'Demo mode' : 'Supabase live'}
                </Badge>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="accent">{currentUser?.role}</Badge>
                <Badge tone={activeCriticalCount > 0 ? 'warning' : 'success'}>
                  {activeCriticalCount} live actions
                </Badge>
              </div>
              <p className="mt-4 text-xs leading-5 text-slate-400">
                {selectedWarehouse.overview.supervisors.join(' and ')} are supervising this facility.
              </p>
            </div>
          </div>

          <nav className="mt-6 flex flex-col gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `group flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition duration-200 ${
                      isActive
                        ? 'border-cyan-400/30 bg-cyan-400/12 text-white shadow-[0_16px_40px_rgba(14,165,233,0.12)]'
                        : 'border-transparent text-slate-300 hover:border-white/10 hover:bg-white/5 hover:text-white'
                    } ${sidebarCollapsed ? 'lg:justify-center lg:px-0' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className={sidebarCollapsed ? 'lg:hidden' : ''}>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <button
            type="button"
            className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-200 transition hover:border-fuchsia-400/30 hover:bg-fuchsia-400/10 ${sidebarCollapsed ? 'lg:px-0' : ''}`}
            onClick={() => void logout()}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className={sidebarCollapsed ? 'lg:hidden' : ''}>Sign out</span>
          </button>
        </aside>

        <div className="flex min-h-screen flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/72 px-4 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/10 px-4 py-3 text-sm text-slate-100 transition hover:border-cyan-400/30 hover:bg-cyan-400/10 lg:hidden"
                  onClick={() => setSidebarOpen(true)}
                >
                  <Menu className="h-4 w-4" />
                  Menu
                </button>

                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-cyan-300/75">Predictive Operations</p>
                  <p className="mt-2 text-sm text-slate-200">
                    {selectedWarehouse.label} is running {selectedShift}. Nexus AI is watching labor, downtime,
                    dock-to-stock risk, inventory confidence, and supervisor action coverage.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{selectedWarehouse.label}</Badge>
                <Badge tone="default">{selectedShift}</Badge>
                <Badge tone={selectedWarehouse.shiftHealth.score >= 80 ? 'success' : 'warning'}>
                  Shift health {selectedWarehouse.shiftHealth.score}/100
                </Badge>
                <Badge tone={activeCriticalCount > 0 ? 'warning' : 'success'}>
                  <Waypoints className="mr-1 h-3 w-3" />
                  {activeCriticalCount} critical actions
                </Badge>
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 py-6 lg:px-8 lg:py-8">{children}</main>
        </div>
      </div>
    </div>
  );
};
