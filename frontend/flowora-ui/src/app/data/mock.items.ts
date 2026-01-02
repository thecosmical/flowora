import { Item } from './inventory.models';

export const ITEMS: Item[] = [
{
id: 'IT-1',
sku: 'GLV-01',
name: 'Safety Gloves',
category: 'PPE',
uom: 'PAIR',
trackingType: 'BATCH_EXPIRY',
status: 'ACTIVE',
hsnSac: '6116',
reorderMinQty: 80,
reorderQty: 200
},
{
id: 'IT-2',
sku: 'CLN-19',
name: 'Industrial Cleaner',
category: 'CHEMICAL',
uom: 'L',
trackingType: 'BATCH_EXPIRY',
status: 'ACTIVE',
hsnSac: '3402',
reorderMinQty: 30,
reorderQty: 100
},
{
id: 'IT-3',
sku: 'TAP-07',
name: 'Packing Tape',
category: 'PACKAGING',
uom: 'ROLL',
trackingType: 'BATCH_EXPIRY',
status: 'ACTIVE',
hsnSac: '4811',
reorderMinQty: 150,
reorderQty: 500
},
{
id: 'IT-4',
sku: 'PPR-33',
name: 'Label Printer Paper',
category: 'STATIONERY',
uom: 'ROLL',
trackingType: 'BATCH_EXPIRY',
status: 'INACTIVE',
hsnSac: '4821',
reorderMinQty: 50,
reorderQty: 150
},
{
id: 'IT-5',
sku: 'MLK-1L',
name: 'Milk 1L (Restaurant)',
    category: 'DAIRY',
    uom: 'L',
    trackingType: 'BATCH_EXPIRY',
    status: 'ACTIVE',
    hsnSac: '0401',
    reorderMinQty: 20,
    reorderQty: 60
  },
  {
    id: 'IT-6',
    sku: 'AMX-250',
    name: 'Amoxicillin 250mg (Pharma)',
    category: 'MEDICINE',
    uom: 'STRIP',
    trackingType: 'BATCH_EXPIRY',
    status: 'ACTIVE',
    hsnSac: '3004',
    reorderMinQty: 40,
    reorderQty: 120
  }
];
