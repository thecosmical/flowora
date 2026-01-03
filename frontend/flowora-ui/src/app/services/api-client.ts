import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';
import inventoryMock from '../data/api/inventory.json';
import requestsMock from '../data/api/requests.json';
import tasksMock from '../data/api/tasks.json';
import auditMock from '../data/api/audit.json';
import rolesMock from '../data/api/roles.json';
import { API_CONFIG, ApiConfig } from './api-config';
import { Batch, Item, Location, Movement, Status, StockRow } from '../data/inventory.models';
import { ApprovalRule, ConsumptionEvent, ProductionRequest, ProductionRequestLine, RequestType } from '../data/request.models';
import { AuditLog } from './audit-store';
import { TaskStatus } from './decision-store';

export type InventoryResponse = {
  items: Item[];
  batches: Batch[];
  stock: StockRow[];
  locations: Location[];
  movements: Movement[];
};

export type RequestsResponse = {
  products: {
    id: string;
    name: string;
    sku: string;
    status: Status;
    uom: string;
    category: string;
    description?: string;
  }[];
  requests: ProductionRequest[];
  lines: ProductionRequestLine[];
  events: ConsumptionEvent[];
  approvalRules: ApprovalRule[];
};

export type TasksResponse = {
  tasks: {
    id: string;
    itemId: string;
    title: string;
    qty: number;
    status: TaskStatus;
    dueDate: string;
    createdAt: string;
    assignee?: string;
    reason?: string;
    category?: string;
    requestId?: string;
  }[];
};

export type AuditResponse = { entries: AuditLog[] };

export type RolesResponse = {
  roles: {
    id: string;
    name: string;
    description?: string;
    permissions?: string[];
  }[];
  industries: { id: string; name: string }[];
};

const clone = <T>(data: T): T => JSON.parse(JSON.stringify(data));

@Injectable({ providedIn: 'root' })
export class ApiClientService {
  constructor(private readonly http: HttpClient, @Inject(API_CONFIG) private readonly config: ApiConfig) {}

  private headers() {
    let h = new HttpHeaders({ 'Content-Type': 'application/json' });
    if (this.config.auth?.username && this.config.auth?.password) {
      const token = btoa(`${this.config.auth.username}:${this.config.auth.password}`);
      h = h.set('Authorization', `Basic ${token}`);
    }
    return h;
  }

  private url(path: string) {
    const base = this.config.baseUrl?.replace(/\/$/, '') ?? 'http://localhost:8080';
    return `${base}${path.startsWith('/') ? path : `/${path}`}`;
  }

  private mock<T>(payload: T): Observable<T> {
    return of(clone(payload)).pipe(delay(30));
  }

  listInventory(): Observable<InventoryResponse> {
    if (this.config.useMock) return this.mock(inventoryMock as unknown as InventoryResponse);
    return this.http.get<InventoryResponse>(this.url('/api/inventory'), { headers: this.headers() });
  }

  createSku(payload: Partial<Item>): Observable<{ id: string }> {
    if (this.config.useMock) {
      return this.mock({ id: payload.id ?? 'SKU-MOCK-' + Date.now() });
    }
    return this.http.post<{ id: string }>(this.url('/api/inventory'), payload, { headers: this.headers() });
  }

  listRequests(): Observable<RequestsResponse> {
    if (this.config.useMock) return this.mock(requestsMock as RequestsResponse);
    return this.http.get<RequestsResponse>(this.url('/api/requests'), { headers: this.headers() });
  }

  createRequest(payload: {
    productId: string;
    type: RequestType;
    requestedBy: string;
    requestedByRole: string;
    approvers: string[];
    lines: { itemId: string; qty: number; reason?: string }[];
  }): Observable<{ id: string }> {
    if (this.config.useMock) {
      return this.mock({ id: `REQ-MOCK-${Date.now()}` });
    }
    return this.http.post<{ id: string }>(this.url('/api/requests'), payload, { headers: this.headers() });
  }

  approveRequest(requestId: string, payload: { by: string; role: string; comment?: string }): Observable<void> {
    if (this.config.useMock) return this.mock(void 0);
    return this.http.post<void>(this.url(`/api/requests/${requestId}/approve`), payload, { headers: this.headers() });
  }

  rejectRequest(requestId: string, payload: { by: string; role: string; comment?: string }): Observable<void> {
    if (this.config.useMock) return this.mock(void 0);
    return this.http.post<void>(this.url(`/api/requests/${requestId}/reject`), payload, { headers: this.headers() });
  }

  listTasks(): Observable<TasksResponse> {
    if (this.config.useMock) return this.mock(tasksMock as TasksResponse);
    return this.http.get<TasksResponse>(this.url('/api/tasks'), { headers: this.headers() });
  }

  updateTaskStatus(taskId: string, payload: { status: TaskStatus; reason?: string }): Observable<void> {
    if (this.config.useMock) return this.mock(void 0);
    return this.http.patch<void>(this.url(`/api/tasks/${taskId}`), payload, { headers: this.headers() });
  }

  listAudit(): Observable<AuditResponse> {
    if (this.config.useMock) return this.mock(auditMock as AuditResponse);
    return this.http.get<AuditResponse>(this.url('/api/audit'), { headers: this.headers() });
  }

  listRoles(): Observable<RolesResponse> {
    if (this.config.useMock) return this.mock(rolesMock as RolesResponse);
    return this.http.get<RolesResponse>(this.url('/api/roles'), { headers: this.headers() });
  }
}
