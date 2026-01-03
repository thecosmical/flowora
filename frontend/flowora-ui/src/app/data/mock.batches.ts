import { Batch } from './inventory.models';

const iso = (d: Date) => d.toISOString().slice(0, 10);
const addDays = (n: number) => {
const d = new Date();
d.setDate(d.getDate() + n);
  return iso(d);
};

export const BATCHES: Batch[] = [
  { id: 'B-STL-01', itemId: 'IT-STEEL-315', batchNumber: 'STL-315-SEP', expiryDate: addDays(365) },
  { id: 'B-STL-02', itemId: 'IT-STEEL-315', batchNumber: 'STL-315-OCT', expiryDate: addDays(420) },

  { id: 'B-FR-01', itemId: 'IT-FOOT-RING', batchNumber: 'FR-2409', expiryDate: addDays(520) },
  { id: 'B-FR-02', itemId: 'IT-FOOT-RING', batchNumber: 'FR-2410', expiryDate: addDays(580) },

  { id: 'B-VLV-01', itemId: 'IT-VALVE-SET', batchNumber: 'VLV-ISI-2408', expiryDate: addDays(260) },
  { id: 'B-VLV-02', itemId: 'IT-VALVE-SET', batchNumber: 'VLV-ISI-2409', expiryDate: addDays(320) },

  { id: 'B-GRD-01', itemId: 'IT-GUARD-RING', batchNumber: 'GRD-2407', expiryDate: addDays(400) },
  { id: 'B-SHL-01', itemId: 'IT-RING-SHOULDER', batchNumber: 'SHL-2408', expiryDate: addDays(480) },

  { id: 'B-WELD-01', itemId: 'IT-WELD-12', batchNumber: 'WELD-12-2408', expiryDate: addDays(300) },
  { id: 'B-WELD-02', itemId: 'IT-WELD-12', batchNumber: 'WELD-12-2409', expiryDate: addDays(330) },

  { id: 'B-PNT-01', itemId: 'IT-PAINT-GRAY', batchNumber: 'PRMR-GRY-2409', expiryDate: addDays(180) },
  { id: 'B-PNT-02', itemId: 'IT-PAINT-RED', batchNumber: 'TOP-RED-2409', expiryDate: addDays(150) },

  { id: 'B-NP-01', itemId: 'IT-NAME-PLATE', batchNumber: 'NP-2409', expiryDate: addDays(720) },
  { id: 'B-HYD-01', itemId: 'IT-HYDRO-PLUG', batchNumber: 'HYD-PLUG-2408', expiryDate: addDays(90) },

  { id: 'B-FG-OXY10-01', itemId: 'FG-OXY-10L', batchNumber: 'OXY-10-FG-2409', expiryDate: addDays(540) },
  { id: 'B-FG-OXY40-01', itemId: 'FG-OXY-40L', batchNumber: 'OXY-40-FG-2409', expiryDate: addDays(540) },
  { id: 'B-FG-CO2-01', itemId: 'FG-CO2-4KG', batchNumber: 'CO2-FG-2409', expiryDate: addDays(420) },
  { id: 'B-FG-OXY15-OLD', itemId: 'FG-OXY-15L-OLD', batchNumber: 'OXY-15-FG-2401', expiryDate: addDays(-90) },
  { id: 'B-FG-CO2-6KG', itemId: 'FG-EXT-6KG-OUT', batchNumber: 'CO2-6KG-2409', expiryDate: addDays(360) }
];
