import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryStore } from '../../../../services/inventory-store';

@Component({
selector: 'app-inventory-list',
standalone: true,
imports: [CommonModule, RouterLink],
templateUrl: './inventory-list.html',
styleUrl: './inventory-list.scss'
})
export class InventoryList {
private readonly store = inject(InventoryStore);

readonly q = signal('');
readonly showInactive = signal(false);
readonly lowOnly = signal(false);
readonly expDays = signal<number | null>(30);
readonly openId = signal<string | null>(null);

readonly scopeMode = computed(() => this.store.scope().mode);

readonly selectedLocationId = computed(() => {
const s = this.store.scope();
return s.mode === 'ONE' ? s.locationId : '';
});

readonly locations = this.store.locations;

setScopeAll() { this.store.scope.set({ mode: 'ALL' }); }

  setScopeOne(locationId: string) {
    this.store.scope.set({ mode: 'ONE', locationId });
  }

  readonly rows = computed(() => {
    const query = this.q().trim().toLowerCase();
    const showInactive = this.showInactive();
    const lowOnly = this.lowOnly();
    const expDays = this.expDays();

    return this.store.items()
      .filter(i => showInactive ? true : i.status === 'ACTIVE')
      .filter(i => {
        if (!query) return true;
        return [i.sku, i.name, i.category].some(v => (v ?? '').toLowerCase().includes(query));
      })
      .map(i => {
        const qty = this.store.qtyForItemInScope(i.id);
        const earliest = this.store.earliestExpiryForItemInScope(i.id);
        const min = i.reorderMinQty ?? 0;
        const low = min > 0 && qty <= min;
        const expSoon = expDays != null && earliest != null && this.store.isExpiringWithin(earliest, expDays);
        const expired = earliest != null && this.store.isExpired(earliest);
        return { item: i, qty, earliest, low, expSoon, expired, min };
      })
      .filter(r => lowOnly ? r.low : true)
      .sort((a, b) => Number(b.expired) - Number(a.expired));
  });

  scopeLabel = computed(() => {
    const scope = this.store.scope();
    if (scope.mode === 'ALL') return 'All Locations';
    const loc = this.store.getLocation(scope.locationId);
    return loc ? loc.name : 'Location';
  });

  toggle(id: string) {
    this.openId.set(this.openId() === id ? null : id);
  }
}
