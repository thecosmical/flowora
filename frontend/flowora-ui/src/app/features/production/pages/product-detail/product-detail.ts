import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Product } from '../../../../data/inventory.models';
import { ProductionRequest, ProductionRequestLine } from '../../../../data/request.models';
import { RequestStore } from '../../../../services/request-store';

type ProductSummary = {
  product: Product;
  requests: (ProductionRequest & { lines: ProductionRequestLine[]; totals: { used: number; returned: number; rejected: number } })[];
  totals: { approved: number; used: number; returned: number; rejected: number; variance: number; pending: number };
};

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.scss'
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  private readonly store = inject(RequestStore);
  readonly statusFilter = signal<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED'>('ALL');

  readonly view = computed<ProductSummary | null>(() => {
    const product = this.store.products().find(p => p.id === this.id);
    if (!product) return null;
    const requests = this.store.requests()
      .filter(r => r.productId === product.id)
      .map(r => {
      const lines = this.store.linesByRequest(r.id);
      const totals = {
        used: lines.reduce((s, l) => s + l.usedQty, 0),
        returned: lines.reduce((s, l) => s + l.returnedQty, 0),
        rejected: lines.reduce((s, l) => s + l.rejectedQty, 0)
      };
      return { ...r, lines, totals };
    })
    .filter(r => this.statusFilter() === 'ALL' ? true : r.status === this.statusFilter());

    const totals = requests.reduce(
      (acc, r) => {
        const approved = this.totalApproved(r.lines);
        acc.approved += approved;
        acc.used += r.lines.reduce((s, l) => s + l.usedQty, 0);
        acc.returned += r.lines.reduce((s, l) => s + l.returnedQty, 0);
        acc.rejected += r.lines.reduce((s, l) => s + l.rejectedQty, 0);
        if (r.status === 'PENDING') acc.pending += 1;
        return acc;
      },
      { approved: 0, used: 0, returned: 0, rejected: 0, pending: 0, variance: 0 }
    );
    totals.variance = totals.approved - (totals.used + totals.returned + totals.rejected);

    return { product, requests, totals };
  });

  totalApproved(lines: ProductionRequestLine[]) {
    return lines.reduce((s, l) => s + l.approvedQty, 0);
  }
}
