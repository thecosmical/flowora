export type RequestType = 'PURCHASE' | 'ISSUE';
export type RequestStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CLOSED';
export type ConsumptionKind = 'USED' | 'RETURNED' | 'REJECTED';
export type UserRole = 'OPS_MANAGER' | 'CEO' | 'PROCUREMENT';

export type Approval = {
  by: string;
  role: UserRole;
  at: string;
  comment?: string;
};

export type Attachment = {
  id: string;
  name: string;
  url?: string;
};

export type ProductionRequest = {
  id: string;
  productId: string;
  type: RequestType;
  requestedBy: string;
  requestedByRole: UserRole;
  approvers: string[];
  approvedBy?: string[];
  status: RequestStatus;
  targetQty: number;
  createdAt: string;
  approvedAt?: string;
  closedAt?: string;
  docs?: Attachment[];
  approvals?: Approval[];
};

export type ProductionRequestLine = {
  requestId: string;
  itemId: string;
  requestedQty: number;
  approvedQty: number;
  usedQty: number;
  returnedQty: number;
  rejectedQty: number;
  reason?: string;
  notes?: string;
};

export type ConsumptionEvent = {
  id: string;
  requestId: string;
  itemId: string;
  kind: ConsumptionKind;
  qty: number;
  reason?: string;
  by: string;
  at: string;
};
