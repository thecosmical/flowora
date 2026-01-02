import { StockRow } from './inventory.models';

export const STOCK: StockRow[] = [
{ itemId: 'IT-1', locationId: 'LOC-1', batchId: 'B-1', qty: 60 },
{ itemId: 'IT-1', locationId: 'LOC-1', batchId: 'B-2', qty: 10 },
{ itemId: 'IT-1', locationId: 'LOC-3', batchId: 'B-1', qty: 40 },

{ itemId: 'IT-2', locationId: 'LOC-2', batchId: 'B-3', qty: 18 },
{ itemId: 'IT-2', locationId: 'LOC-2', batchId: 'B-4', qty: 6 },

{ itemId: 'IT-3', locationId: 'LOC-1', batchId: 'B-5', qty: 120 },
{ itemId: 'IT-3', locationId: 'LOC-3', batchId: 'B-5', qty: 90 },

{ itemId: 'IT-4', locationId: 'LOC-1', batchId: 'B-5', qty: 10 },

{ itemId: 'IT-5', locationId: 'LOC-4', batchId: 'B-6', qty: 8 },
{ itemId: 'IT-5', locationId: 'LOC-4', batchId: 'B-7', qty: 14 },

{ itemId: 'IT-6', locationId: 'LOC-2', batchId: 'B-8', qty: 22 },
{ itemId: 'IT-6', locationId: 'LOC-2', batchId: 'B-9', qty: 70 }
];
