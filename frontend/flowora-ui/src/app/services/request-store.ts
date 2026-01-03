import { Injectable, effect, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Attachment, ApprovalRule, ConsumptionEvent, ProductionRequest, ProductionRequestLine, RequestType, UserRole } from '../data/request.models';
import { Product } from '../data/inventory.models';
import { AuditStore } from './audit-store';
import { ApiClientService, RequestsResponse } from './api-client';
import { InventoryStore } from './inventory-store';
import { DecisionStore } from './decision-store';

const APPROVAL_RULES: ApprovalRule[] = [
  { type: 'ISSUE', roles: ['OPS_MANAGER', 'CEO'] },
  { type: 'PURCHASE', minAmount: 0, roles: ['OPS_MANAGER', 'CEO'] }
];

@Injectable({ providedIn: 'root' })
export class RequestStore {
  private readonly api = inject(ApiClientService);
  private readonly audit = inject(AuditStore);
  private readonly inventory = inject(InventoryStore);
  private readonly decisions = inject(DecisionStore);
  private readonly _requests = signal<ProductionRequest[]>([]);
  private readonly _lines = signal<ProductionRequestLine[]>([]);
  private readonly _events = signal<ConsumptionEvent[]>([]);
  private readonly _products = signal<Product[]>([]);
  private readonly _approvalRules = signal<ApprovalRule[]>(APPROVAL_RULES);
  private readonly _loading = signal(false);

  readonly requests = this._requests.asReadonly();
  readonly lines = this._lines.asReadonly();
  readonly events = this._events.asReadonly();
  readonly products = this._products.asReadonly();
  readonly approvalRules = this._approvalRules.asReadonly();
  readonly loading = this._loading.asReadonly();

  constructor() {
    this.refresh();
    // keep products aligned with inventory items for consistent SKU/name
    effect(() => {
      const items = this.inventory.items();
      const mapped: Product[] = items.map(it => ({
        id: it.id,
        name: it.name,
        sku: it.sku,
        status: it.status,
        uom: it.uom,
        category: it.category,
        description: it.description
      }));
      if (mapped.length) this._products.set(mapped);
    });
  }

  async refresh() {
    if (this._loading()) return;
    this._loading.set(true);
    try {
      const res = await firstValueFrom(this.api.listRequests());
      this.hydrate(res);
    } catch (err) {
      console.error('Failed to load requests from API', err);
    } finally {
      this._loading.set(false);
    }
  }

  private hydrate(res: RequestsResponse) {
    this._products.set(res.products ?? []);
    this._requests.set(res.requests ?? []);
    this._lines.set(res.lines ?? []);
    this._events.set(res.events ?? []);
    this._approvalRules.set(res.approvalRules?.length ? res.approvalRules : APPROVAL_RULES);
  }

  requestById = (id: string) => this._requests().find(r => r.id === id) ?? null;
  linesByRequest = (id: string) => this._lines().filter(l => l.requestId === id);
  eventsByRequest = (id: string) => this._events().filter(e => e.requestId === id);

  addAttachment(requestId: string, name: string, docType: Attachment['docType'] = 'OTHER') {
    this._requests.update(list =>
      list.map(r =>
        r.id === requestId
          ? {
              ...r,
              docs: [...(r.docs ?? []), { id: `DOC-${Date.now()}`, name, docType }]
            }
          : r
      )
    );
  }

