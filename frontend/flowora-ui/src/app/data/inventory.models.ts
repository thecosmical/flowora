export type TrackingType = 'BATCH_EXPIRY';
export type Status = 'ACTIVE' | 'INACTIVE';

export type LocationType = 'WAREHOUSE' | 'STORE' | 'KITCHEN' | 'PLANT' | 'OTHER';

export type Item = {
id: string;
sku: string;
name: string;
category: string;
industry?: string;
subCategory?: string;
prevCode?: string;
uom: string;
trackingType: TrackingType;
status: Status;
hsnSac?: string;
reorderMinQty?: number;
reorderQty?: number;
safetyStockByLocation?: Record<string, number>;
shelfLifeDays?: number;
batchType?: string;
importance?: string;
types?: string[];
internalManufacturing?: boolean;
purchase?: boolean;
stdCost?: number;
purchaseCost?: number;
salePrice?: number;
gst?: number;
mrp?: number;
description?: string;
internalNotes?: string;
leadTimeDays?: number;
tags?: string[];
};

export type Product = {
  id: string;
  name: string;
  sku: string;
  status: Status;
  uom: string;
  category: string;
  description?: string;
};

export type Location = {
id: string;
name: string;
type: LocationType;
status: Status;
};

export type Batch = {
id: string;
itemId: string;
batchNumber: string;
expiryDate: string;
qaStatus?: 'PASS' | 'HOLD' | 'REJECT';
};

export type StockRow = {
itemId: string;
locationId: string;
batchId: string;
qty: number;
onHold?: number;
};

export type MovementType =
| 'PURCHASE_IN'
| 'TRANSFER'
| 'CONSUMPTION'
| 'WASTAGE'
| 'ADJUSTMENT';

export type ReasonCode =
| 'EXPIRED'
| 'DAMAGED'
| 'SPILLAGE'
| 'LOST'
| 'COUNT_CORRECTION'
| 'OTHER';

export type Movement = {
id: string;
type: MovementType;
itemId: string;
batchId: string;
qty: number;
fromLocationId?: string;
toLocationId?: string;
reasonCode?: ReasonCode;
refType?: string;
refId?: string;
performedBy: string;
occurredAt: string;
};
