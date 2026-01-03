import { Item } from './inventory.models';

export type SupplierAddress = {
  id: string;
  line1: string;
  city: string;
  state: string;
  country: string;
  gstin?: string;
};

export type Supplier = {
  id: string;
  name: string;
  contact: string;
  phone?: string;
  email?: string;
  addresses: SupplierAddress[];
  gstin?: string;
  linkedItems: Pick<Item, 'id' | 'name' | 'sku' | 'hsnSac' | 'uom'>[];
  quotes?: { itemId: string; price: number; leadDays: number }[];
  partnerType?: string;
};

export const SUPPLIERS: Supplier[] = [
  {
    id: 'SUP-NORTHWIND',
    name: 'Northwind Metals',
    contact: 'Priya Menon',
    phone: '+91 98111 22233',
    email: 'priya@northwind.in',
    gstin: '22AAAAA0000A1Z5',
    addresses: [
      { id: 'ADDR-NW-1', line1: 'Haridwar Plant Gate', city: 'Haridwar', state: 'Uttarakhand', country: 'India', gstin: '22AAAAA0000A1Z5' }
    ],
    linkedItems: [
      { id: 'IT-STEEL-315', name: 'Steel Coil IS 2062 (3.15mm)', sku: 'STL-315-COIL', hsnSac: '7208', uom: 'KG' }
    ],
    quotes: [
      { itemId: 'IT-STEEL-315', price: 36.8, leadDays: 6 }
    ],
    partnerType: 'Supplier'
  },
  {
    id: 'SUP-VALVEWORKS',
    name: 'ValveWorks India',
    contact: 'Harshad Kulkarni',
    phone: '+91 98765 99110',
    email: 'harshad@valveworks.in',
    gstin: '23BBBBB1111B2Z6',
    addresses: [
      { id: 'ADDR-VW-1', line1: 'Pune Industrial Area', city: 'Pune', state: 'Maharashtra', country: 'India', gstin: '23BBBBB1111B2Z6' }
    ],
    linkedItems: [
      { id: 'IT-VALVE-SET', name: 'Valve + Bung Set', sku: 'VLV-BNG-SET', hsnSac: '8481', uom: 'SET' }
    ],
    quotes: [
      { itemId: 'IT-VALVE-SET', price: 160, leadDays: 7 }
    ],
    partnerType: 'Supplier'
  }
];
