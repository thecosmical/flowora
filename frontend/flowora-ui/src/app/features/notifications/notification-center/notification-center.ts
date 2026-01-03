import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecisionStore, TaskStatus } from '../../../services/decision-store';
import { InventoryStore } from '../../../services/inventory-store';
import { RequestStore } from '../../../services/request-store';
import { MessagingStore } from '../../../services/messaging-store';
import { UserContextService } from '../../../services/user-context';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss'
})
export class NotificationCenterComponent {
  private readonly decisions = inject(DecisionStore);
  private readonly inventory = inject(InventoryStore);
  private readonly requests = inject(RequestStore);
  readonly messaging = inject(MessagingStore);
  private readonly userCtx = inject(UserContextService);

  readonly status = signal<TaskStatus | 'ALL'>('ALL');
  readonly openId = signal<string | null>(null);
  readonly rfqTaskId = signal<string | null>(null);
  readonly rfqChannel = signal<'SMS' | 'EMAIL'>('SMS');
  readonly rfqTemplate = signal<string>('');
  readonly rfqTo = signal<string>(''); // comma separated
  readonly rfqCc = signal<string>('');
  readonly rfqFrom = signal<string>('Tarun (CEO)');
  readonly rfqSubject = signal<string>('');
  readonly rfqBody = signal<string>('');
  readonly rfqTask = computed(() => this.tasks().find(t => t.id === this.rfqTaskId()) || null);
  readonly rfqRequest = computed(() => {
    const task = this.rfqTask();
    if (!task?.requestId) return null;
    return this.requests.requestById(task.requestId);
  });

  readonly tasks = computed(() =>
    this.decisions.tasksView()
      .filter(t => this.status() === 'ALL' ? true : t.status === this.status())
      .map(t => ({
        ...t,
        item: this.inventory.items().find(i => i.id === t.itemId),
        request: t.requestId ? this.requests.requestById(t.requestId) : null
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );

  toggle(id: string) {
    this.openId.set(this.openId() === id ? null : id);
  }

  action(id: string, status: TaskStatus) {
    this.decisions.updateTask(id, status);
  }

  openRfq(taskId: string, channel: 'SMS' | 'EMAIL') {
    this.rfqTaskId.set(taskId);
    this.rfqChannel.set(channel);
    const task = this.tasks().find(t => t.id === taskId);
    const req = task?.requestId ? this.requests.requestById(task.requestId) : null;
    const ctx = this.rfqContext(task);
    this.rfqTemplate.set(channel === 'SMS' ? 'RFQ_INVENTORY_SMS' : 'RFQ_INVENTORY_EMAIL');
    this.rfqTo.set(req?.requestedBy ?? '');
    this.rfqCc.set('');
    this.rfqFrom.set(this.userCtx.current().name);
    if (channel === 'EMAIL') {
      const tpl = this.messaging.emailTemplates()[0];
      if (tpl) {
        this.rfqSubject.set(this.messaging.render(tpl.subject, ctx));
        this.rfqBody.set(this.messaging.render(tpl.body, ctx));
      }
    } else {
      const tpl = this.messaging.smsTemplates()[0];
      if (tpl) {
        this.rfqSubject.set('');
        this.rfqBody.set(this.messaging.render(tpl.body, ctx));
      }
    }
  }

  rfqContext(task?: ReturnType<typeof this.tasks>[number]) {
    const req = task?.requestId ? this.requests.requestById(task.requestId) : null;
    return {
      itemName: task?.item?.name ?? task?.itemId ?? '',
      sku: task?.item?.sku ?? '',
      qty: task?.qty ?? '',
      requestId: req?.id ?? '',
      requester: req?.requestedBy ?? '',
      approver: this.userCtx.current().name,
      dueDate: task?.dueDate ?? ''
    };
  }

  applyTemplate(channel: 'SMS' | 'EMAIL') {
    const task = this.tasks().find(t => t.id === this.rfqTaskId());
    if (!task) return;
    const ctx = this.rfqContext(task);
    if (channel === 'SMS') {
      const tpl = this.messaging.smsTemplates().find(t => t.id === this.rfqTemplate()) ?? this.messaging.smsTemplates()[0];
      if (!tpl) return;
      this.rfqBody.set(this.messaging.render(tpl.body, ctx));
    } else {
      const tpl = this.messaging.emailTemplates().find(t => t.id === this.rfqTemplate()) ?? this.messaging.emailTemplates()[0];
      if (!tpl) return;
      this.rfqSubject.set(this.messaging.render(tpl.subject, ctx));
      this.rfqBody.set(this.messaging.render(tpl.body, ctx));
    }
  }

  sendRfq() {
    const task = this.rfqTask();
    if (!task) return;
    const ctx = this.rfqContext(task);
    const to = this.rfqTo().split(',').map(r => r.trim()).filter(Boolean);
    const cc = this.rfqCc().split(',').map(r => r.trim()).filter(Boolean);
    if (!to.length) return;

    if (this.rfqChannel() === 'SMS') {
      this.messaging.sendSms(to, this.rfqTemplate(), ctx);
    } else {
      this.messaging.sendEmail([...to, ...cc], this.rfqTemplate(), ctx);
    }
    this.rfqTaskId.set(null);
  }

  closeRfq() {
    this.rfqTaskId.set(null);
  }
}
