import { Activity, Boxes, PackageSearch, Truck, Waypoints } from 'lucide-react';
import type { WarehouseMapZone } from '../../types';
import { SurfaceCard } from './SurfaceCard';

const iconMap = {
  dock: Truck,
  receiving: Boxes,
  picking: Activity,
  inventory: PackageSearch,
  congestion: Waypoints,
} as const;

const toneStyles = {
  healthy: 'border-emerald-400/20 bg-emerald-400/10 text-emerald-100',
  watch: 'border-amber-400/20 bg-amber-400/10 text-amber-100',
  urgent: 'border-rose-400/20 bg-rose-400/12 text-rose-100',
} as const;

export const WarehouseMapCard = ({ zones }: { zones: WarehouseMapZone[] }) => (
  <SurfaceCard
    header={
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300/80">Live Warehouse Map</p>
        <h2 className="mt-3 text-2xl font-semibold text-white">Operational floor view</h2>
        <p className="mt-2 text-sm text-slate-300">
          Green is healthy, yellow is watch, red is urgent. Pulsing markers show active issues.
        </p>
      </div>
    }
  >
    <div className="grid auto-rows-[112px] grid-cols-6 gap-3">
      {zones.map((zone) => {
        const Icon = iconMap[zone.type];
        return (
          <div
            key={zone.id}
            className={`${zone.span} rounded-[24px] border p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] ${toneStyles[zone.tone]}`}
          >
            <div className="flex h-full flex-col justify-between gap-3">
              <div className="flex items-start justify-between gap-3">
                <div className="rounded-2xl border border-white/10 bg-slate-950/40 p-2">
                  <Icon className="h-4 w-4" />
                </div>
                {zone.activeAlert ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-slate-950/40 px-3 py-1 text-[11px] uppercase tracking-[0.18em]">
                    {zone.tone === 'urgent' ? <span className="h-2.5 w-2.5 rounded-full bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.85)] animate-alert-pulse" /> : null}
                    {zone.activeAlert}
                  </span>
                ) : null}
              </div>
              <div>
                <p className="text-sm font-semibold text-white">{zone.label}</p>
                <p className="mt-2 text-xs leading-5 text-slate-200/85">{zone.detail}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  </SurfaceCard>
);
