import { Injectable, inject, signal } from '@angular/core';
import { AuditStore } from './audit-store';
import { PurchaseRequest, PurchaseStatus } from '../data/purchase.models';
import { PURCHASE_REQUESTS } from '../data/purchase.mock';
import { InventoryStore } from './inventory-store';

@Injectable({ providedIn: 'root' })
export class PurchaseStore {
  private readonly audit = inject(AuditStore);
  private readonly inventory = inject(InventoryStore);
  private readonly _requests = signal<PurchaseRequest[]>(PURCHASE_REQUESTS);

  readonly requests = this._requests.asReadonly();

  purchaseById = (id: string) => this._requests().find(r => r.id === id) ?? null;

  createPurchase(payload: {
    supplierId?: string;
    supplier: string;
    contact: string;
    contactEmail?: string;
    contactPhone?: string;
    branch: string;
    buyer: string;
    status?: PurchaseStatus;
    rfqRef?: string;
    poNumber?: string;
    reference?: string;
    orderedOn?: string;
    expectedOn?: string;
    notes?: string;
    tags?: string[];
    currency?: string;
    createdBy?: string;
    lines: PurchaseRequest['lines'];
  }) {
    const now = new Date();
    const orderedOn = payload.orderedOn ?? now.toISOString().slice(0, 10);
    const eta = payload.expectedOn ?? (() => {
      const d = new Date(now);
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    })();

    const totals = payload.lines.reduce(
      (acc, l) => {
        const discount = l.discount ?? 0;
        const taxable = Math.max(0, l.qty * l.rate - discount);
        const total = taxable * (1 + (l.taxRate ?? 0) / 100);
        acc.taxable += taxable;
        acc.total += total;
        return acc;
      },
      { taxable: 0, total: 0 }
    );

    const req: PurchaseRequest = {
      id: `PO-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
      poNumber: payload.poNumber ?? `PO-FLOW-${Date.now().toString().slice(-5)}`,
      rfqRef: payload.rfqRef ?? 'RFQ-TBD',
      supplierId: payload.supplierId,
      supplier: payload.supplier,
      contact: payload.contact,
      contactEmail: payload.contactEmail,
      contactPhone: payload.contactPhone,
      branch: payload.branch,
      buyer: payload.buyer,
      category: 'Pending category',
      status: payload.status ?? 'PENDING',
      orderedOn,
      expectedOn: eta,
      taxableValue: totals.taxable,
      totalValue: totals.total,
      currency: payload.currency ?? 'INR',
      createdBy: payload.createdBy ?? payload.buyer,
      reference: payload.reference,
      tags: payload.tags ?? [],
      notes: payload.notes,
      lines: payload.lines
    };

    this._requests.update(list => [req, ...list]);
    this.audit.add('PURCHASE_CREATED', req.id, `${req.poNumber} created`, req.createdBy, { requester: req.createdBy, notes: req.notes });
    return req.id;
  }

  createDraft(seed?: Partial<PurchaseRequest>) {
    const now = new Date();
    const isoDate = now.toISOString().slice(0, 10);
    const eta = new Date(now);
    eta.setDate(eta.getDate() + 5);

    const lines = (seed?.lines?.length ? seed.lines : [
      { sku: 'SKU-TBD', name: 'Line item pending', qty: 1, uom: 'unit', rate: 0, taxRate: 0 }
    ]).map(l => ({ ...l }));

    const totals = lines.reduce(
      (acc, l) => {
        const taxable = l.qty * l.rate;
        const total = taxable * (1 + (l.taxRate ?? 0) / 100);
        acc.taxable += taxable;
        acc.total += total;
        return acc;
      },
      { taxable: 0, total: 0 }
    );

    const req: PurchaseRequest = {
      id: seed?.id ?? `PRQ-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}-${Date.now().toString().slice(-4)}`,
      poNumber: seed?.poNumber ?? `PO-FLOW-${Date.now().toString().slice(-5)}`,
      rfqRef: seed?.rfqRef ?? 'RFQ-TBD',
      supplier: seed?.supplier ?? 'New supplier (post-RFQ)',
      contact: seed?.contact ?? 'Contact pending',
      contactEmail: seed?.contactEmail,
      contactPhone: seed?.contactPhone ?? '',
      branch: seed?.branch ?? 'Haridwar Plant',
      buyer: seed?.buyer ?? 'Procurement Desk',
      category: seed?.category ?? 'Unassigned',
      status: 'DRAFT',
      orderedOn: seed?.orderedOn ?? isoDate,
      expectedOn: seed?.expectedOn ?? eta.toISOString().slice(0, 10),
      taxableValue: seed?.taxableValue ?? totals.taxable,
      totalValue: seed?.totalValue ?? totals.total,
      currency: seed?.currency ?? 'INR',
      createdBy: seed?.createdBy ?? 'Tarun (CEO)',
      tags: seed?.tags ?? ['RFQ pending award'],
      notes: seed?.notes ?? 'Draft created from RFQ decision; fill supplier, PO number, and dates.',
      lines
    };

    this._requests.update(list => [req, ...list]);
    this.audit.add('PURCHASE_CREATED', req.id, `Draft ${req.poNumber} created`, req.createdBy, {
      requester: req.createdBy,
      notes: req.notes
    });
    return req.id;
  }

  updateStatus(id: string, status: PurchaseStatus, note?: string) {
    const req = this.purchaseById(id);
    if (!req) return;

    this._requests.update(list =>
      list.map(r => (r.id === id ? { ...r, status, notes: note ?? r.notes } : r))
    );

    if (status === 'RECEIVED') {
      req.lines.forEach(l => {
        this.inventory.addStock(l.sku, l.qty);
        const item = this.inventory.getItem(l.sku);
        this.audit.add(
          'STOCK_UPDATE',
          l.sku,
          `PO ${req.poNumber} received ${l.qty} ${l.uom}`,
          req.createdBy,
          {
            itemId: l.sku,
            itemName: item?.name ?? l.name,
            sku: item?.sku ?? l.sku,
            qty: l.qty,
            requester: req.buyer
          }
        );
      });
    }

    this.audit.add('PURCHASE_STATUS', id, `${req.poNumber} → ${status}`, req.createdBy, {
      requester: req.createdBy,
      notes: note
    });
  }
}
