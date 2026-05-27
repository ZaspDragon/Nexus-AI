import { PageHeader } from '../components/ui/PageHeader';
import { ProgressMeter } from '../components/ui/ProgressMeter';
import { SurfaceCard } from '../components/ui/SurfaceCard';
import { WarehouseMapCard } from '../components/ui/WarehouseMapCard';
import { useAppData } from '../hooks/useAppData';

export const InventoryPage = () => {
  const { selectedWarehouse } = useAppData();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Inventory"
        title="Cycle counts, zone variance, and inventory confidence"
        description="Spot where inventory accuracy is trending off plan before it turns into short picks, missed replenishment, or end-of-shift recounts."
      />

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <SurfaceCard
          header={
            <div>
              <h2 className="text-xl font-semibold text-white">Zone accuracy</h2>
              <p className="mt-1 text-sm text-slate-400">Cycle count goal: 200 counts per shift.</p>
            </div>
          }
        >
          <div className="space-y-5">
            {selectedWarehouse.inventoryZones.map((zone) => (
              <div key={zone.zone} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{zone.zone}</p>
                    <p className="mt-1 text-xs text-slate-400">Primary issue: {zone.issue}</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-slate-200">
                    {zone.accuracy.toFixed(1)}% accuracy
                  </span>
                </div>
                <div className="mt-4">
                  <ProgressMeter value={zone.accuracy} label="Inventory confidence" detail={zone.action} />
                </div>
              </div>
            ))}
          </div>
        </SurfaceCard>

        <WarehouseMapCard zones={selectedWarehouse.warehouseMap.filter((zone) => zone.type === 'inventory' || zone.type === 'congestion' || zone.type === 'picking')} />
      </section>
    </div>
  );
};
