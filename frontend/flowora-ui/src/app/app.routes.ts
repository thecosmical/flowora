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

export const routes: Routes = [
{
path: '',
component: Shell,
children: [
{ path: '', component: HomeComponent },
{ path: 'home', component: HomeComponent },
{ path: 'inventory', component: InventoryList },
{ path: 'inventory/create', component: InventoryCreateComponent },
{ path: 'inventory/:id', component: InventoryDetail },
{ path: 'inventory/:id/issue', component: InventoryIssue },
{ path: 'templates/new', component: TemplateCreateComponent },
{ path: 'production/requests', component: RequestListComponent },
{ path: 'production/request/new', component: RequestCreateComponent },
{ path: 'production/request/:id', component: RequestDetailComponent }
]
},
{ path: '**', redirectTo: 'inventory' }
];
