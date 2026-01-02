import { Injectable, computed, signal } from '@angular/core';
import { Batch, Item, Location, Movement, StockRow } from '../data/inventory.models';
import { ITEMS } from '../data/mock.items';
import { LOCATIONS } from '../data/mock.locations';
import { BATCHES } from '../data/mock.batches';
import { STOCK } from '../data/mock.stock';
import { MOVEMENTS } from '../data/mock.movements';

type LocationScope = { mode: 'ALL' } | { mode: 'ONE'; locationId: string };

@Injectable({ providedIn: 'root' })
export class InventoryStore {
private readonly _items = signal<Item[]>(ITEMS);
private readonly _locations = signal<Location[]>(LOCATIONS);
private readonly _batches = signal<Batch[]>(BATCHES);
private readonly _stock = signal<StockRow[]>(STOCK);
private readonly _movements = signal<Movement[]>(MOVEMENTS);

readonly items = this._items.asReadonly();
readonly locations = this._locations.asReadonly();
readonly batches = this._batches.asReadonly();
readonly stock = this._stock.asReadonly();
readonly movements = this._movements.asReadonly();

readonly scope = signal<LocationScope>({ mode: 'ALL' });

todayIso = () => new Date().toISOString().slice(0, 10);

getItem = (id: string) => this._items().find(i => i.id === id) ?? null;
getLocation = (id: string) => this._locations().find(l => l.id === id) ?? null;
getBatch = (id: string) => this._batches().find(b => b.id === id) ?? null;

stockRowsInScope = computed(() => {
const s = this._stock();
const scope = this.scope();
if (scope.mode === 'ALL') return s;
    return s.filter(r => r.locationId === scope.locationId);
  });

  qtyForItemInScope = (itemId: string) =>
    this.stockRowsInScope()
      .reduce((sum, r) => (r.itemId === itemId ? sum + r.qty : sum), 0);

  earliestExpiryForItemInScope = (itemId: string) => {
    const today = this.todayIso();
    const batchIds = new Set(
      this.stockRowsInScope().filter(r => r.itemId === itemId && r.qty > 0).map(r => r.batchId)
    );
    const dates = this._batches()
      .filter(b => batchIds.has(b.id))
      .map(b => b.expiryDate)
      .filter(Boolean)
      .sort();
    if (!dates.length) return null;
    return dates[0] < today ? dates[0] : dates[0];
  };

  isExpiringWithin = (dateIso: string | null, days: number) => {
    if (!dateIso) return false;
    const today = new Date(this.todayIso());
    const d = new Date(dateIso);
    const diff = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= days;
  };

  isExpired = (dateIso: string) => dateIso < this.todayIso();

  lowStockInScope = (item: Item) => {
    const min = item.reorderMinQty ?? 0;
    if (min <= 0) return false;
    return this.qtyForItemInScope(item.id) < min;
  };

  stockByLocationForItem = (itemId: string) => {
    const rows = this._stock().filter(r => r.itemId === itemId);
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.locationId, (map.get(r.locationId) ?? 0) + r.qty);
    return [...map.entries()]
      .map(([locationId, qty]) => ({ locationId, qty, location: this.getLocation(locationId) }))
      .sort((a, b) => (b.qty ?? 0) - (a.qty ?? 0));
  };

  stockByBatchForItem = (itemId: string, locationId?: string) => {
    const rows = this._stock().filter(r => r.itemId === itemId && (!locationId || r.locationId === locationId));
    const map = new Map<string, number>();
    for (const r of rows) map.set(r.batchId, (map.get(r.batchId) ?? 0) + r.qty);

    return [...map.entries()]
      .map(([batchId, qty]) => {
        const batch = this.getBatch(batchId);
        return { batchId, qty, batch };
      })
      .sort((a, b) => (a.batch?.expiryDate ?? '').localeCompare(b.batch?.expiryDate ?? ''));
  };

  movementsForItem = (itemId: string) =>
    this._movements().filter(m => m.itemId === itemId).sort((a, b) => b.occurredAt.localeCompare(a.occurredAt));

  fefoBatchesForItemInLocation = (itemId: string, locationId: string) => {
    const rows = this._stock().filter(r => r.itemId === itemId && r.locationId === locationId && r.qty > 0);
    const byBatch = new Map<string, number>();
    for (const r of rows) byBatch.set(r.batchId, (byBatch.get(r.batchId) ?? 0) + r.qty);

    return [...byBatch.entries()]
      .map(([batchId, qty]) => ({ batchId, qty, batch: this.getBatch(batchId) }))
      .filter(x => x.batch)
      .sort((a, b) => (a.batch!.expiryDate).localeCompare(b.batch!.expiryDate));
  };
}
