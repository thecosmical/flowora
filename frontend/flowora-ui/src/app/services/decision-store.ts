import { Injectable, effect, signal } from '@angular/core';
import { InventoryStore } from './inventory-store';
import { AuditStore } from './audit-store';

type DemandProfile = {
  monthly: number[];
  leadDays: number;
  unitCost: number;
  seasonality?: number; // multiplier
};

type Recommendation = {
  suggestedQty: number;
  risk: 'STOCKOUT' | 'OVERSTOCK' | 'BALANCED';
  costImpact: number;
  rationale: string;
};

type SimulationResult = {
  workingCapital: number;
  sellThroughDays: number;
  risk: 'LOW' | 'MEDIUM' | 'HIGH';
};

type DecisionLog = {
  id: string;
  itemId: string;
  action: string;
  qty: number;
  price: number;
  daysToArrive: number;
  at: string;
  note?: string;
};

export type TaskStatus = 'PENDING' | 'RECEIVED' | 'COMPLETED' | 'REJECTED' | 'BREACHED';

export type TaskCategory = 'INVENTORY_DISPATCH' | 'REPLENISHMENT' | 'LOW_STOCK' | 'GENERAL';

export type Task = {
  id: string;
  itemId: string;
  title: string;
  qty: number;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  assignee?: string;
  reason?: string;
  category?: TaskCategory;
  requestId?: string;
};

const DEMAND: Record<string, DemandProfile> = {
  'IT-STEEL-315': { monthly: [6000, 6400, 6200, 6500], leadDays: 14, unitCost: 62, seasonality: 1.08 },
  'IT-FOOT-RING': { monthly: [900, 950, 920, 980], leadDays: 10, unitCost: 185 },
  'IT-VALVE-SET': { monthly: [1200, 1300, 1250, 1350], leadDays: 12, unitCost: 145 },
  'IT-GUARD-RING': { monthly: [700, 740, 720, 760], leadDays: 9, unitCost: 95 },
  'IT-WELD-12': { monthly: [900, 950, 970, 990], leadDays: 7, unitCost: 210 },
  'IT-PAINT-GRAY': { monthly: [400, 420, 410, 430], leadDays: 8, unitCost: 380 },
  'IT-PAINT-RED': { monthly: [380, 400, 390, 420], leadDays: 8, unitCost: 410 },
  'IT-HYDRO-PLUG': { monthly: [80, 90, 85, 95], leadDays: 15, unitCost: 920 }
};

const seedTasks: Task[] = [
  {
    id: 'TASK-STEEL-SPLIT',
    itemId: 'IT-STEEL-315',
    title: 'Split coil STL-315 into blanks',
    qty: 1500,
    status: 'PENDING',
    dueDate: '2024-12-22',
    createdAt: '2024-12-18T10:00:00Z',
    assignee: 'Stores Team'
  },
  {
    id: 'TASK-QA-PLUG',
    itemId: 'IT-HYDRO-PLUG',
    title: 'Hydro plugs calibration & issue',
    qty: 10,
    status: 'BREACHED',
    dueDate: '2024-12-17',
    createdAt: '2024-12-15T08:00:00Z',
    assignee: 'QA Desk',
    reason: 'Awaiting water line clearance'
  },
  {
    id: 'TASK-VALVE-REC',
    itemId: 'IT-VALVE-SET',
    title: 'Receive valve+bung sets - QA sample 10%',
    qty: 200,
    status: 'RECEIVED',
    dueDate: '2024-12-25',
    createdAt: '2024-12-18T12:00:00Z',
    assignee: 'Maintenance'
  }
];

@Injectable({ providedIn: 'root' })
export class DecisionStore {
  constructor(private readonly inventory: InventoryStore, private readonly audit: AuditStore) {}
  private readonly logs = signal<DecisionLog[]>([]);
  private readonly tasks = signal<Task[]>(seedTasks);

  private readonly lowStockWatcher = effect(() => {
    // reacts to inventory signals to auto-create low stock alerts
    this.ensureLowStockTasks();
  });

  demandContext(itemId: string) {
    const prof = DEMAND[itemId] ?? { monthly: [50, 50, 50], leadDays: 7, unitCost: 100, seasonality: 1 };
    const avgMonthly = prof.monthly.reduce((a, b) => a + b, 0) / prof.monthly.length;
    return { avgMonthly, leadDays: prof.leadDays, bufferDays: 14 };
  }

  logsForItem = (itemId: string) => this.logs().filter(l => l.itemId === itemId);
  tasksView = this.tasks.asReadonly();

  recommendation(itemId: string, currentStock: number): Recommendation {
    const prof = DEMAND[itemId] ?? { monthly: [50, 50, 50], leadDays: 7, unitCost: 100, seasonality: 1 };
    const avgMonthly = prof.monthly.reduce((a, b) => a + b, 0) / prof.monthly.length;
    const avgDaily = avgMonthly / 30;
    const safetyBufferDays = 14;
    const targetDays = prof.leadDays + safetyBufferDays;
    const suggested = Math.max(0, Math.round(avgDaily * targetDays - currentStock));
    const costImpact = suggested * prof.unitCost;
    let risk: Recommendation['risk'] = 'BALANCED';
    if (suggested < avgDaily * 7) risk = 'STOCKOUT';
    if (suggested > avgDaily * 45) risk = 'OVERSTOCK';
    return {
      suggestedQty: suggested,
      risk,
      costImpact,
      rationale: `Past demand ~${avgMonthly.toFixed(1)}/mo • Lead ${prof.leadDays}d • Buffer ${safetyBufferDays}d to prevent line stops`
    };
  }

