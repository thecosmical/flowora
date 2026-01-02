import { Injectable, computed, signal } from '@angular/core';

export type InventoryItem = {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  location: string;
  updatedAt: string;
};

@Injectable({ providedIn: 'root' })
export class InventoryStoreService {
  private readonly _items = signal<InventoryItem[]>([
    {
      id: 'INV-1001',
      name: 'Safety Gloves',
      sku: 'GLV-01',
      quantity: 120,
      location: 'Dehradun WH-A',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'INV-1002',
      name: 'Industrial Cleaner',
      sku: 'CLN-19',
      quantity: 48,
      location: 'Dehradun WH-B',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'INV-1003',
      name: 'Packing Tape رول',
      sku: 'TAP-07',
      quantity: 300,
      location: 'Noida HUB-1',
      updatedAt: new Date().toISOString()
    },
    {
      id: 'INV-1004',
      name: 'Label Printer Paper',
      sku: 'PPR-33',
      quantity: 75,
      location: 'Gurgaon HUB-2',
      updatedAt: new Date().toISOString()
    }
  ]);

  readonly items = this._items.asReadonly();

  readonly totalSku = computed(() => this._items().length);
  readonly totalQty = computed(() => this._items().reduce((sum, i) => sum + i.quantity, 0));

  getById(id: string) {
    return this._items().find(i => i.id === id) ?? null;
  }

  add(item: Omit<InventoryItem, 'updatedAt'>) {
    const now = new Date().toISOString();
    this._items.update(list => [{ ...item, updatedAt: now }, ...list]);
  }

  updateQty(id: string, quantity: number) {
    const now = new Date().toISOString();
    this._items.update(list =>
      list.map(i => (i.id === id ? { ...i, quantity, updatedAt: now } : i))
    );
  }

  remove(id: string) {
    this._items.update(list => list.filter(i => i.id !== id));
  }
}
