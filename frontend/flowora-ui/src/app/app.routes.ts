import { Routes } from '@angular/router';
import { Shell } from './layout/shell/shell';
import { InventoryList } from './features/inventory/pages/inventory-list/inventory-list';
import { InventoryDetail } from './features/inventory/pages/inventory-detail/inventory-detail';
import { InventoryIssue } from './features/inventory/pages/inventory-issue/inventory-issue';

export const routes: Routes = [
{
path: '',
component: Shell,
children: [
{ path: '', pathMatch: 'full', redirectTo: 'inventory' },
{ path: 'inventory', component: InventoryList },
{ path: 'inventory/:id', component: InventoryDetail },
{ path: 'inventory/:id/issue', component: InventoryIssue }
]
},
{ path: '**', redirectTo: 'inventory' }
];
