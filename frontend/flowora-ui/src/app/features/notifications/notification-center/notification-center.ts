import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DecisionStore, TaskStatus } from '../../../services/decision-store';
import { InventoryStore } from '../../../services/inventory-store';
import { RequestStore } from '../../../services/request-store';

@Component({
  selector: 'app-notification-center',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-center.html',
  styleUrl: './notification-center.scss'
})
export class NotificationCenterComponent {
  private readonly decisions = inject(DecisionStore);
  private readonly inventory = inject(InventoryStore);
  private readonly requests = inject(RequestStore);

  readonly status = signal<TaskStatus | 'ALL'>('ALL');
  readonly openId = signal<string | null>(null);

  readonly tasks = computed(() =>
    this.decisions.tasksView()
      .filter(t => this.status() === 'ALL' ? true : t.status === this.status())
      .map(t => ({
        ...t,
        item: this.inventory.items().find(i => i.id === t.itemId),
        request: this.requests.requests().find(r => r.id === t.itemId)
      }))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  );

  toggle(id: string) {
    this.openId.set(this.openId() === id ? null : id);
  }

  action(id: string, status: TaskStatus) {
    this.decisions.updateTask(id, status);
  }
}
