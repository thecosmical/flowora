import { Injectable, signal } from '@angular/core';

export type TypeOption = 'Products' | 'Materials' | 'Spares' | 'Assemblies';

export type TemplatePayload = {
  name?: string;
  code?: string;
  prevCode?: string;
  category?: string;
  industry?: string;
  subCategory?: string;
  batchType?: string;
  qty?: number;
  unit?: string;
  storeId?: string;
  importance?: string;
  types?: TypeOption[];
  internalManufacturing?: boolean;
  purchase?: boolean;
  stdCost?: number | null;
  purchaseCost?: number | null;
  salePrice?: number | null;
  hsnSac?: string;
  gst?: number | null;
  mrp?: number | null;
  description?: string;
  internalNotes?: string;
  minStock?: number | null;
  leadTimeDays?: number | null;
  tags?: string[];
  newTag?: string;
};

const BASE_TEMPLATES: Record<string, TemplatePayload> = {
  Shopkeeper: {
    name: 'LED Light 350W (Blue Shade)',
    code: 'LL-1250',
    prevCode: 'LL-1200',
    category: 'Lighting',
    industry: 'Retail',
    subCategory: 'Blue Shade',
    batchType: 'No, Non-expirable',
    qty: 12,
    unit: 'no.s',
    importance: 'Normal',
    types: ['Products'],
    stdCost: 150,
    purchaseCost: 250,
    salePrice: 350,
    hsnSac: '9405',
    gst: 18,
    mrp: 500,
    description: 'Portable LED light with NP F750 battery and remote.',
    minStock: 20,
    leadTimeDays: 5,
    tags: ['Retail', 'Lighting']
  },
  Manufacturing: {
    name: 'Steel Bracket Assembly',
    code: 'ASM-204',
    prevCode: 'ASM-199',
    category: 'Assembly',
    industry: 'Manufacturers',
    subCategory: 'Bracket',
    batchType: 'No, Non-expirable',
    qty: 50,
    unit: 'no.s',
    importance: 'High',
    types: ['Assemblies', 'Materials'],
    stdCost: 120,
    purchaseCost: 140,
    salePrice: 220,
    hsnSac: '7326',
    gst: 18,
    description: 'Bracket sub-assembly with fasteners bundled.',
    minStock: 80,
    leadTimeDays: 10,
    tags: ['Plant', 'WIP']
  },
  Pharmaceutical: {
    name: 'Amoxicillin 250mg',
    code: 'AMX-250',
    category: 'Medicine',
    industry: 'Pharma',
    subCategory: 'Capsule',
    batchType: 'Yes, Expirable',
    qty: 100,
    unit: 'no.s',
    importance: 'Critical',
    types: ['Products'],
    stdCost: 35,
    purchaseCost: 40,
    salePrice: 60,
    hsnSac: '3004',
    gst: 12,
    description: 'Blister strips; maintain FEFO with batch tracking.',
    minStock: 120,
    leadTimeDays: 7,
    tags: ['Pharma', 'Batch']
  }
};

@Injectable({ providedIn: 'root' })
export class TemplateStore {
  private readonly custom = signal<{ name: string; data: TemplatePayload }[]>([]);

  baseTemplateNames = () => Object.keys(BASE_TEMPLATES);
  customTemplateNames = () => this.custom().map(t => t.name);

  getTemplate(name: string) {
    return BASE_TEMPLATES[name] ?? this.custom().find(t => t.name === name)?.data ?? null;
  }

  addCustomTemplate(name: string, data: TemplatePayload) {
    const existing = this.custom().filter(t => t.name !== name);
    this.custom.set([...existing, { name, data }]);
  }
}
