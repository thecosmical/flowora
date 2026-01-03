import { CommonModule } from '@angular/common';
import { Component, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { PurchaseStore } from '../../../services/purchase-store';
import { PurchaseRequest, PurchaseStatus } from '../../../data/purchase.models';
import { SUPPLIERS } from '../../../data/suppliers.mock';
import { InventoryStore } from '../../../services/inventory-store';

type Line = PurchaseRequest['lines'][number];
type NextActionsState = {
  saveTemplate: boolean;
  templateName: string;
  shareEmail: boolean;
  shareWhatsapp: boolean;
  whatsappTo: string;
  printAfterSave: boolean;
};

@Component({
  selector: 'app-purchase-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './purchase-create.html',
  styleUrl: './purchase-create.scss'
})
export class PurchaseCreateComponent {
  private readonly store = inject(PurchaseStore);
  private readonly router = inject(Router);
  private readonly inventory = inject(InventoryStore);

  readonly statusOptions: PurchaseStatus[] = ['DRAFT', 'PENDING', 'ORDERED', 'INBOUND'];

  readonly form = signal({
    supplierId: '',
    supplier: '',
    contact: '',
    contactEmail: '',
    contactPhone: '',
    branch: 'Haridwar Plant',
    rfqRef: '',
    poNumber: '',
    reference: '',
    orderedOn: new Date().toISOString().slice(0, 10),
    expectedOn: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      return d.toISOString().slice(0, 10);
    })(),
    buyer: 'Procurement Desk',
    status: 'DRAFT' as PurchaseStatus,
    notes: '',
    tags: 'RFQ award, Priority',
    sourceAddress: '',
    shippingDetails: '',
    taxMode: 'IGST' as 'IGST' | 'CGST_SGST'
  });

  readonly lines = signal<Line[]>([
    { sku: '', name: '', qty: 1, uom: 'unit', rate: 0, taxRate: 18, discount: 0, hsn: '' }
  ]);

  readonly supplierOptions = signal(SUPPLIERS);
  readonly autoPopulated = signal(false);

  readonly terms = signal<string[]>([
    '100% advance → Standard packaging → Delivery charges extra',
    '50% advance, balance 50% post trial or GRN at our site.'
  ]);

  readonly templates = signal([
    {
      id: 'TPL-EXPEDITE',
      name: 'Expedite + QA hold',
      notes: 'Expedite shipment, QA hold on arrival.',
      tags: ['Expedite', 'QA Hold'],
      lines: [
        { sku: 'IT-VALVE-SET', name: 'Valve + Bung Set', qty: 100, uom: 'sets', rate: 162, taxRate: 18, discount: 0, hsn: '8481' }
      ]
    },
    {
      id: 'TPL-COATING',
      name: 'Coating replenishment',
      notes: 'Standard coating replenishment, net 30.',
      tags: ['Coating'],
      lines: [
        { sku: 'IT-PAINT-GRAY', name: 'Epoxy Grey Top Coat (RAL 7037)', qty: 80, uom: 'litre', rate: 155, taxRate: 18, discount: 0, hsn: '3208' }
      ]
    }
  ]);

  readonly nextActions = signal<NextActionsState>({
    saveTemplate: false,
    templateName: '',
    shareEmail: false,
    shareWhatsapp: false,
    whatsappTo: '',
    printAfterSave: false
  });

  readonly includeRoundOff = signal(false);

  readonly bestSupplierId = computed(() => {
    const lines = this.lines();
    if (!lines.length) return null;
    const opts = this.supplierOptions();
    const norm = (v: string) => v.trim().toUpperCase();
    let best: { id: string; cost: number } | null = null;
    for (const sup of opts) {
      let missing = false;
      let total = 0;
      for (const l of lines) {
        const ids = [l.sku, l.name].map(v => norm(v || ''));
        const quote = (sup.quotes ?? []).find((q: { itemId: string }) => ids.includes(norm(q.itemId)));
        if (!quote) {
          missing = true;
          break;
        }
        total += l.qty * quote.price;
      }
      if (!missing) {
        if (!best || total < best.cost) best = { id: sup.id, cost: total };
      }
    }
    return best?.id ?? null;
  });

  readonly bestSupplier = computed(() => {
    const id = this.bestSupplierId();
    if (!id) return null;
    return this.supplierOptions().find(s => s.id === id) ?? null;
  });

  private readonly ensureBest = effect(() => {
    const best = this.bestSupplierId();
    if (!best) return;
    const current = this.form().supplierId;
    if (!current) this.applySupplier(best);
  });

  private readonly autoFill = effect(() => {
    const sid = this.form().supplierId;
    if (!sid) {
      this.autoPopulated.set(false);
      return;
    }
    const lines = this.lines();
    const hasUserData = lines.some(l =>
      (l.name && l.name.trim().length > 0) ||
      (l.sku && l.sku.trim().length > 0) ||
      (l.qty && l.qty !== 1) ||
      (l.rate && l.rate > 0)
    );
    if (!hasUserData && !this.autoPopulated()) {
      const ok = this.populateFromHistory();
      if (ok) this.autoPopulated.set(true);
    }
  });

  readonly totals = computed(() =>
    this.lines().reduce(
      (acc, l) => {
        const calc = this.lineTotals(l);
        acc.taxable += calc.taxable;
        acc.tax += calc.tax;
        acc.total += calc.amount;
        return acc;
      },
      { taxable: 0, tax: 0, total: 0 }
    )
  );

  readonly roundOff = computed(() => {
    if (!this.includeRoundOff()) return 0;
    const total = this.totals().total;
    return Math.round(total) - total;
  });

  readonly grandTotal = computed(() => this.totals().total + this.roundOff());

  updateField<K extends keyof ReturnType<typeof this.form>>(key: K, value: ReturnType<typeof this.form>[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  updateLine(index: number, patch: Partial<Line>) {
    this.lines.update(list => list.map((l, i) => (i === index ? { ...l, ...patch } : l)));
  }

  addLine() {
    this.lines.update(list => [...list, { sku: '', name: '', qty: 1, uom: 'unit', rate: 0, taxRate: 18, discount: 0, hsn: '' }]);
  }

  removeLine(index: number) {
    this.lines.update(list => list.filter((_, i) => i !== index));
  }

  applySupplier(id: string) {
    if (!id) {
      this.form.update(f => ({ ...f, supplierId: '', supplier: '', contact: '', contactEmail: '', contactPhone: '' }));
      this.autoPopulated.set(false);
      return;
    }
    const sup = this.supplierOptions().find(s => s.id === id);
    if (!sup) return;
    this.form.update(f => ({
      ...f,
      supplierId: sup.id,
      supplier: sup.name,
      contact: sup.contact,
      contactEmail: sup.email ?? '',
      contactPhone: sup.phone ?? ''
    }));
  }

  lineTotals(l: Line) {
    const qty = l.qty ?? 0;
    const rate = l.rate ?? 0;
    const discount = l.discount ?? 0;
    const taxable = Math.max(0, qty * rate - discount);
    const taxRate = l.taxRate ?? 0;
    const tax = taxable * (taxRate / 100);
    const mode = this.form().taxMode;
    const igst = mode === 'IGST' ? tax : 0;
    const cgst = mode === 'CGST_SGST' ? tax / 2 : 0;
    const sgst = mode === 'CGST_SGST' ? tax / 2 : 0;
    const amount = taxable + tax;
    return { taxable, tax, igst, cgst, sgst, amount };
  }

  addTerm() {
    this.terms.update(list => [...list, 'New term...']);
  }

  updateTerm(i: number, value: string) {
    this.terms.update(list => list.map((t, idx) => (idx === i ? value : t)));
  }

  setAction<K extends keyof NextActionsState>(key: K, value: NextActionsState[K]) {
    this.nextActions.update(v => ({ ...v, [key]: value }));
  }

  populateFromHistory() {
    const sid = this.form().supplierId;
    const sname = this.form().supplier;
    const supplier = sid ? this.supplierOptions().find(s => s.id === sid) : undefined;
    const history = this.store.requests().find(r => (sid && r.supplierId === sid) || (!sid && sname && r.supplier === sname));

    if (history) {
      this.form.update(f => ({
        ...f,
        supplierId: history.supplierId ?? f.supplierId,
        supplier: history.supplier ?? f.supplier,
        contact: history.contact ?? f.contact,
        contactEmail: history.contactEmail ?? f.contactEmail,
        contactPhone: history.contactPhone ?? f.contactPhone,
        branch: history.branch ?? f.branch,
        rfqRef: history.rfqRef ?? f.rfqRef,
        buyer: history.buyer ?? f.buyer,
        notes: history.notes ?? f.notes,
        tags: history.tags?.join(', ') ?? f.tags
      }));
      this.lines.set(history.lines.map(l => ({
        ...l,
        discount: l.discount ?? 0,
        hsn: l.hsn ?? ''
      })));
      return true;
    }

    if (supplier) {
      const inventory = this.inventory.items();
      const lines = (supplier.quotes ?? []).map((q: { itemId: string; price: number }) => {
        const item = inventory.find(i => i.id === q.itemId);
        return {
          sku: q.itemId,
          name: item?.name ?? q.itemId,
          qty: 1,
          uom: item?.uom ?? 'unit',
          rate: q.price,
          taxRate: 18,
          discount: 0,
          hsn: item?.hsnSac ?? ''
        } as Line;
      });
      if (lines.length) this.lines.set(lines);
      this.form.update(f => ({
        ...f,
        contact: supplier.contact,
        contactEmail: supplier.email ?? f.contactEmail,
        contactPhone: supplier.phone ?? f.contactPhone,
        supplier: supplier.name
      }));
      return true;
    }

    return false;
  }

  loadPreset(kind: 'LAST_PO' | 'AWARDED_RFQ' | 'TEMPLATE', templateId?: string) {
    if (kind === 'TEMPLATE') {
      const tpl = this.templates().find(t => t.id === templateId) ?? this.templates()[0];
      if (!tpl) return;
      this.lines.set(tpl.lines.map(l => ({ ...l })));
      this.form.update(f => ({
        ...f,
        notes: tpl.notes,
        tags: tpl.tags.join(', ')
      }));
      return;
    }

    const requests = this.store.requests()
      .slice()
      .sort((a, b) => (b.orderedOn || '').localeCompare(a.orderedOn || ''));

    if (kind === 'LAST_PO') {
      const target = requests.find(r => r.supplierId === this.form().supplierId) ?? requests[0];
      if (target) {
        this.fillFromRequest(target);
      }
      return;
    }

    if (kind === 'AWARDED_RFQ') {
      const withRfq = requests.find(r => r.rfqRef);
      if (withRfq) this.fillFromRequest(withRfq);
    }
  }

  private fillFromRequest(req: PurchaseRequest) {
    this.form.update(f => ({
      ...f,
      supplierId: req.supplierId ?? f.supplierId,
      supplier: req.supplier ?? f.supplier,
      contact: req.contact ?? f.contact,
      contactEmail: req.contactEmail ?? f.contactEmail,
      contactPhone: req.contactPhone ?? f.contactPhone,
      branch: req.branch ?? f.branch,
      rfqRef: req.rfqRef ?? f.rfqRef,
      buyer: req.buyer ?? f.buyer,
      notes: req.notes ?? f.notes,
      tags: req.tags?.join(', ') ?? f.tags,
      poNumber: req.poNumber ?? f.poNumber,
      orderedOn: req.orderedOn ?? f.orderedOn,
      expectedOn: req.expectedOn ?? f.expectedOn
    }));
    this.lines.set(req.lines.map(l => ({
      ...l,
      discount: l.discount ?? 0,
      hsn: l.hsn ?? ''
    })));
  }

  removeTerm(i: number) {
    this.terms.update(list => list.filter((_, idx) => idx !== i));
  }

  async save(goToList: boolean) {
    const f = this.form();
    const id = this.store.createPurchase({
      supplierId: f.supplierId || undefined,
      supplier: f.supplier || 'Supplier pending',
      contact: f.contact || 'Contact pending',
      contactEmail: f.contactEmail || undefined,
      contactPhone: f.contactPhone || undefined,
      branch: f.branch,
      buyer: f.buyer,
      rfqRef: f.rfqRef || 'RFQ-TBD',
      poNumber: f.poNumber || undefined,
      reference: f.reference || undefined,
      orderedOn: f.orderedOn,
      expectedOn: f.expectedOn,
      status: f.status,
      notes: f.notes || undefined,
      tags: f.tags.split(',').map(t => t.trim()).filter(Boolean),
      currency: 'INR',
      lines: this.lines().map(l => ({ ...l }))
    });
    if (goToList) {
      this.router.navigate(['/procurement/purchases']);
    } else {
      this.form.set({
        ...this.form(),
        supplierId: '',
        supplier: '',
        contact: '',
        contactEmail: '',
        contactPhone: '',
        rfqRef: '',
        poNumber: '',
        reference: '',
        notes: ''
      });
      this.lines.set([{ sku: '', name: '', qty: 1, uom: 'unit', rate: 0, taxRate: 18, discount: 0, hsn: '' }]);
    }
  }
}
