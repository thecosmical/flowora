import { Injectable, computed, signal } from '@angular/core';
import { Attachment, ConsumptionEvent, ProductionRequest, ProductionRequestLine, RequestStatus, RequestType, UserRole } from '../data/request.models';
import { Product } from '../data/inventory.models';

const PRODUCTS: Product[] = [
  {
    id: 'PRD-HYD-10T',
    name: 'Hydraulic Press 10T (Workstation)',
    sku: 'HYD-PR-10T',
    status: 'ACTIVE',
    uom: 'unit',
    category: 'Machinery',
    description: 'Compact 10-ton hydraulic press for small-batch fabrication.'
  },
  {
    id: 'PRD-TANK-50L',
    name: 'Tata Tank 50L Petrol Cylinder',
    sku: 'TATA-TNK-50',
    status: 'ACTIVE',
    uom: 'unit',
    category: 'Fuel Storage',
    description: '50L petrol storage cylinder with Tata-branded fittings.'
  }
];

const seedRequests: ProductionRequest[] = [
  {
    id: 'REQ-HYD-001',
    productId: 'PRD-HYD-10T',
    type: 'ISSUE',
    requestedBy: 'Rahul (Ops)',
    requestedByRole: 'OPS_MANAGER',
    approvers: ['Rahul (Ops)', 'Anita (CEO)'],
    approvedBy: ['Rahul (Ops)'],
    approvals: [{ by: 'Rahul (Ops)', role: 'OPS_MANAGER', at: '2024-12-15T12:00:00Z', comment: 'Proceed for build #12' }],
    status: 'APPROVED',
    targetQty: 2,
    createdAt: '2024-12-15T10:00:00Z',
    approvedAt: '2024-12-15T12:00:00Z',
    docs: [{ id: 'DOC-1', name: 'Issue Note #45 (placeholder)' }]
  },
  {
    id: 'REQ-TNK-002',
    productId: 'PRD-TANK-50L',
    type: 'PURCHASE',
    requestedBy: 'Vikram (Procurement)',
    requestedByRole: 'PROCUREMENT',
    approvers: ['Rahul (Ops)', 'Anita (CEO)'],
    approvedBy: [],
    approvals: [],
    status: 'PENDING',
    targetQty: 5,
    createdAt: '2024-12-20T09:00:00Z',
    docs: [{ id: 'DOC-2', name: 'PO Draft (placeholder)' }]
  }
];

const seedLines: ProductionRequestLine[] = [
  {
    requestId: 'REQ-HYD-001',
    itemId: 'IT-1',
    requestedQty: 20,
    approvedQty: 20,
    usedQty: 18,
    returnedQty: 1,
    rejectedQty: 1,
    reason: 'Size not compatible',
    notes: 'One hose too short'
  },
  {
    requestId: 'REQ-HYD-001',
    itemId: 'IT-2',
    requestedQty: 10,
    approvedQty: 10,
    usedQty: 10,
    returnedQty: 0,
    rejectedQty: 0
  },
  {
    requestId: 'REQ-TNK-002',
    itemId: 'IT-3',
    requestedQty: 80,
    approvedQty: 0,
    usedQty: 0,
    returnedQty: 0,
    rejectedQty: 0
  }
];

const seedEvents: ConsumptionEvent[] = [
  {
    id: 'EVT-1',
    requestId: 'REQ-HYD-001',
    itemId: 'IT-1',
    kind: 'USED',
    qty: 10,
    by: 'Rahul (Ops)',
    at: '2024-12-15T14:00:00Z'
  },
  {
    id: 'EVT-2',
    requestId: 'REQ-HYD-001',
    itemId: 'IT-1',
    kind: 'USED',
    qty: 8,
    by: 'Rahul (Ops)',
    at: '2024-12-16T10:00:00Z'
  },
  {
    id: 'EVT-3',
    requestId: 'REQ-HYD-001',
    itemId: 'IT-1',
    kind: 'REJECTED',
    qty: 1,
    reason: 'Size not compatible',
    by: 'Rahul (Ops)',
    at: '2024-12-16T11:00:00Z'
  },
  {
    id: 'EVT-4',
    requestId: 'REQ-HYD-001',
    itemId: 'IT-1',
    kind: 'RETURNED',
    qty: 1,
    reason: 'Not used',
    by: 'Rahul (Ops)',
    at: '2024-12-16T12:00:00Z'
  }
];

@Injectable({ providedIn: 'root' })
export class RequestStore {
  private readonly _requests = signal<ProductionRequest[]>(seedRequests);
  private readonly _lines = signal<ProductionRequestLine[]>(seedLines);
  private readonly _events = signal<ConsumptionEvent[]>(seedEvents);
  private readonly _products = signal<Product[]>(PRODUCTS);

  readonly requests = this._requests.asReadonly();
  readonly lines = this._lines.asReadonly();
  readonly events = this._events.asReadonly();
  readonly products = this._products.asReadonly();
  readonly approvalRules = APPROVAL_RULES;

  requestById = (id: string) => this._requests().find(r => r.id === id) ?? null;
  linesByRequest = (id: string) => this._lines().filter(l => l.requestId === id);
  eventsByRequest = (id: string) => this._events().filter(e => e.requestId === id);

  addAttachment(requestId: string, name: string) {
    this._requests.update(list =>
      list.map(r =>
        r.id === requestId
          ? {
              ...r,
              docs: [...(r.docs ?? []), { id: `DOC-${Date.now()}`, name }]
            }
          : r
      )
    );
  }

  approve(requestId: string, user: string, role: UserRole) {
    this._requests.update(list =>
      list.map(r => {
        if (r.id !== requestId) return r;
        if (!this.canApprove(r, role)) return r;
        const approvedBy = Array.from(new Set([...(r.approvedBy ?? []), user]));
        const approvals = [...(r.approvals ?? []), { by: user, role, at: new Date().toISOString() }];
        return { ...r, status: 'APPROVED', approvedBy, approvals, approvedAt: new Date().toISOString() };
      })
    );
  }

  reject(requestId: string, user: string, role: UserRole, comment?: string) {
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
  }

  canApprove(req: ProductionRequest, role: UserRole) {
    const rule = this.approvalRules.find(r => r.type === req.type);
    if (!rule) return false;
    return rule.roles.includes(role);
  }

  addRequest(payload: {
    id: string;
    productId: string;
    type: RequestType;
    requestedBy: string;
    requestedByRole: UserRole;
    approvers: string[];
    lines: { itemId: string; qty: number; reason?: string }[];
  }) {
    const req: ProductionRequest = {
      id: payload.id,
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
      docs: []
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
  }
}
export type ApprovalRule = {
  type: RequestType;
  minAmount?: number;
  roles: UserRole[];
};

const APPROVAL_RULES: ApprovalRule[] = [
  { type: 'ISSUE', roles: ['OPS_MANAGER'] },
  { type: 'PURCHASE', minAmount: 0, roles: ['OPS_MANAGER', 'CEO'] }
];
