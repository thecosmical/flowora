import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { RequestStore } from '../../../../services/request-store';
import { UserContextService } from '../../../../services/user-context';
import { InventoryStore } from '../../../../services/inventory-store';
import { RequestType } from '../../../../data/request.models';
const toNumber = (value: any) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
};

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
  private readonly inventory = inject(InventoryStore);

  readonly products = computed(() => {
    const items = this.inventory.items();
    const asProducts = items.filter(it => (it.types?.includes('Products') ?? true));
    return asProducts.length ? asProducts : items;
  });
  readonly items = computed(() =>
    [...this.inventory.items()].sort((a, b) => a.name.localeCompare(b.name))
  );
  readonly typeOptions: { value: RequestType; label: string; hint: string }[] = [
    { value: 'ISSUE', label: 'Inventory Dispatch', hint: 'Dispatch stock from stores to production/ops' },
    { value: 'PURCHASE', label: 'Purchase', hint: 'Raise supplier PO for replenishment' }
  ];
  readonly typeHint = computed(() => this.typeOptions.find(t => t.value === this.form().type)?.hint ?? '');
  readonly reasonSeeds = signal([
    'Damaged',
    'QA Fail',
    'Calibration Loss',
    'Size not compatible',
    'Cost high',
    'Quality low',
    'Product mismatch',
    'Fast track',
    'Line priority',
    'Pilot batch'
  ]);

  readonly form = signal({
    type: 'ISSUE' as RequestType,
    productId: '',
    requestedBy: this.userCtx.current().name,
    approvers: ['Ops Manager'],
    lines: [{ itemId: '', qty: 1, reason: '' }],
    newReason: '',
    description: ''
  });

  readonly approverOptions = computed(() =>
    this.form().type === 'PURCHASE' ? ['Ops Manager', 'CEO'] : ['Ops Manager', 'CEO']
  );

  constructor() {
    effect(() => {
      const product = this.products()[0];
      if (!this.form().productId && product) {
        this.updateForm('productId', product.id);
      }
      const firstItem = this.items()[0];
      if (firstItem && this.form().lines[0]?.itemId === '') {
        this.updateLine(0, 'itemId', firstItem.id);
      }
    });
  }

  updateForm<K extends keyof ReturnType<typeof this.form>>(key: K, value: ReturnType<typeof this.form>[K]) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  addLine() {
    const defaultItem = this.items()[0]?.id ?? '';
    this.form.update(f => ({
      ...f,
      lines: [...f.lines, { itemId: defaultItem, qty: 1, reason: '' }]
    }));
  }

  updateLine(idx: number, key: 'itemId' | 'qty' | 'reason', value: any) {
    this.form.update(f => {
      const next = [...f.lines];
      next[idx] = { ...next[idx], [key]: key === 'qty' ? toNumber(value) : value };
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

  async save() {
    const user = this.userCtx.current();
    if (!this.form().productId || !this.form().lines.length) return;
    await this.store.addRequest({
      id: `REQ-${Date.now()}`,
      productId: this.form().productId,
      type: this.form().type,
      requestedBy: user.name,
      requestedByRole: user.role,
      approvers: this.form().approvers,
      lines: this.form().lines,
      description: this.form().description
    });
    this.router.navigate(['/production/requests']);
  }
}
