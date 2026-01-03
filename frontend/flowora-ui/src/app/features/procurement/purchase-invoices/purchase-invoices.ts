import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SUPPLIER_INVOICES, SupplierInvoice } from '../../../data/supplier-invoices.mock';

type Summary = { count: number; taxable: number; total: number };

@Component({
  selector: 'app-purchase-invoices',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-invoices.html',
  styleUrl: './purchase-invoices.scss'
})
export class PurchaseInvoicesComponent {
  private readonly invoices = signal<SupplierInvoice[]>(SUPPLIER_INVOICES);

  readonly horizon = signal<'THIS_MONTH' | 'LAST_30' | 'THIS_QUARTER'>('THIS_MONTH');
  readonly status = signal<'ALL' | SupplierInvoice['status']>('ALL');
  readonly branch = signal<'ALL' | string>('ALL');
  readonly owner = signal<'ALL' | string>('ALL');
  readonly search = signal('');
  readonly openId = signal<string | null>(null);

  private readonly dateStart = computed(() => {
    const now = new Date();
    const h = this.horizon();
    if (h === 'LAST_30') {
      const d = new Date(now);
      d.setDate(d.getDate() - 30);
      return d;
    }
    if (h === 'THIS_QUARTER') {
      const d = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
      return d;
    }
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  readonly rows = computed(() => {
    const start = this.dateStart();
    const term = this.search().trim().toLowerCase();
    return this.invoices()
      .filter(inv => (this.status() === 'ALL' ? true : inv.status === this.status()))
      .filter(inv => (this.branch() === 'ALL' ? true : inv.branch === this.branch()))
      .filter(inv => (this.owner() === 'ALL' ? true : inv.owner === this.owner()))
      .filter(inv => new Date(inv.invoiceDate) >= start)
      .filter(inv => {
        if (!term) return true;
        return [
          inv.supplier,
          inv.contact,
          inv.invoiceNo,
          inv.purchaseOrderId ?? '',
          inv.purchaseOrderRef ?? '',
          inv.id
        ].some(v => v.toLowerCase().includes(term));
      })
      .sort((a, b) => b.invoiceDate.localeCompare(a.invoiceDate));
  });

  readonly summary = computed<Summary>(() =>
    this.rows().reduce(
      (acc, r) => {
        acc.count += 1;
        acc.taxable += r.taxable;
        acc.total += r.total;
        return acc;
      },
      { count: 0, taxable: 0, total: 0 }
    )
  );

  readonly statuses = ['ALL', 'AWAITING_GRN', 'READY_FOR_PAYMENT', 'PAID'] as const;
  readonly branches = computed(() => ['ALL', ...new Set(this.invoices().map(i => i.branch))]);
  readonly owners = computed(() => ['ALL', ...new Set(this.invoices().map(i => i.owner))]);

  formatCurrency(value: number, currency = 'INR', maximumFractionDigits = 0) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits }).format(value);
  }

  toggle(id: string) {
    this.openId.set(this.openId() === id ? null : id);
  }

  markPaid(id: string) {
    this.invoices.update(list => list.map(i => (i.id === id ? { ...i, status: 'PAID' as const } : i)));
  }

  markReady(id: string) {
    this.invoices.update(list => list.map(i => (i.id === id ? { ...i, status: 'READY_FOR_PAYMENT' as const } : i)));
  }
}
