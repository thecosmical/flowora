import { Injectable, computed, signal } from '@angular/core';
import { Attachment, ConsumptionEvent, ProductionRequest, ProductionRequestLine, RequestStatus, RequestType, UserRole } from '../data/request.models';
import { Product } from '../data/inventory.models';
import { AuditStore } from './audit-store';

const PRODUCTS: Product[] = [
  {
    id: 'FG-LPG-15KG',
    name: 'LPG Cylinder 15kg Domestic',
    sku: 'FG-LPG-15',
    status: 'ACTIVE',
    uom: 'unit',
    category: 'Finished Goods',
    description: '15kg domestic LPG cylinder (ISI).'
  },
  {
    id: 'FG-LPG-33KG',
    name: 'LPG Cylinder 33kg Commercial',
    sku: 'FG-LPG-33',
    status: 'ACTIVE',
    uom: 'unit',
    category: 'Finished Goods',
    description: '33kg commercial LPG cylinder.'
  },
  {
    id: 'FG-FE-9KG',
    name: 'Fire Extinguisher Shell 9kg',
    sku: 'FG-FE-9',
    status: 'ACTIVE',
    uom: 'unit',
    category: 'Finished Goods',
    description: 'CO2 / dry-chem extinguisher shell 9kg.'
  },
  {
    id: 'FG-AIR-1000L',
    name: 'Air Receiver 1000L',
    sku: 'FG-AIR-1000',
    status: 'ACTIVE',
    uom: 'unit',
    category: 'Finished Goods',
    description: '1000L pressure vessel / air receiver.'
  },
  {
    id: 'FG-SOLAR-200L',
    name: 'Solar Water Heater Tank 200L',
    sku: 'FG-SOLAR-200',
    status: 'ACTIVE',
    uom: 'unit',
    category: 'Finished Goods',
    description: '200L solar water heater storage tank.'
  }
];

const seedRequests: ProductionRequest[] = [
  {
    id: 'REQ-LPG-001',
    productId: 'FG-LPG-15KG',
    type: 'ISSUE',
    requestedBy: 'Ananya (Ops Lead)',
    requestedByRole: 'OPS_MANAGER',
    approvers: ['Rahul (Ops Head)', 'Tarun (CEO)'],
    approvedBy: ['Tarun (CEO)'],
    approvals: [{ by: 'Tarun (CEO)', role: 'CEO', at: '2024-12-15T12:00:00Z', comment: 'Build batch of 150 units' }],
    status: 'APPROVED',
    targetQty: 150,
    createdAt: '2024-12-14T10:00:00Z',
    approvedAt: '2024-12-15T12:00:00Z',
    docs: [{ id: 'DOC-1', name: 'Issue Note #VANSH-45', docType: 'OTHER' }]
  },
  {
    id: 'REQ-LPG-002',
    productId: 'FG-LPG-33KG',
    type: 'ISSUE',
    requestedBy: 'Megha (QA)',
    requestedByRole: 'OPS_MANAGER',
    approvers: ['Tarun (CEO)'],
    approvedBy: [],
    approvals: [],
    status: 'PENDING',
    targetQty: 60,
    createdAt: '2024-12-20T09:00:00Z',
    docs: [{ id: 'DOC-2', name: 'Batch Plan 33kg', docType: 'OTHER' }]
  },
  {
    id: 'REQ-FG-003',
    productId: 'FG-FE-9KG',
    type: 'ISSUE',
    requestedBy: 'Vikram (Production)',
    requestedByRole: 'OPS_MANAGER',
    approvers: ['Rahul (Ops Head)'],
    approvedBy: ['Rahul (Ops Head)'],
    approvals: [{ by: 'Rahul (Ops Head)', role: 'OPS_MANAGER', at: '2024-12-12T09:00:00Z', comment: 'Shell line ready' }],
    status: 'APPROVED',
    targetQty: 200,
    createdAt: '2024-12-12T08:00:00Z',
    docs: [{ id: 'DOC-3', name: 'Shell Schedule FE-9', docType: 'OTHER' }]
  }
];

