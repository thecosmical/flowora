import { Movement } from './inventory.models';

const iso = (d: Date) => d.toISOString();

export const MOVEMENTS: Movement[] = [
{
id: 'M-1',
type: 'PURCHASE_IN',
itemId: 'IT-1',
batchId: 'B-1',
qty: 100,
toLocationId: 'LOC-1',
performedBy: 'operator@flowora',
occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 5))
  },
  {
    id: 'M-2',
    type: 'TRANSFER',
    itemId: 'IT-1',
    batchId: 'B-1',
    qty: 40,
    fromLocationId: 'LOC-1',
    toLocationId: 'LOC-3',
    performedBy: 'operator@flowora',
    occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3))
  },
  {
    id: 'M-3',
    type: 'CONSUMPTION',
    itemId: 'IT-5',
    batchId: 'B-6',
    qty: 4,
    fromLocationId: 'LOC-4',
    performedBy: 'kitchen@flowora',
    occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 12))
  },
  {
    id: 'M-4',
    type: 'WASTAGE',
    itemId: 'IT-2',
    batchId: 'B-4',
    qty: 2,
    fromLocationId: 'LOC-2',
    reasonCode: 'EXPIRED',
    performedBy: 'manager@flowora',
    occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 6))
  }
];
