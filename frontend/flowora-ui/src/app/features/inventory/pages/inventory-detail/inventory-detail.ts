import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { InventoryStore } from '../../../../services/inventory-store';

@Component({
selector: 'app-inventory-detail',
standalone: true,
imports: [CommonModule, RouterLink],
templateUrl: './inventory-detail.html',
styleUrl: './inventory-detail.scss'
})
export class InventoryDetail {
readonly store = inject(InventoryStore);
private readonly route = inject(ActivatedRoute);

readonly id = computed(() => this.route.snapshot.paramMap.get('id') ?? '');
readonly item = computed(() => this.store.getItem(this.id()));
readonly scope = this.store.scope;

readonly byLocation = computed(() => this.store.stockByLocationForItem(this.id()));
readonly byBatch = computed(() => {
const s = this.store.scope();
if (s.mode === 'ONE') return this.store.stockByBatchForItem(this.id(), s.locationId);
    return this.store.stockByBatchForItem(this.id());
  });

  readonly earliest = computed(() => this.store.earliestExpiryForItemInScope(this.id()));
  readonly movements = computed(() => this.store.movementsForItem(this.id()).slice(0, 30));
}
