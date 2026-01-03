import { Component, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

type HomeCard = {
  pill: string;
  title: string;
  desc: string;
  link: string;
  order: number;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrl: './home.scss'
})
export class HomeComponent {
  readonly search = signal('');

  readonly cards = signal<HomeCard[]>([
    {
      pill: 'Inventory',
      title: 'Inventory Workspace',
      desc: 'On-hand stock, batches/serials, expiry tracking, and multi-location movements.',
      link: '/inventory',
      order: 1
    },
    {
      pill: 'Requests',
      title: 'Requests & Approvals',
      desc: 'Operational and production requests with approval workflows and status tracking.',
      link: '/production/requests',
      order: 2
    },
    {
      pill: 'Purchase',
      title: 'Purchase Orders',
      desc: 'Create and manage purchase orders, pricing, quantities, and delivery status.',
      link: '/procurement/purchases',
      order: 3
    },
    {
      pill: 'Leads',
      title: 'Leads Management',
      desc: 'Ops-first leads: sources, won/lost reasons, dispatch vs manufacture split.',
      link: '/inventory/lead-fulfillment',
      order: 3.5
    },
    {
      pill: 'Partners',
      title: 'Partner Directory',
      desc: 'Suppliers, logistics, warehouse partners—GSTIN, addresses, and linked items.',
      link: '/procurement/suppliers',
      order: 4
    },
    {
      pill: 'Bills',
      title: 'Bills & Receipts',
      desc: 'Received orders with partner invoices; reconcile quantities and payments.',
      link: '/procurement/purchases/received',
      order: 5
    },
    {
      pill: 'Notifications',
      title: 'Alerts & Tasks',
      desc: 'Assigned tasks, pending approvals, reminders, and SLA-driven alerts.',
      link: '/notifications',
      order: 6
    },
    {
      pill: 'Audit',
      title: 'Audit Log',
      desc: 'Immutable activity trail capturing approvals, stock changes, and user actions.',
      link: '/audit',
      order: 7
    }
  ]);

  readonly filteredCards = computed(() => {
    const term = this.search().trim().toLowerCase();

    return this.cards()
      .filter(card =>
        !term
          ? true
          : [card.pill, card.title, card.desc]
              .some(value => value.toLowerCase().includes(term))
      )
      .sort((a, b) => a.order - b.order);
  });
}
