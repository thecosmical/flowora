export type PurchaseStatus = 'DRAFT' | 'PENDING' | 'ORDERED' | 'INBOUND' | 'RECEIVED' | 'CANCELLED';

export type PurchaseLine = {
  sku: string;
  name: string;
  qty: number;
  uom: string;
  rate: number;
  taxRate?: number;
  discount?: number;
  hsn?: string;
};

export type PurchaseRequest = {
  id: string;
  poNumber: string;
  rfqRef?: string;
  supplierId?: string;
  supplier: string;
  contact: string;
  contactEmail?: string;
  contactPhone?: string;
  branch: string;
  buyer: string;
  category?: string;
  status: PurchaseStatus;
  orderedOn: string;
  expectedOn: string;
  taxableValue: number;
  totalValue: number;
  currency?: string;
  createdBy: string;
  reference?: string;
  tags?: string[];
  notes?: string;
  lines: PurchaseLine[];
};