  async approve(requestId: string, user: string, role: UserRole, comment?: string) {
    const req = this.requestById(requestId);
    if (!req || !this.canApprove(req, role)) return;
    try {
      await firstValueFrom(this.api.approveRequest(requestId, { by: user, role, comment }));
    } catch (err) {
      console.error('Failed to approve request via API, updating locally', err);
    }

    this._requests.update(list =>
      list.map(r => {
        if (r.id !== requestId) return r;
        const approvedBy = Array.from(new Set([...(r.approvedBy ?? []), user]));
        const approvals = [...(r.approvals ?? []), { by: user, role, at: new Date().toISOString(), comment }];
        return { ...r, status: 'APPROVED', approvedBy, approvals, approvedAt: new Date().toISOString() };
      })
    );
    this.audit.add('REQUEST_APPROVED', requestId, `Approved by ${user}`, user, { approver: user, requester: req.requestedBy });

    if (req.type === 'ISSUE') {
      const lines = this.linesByRequest(requestId);
      lines.forEach(l => {
        const qty = l.approvedQty ?? l.requestedQty;
        if (qty > 0) {
          this.inventory.removeStock(l.itemId, qty);
          const item = this.inventory.getItem(l.itemId);
          this.audit.add(
            'STOCK_UPDATE',
            l.itemId,
            `Issued ${qty} for request ${requestId}`,
            user,
            {
              itemId: l.itemId,
              itemName: item?.name,
              sku: item?.sku,
              qty
            }
          );
          const ev = {
            id: `EVT-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
            requestId,
            itemId: l.itemId,
            kind: 'USED' as const,
            qty,
            reason: comment ?? 'Issued',
            by: user,
            at: new Date().toISOString()
          };
          this._events.update(list => [ev, ...list]);
        }
      });
    }
  }

  async reject(requestId: string, user: string, role: UserRole, comment?: string) {
    const req = this.requestById(requestId);
    if (!req) return;
    try {
      await firstValueFrom(this.api.rejectRequest(requestId, { by: user, role, comment }));
    } catch (err) {
      console.error('Failed to reject request via API, updating locally', err);
    }

    this._requests.update(list =>
      list.map(r =>
        r.id === requestId
          ? {
              ...r,
              status: 'REJECTED',
              approvals: [...(r.approvals ?? []), { by: user, role, at: new Date().toISOString(), comment }]
            }
          : r
      )
    );
    if (req) this.audit.add('REQUEST_REJECTED', req.id, `Rejected by ${user}`, user, { approver: user, requester: req.requestedBy });
  }

  canApprove(req: ProductionRequest, role: UserRole) {
    const rule = this.approvalRules().find(r => r.type === req.type);
    if (!rule) return false;
    return rule.roles.includes(role);
  }

  async addRequest(payload: {
    id: string;
    productId: string;
    type: RequestType;
    requestedBy: string;
    requestedByRole: UserRole;
    approvers: string[];
    lines: { itemId: string; qty: number; reason?: string }[];
    description?: string;
  }) {
    let requestId = payload.id;
    try {
      const res = await firstValueFrom(this.api.createRequest({
        productId: payload.productId,
        type: payload.type,
        requestedBy: payload.requestedBy,
        requestedByRole: payload.requestedByRole,
        approvers: payload.approvers,
        lines: payload.lines
      }));
      if (res?.id) requestId = res.id;
    } catch (err) {
      console.error('Failed to create request via API, adding locally', err);
    }

    const req: ProductionRequest = {
      id: requestId,
      productId: payload.productId,
      type: payload.type,
      requestedBy: payload.requestedBy,
      requestedByRole: payload.requestedByRole,
      approvers: payload.approvers,
      approvedBy: [],
      approvals: [],
      status: 'PENDING',
      targetQty: payload.lines.reduce((s, l) => s + l.qty, 0),
      createdAt: new Date().toISOString(),
      docs: [],
      description: payload.description
    };
    this._requests.update(list => [req, ...list]);
    const newLines: ProductionRequestLine[] = payload.lines.map(l => ({
      requestId: req.id,
      itemId: l.itemId,
      requestedQty: l.qty,
      approvedQty: l.qty,
      usedQty: 0,
      returnedQty: 0,
      rejectedQty: 0,
      reason: l.reason
    }));
    this._lines.update(list => [...newLines, ...list]);
    this.audit.add('REQUEST_CREATED', req.id, `Requested by ${payload.requestedBy}`, payload.requestedBy, {
      requester: payload.requestedBy
    });
    const totalQty = newLines.reduce((sum, l) => sum + l.approvedQty, 0);
    const title = `${req.id}: Dispatch ${totalQty} units`;
    this.decisions.addTask(
      newLines[0]?.itemId ?? req.productId,
      title,
      totalQty,
      1,
      'Tarun (CEO)',
      { category: 'INVENTORY_DISPATCH', requestId: req.id, status: 'PENDING' }
    );
    const firstItem = this.inventory.getItem(newLines[0]?.itemId ?? '');
    this.audit.add(
      'TASK_CREATED',
      req.id,
      `Dispatch task created for ${totalQty} units ${firstItem?.name ?? newLines[0]?.itemId ?? ''}`,
      payload.requestedBy,
      {
        requester: payload.requestedBy,
        itemId: firstItem?.id,
        itemName: firstItem?.name,
        qty: totalQty
      }
    );

    // Demo convenience: auto-approve inventory issues so stock deducts immediately
    if (req.type === 'ISSUE') {
      await this.approve(req.id, 'Tarun (CEO)', 'CEO', 'Auto-approved dispatch');
    }
    return req.id;
  }
}
