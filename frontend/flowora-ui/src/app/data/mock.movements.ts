import { Movement } from './inventory.models';

const iso = (d: Date) => d.toISOString();

export const MOVEMENTS: Movement[] = [
{
    id: 'M-1',
    type: 'PURCHASE_IN',
    itemId: 'IT-STEEL-315',
    batchId: 'B-STL-01',
    qty: 3200,
    toLocationId: 'LOC-1',
    performedBy: 'store@vansh',
    occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 12))
  },
  {
    id: 'M-2',
    type: 'TRANSFER',
    itemId: 'IT-VALVE-SET',
    batchId: 'B-VLV-01',
    qty: 200,
    fromLocationId: 'LOC-1',
    toLocationId: 'LOC-2',
    performedBy: 'shiftlead@vansh',
    occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 8))
  },
  {
    id: 'M-3',
    type: 'CONSUMPTION',
    itemId: 'IT-WELD-12',
    batchId: 'B-WELD-01',
    qty: 80,
    fromLocationId: 'LOC-1',
    performedBy: 'ops@vansh',
    occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24 * 3))
  },
  {
    id: 'M-4',
    type: 'WASTAGE',
    itemId: 'IT-PAINT-RED',
    batchId: 'B-PNT-02',
    qty: 10,
    fromLocationId: 'LOC-3',
    reasonCode: 'EXPIRED',
    performedBy: 'qa@vansh',
    occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 24))
  },
  {
    id: 'M-5',
    type: 'ADJUSTMENT',
    itemId: 'IT-HYDRO-PLUG',
    batchId: 'B-HYD-01',
    qty: 5,
    fromLocationId: 'LOC-3',
    toLocationId: 'LOC-4',
    performedBy: 'qa@vansh',
    occurredAt: iso(new Date(Date.now() - 1000 * 60 * 60 * 3))
  }
];
