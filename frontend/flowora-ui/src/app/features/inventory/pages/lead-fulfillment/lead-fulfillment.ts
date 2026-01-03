import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { InventoryStore } from '../../../../services/inventory-store';
import { DecisionStore } from '../../../../services/decision-store';

type LeadLine = {
  id: string;
  customer: string;
  itemId: string;
  qty: number;
  dueDate: string;
  source: string;
  status: 'Won' | 'Lost';
  reason?: string;
};

type RawNeed = { rawId: string; perUnit: number };

@Component({
  selector: 'app-lead-fulfillment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './lead-fulfillment.html',
  styleUrl: './lead-fulfillment.scss'
})
export class LeadFulfillmentComponent {
  readonly inventory = inject(InventoryStore);
  private readonly decisions = inject(DecisionStore);
  readonly openId = signal<string | null>(null);
  readonly activeFilter = signal<{ type: 'ALL' | 'STATUS' | 'SOURCE'; value?: string }>({ type: 'ALL' });
  readonly reasonFilter = signal<string | null>(null);

  readonly leads = signal<LeadLine[]>([
    { id: 'LEAD-OXY-500', customer: 'Acme Hospitals', itemId: 'FG-OXY-10L', qty: 500, dueDate: '2026-01-10', source: 'Direct call', status: 'Won', reason: 'Price matched and quick ETA' },
    { id: 'LEAD-OXY-600', customer: 'Metro Care', itemId: 'FG-OXY-15L-OLD', qty: 120, dueDate: '2026-01-12', source: 'IndiaMART API', status: 'Lost', reason: 'Deadline tough' },
    { id: 'LEAD-CO2-150', customer: 'FireShield Pvt Ltd', itemId: 'FG-EXT-6KG-OUT', qty: 150, dueDate: '2026-01-15', source: 'Trade India', status: 'Won', reason: 'Retained customer' },
    { id: 'LEAD-CO2-90', customer: 'Apex Safety', itemId: 'FG-CO2-4KG', qty: 90, dueDate: '2026-01-09', source: 'Website', status: 'Won', reason: 'Price matched and quick ETA' },
    { id: 'LEAD-OXY-800', customer: 'City Care Network', itemId: 'FG-OXY-40L', qty: 800, dueDate: '2026-01-20', source: 'LinkedIn', status: 'Lost', reason: 'Competitor lower price' }
  ]);

  readonly sources = ['Direct call', 'IndiaMART API', 'Trade India', 'Website', 'LinkedIn', 'Referral', 'Retained customer', 'Other'];
  readonly reasons = signal([
    'Deadline tough',
    'Missing engineering capability',
    'Competitor lower price',
    'Customer priority shift',
    'Budget not approved',
    'Retained customer',
    'Price matched and quick ETA'
  ]);
  readonly addReasonMode = signal(false);
  readonly newReason = signal('');

  readonly newLead = signal<LeadLine>({
    id: '',
    customer: '',
    itemId: 'FG-OXY-10L',
    qty: 100,
    dueDate: new Date().toISOString().slice(0, 10),
    source: this.sources[0],
    status: 'Won',
    reason: 'Price matched and quick ETA'
  });

  setNewLead<K extends keyof LeadLine>(key: K, value: LeadLine[K]) {
    this.newLead.update(v => ({ ...v, [key]: value }));
  }

  private readonly bom: Record<string, RawNeed[]> = {
    'FG-OXY-10L': [
      { rawId: 'IT-STEEL-315', perUnit: 10 },
      { rawId: 'IT-WELD-12', perUnit: 1 },
      { rawId: 'IT-PAINT-RED', perUnit: 0.5 },
      { rawId: 'IT-VALVE-SET', perUnit: 1 },
      { rawId: 'IT-FOOT-RING', perUnit: 1 }
    ],
    'FG-OXY-15L-OLD': [
      { rawId: 'IT-STEEL-315', perUnit: 12 },
      { rawId: 'IT-WELD-12', perUnit: 1.2 },
      { rawId: 'IT-PAINT-RED', perUnit: 0.6 },
      { rawId: 'IT-VALVE-SET', perUnit: 1 },
      { rawId: 'IT-FOOT-RING', perUnit: 1 }
    ],
    'FG-OXY-40L': [
      { rawId: 'IT-STEEL-315', perUnit: 20 },
      { rawId: 'IT-WELD-12', perUnit: 2.5 },
      { rawId: 'IT-PAINT-RED', perUnit: 1 },
      { rawId: 'IT-VALVE-SET', perUnit: 1 },
      { rawId: 'IT-FOOT-RING', perUnit: 1 }
    ],
    'FG-CO2-4KG': [
      { rawId: 'IT-STEEL-315', perUnit: 6 },
      { rawId: 'IT-WELD-12', perUnit: 0.5 },
      { rawId: 'IT-PAINT-GRAY', perUnit: 0.4 },
      { rawId: 'IT-VALVE-SET', perUnit: 1 },
      { rawId: 'IT-FOOT-RING', perUnit: 1 }
    ],
    'FG-EXT-6KG-OUT': [
      { rawId: 'IT-STEEL-315', perUnit: 7 },
      { rawId: 'IT-WELD-12', perUnit: 0.6 },
      { rawId: 'IT-PAINT-GRAY', perUnit: 0.5 },
      { rawId: 'IT-VALVE-SET', perUnit: 1 },
      { rawId: 'IT-FOOT-RING', perUnit: 1 }
    ]
  };

