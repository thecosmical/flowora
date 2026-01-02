import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InventoryStore } from '../../../../services/inventory-store';
import { TemplateStore, TemplatePayload, TypeOption } from '../../../../services/template-store';

const formDefaults = () => ({
  name: '',
  code: '',
  prevCode: '',
  category: '',
  subCategory: '',
  batchType: '',
  qty: 1,
  unit: 'no.s',
  storeId: '',
  importance: 'Normal',
  types: new Set<TypeOption>(['Products']),
  internalManufacturing: true,
  purchase: false,
  stdCost: null as number | null,
  purchaseCost: null as number | null,
  salePrice: null as number | null,
  hsnSac: '',
  gst: null as number | null,
  mrp: null as number | null,
  description: '',
  internalNotes: '',
  minStock: null as number | null,
  leadTimeDays: null as number | null,
  tags: [] as string[],
  newTag: ''
});

@Component({
  selector: 'app-inventory-create',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './inventory-create.html',
  styleUrl: './inventory-create.scss'
})
export class InventoryCreateComponent {
  private readonly store = inject(InventoryStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly templateStore = inject(TemplateStore);

  readonly typeOptions: TypeOption[] = ['Products', 'Materials', 'Spares', 'Assemblies'];
  readonly batchTypes = ['Yes, Expirable', 'No, Non-expirable'];
  readonly units = ['no.s', 'kg', 'litre'];
  readonly subCategoryOptions = signal<string[]>(['Blue Shade', 'White Shade']);
  readonly categoryOptions = signal<string[]>([
    ...new Set(this.store.items().map(i => i.category))
  ]);
  readonly storeOptions = computed(() => this.store.locations());

  readonly form = signal({
    ...formDefaults(),
    storeId: this.store.locations()[0]?.id ?? ''
  });

  constructor() {
    const preset = this.route.snapshot.queryParamMap.get('template');
    const initial = preset ?? this.selectedTemplate();
    if (initial) {
      this.selectedTemplate.set(initial);
      this.populate(initial);
    }
  }

  readonly templateOptions = computed(() => [
    ...this.templateStore.baseTemplateNames(),
    ...this.templateStore.customTemplateNames(),
    'Add custom template…'
  ]);
  readonly selectedTemplate = signal<string>(this.templateStore.baseTemplateNames()[0] ?? '');

  updateField<K extends keyof ReturnType<typeof this.form>>(
    key: K,
    value: ReturnType<typeof this.form>[K]
  ) {
    this.form.update(f => ({ ...f, [key]: value }));
  }

  readonly isValid = computed(() => {
    const f = this.form();
    const required = [
      f.name.trim(),
      f.code.trim(),
      f.category.trim(),
      f.subCategory.trim(),
      f.unit.trim(),
      f.storeId.trim()
    ].every(Boolean);
    const qtyOk = Number.isFinite(f.qty) && f.qty > 0;
    const hasType = f.types.size > 0;
    return required && qtyOk && hasType;
  });

  onAddCategory(value: string) {
    const v = value.trim();
    if (!v) return;
    const next = new Set(this.categoryOptions());
    next.add(v);
    this.categoryOptions.set([...next]);
    this.form.update(f => ({ ...f, category: v }));
  }

  onAddSubCategory(value: string) {
    const v = value.trim();
    if (!v) return;
    this.subCategoryOptions.update(list => Array.from(new Set([...list, v])));
    this.form.update(f => ({ ...f, subCategory: v }));
  }

  onAddStore(value: string) {
    const v = value.trim();
    if (!v) return;
    const loc = this.store.addLocation(v);
    this.form.update(f => ({ ...f, storeId: loc.id }));
  }

  toggleType(t: TypeOption) {
    const next = new Set(this.form().types);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    this.form.update(f => ({ ...f, types: next }));
  }

  addTag() {
    const v = this.form().newTag.trim();
    if (!v) return;
    this.form.update(f => ({ ...f, tags: [...f.tags, v], newTag: '' }));
  }

  removeTag(tag: string) {
    this.form.update(f => ({ ...f, tags: f.tags.filter(t => t !== tag) }));
  }

  openPricing() {
    alert('Customer category-wise rates: coming soon.');
  }

  populate(templateName: string) {
    if (templateName === 'Add custom template…') {
      this.router.navigate(['/templates/new']);
      return;
    }
    const t = this.templateStore.getTemplate(templateName);
    if (!t) return;
    this.form.update(f => ({
      ...f,
      ...t,
      types: t.types ? new Set<TypeOption>(t.types as TypeOption[]) : f.types,
      storeId: f.storeId || this.store.locations()[0]?.id || this.store.locations()[0]?.id || f.storeId
    }));
  }

  onSubmit() {
    if (!this.isValid()) return;
    const f = this.form();
    const id = f.code.trim();
    this.store.addItem({
      id,
      sku: f.code.trim(),
      name: f.name.trim(),
      prevCode: f.prevCode.trim(),
      category: f.category.trim(),
      subCategory: f.subCategory.trim(),
      batchType: f.batchType,
      uom: f.unit.trim(),
      trackingType: f.batchType?.includes('Expirable') ? 'BATCH_EXPIRY' : 'BATCH_EXPIRY',
      status: 'ACTIVE',
      hsnSac: f.hsnSac.trim(),
      reorderMinQty: f.minStock ?? undefined,
      reorderQty: undefined,
      shelfLifeDays: undefined,
      importance: f.importance,
      types: Array.from(f.types),
      internalManufacturing: f.internalManufacturing,
      purchase: f.purchase,
      stdCost: f.stdCost ?? undefined,
      purchaseCost: f.purchaseCost ?? undefined,
      salePrice: f.salePrice ?? undefined,
      gst: f.gst ?? undefined,
      mrp: f.mrp ?? undefined,
      description: f.description.trim(),
      internalNotes: f.internalNotes.trim(),
      leadTimeDays: f.leadTimeDays ?? undefined,
      tags: f.tags,
      defaultStoreId: f.storeId,
      qty: f.qty
    });
    alert('Item saved');
    this.router.navigateByUrl('/inventory');
  }
}
