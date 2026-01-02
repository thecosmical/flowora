import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { InventoryStore } from '../../../../services/inventory-store';
import { DecisionStore } from '../../../../services/decision-store';

@Component({
selector: 'app-inventory-list',
standalone: true,
imports: [CommonModule, RouterLink],
templateUrl: './inventory-list.html',
styleUrl: './inventory-list.scss'
})
export class InventoryList {
private readonly store = inject(InventoryStore);
private readonly decisions = inject(DecisionStore);

readonly q = signal('');
readonly showInactive = signal(false);
readonly lowOnly = signal(false);
readonly expDays = signal<number | null>(30);
readonly openId = signal<string | null>(null);
readonly openActionId = signal<string | null>(null);
readonly simQty = signal(0);
readonly simPrice = signal(0);
readonly simLead = signal(0);

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
        return [i.sku, i.name, i.category, i.industry ?? ''].some(v => (v ?? '').toLowerCase().includes(query));
      })
      .map(i => {
        const qty = this.store.qtyForItemInScope(i.id);
        const earliest = this.store.earliestExpiryForItemInScope(i.id);
        const min = this.store.minForItemInScope(i);
        const low = min > 0 && qty < min;
        const expSoon = expDays != null && earliest != null && this.store.isExpiringWithin(earliest, expDays);
        const expired = earliest != null && this.store.isExpired(earliest);
        const risk: 'STOCKOUT' | 'LOW' | 'EXPIRING' | 'OK' =
          qty <= 0 ? 'STOCKOUT' :
          low ? 'LOW' :
          expSoon ? 'EXPIRING' :
          'OK';
        return { item: i, qty, earliest, low, expSoon, expired, min, risk };
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
    this.openActionId.set(null);

    const row = this.rows().find(r => r.item.id === id);
    if (row) {
      const rec = this.decisions.recommendation(id, row.qty);
      this.simQty.set(rec.suggestedQty);
      this.simPrice.set(this.decisions.defaultPrice(id));
      this.simLead.set(this.decisions.defaultLead(id));
    }
  }

  recommendation(itemId: string, currentStock: number) {
    return this.decisions.recommendation(itemId, currentStock);
  }

  riskLabel(risk: string) {
    if (risk === 'STOCKOUT') return 'Out of Stock';
    if (risk === 'LOW') return 'Low';
    if (risk === 'EXPIRING') return 'Expiring';
    return 'OK';
  }

  rowClass(r: { risk: string; expired: boolean }) {
    return {
      'row-stockout': r.risk === 'STOCKOUT',
      'row-low': r.risk === 'LOW',
      'row-expiring': r.risk === 'EXPIRING',
      'row-ok': r.risk === 'OK' && !r.expired
    };
  }

  demandContext(itemId: string) {
    return this.decisions.demandContext(itemId);
  }

  formatCurrency(v: number | null | undefined) {
    if (v == null || Number.isNaN(v)) return '-';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(v);
  }

  simulation(row: { item: any; qty: number }) {
    if (!row || this.openId() !== row.item.id) return null;
    return this.decisions.simulate(row.item.id, {
      qty: this.simQty(),
      price: this.simPrice(),
      leadTime: this.simLead(),
      currentStock: row.qty
    });
  }

  acceptRecommendation(row: { item: any; qty: number }) {
    this.createActionTask(row);
  }

  rejectRecommendation(row: { item: any; qty: number }) {
    this.rejectActionTask(row);
  }

  createActionTask(row: { item: any; qty: number }) {
    const rec = this.recommendation(row.item.id, row.qty);
    this.decisions.addTask(row.item.id, `Buy ${rec.suggestedQty} of ${row.item.name}`, rec.suggestedQty, this.simLead());
    this.decisions.logDecision(row.item.id, 'CREATE_TASK', rec.suggestedQty, this.simPrice(), this.simLead());
    alert('Action created and sent to Notification Center.');
  }

  rejectActionTask(row: { item: any; qty: number }) {
    const rec = this.recommendation(row.item.id, row.qty);
    this.decisions.logDecision(row.item.id, 'REJECT_TASK', rec.suggestedQty, this.simPrice(), this.simLead(), 'Rejected from inventory');
    alert('Action rejected (logged).');
  }

  toggleActionMenu(id: string) {
    this.openActionId.set(this.openActionId() === id ? null : id);
  }

  performAction(row: { item: any; qty: number }, action: 'PLACE_ORDER' | 'REJECT_DECISION') {
    if (action === 'PLACE_ORDER') this.createActionTask(row);
    if (action === 'REJECT_DECISION') this.rejectActionTask(row);
    this.openActionId.set(null);
  }
}
