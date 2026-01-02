import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../../../data/inventory.models';
import { ConsumptionEvent, ProductionRequest, ProductionRequestLine } from '../../../../data/request.models';
import { RequestStore } from '../../../../services/request-store';
import { UserContextService } from '../../../../services/user-context';
import { InventoryStore } from '../../../../services/inventory-store';

@Component({
  selector: 'app-request-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './request-detail.html',
  styleUrl: './request-detail.scss'
})
export class RequestDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly reqId = this.route.snapshot.paramMap.get('id') ?? '';
  private readonly store = inject(RequestStore);
  private readonly userCtx = inject(UserContextService);
  private readonly inventory = inject(InventoryStore);
  readonly requestStore = this.store;

  readonly summary = computed(() => {
    const req = this.request;
    if (!req) return null;
    const events = this.store.eventsByRequest(req.id);
    const used = events.filter(e => e.kind === 'USED').reduce((s, e) => s + e.qty, 0);
    const returned = events.filter(e => e.kind === 'RETURNED').reduce((s, e) => s + e.qty, 0);
    const rejected = events.filter(e => e.kind === 'REJECTED').reduce((s, e) => s + e.qty, 0);
    return { used, returned, rejected };
  });

  get request(): ProductionRequest | null {
    return this.store.requestById(this.reqId);
  }

  get productInfo(): Product | null {
    const req = this.store.requestById(this.reqId);
    if (!req) return null;
    return this.store.products().find(p => p.id === req.productId) ?? null;
  }

  get lineItems(): ProductionRequestLine[] {
    return this.store.linesByRequest(this.reqId);
  }

  get history(): ConsumptionEvent[] {
    return this.store.eventsByRequest(this.reqId).sort((a, b) => b.at.localeCompare(a.at));
  }

  itemName(id: string) {
    return this.inventory.items().find(i => i.id === id)?.name ?? id;
  }

  itemSku(id: string) {
    return this.inventory.items().find(i => i.id === id)?.sku ?? '';
  }

  itemStock(id: string) {
    return this.inventory.qtyForItemInScope(id);
  }

  canApprove(status: string) {
    const req = this.store.requestById(this.reqId);
    if (!req) return false;
    if (!(status === 'PENDING' || status === 'APPROVED')) return false;
    const user = this.userCtx.current();
    const allowed = this.store.canApprove(req, user.role);
    return allowed && req.approvers.includes(user.name);
  }

  approveMock() {
    const user = this.userCtx.current();
    this.store.approve(this.reqId, user.name, user.role);
  }

  rejectMock() {
    const user = this.userCtx.current();
    this.store.reject(this.reqId, user.name, user.role);
  }
}
