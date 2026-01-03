import { StockRow } from './inventory.models';

export const STOCK: StockRow[] = [
  { itemId: 'IT-STEEL-315', locationId: 'LOC-1', batchId: 'B-STL-01', qty: 3200 },
  { itemId: 'IT-STEEL-315', locationId: 'LOC-2', batchId: 'B-STL-02', qty: 2100 },

  { itemId: 'IT-FOOT-RING', locationId: 'LOC-1', batchId: 'B-FR-01', qty: 420 },
  { itemId: 'IT-FOOT-RING', locationId: 'LOC-2', batchId: 'B-FR-02', qty: 260 },

  { itemId: 'IT-VALVE-SET', locationId: 'LOC-1', batchId: 'B-VLV-01', qty: 650 },
  { itemId: 'IT-VALVE-SET', locationId: 'LOC-2', batchId: 'B-VLV-02', qty: 420 },

  { itemId: 'IT-GUARD-RING', locationId: 'LOC-1', batchId: 'B-GRD-01', qty: 380 },
  { itemId: 'IT-RING-SHOULDER', locationId: 'LOC-1', batchId: 'B-SHL-01', qty: 310 },

  { itemId: 'IT-WELD-12', locationId: 'LOC-1', batchId: 'B-WELD-01', qty: 540 },
  { itemId: 'IT-WELD-12', locationId: 'LOC-2', batchId: 'B-WELD-02', qty: 360 },

  { itemId: 'IT-PAINT-GRAY', locationId: 'LOC-3', batchId: 'B-PNT-01', qty: 220 },
  { itemId: 'IT-PAINT-RED', locationId: 'LOC-3', batchId: 'B-PNT-02', qty: 0 },

  { itemId: 'IT-NAME-PLATE', locationId: 'LOC-1', batchId: 'B-NP-01', qty: 900 },
  { itemId: 'IT-HYDRO-PLUG', locationId: 'LOC-3', batchId: 'B-HYD-01', qty: 60 },

  { itemId: 'FG-OXY-10L', locationId: 'LOC-1', batchId: 'B-FG-OXY10-01', qty: 500 },
  { itemId: 'FG-OXY-40L', locationId: 'LOC-1', batchId: 'B-FG-OXY40-01', qty: 180 },
  { itemId: 'FG-CO2-4KG', locationId: 'LOC-2', batchId: 'B-FG-CO2-01', qty: 260 },
  { itemId: 'FG-OXY-15L-OLD', locationId: 'LOC-2', batchId: 'B-FG-OXY15-OLD', qty: 60 },
  { itemId: 'FG-EXT-6KG-OUT', locationId: 'LOC-2', batchId: 'B-FG-CO2-6KG', qty: 0 }
];
