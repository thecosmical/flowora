import { PurchaseRequest } from './purchase.models';

export const PURCHASE_REQUESTS: PurchaseRequest[] = [
  {
    id: 'PRQ-2401-001',
    poNumber: 'PO-FLOW-1201',
    rfqRef: 'RFQ-STEEL-315',
    supplierId: 'SUP-NORTHWIND',
    supplier: 'Northwind Metals',
    contact: 'Priya Menon',
    contactEmail: 'priya@northwind.in',
    contactPhone: '+91 98111 22233',
    branch: 'Haridwar Plant',
    buyer: 'Ananya (Procurement)',
    category: 'Steel & Fabrication',
    status: 'PENDING',
    orderedOn: '2025-01-03',
    expectedOn: '2025-01-10',
    taxableValue: 44200,
    totalValue: 52256,
    currency: 'INR',
    createdBy: 'Tarun (CEO)',
    tags: ['RFQ award', 'Time-critical'],
    notes: 'Best landed cost after RFQ; include QA sample coupon.',
    lines: [
      { sku: 'IT-STEEL-315', name: 'Steel Coil IS 2062 (3.15mm)', qty: 1200, uom: 'kg', rate: 36.8, taxRate: 18 },
      { sku: 'IT-FOOT-RING', name: 'Foot Ring - LPG 15kg', qty: 200, uom: 'pcs', rate: 58, taxRate: 18 }
    ]
  },
  {
    id: 'PRQ-2401-002',
    poNumber: 'PO-FLOW-1202',
    rfqRef: 'RFQ-VALVES-LOT24',
    supplierId: 'SUP-VALVEWORKS',
    supplier: 'ValveWorks India',
    contact: 'Harshad Kulkarni',
    contactEmail: 'harshad@valveworks.in',
    contactPhone: '+91 98765 99110',
    branch: 'Dehradun Consolidation',
    buyer: 'Rhea (Ops)',
    category: 'Valves & Safety',
    status: 'ORDERED',
    orderedOn: '2025-01-02',
    expectedOn: '2025-01-09',
    taxableValue: 28800,
    totalValue: 33984,
    currency: 'INR',
    createdBy: 'Rhea (Ops)',
    tags: ['RFQ follow-up', 'QA 10%'],
    notes: 'Advance released. Keep QA sample ready for day-1.',
    lines: [
      { sku: 'IT-VALVE-SET', name: 'Valve + Bung Set', qty: 180, uom: 'sets', rate: 160, taxRate: 18 }
    ]
  },
  {
    id: 'PRQ-2401-003',
    poNumber: 'PO-FLOW-1203',
    rfqRef: 'RFQ-COAT-GRAY',
    supplierId: 'SUP-AERON',
    supplier: 'Aeron Coatings',
    contact: 'Maya Jacob',
    contactEmail: 'maya@aeroncoats.com',
    contactPhone: '+91 98990 12004',
    branch: 'Haridwar Plant',
    buyer: 'Tarun (CEO)',
    category: 'Paints & Consumables',
    status: 'INBOUND',
    orderedOn: '2024-12-28',
    expectedOn: '2025-01-04',
    taxableValue: 18600,
    totalValue: 21948,
    currency: 'INR',
    createdBy: 'Tarun (CEO)',
    tags: ['Expedite', 'Coating'],
    notes: 'Hold final payment until adhesion test passes.',
    lines: [
      { sku: 'IT-PAINT-GRAY', name: 'Epoxy Grey Top Coat (RAL 7037)', qty: 120, uom: 'litre', rate: 155, taxRate: 18 }
    ]
  }
];
