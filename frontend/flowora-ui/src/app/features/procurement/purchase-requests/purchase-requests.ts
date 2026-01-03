import { CommonModule } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { PurchaseStore } from '../../../services/purchase-store';
import { PurchaseRequest, PurchaseStatus } from '../../../data/purchase.models';
import { RouterLink } from '@angular/router';

type Summary = { count: number; taxable: number; total: number };

@Component({
  selector: 'app-purchase-requests',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './purchase-requests.html',
  styleUrl: './purchase-requests.scss'
})
export class PurchaseRequestsComponent {
  private readonly store = inject(PurchaseStore);

  readonly horizon = signal<'THIS_MONTH' | 'LAST_30' | 'THIS_QUARTER'>('THIS_MONTH');
  readonly status = signal<'ALL' | PurchaseStatus>('ALL');
  readonly branch = signal<'ALL' | string>('ALL');
  readonly buyer = signal<'ALL' | string>('ALL');
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
    // default: first day of current month
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  readonly rows = computed<PurchaseRequest[]>(() => {
    const start = this.dateStart();
    const term = this.search().trim().toLowerCase();
    return this.store
      .requests()
      .filter(r => (this.status() === 'ALL' ? true : r.status === this.status()))
      .filter(r => (this.branch() === 'ALL' ? true : r.branch === this.branch()))
      .filter(r => (this.buyer() === 'ALL' ? true : r.buyer === this.buyer()))
      .filter(r => {
        const ordered = new Date(r.orderedOn);
        return ordered >= start;
      })
      .filter(r => {
        if (!term) return true;
        return [
          r.poNumber,
          r.id,
          r.supplier,
          r.contact,
          r.rfqRef ?? '',
          r.category ?? ''
        ].some(v => v.toLowerCase().includes(term));
      })
      .sort((a, b) => b.orderedOn.localeCompare(a.orderedOn));
  });

  readonly summary = computed<Summary>(() =>
    this.rows().reduce(
      (acc, r) => {
        acc.count += 1;
        acc.taxable += r.taxableValue;
        acc.total += r.totalValue;
        return acc;
      },
      { count: 0, taxable: 0, total: 0 }
    )
  );

  readonly statuses = ['ALL', 'DRAFT', 'PENDING', 'ORDERED', 'INBOUND', 'RECEIVED', 'CANCELLED'] as const;
  readonly branches = computed(() => ['ALL', ...new Set(this.store.requests().map(r => r.branch))]);
  readonly buyers = computed(() => ['ALL', ...new Set(this.store.requests().map(r => r.buyer))]);

  formatCurrency(value: number, currency = 'INR', maximumFractionDigits = 0) {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency, maximumFractionDigits }).format(value);
  }

  etaBadge(r: PurchaseRequest) {
    const eta = new Date(r.expectedOn);
    const today = new Date();
    const diff = Math.round((eta.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return `Late by ${Math.abs(diff)}d`;
    if (diff === 0) return 'Arriving today';
    if (diff <= 3) return `Due in ${diff}d`;
    return `ETD ${r.expectedOn}`;
  }

  toggle(id: string) {
    this.openId.set(this.openId() === id ? null : id);
  }

  moveTo(id: string, status: PurchaseStatus) {
    this.store.updateStatus(id, status);
  }
}
