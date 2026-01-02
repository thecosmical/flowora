import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Product } from '../../../../data/inventory.models';
import { ProductionRequest, ProductionRequestLine } from '../../../../data/request.models';
import { RequestStore } from '../../../../services/request-store';
import { InventoryStore } from '../../../../services/inventory-store';

type RequestRow = ProductionRequest & {
  product?: Product | null;
  lines: ProductionRequestLine[];
  totals: { approved: number; used: number; returned: number; rejected: number };
};

@Component({
  selector: 'app-request-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink
  ],
  templateUrl: './request-list.html',
  styleUrl: './request-list.scss'
})
export class RequestListComponent {
  private readonly store = inject(RequestStore);
  private readonly inventory = inject(InventoryStore);

  readonly q = signal('');
  readonly status = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED'>('ALL');
  readonly type = signal<'ALL' | 'PURCHASE' | 'ISSUE'>('ALL');
  readonly openId = signal<string | null>(null);

  readonly rows = computed<RequestRow[]>(() =>
    this.store.requests()
      .map(r => {
        const product = this.store.products().find(p => p.id === r.productId) ?? null;
        const lines = this.store.lines().filter(l => l.requestId === r.id);
        const totalsEvents = this.store.events()
          .filter(e => e.requestId === r.id)
          .reduce(
            (acc, e) => {
              if (e.kind === 'USED') acc.used += e.qty;
              if (e.kind === 'RETURNED') acc.returned += e.qty;
              if (e.kind === 'REJECTED') acc.rejected += e.qty;
              return acc;
            },
            { used: 0, returned: 0, rejected: 0 }
          );
        const totals = {
          approved: lines.reduce((s, l) => s + l.approvedQty, 0),
          ...totalsEvents
        };
        return { ...r, product, lines, totals };
      })
      .filter(r => (this.status() === 'ALL' ? true : r.status === this.status()))
      .filter(r => (this.type() === 'ALL' ? true : r.type === this.type()))
      .filter(r => {
        const query = this.q().trim().toLowerCase();
        if (!query) return true;
        return [r.id, r.product?.name ?? '', r.product?.sku ?? '', r.requestedBy]
          .some(v => v.toLowerCase().includes(query));
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );

  eventsFor = (id: string) => this.store.events().filter(e => e.requestId === id).sort((a, b) => b.at.localeCompare(a.at));

  toggle(id: string) {
    this.openId.set(this.openId() === id ? null : id);
  }

  itemName = (id: string) => this.inventory.items().find(i => i.id === id)?.name ?? id;
  itemSku = (id: string) => this.inventory.items().find(i => i.id === id)?.sku ?? '';
  itemStock = (id: string) => this.inventory.qtyForItemInScope(id);

  variance(r: RequestRow) {
    return r.totals.approved - (r.totals.used + r.totals.returned + r.totals.rejected);
  }
}
