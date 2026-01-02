import { Batch } from './inventory.models';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => {
const d = new Date();
d.setDate(d.getDate() + n);
  return iso(d);
};

export const BATCHES: Batch[] = [
  { id: 'B-1', itemId: 'IT-1', batchNumber: 'GLO-2409', expiryDate: addDays(120) },
  { id: 'B-2', itemId: 'IT-1', batchNumber: 'GLO-2410', expiryDate: addDays(20) },

  { id: 'B-3', itemId: 'IT-2', batchNumber: 'CLN-882', expiryDate: addDays(60) },
  { id: 'B-4', itemId: 'IT-2', batchNumber: 'CLN-883', expiryDate: addDays(-2) },

  { id: 'B-5', itemId: 'IT-3', batchNumber: 'TAP-771', expiryDate: addDays(200) },

  { id: 'B-6', itemId: 'IT-5', batchNumber: 'MLK-0901', expiryDate: addDays(3) },
  { id: 'B-7', itemId: 'IT-5', batchNumber: 'MLK-0902', expiryDate: addDays(7) },

  { id: 'B-8', itemId: 'IT-6', batchNumber: 'AMX-17A', expiryDate: addDays(15) },
  { id: 'B-9', itemId: 'IT-6', batchNumber: 'AMX-17B', expiryDate: addDays(90) }
];