const seedLines: ProductionRequestLine[] = [
  {
    requestId: 'REQ-LPG-001',
    itemId: 'IT-STEEL-315',
    requestedQty: 3200,
    approvedQty: 3200,
    usedQty: 1800,
    returnedQty: 0,
    rejectedQty: 0,
    reason: 'Shells + foot ring blanks',
    notes: 'Balance reserved for rework'
  },
  {
    requestId: 'REQ-LPG-001',
    itemId: 'IT-FOOT-RING',
    requestedQty: 200,
    approvedQty: 200,
    usedQty: 160,
    returnedQty: 10,
    rejectedQty: 0
  },
  {
    requestId: 'REQ-LPG-001',
    itemId: 'IT-VALVE-SET',
    requestedQty: 180,
    approvedQty: 180,
    usedQty: 150,
    returnedQty: 20,
    rejectedQty: 10,
    reason: '10 valves failed QA'
  },
  {
    requestId: 'REQ-LPG-002',
    itemId: 'IT-STEEL-315',
    requestedQty: 1800,
    approvedQty: 0,
    usedQty: 0,
    returnedQty: 0,
    rejectedQty: 0,
    notes: 'Pending lead approval'
  },
  {
    requestId: 'REQ-LPG-002',
    itemId: 'IT-GUARD-RING',
    requestedQty: 120,
    approvedQty: 0,
    usedQty: 0,
    returnedQty: 0,
    rejectedQty: 0
  },
  {
    requestId: 'REQ-FG-003',
    itemId: 'IT-STEEL-315',
    requestedQty: 900,
    approvedQty: 900,
    usedQty: 540,
    returnedQty: 0,
    rejectedQty: 0
  },
  {
    requestId: 'REQ-FG-003',
    itemId: 'IT-PAINT-RED',
    requestedQty: 120,
    approvedQty: 120,
    usedQty: 90,
    returnedQty: 0,
    rejectedQty: 30,
    reason: 'Line swapped to grey for QA lot'
  },
  {
    requestId: 'REQ-FG-003',
    itemId: 'IT-WELD-12',
    requestedQty: 140,
    approvedQty: 140,
    usedQty: 110,
    returnedQty: 10,
    rejectedQty: 0
  }
];

const seedEvents: ConsumptionEvent[] = [
  {
    id: 'EVT-1',
    requestId: 'REQ-LPG-001',
    itemId: 'IT-STEEL-315',
    kind: 'USED',
    qty: 1200,
    by: 'Ananya (Ops Lead)',
    at: '2024-12-15T14:00:00Z'
  },
  {
    id: 'EVT-2',
    requestId: 'REQ-LPG-001',
    itemId: 'IT-VALVE-SET',
    kind: 'USED',
    qty: 100,
    by: 'Ananya (Ops Lead)',
    at: '2024-12-16T10:00:00Z'
  },
  {
    id: 'EVT-3',
    requestId: 'REQ-LPG-001',
    itemId: 'IT-VALVE-SET',
    kind: 'REJECTED',
    qty: 10,
    reason: 'Seat leak',
    by: 'QA Desk',
    at: '2024-12-16T11:00:00Z'
  },
  {
    id: 'EVT-4',
    requestId: 'REQ-LPG-001',
    itemId: 'IT-FOOT-RING',
    kind: 'RETURNED',
    qty: 10,
    reason: 'Excess issued',
    by: 'Line-1 Supervisor',
    at: '2024-12-16T12:00:00Z'
  },
  {
    id: 'EVT-5',
    requestId: 'REQ-FG-003',
    itemId: 'IT-PAINT-RED',
    kind: 'REJECTED',
    qty: 30,
    reason: 'Switched shade for QA lot',
    by: 'QA Desk',
    at: '2024-12-12T15:00:00Z'
  },
  {
    id: 'EVT-6',
    requestId: 'REQ-LPG-001',
    itemId: 'IT-WELD-12',
    kind: 'USED',
    qty: 60,
    by: 'Line-1 Supervisor',
    at: '2024-12-16T15:00:00Z'
  }
];

@Injectable({ providedIn: 'root' })
export class RequestStore {
  constructor(private readonly audit: AuditStore) {}
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

  approve(requestId: string, user: string, role: UserRole) {
    this._requests.update(list =>
      list.map(r => {
        if (r.id !== requestId) return r;
        if (!this.canApprove(r, role)) return r;
        const approvedBy = Array.from(new Set([...(r.approvedBy ?? []), user]));
        const approvals = [...(r.approvals ?? []), { by: user, role, at: new Date().toISOString() }];
        const updated: ProductionRequest = { ...r, status: 'APPROVED', approvedBy, approvals, approvedAt: new Date().toISOString() };
        this.audit.add('REQUEST_APPROVED', r.id, `Approved by ${user}`, user, { approver: user, requester: r.requestedBy });
        return updated;
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
    const req = this.requestById(requestId);
    if (req) this.audit.add('REQUEST_REJECTED', req.id, `Rejected by ${user}`, user, { approver: user, requester: req.requestedBy });
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
    this.audit.add('REQUEST_CREATED', req.id, `Requested by ${payload.requestedBy}`, payload.requestedBy, {
      requester: payload.requestedBy
    });
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
