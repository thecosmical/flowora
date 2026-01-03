import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SUPPLIERS, Supplier } from '../../../data/suppliers.mock';
import { ITEMS } from '../../../data/mock.items';

@Component({
  selector: 'app-suppliers',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './suppliers.html',
  styleUrl: './suppliers.scss'
})
export class SuppliersComponent {
  readonly suppliers = signal<Supplier[]>(SUPPLIERS);
  readonly search = signal('');
  readonly openId = signal<string | null>(null);
  readonly editMode = signal<Record<string, boolean>>({});
  readonly addTypeMode = signal(false);
  readonly newTypeValue = signal('');
  readonly editTypeFor = signal<string | null>(null);
  readonly editTypeValue = signal('');
  readonly newSupplier = signal({
    partnerType: 'Supplier',
    name: '',
    contact: '',
    phone: '',
    email: '',
    gstin: '',
    address: { line1: '', city: '', state: '', country: 'India', gstin: '' }
  });

  readonly items = signal(ITEMS.map(i => ({ id: i.id, name: i.name, sku: i.sku, hsnSac: i.hsnSac, uom: i.uom })));
  readonly partnerTypes = signal(['Supplier', 'Logistics Partner', 'Warehouse Partner', 'Vendor']);
  private readonly gstDirectory: Record<string, { name: string; contact: string; city: string; state: string; phone?: string; email?: string }> = {
    '22AAAAA0000A1Z5': { name: 'Northwind Metals', contact: 'Priya Menon', city: 'Haridwar', state: 'Uttarakhand', phone: '+91 98111 22233', email: 'priya@northwind.in' },
    '23BBBBB1111B2Z6': { name: 'ValveWorks India', contact: 'Harshad Kulkarni', city: 'Pune', state: 'Maharashtra', phone: '+91 98765 99110', email: 'harshad@valveworks.in' }
  };

  readonly rows = computed(() => {
    const term = this.search().trim().toLowerCase();
    return this.suppliers()
      .filter(s =>
        !term
          ? true
          : [s.name, s.contact, s.gstin, s.addresses.map(a => a.city).join(' ')]
              .some(v => v?.toLowerCase().includes(term))
      );
  });

  toggle(id: string) {
    this.openId.set(this.openId() === id ? null : id);
  }

  toggleEdit(id: string) {
    this.editMode.update(map => ({ ...map, [id]: !map[id] }));
  }

  updateSupplier(id: string, patch: Partial<Supplier>) {
    this.suppliers.update(list =>
      list.map(s => (s.id === id ? { ...s, ...patch } : s))
    );
  }

  addLinkedItem(supplierId: string, itemId: string) {
    if (!itemId) return;
    this.suppliers.update(list =>
      list.map(s => {
        if (s.id !== supplierId) return s;
        const item = this.items().find(i => i.id === itemId);
        if (!item) return s;
        const exists = s.linkedItems.some(li => li.id === item.id);
        if (exists) return s;
        return { ...s, linkedItems: [...s.linkedItems, item] };
      })
    );
  }

  setNew<K extends keyof ReturnType<typeof this.newSupplier>>(key: K, value: ReturnType<typeof this.newSupplier>[K]) {
    this.newSupplier.update(v => ({ ...v, [key]: value }));
  }

  setAddress(field: keyof ReturnType<typeof this.newSupplier>['address'], value: string) {
    this.newSupplier.update(v => ({ ...v, address: { ...v.address, [field]: value } }));
  }

  addPartnerType(type: string) {
    const t = type.trim();
    if (!t) return;
    this.partnerTypes.update(list => (list.includes(t) ? list : [...list, t]));
  }

  handlePartnerTypeSelect(value: string) {
    if (value === '__add__') {
      this.addTypeMode.set(true);
      this.newTypeValue.set('');
      return;
    }
    this.addTypeMode.set(false);
    this.setNew('partnerType', value);
  }

  confirmNewType() {
    const type = this.newTypeValue().trim();
    if (!type) return;
    this.addPartnerType(type);
    this.setNew('partnerType', type);
    this.addTypeMode.set(false);
    this.newTypeValue.set('');
  }

  cancelNewType() {
    this.addTypeMode.set(false);
    this.newTypeValue.set('');
  }

  addSupplier() {
    const f = this.newSupplier();
    if (!f.name.trim()) return;
    const id = `SUP-${Date.now()}`;
    const addr = {
      id: `ADDR-${Date.now()}`,
      line1: f.address.line1 || 'Address pending',
      city: f.address.city || 'City',
      state: f.address.state || 'State',
      country: f.address.country || 'India',
      gstin: f.address.gstin || f.gstin || undefined
    };
    const supplier: Supplier = {
      id,
      name: f.name,
      contact: f.contact || f.name,
      phone: f.phone || undefined,
      email: f.email || undefined,
      gstin: f.gstin || undefined,
      addresses: [addr],
      linkedItems: [],
      partnerType: f.partnerType || 'Supplier'
    };
    this.suppliers.update(list => [supplier, ...list]);
    this.newSupplier.set({
      partnerType: 'Supplier',
      name: '',
      contact: '',
      phone: '',
      email: '',
      gstin: '',
      address: { line1: '', city: '', state: '', country: 'India', gstin: '' }
    });
  }

  handleDetailTypeChange(id: string, value: string) {
    if (value === '__add__') {
      this.editTypeFor.set(id);
      this.editTypeValue.set('');
      return;
    }
    this.editTypeFor.set(null);
    this.updateSupplier(id, { partnerType: value });
  }

  applyDetailNewType(id: string) {
    const type = this.editTypeValue().trim();
    if (!type) return;
    this.addPartnerType(type);
    this.updateSupplier(id, { partnerType: type });
    this.editTypeFor.set(null);
    this.editTypeValue.set('');
  }

  cancelDetailType() {
    this.editTypeFor.set(null);
    this.editTypeValue.set('');
  }

  fetchByGstin() {
    const gstin = this.newSupplier().gstin?.trim().toUpperCase();
    if (!gstin) return;
    const hit = this.gstDirectory[gstin];
    if (!hit) return;
    this.newSupplier.update(v => ({
      ...v,
      name: hit.name,
      contact: hit.contact,
      phone: hit.phone ?? v.phone,
      email: hit.email ?? v.email,
      address: {
        ...v.address,
        city: hit.city,
        state: hit.state,
        gstin
      }
    }));
  }
}
