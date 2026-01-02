import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryStore } from '../../../../services/inventory-store';

@Component({
selector: 'app-inventory-issue',
standalone: true,
imports: [CommonModule, RouterLink],
templateUrl: './inventory-issue.html',
styleUrl: './inventory-issue.scss'
})
export class InventoryIssue {
readonly store = inject(InventoryStore);
private readonly route = inject(ActivatedRoute);

readonly itemId = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
readonly item = computed(() => this.store.getItem(this.itemId()));

readonly locationId = signal('LOC-1');
readonly selectedBatchId = signal<string | null>(null);
readonly qty = signal<number>(1);

readonly fefo = computed(() =>
this.store.fefoBatchesForItemInLocation(this.itemId(), this.locationId())
  );

  readonly defaultBatchId = computed(() => this.fefo()[0]?.batchId ?? null);

  readonly selected = computed(() => {
    const chosen = this.selectedBatchId() ?? this.defaultBatchId();
    return this.fefo().find(x => x.batchId === chosen) ?? null;
  });

  readonly error = computed(() => {
    const row = this.selected();
    if (!row?.batch) return 'Select a batch';
    if (this.store.isExpired(row.batch.expiryDate)) return 'Batch is expired and cannot be used';
    if (!Number.isFinite(this.qty()) || this.qty() <= 0) return 'Quantity must be > 0';
    if (this.qty() > row.qty) return 'Insufficient stock';
    return null;
  });

  onLocationChange(v: string) {
    this.locationId.set(v);
    this.selectedBatchId.set(null);
  }

  onSubmit() {
    if (this.error()) return;
    alert('UI-only MVP: consume/issue will call API later');
  }
}
