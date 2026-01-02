import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ITEMS } from '../../../../data/mock.items';
import { Product, Item } from '../../../../data/inventory.models';
import { RequestStore } from '../../../../services/request-store';
import { UserContextService } from '../../../../services/user-context';

type RequestType = 'ISSUE' | 'PURCHASE';

@Component({
  selector: 'app-request-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './request-create.html',
  styleUrl: './request-create.scss'
})
export class RequestCreateComponent {
  private readonly router = inject(Router);
  private readonly store = inject(RequestStore);
  private readonly userCtx = inject(UserContextService);

  readonly products = this.store.products();
  readonly items = ITEMS;
  readonly reasonSeeds = signal([
    'Damaged',
    'QA Fail',
    'Calibration Loss',
    'Size not compatible',
    'Cost high',
    'Quality low',
    'Product mismatch'
  ]);

  readonly form = signal({
    type: 'ISSUE' as RequestType,
    productId: this.products[0]?.id ?? '',
    requestedBy: this.userCtx.current().name,
    approvers: ['Ops Manager'],
    lines: [{ itemId: ITEMS[0]?.id ?? '', qty: 1, reason: '' }],
    newReason: ''
  });

  readonly approverOptions = computed(() =>
    this.form().type === 'PURCHASE' ? ['Ops Manager', 'CEO'] : ['Ops Manager', 'CEO']
  );

  updateForm<K extends keyof ReturnType<typeof this.form>>(key: K, value: ReturnType<typeof this.form>[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  addLine() {
    this.form.update(f => ({
      ...f,
      lines: [...f.lines, { itemId: this.items[0]?.id ?? '', qty: 1, reason: '' }]
    }));
  }

  updateLine(idx: number, key: 'itemId' | 'qty' | 'reason', value: any) {
    this.form.update(f => {
      const next = [...f.lines];
      next[idx] = { ...next[idx], [key]: key === 'qty' ? +value : value };
      return { ...f, lines: next };
    });
  }

  removeLine(idx: number) {
    this.form.update(f => ({ ...f, lines: f.lines.filter((_, i) => i !== idx) }));
  }

  addReason() {
    const v = this.form().newReason.trim();
    if (!v) return;
    this.reasonSeeds.update(list => Array.from(new Set([...list, v])));
    this.form.update(f => ({ ...f, newReason: '' }));
  }

  toggleApprover(name: string) {
    this.form.update(f => {
      const set = new Set(f.approvers);
      set.has(name) ? set.delete(name) : set.add(name);
      return { ...f, approvers: [...set] };
    });
  }

  save() {
    const user = this.userCtx.current();
    this.store.addRequest({
      id: `REQ-${Date.now()}`,
      productId: this.form().productId,
      type: this.form().type,
      requestedBy: user.name,
      requestedByRole: user.role,
      approvers: this.form().approvers,
      lines: this.form().lines
    });
    this.router.navigate(['/production/requests']);
  }
}
