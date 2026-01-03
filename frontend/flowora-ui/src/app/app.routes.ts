import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { InventoryList } from './features/inventory/pages/inventory-list/inventory-list';
import { InventoryDetail } from './features/inventory/pages/inventory-detail/inventory-detail';
import { InventoryIssue } from './features/inventory/pages/inventory-issue/inventory-issue';
import { InventoryCreateComponent } from './features/inventory/pages/inventory-create/inventory-create';
import { HomeComponent } from './home/home';
import { TemplateCreateComponent } from './templates/template-create';
import { RequestListComponent } from './features/production/pages/request-list/request-list';
import { RequestDetailComponent } from './features/production/pages/request-detail/request-detail';
import { RequestCreateComponent } from './features/production/pages/request-create/request-create';
import { NotificationCenterComponent } from './features/notifications/notification-center/notification-center';
import { AuditListComponent } from './features/audit/audit-list';
import { PurchaseRequestsComponent } from './features/procurement/purchase-requests/purchase-requests';
import { PurchaseCreateComponent } from './features/procurement/purchase-create/purchase-create';
import { PurchaseInvoicesComponent } from './features/procurement/purchase-invoices/purchase-invoices';
import { SuppliersComponent } from './features/procurement/suppliers/suppliers';

export const routes: Routes = [
{
path: '',
component: Shell,
children: [
{ path: '', component: HomeComponent },
{ path: 'home', component: HomeComponent },
{ path: 'inventory', component: InventoryList },
{ path: 'inventory/create', component: InventoryCreateComponent },
{ path: 'inventory/lead-fulfillment', loadComponent: () => import('./features/inventory/pages/lead-fulfillment/lead-fulfillment').then(m => m.LeadFulfillmentComponent) },
{ path: 'inventory/:id', component: InventoryDetail },
{ path: 'inventory/:id/issue', component: InventoryIssue },
{ path: 'templates/new', component: TemplateCreateComponent },
{ path: 'production/requests', component: RequestListComponent },
{ path: 'production/request/new', component: RequestCreateComponent },
{ path: 'production/request/:id', component: RequestDetailComponent },
{ path: 'procurement/purchases', component: PurchaseRequestsComponent },
{ path: 'procurement/purchases/new', component: PurchaseCreateComponent },
{ path: 'procurement/purchases/received', component: PurchaseInvoicesComponent },
{ path: 'procurement/suppliers', component: SuppliersComponent },
{ path: 'notifications', component: NotificationCenterComponent },
{ path: 'audit', component: AuditListComponent }
]
},
{ path: '**', redirectTo: 'inventory' }
];