  addLead() {
    const f = this.newLead();
    if (!f.customer.trim() || !f.itemId || f.qty <= 0) return;
    const id = `LEAD-${Date.now()}`;
    const lead: LeadLine = { ...f, id };
    this.leads.update(list => [lead, ...list]);
    this.newLead.update(v => ({
      ...v,
      id: '',
      customer: '',
      qty: 100,
      dueDate: new Date().toISOString().slice(0, 10),
      source: this.sources[0],
      status: 'Won',
      reason: 'Price matched and quick ETA'
    }));
  }

  handleReasonSelect(val: string) {
    if (val === '__add__') {
      this.addReasonMode.set(true);
      this.newReason.set('');
      return;
    }
    this.addReasonMode.set(false);
    this.newLead.update(v => ({ ...v, reason: val }));
  }

  confirmNewReason() {
    const r = this.newReason().trim();
    if (!r) return;
    this.reasons.update(list => (list.includes(r) ? list : [...list, r]));
    this.newLead.update(v => ({ ...v, reason: r }));
    this.addReasonMode.set(false);
    this.newReason.set('');
  }

  cancelNewReason() {
    this.addReasonMode.set(false);
    this.newReason.set('');
  }

  readonly rows = computed(() => {
    const filter = this.activeFilter();
    const filtered = this.leads().filter(l => {
      if (filter.type === 'ALL') return true;
      if (filter.type === 'STATUS') return l.status === filter.value;
      if (filter.type === 'SOURCE') return l.source === filter.value;
      return true;
    }).filter(l => !this.reasonFilter() ? true : l.reason === this.reasonFilter());

    return filtered.map(lead => {
      const item = this.inventory.getItem(lead.itemId);
      const available = this.inventory.qtyForItemInScope(lead.itemId);
      const dispatch = Math.min(available, lead.qty);
      const toProduce = Math.max(0, lead.qty - available);
      const earliest = this.inventory.earliestExpiryForItemInScope(lead.itemId);
      const expired = earliest ? this.inventory.isExpired(earliest) : false;
      const rec = this.decisions.recommendation(lead.itemId, available);
      const ctx = this.decisions.demandContext(lead.itemId);
      const statusLabel =
        toProduce === 0 ? 'Can be dispatched fully' :
        dispatch === 0 ? 'Cannot dispatch (make to order)' : 'Can dispatch partially';
      const statusReason =
        toProduce === 0
          ? 'Inventory has all finished goods.'
          : dispatch === 0
            ? 'Out of finished goods; manufacture entire order.'
            : `Finished goods short by ${toProduce} ${item?.uom || 'units'}.`;
      const rawShortages = toProduce > 0 ? this.rawShortagesForLead(lead) : [];
      const sla = this.slaStatus(lead.dueDate);
      return { lead, item, available, dispatch, toProduce, statusLabel, statusReason, earliest, expired, rec, leadDays: ctx.leadDays, rawShortages, sla };
    });
  });

  readonly summary = computed(() => {
    const leads = this.leads();
    const won = leads.filter(l => l.status === 'Won').length;
    const lost = leads.filter(l => l.status === 'Lost').length;
    const bySource = leads.reduce<Record<string, number>>((acc, l) => {
      acc[l.source] = (acc[l.source] ?? 0) + 1;
      return acc;
    }, {});
    return { total: leads.length, won, lost, bySource };
  });

  private isFinished(item: any) {
    const cat = (item?.category || '').toLowerCase();
    const tags = (item?.types || []).map((t: string) => t.toLowerCase());
    return cat.includes('finished') || tags.some((t: string) => t.includes('finished') || t.includes('product'));
  }

  private rawShortagesForLead(lead: LeadLine) {
    const stockMap = new Map<string, number>();
    this.inventory.stockRowsInScope().forEach(r => {
      stockMap.set(r.itemId, (stockMap.get(r.itemId) ?? 0) + r.qty);
    });
    const bom = this.bom[lead.itemId] ?? [];
    return bom
      .map(entry => {
        const raw = this.inventory.getItem(entry.rawId);
        const required = entry.perUnit * lead.qty;
        const available = stockMap.get(entry.rawId) ?? 0;
        const shortfall = Math.max(0, required - available);
        return { name: raw?.name || entry.rawId, required, available, shortfall, uom: raw?.uom || 'units' };
      })
      .filter(r => r.shortfall > 0);
  }

  toggle(id: string) {
    this.openId.set(this.openId() === id ? null : id);
  }

  slaStatus(due: string) {
    const today = new Date();
    const d = new Date(due);
    const diffDays = Math.ceil((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return { label: 'Past due', tone: 'stockout' as const };
    if (diffDays <= 2) return { label: `Due in ${diffDays}d`, tone: 'warn' as const };
    return { label: `Due in ${diffDays}d`, tone: 'ok' as const };
  }

  triggerAction(kind: 'RESERVE' | 'WORK_ORDER' | 'RAW') {
    alert(`${kind} action recorded (demo)`);
  }

  reasonCounts() {
    const counts: Record<string, number> = {};
    this.leads().forEach(l => {
      if (!l.reason) return;
      counts[l.reason] = (counts[l.reason] ?? 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([reason, count]) => ({ reason, count }));
  }
}
