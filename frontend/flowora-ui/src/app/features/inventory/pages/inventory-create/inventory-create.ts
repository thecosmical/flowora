import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { InventoryStoreService } from '../../data/inventory-store';

@Component({
  selector: 'app-inventory-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventory-create.html',
  styleUrl: './inventory-create.scss'
})
export class InventoryCreateComponent {
  id = '';
  name = '';
  sku = '';
  quantity = 0;
  location = '';

  constructor(private readonly store: InventoryStoreService, private readonly router: Router) {}

  save() {
    const id = this.id.trim();
    const name = this.name.trim();
    const sku = this.sku.trim();
    const location = this.location.trim();
    if (!id || !name || !sku || !location) return;

    this.store.add({ id, name, sku, quantity: Number(this.quantity) || 0, location });
    this.router.navigateByUrl('/inventory');
  }
}
