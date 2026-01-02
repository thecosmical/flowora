import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditStore } from '../../services/audit-store';
import { InventoryStore } from '../../services/inventory-store';
import { RequestStore } from '../../services/request-store';

@Component({
  selector: 'app-audit-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './audit-list.html',
  styleUrl: './audit-list.scss'
})
export class AuditListComponent {
  readonly audit = inject(AuditStore);
  private readonly inventory = inject(InventoryStore);
  private readonly requests = inject(RequestStore);

  readonly q = signal('');
  readonly actionFilter = signal<'ALL' | string>('ALL');
  readonly actions = computed(() => Array.from(new Set(this.audit.entries().map(e => e.action))));

  readonly view = computed(() =>
    this.audit.entries()
      .filter(e => this.actionFilter() === 'ALL' ? true : e.action === this.actionFilter())
      .filter(e => {
        const query = this.q().trim().toLowerCase();
        if (!query) return true;
        return [e.action, e.entity, e.details, e.by ?? ''].some(v => v.toLowerCase().includes(query));
      })
      .map(e => ({
        ...e,
        entityLabel: this.resolveEntity(e.entity),
        itemName: e.meta?.itemName,
        sku: e.meta?.sku,
        hsn: e.meta?.hsn,
        requester: e.meta?.requester,
        approver: e.meta?.approver,
        qty: e.meta?.qty,
        price: e.meta?.price,
        location: e.meta?.location
      }))
  );

  private resolveEntity(id: string) {
    const item = this.inventory.items().find(i => i.id === id);
    if (item) return `${item.name} (${item.sku})`;
    const req = this.requests.requests().find(r => r.id === id);
    if (req) return `Request ${req.id}`;
    return id;
  }
}
