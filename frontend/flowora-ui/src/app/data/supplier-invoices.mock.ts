export type SupplierInvoiceLine = {
  sku: string;
  name: string;
  qty: number;
  uom: string;
  rate: number;
  taxRate: number;
  discount?: number;
  hsn?: string;
};

export type SupplierInvoice = {
  id: string;
  supplierId: string;
  supplier: string;
  contact: string;
  contactPhone?: string;
  branch: string;
  invoiceNo: string;
  invoiceDate: string;
  creditMonth: string;
  taxable: number;
  total: number;
  purchaseOrderId?: string;
  purchaseOrderRef?: string;
  status: 'AWAITING_GRN' | 'READY_FOR_PAYMENT' | 'PAID';
  owner: string;
  notes?: string;
  lines: SupplierInvoiceLine[];
};

export const SUPPLIER_INVOICES: SupplierInvoice[] = [
  {
    id: 'INV-STEEL-001',
    supplierId: 'SUP-NORTHWIND',
    supplier: 'Northwind Metals',
    contact: 'Priya Menon',
    contactPhone: '+91 98111 22233',
    branch: 'Haridwar Plant',
    invoiceNo: 'INV-422',
    invoiceDate: '2026-01-06',
    creditMonth: 'Jan 2026',
    taxable: 1500,
    total: 1770,
    purchaseOrderId: 'PO-FLOW-1201',
    purchaseOrderRef: 'RFQ-STEEL-315',
    status: 'READY_FOR_PAYMENT',
    owner: 'Ananya (Procurement)',
    notes: 'QA sample cleared, ready for payment.',
    lines: [
      { sku: 'IT-STEEL-315', name: 'Steel Coil IS 2062 (3.15mm)', qty: 30, uom: 'kg', rate: 50, taxRate: 18, hsn: '7208' }
    ]
  },
  {
    id: 'INV-VALVE-002',
    supplierId: 'SUP-VALVEWORKS',
    supplier: 'ValveWorks India',
    contact: 'Harshad Kulkarni',
    contactPhone: '+91 98765 99110',
    branch: 'Dehradun Consolidation',
    invoiceNo: 'VAL-552',
    invoiceDate: '2026-01-05',
    creditMonth: 'Jan 2026',
    taxable: 28800,
    total: 33984,
    purchaseOrderId: 'PO-FLOW-1202',
    purchaseOrderRef: 'RFQ-VALVES-LOT24',
    status: 'AWAITING_GRN',
    owner: 'Rhea (Ops)',
    notes: 'Hold payment until GRN posted.',
    lines: [
      { sku: 'IT-VALVE-SET', name: 'Valve + Bung Set', qty: 180, uom: 'sets', rate: 160, taxRate: 18, hsn: '8481' }
    ]
  },
  {
    id: 'INV-COAT-003',
    supplierId: 'SUP-AERON',
    supplier: 'Aeron Coatings',
    contact: 'Maya Jacob',
    contactPhone: '+91 98990 12004',
    branch: 'Haridwar Plant',
    invoiceNo: 'AER-901',
    invoiceDate: '2026-01-04',
    creditMonth: 'Jan 2026',
    taxable: 18600,
    total: 21948,
    purchaseOrderId: 'PO-FLOW-1203',
    purchaseOrderRef: 'RFQ-COAT-GRAY',
    status: 'PAID',
    owner: 'Tarun (CEO)',
    notes: 'Payment cleared; retain sample for adhesion test.',
    lines: [
      { sku: 'IT-PAINT-GRAY', name: 'Epoxy Grey Top Coat (RAL 7037)', qty: 120, uom: 'litre', rate: 155, taxRate: 18, hsn: '3208' }
    ]
  }
];