  simulate(itemId: string, params: { qty: number; price: number; leadTime: number; currentStock: number }): SimulationResult {
    const prof = DEMAND[itemId] ?? { monthly: [50, 50, 50], leadDays: 7, unitCost: 100, seasonality: 1 };
    const avgDaily = (prof.monthly.reduce((a, b) => a + b, 0) / prof.monthly.length) / 30;
    const workingCapital = params.qty * params.price;
    const sellThroughDays = avgDaily > 0 ? Math.round((params.qty + params.currentStock) / avgDaily) : 0;
    const risk: SimulationResult['risk'] =
      params.qty > avgDaily * 60 ? 'HIGH' : params.qty > avgDaily * 30 ? 'MEDIUM' : 'LOW';
    return { workingCapital, sellThroughDays, risk };
  }

  logDecision(itemId: string, action: string, qty: number, price: number, daysToArrive: number, note?: string) {
    this.logs.update(list => [
      {
        id: `LOG-${Date.now()}`,
        itemId,
        action,
        qty,
        price,
        daysToArrive,
        at: new Date().toISOString(),
        note
      },
      ...list
    ]);
  }

  defaultPrice(itemId: string) {
    return (DEMAND[itemId]?.unitCost ?? 100);
  }

  defaultLead(itemId: string) {
    return (DEMAND[itemId]?.leadDays ?? 7);
  }

  addTask(
    itemId: string,
    title: string,
    qty: number,
    daysToArrive: number,
    assignee?: string,
    options?: { category?: TaskCategory; requestId?: string; status?: TaskStatus }
  ) {
    const due = new Date();
    due.setDate(due.getDate() + daysToArrive);
    const task: Task = {
      id: `TASK-${Date.now()}`,
      itemId,
      title,
      qty,
      status: options?.status ?? 'PENDING',
      dueDate: due.toISOString().slice(0, 10),
      createdAt: new Date().toISOString(),
      assignee,
      category: options?.category,
      requestId: options?.requestId
    };
    this.tasks.update(list => [task, ...list]);
  }

  private ensureLowStockTasks() {
    const items = this.inventory.items();
    if (!items.length) return;

    const nowIso = new Date().toISOString();
    this.tasks.update(list => {
      const updated: Task[] = list.map(t => {
        if (t.category === 'LOW_STOCK') {
          const item = items.find(i => i.id === t.itemId);
          const min = item ? this.inventory.minForItemInScope(item) : 0;
          const qty = this.inventory.qtyForItemInScope(t.itemId);
          if (min > 0 && qty >= min && t.status !== 'COMPLETED') {
            return { ...t, status: 'COMPLETED' as TaskStatus, reason: 'Stock recovered' };
          }
        }
        return t;
      });

      const newTasks: Task[] = [];
      for (const item of items) {
        const min = this.inventory.minForItemInScope(item);
        const qty = this.inventory.qtyForItemInScope(item.id);
        const hasAlert = updated.some(
          t => t.category === 'LOW_STOCK' && t.itemId === item.id && t.status !== 'COMPLETED'
        );
        if (min > 0 && qty < min && !hasAlert) {
          newTasks.push({
            id: `LOW-${Date.now()}-${item.id}`,
            itemId: item.id,
            title: `Low stock: ${item.name} (Have ${qty}, Min ${min})`,
            qty: min,
            status: 'BREACHED',
            dueDate: nowIso.slice(0, 10),
            createdAt: nowIso,
            assignee: 'Tarun (CEO)',
            category: 'LOW_STOCK'
          });
        }
      }
      return [...newTasks, ...updated];
    });
  }

  updateTask(id: string, status: TaskStatus, reason?: string) {
    const task = this.tasks().find(t => t.id === id);
    if (!task) return;

    if (status === 'COMPLETED' && task.category !== 'INVENTORY_DISPATCH') {
      this.inventory.addStock(task.itemId, task.qty);
      const item = this.inventory.getItem(task.itemId);
      this.audit.add(
        'STOCK_UPDATE',
        task.itemId,
        `Added ${task.qty} to stock via task ${task.id}`,
        task.assignee,
        {
          itemId: task.itemId,
          itemName: item?.name,
          sku: item?.sku,
          hsn: item?.hsnSac,
          qty: task.qty,
          requester: task.assignee
        }
      );
    }

    this.tasks.update(list =>
      list.map(t => (t.id === id ? { ...t, status, reason } : t))
    );
    this.audit.add(
      'TASK_STATUS',
      task.itemId,
      `Task ${task.id} -> ${status}`,
      task.assignee,
      {
        itemId: task.itemId,
        itemName: this.inventory.getItem(task.itemId)?.name,
        sku: this.inventory.getItem(task.itemId)?.sku,
        hsn: this.inventory.getItem(task.itemId)?.hsnSac,
        qty: task.qty
      }
    );
  }
}
