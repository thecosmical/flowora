import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { InventoryStore } from '../../../../services/inventory-store';
import { TemplateStore, TemplatePayload, TypeOption } from '../../../../services/template-store';

const toNumber = (v: any, fallback = 0) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
};

const formDefaults = (storeIds: string[]) => ({
  name: '',
  code: '',
  prevCode: '',
  category: '',
  industry: 'Manufacturers',
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
  minStockByLocation: storeIds.reduce<Record<string, number>>((m, id) => { m[id] = 0; return m; }, {}),
  leadTimeDays: null as number | null,
  tags: [] as string[],
  newTag: ''
});
type FormState = ReturnType<typeof formDefaults>;

@Component({
  selector: 'app-inventory-create',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule
  ],
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
  readonly industryOptions = ['Manufacturers', 'Pharma', 'Retail', 'Ecom', 'Automotive', 'Energy', 'Manufacturing'];
  readonly subCategoryOptions = signal<string[]>(['Blue Shade', 'White Shade']);
  readonly categoryOptions = signal<string[]>([
    ...new Set(this.store.items().map(i => i.category))
  ]);
  readonly storeOptions = computed(() => this.store.locations());

  private readonly initialStoreIds = this.store.locations().map(l => l.id);
  readonly form = signal<FormState>({
    ...formDefaults(this.initialStoreIds),
    storeId: this.store.locations()[0]?.id ?? ''
  });

  constructor() {
    const preset = this.route.snapshot.queryParamMap.get('template');
    const initial = preset ?? this.selectedTemplate();
    if (initial) {
      this.selectedTemplate.set(initial);
      this.populate(initial);
    }
    effect(() => {
      const defaultStore = this.store.locations()[0];
      if (!this.form().storeId && defaultStore) {
        this.form.update(f => ({ ...f, storeId: defaultStore.id }));
      }
    });
  }

  readonly templateOptions = computed(() => [
    ...this.templateStore.baseTemplateNames(),
    ...this.templateStore.customTemplateNames(),
    'Add custom template…'
  ]);
  readonly selectedTemplate = signal<string>(this.templateStore.baseTemplateNames()[0] ?? '');

  updateField<K extends keyof FormState>(key: K, value: FormState[K]) {
    this.form.update((f: FormState) => ({ ...f, [key]: value }));
  }

  readonly isValid = computed(() => {
    const f = this.form();
    const required = [
      f.name.trim(),
      f.code.trim(),
      f.category.trim(),
      f.industry.trim(),
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
    this.form.update((f: FormState) => ({ ...f, category: v }));
  }

  onAddSubCategory(value: string) {
    const v = value.trim();
    if (!v) return;
    this.subCategoryOptions.update(list => Array.from(new Set([...list, v])));
    this.form.update((f: FormState) => ({ ...f, subCategory: v }));
  }

  onAddStore(value: string) {
    const v = value.trim();
    if (!v) return;
    const loc = this.store.addLocation(v);
    this.form.update((f: FormState) => {
      const next = { ...f.minStockByLocation, [loc.id]: 0 };
      return { ...f, storeId: loc.id, minStockByLocation: next };
    });
  }

  setMinForLocation(id: string, value: any) {
    const num = value === '' ? 0 : toNumber(value, 0);
    this.form.update((f: FormState) => ({
      ...f,
      minStockByLocation: { ...f.minStockByLocation, [id]: num }
    }));
  }

  toggleType(t: TypeOption) {
    const next = new Set(this.form().types);
    if (next.has(t)) next.delete(t);
    else next.add(t);
    this.form.update((f: FormState) => ({ ...f, types: next }));
  }

  addTag() {
    const v = this.form().newTag.trim();
    if (!v) return;
    this.form.update((f: FormState) => ({ ...f, tags: [...f.tags, v], newTag: '' }));
  }

  removeTag(tag: string) {
    this.form.update((f: FormState) => ({ ...f, tags: f.tags.filter((t: string) => t !== tag) }));
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
    this.form.update((f: FormState) => ({
      ...f,
      ...t,
      types: t.types ? new Set<TypeOption>(t.types as TypeOption[]) : f.types,
      industry: t.industry ?? f.industry,
      storeId: f.storeId || this.store.locations()[0]?.id || this.store.locations()[0]?.id || f.storeId
    }));
  }

  async onSubmit() {
    if (!this.isValid()) return;
    const f = this.form();
    const id = f.code.trim();
    const cleanedMinByLoc = Object.fromEntries(
      Object.entries(f.minStockByLocation ?? {}).map(([k, v]) => [k, toNumber(v, 0)])
    );
    try {
      await this.store.addItem({
      id,
      sku: f.code.trim(),
      name: f.name.trim(),
      prevCode: f.prevCode.trim(),
      category: f.category.trim(),
      industry: f.industry,
      subCategory: f.subCategory.trim(),
      batchType: f.batchType,
      uom: f.unit.trim(),
      trackingType: f.batchType?.includes('Expirable') ? 'BATCH_EXPIRY' : 'BATCH_EXPIRY',
      status: 'ACTIVE',
      hsnSac: f.hsnSac.trim(),
      reorderMinQty: f.minStock ?? undefined,
      safetyStockByLocation: cleanedMinByLoc,
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
    } catch (err) {
      alert('Failed to save item');
      console.error(err);
    }
  }
}
