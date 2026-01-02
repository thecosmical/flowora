export type TrackingType = 'BATCH_EXPIRY';
export type Status = 'ACTIVE' | 'INACTIVE';

export type LocationType = 'WAREHOUSE' | 'STORE' | 'KITCHEN' | 'PLANT' | 'OTHER';

export type Item = {
id: string;
sku: string;
name: string;
category: string;
uom: string;
trackingType: TrackingType;
status: Status;
reorderMinQty?: number;
reorderQty?: number;
shelfLifeDays?: number;
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
};

export type StockRow = {
itemId: string;
locationId: string;
batchId: string;
qty: number;
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
