import { Routes } from '@angular/router';

import { RequestsListComponent } from './requests-list/requests-list.component';

export const requestsRoutes: Routes = [
  {
    path: 'list',
    component: RequestsListComponent,
  },
  {
    path: '**',
    redirectTo: 'list',
    pathMatch: 'full',
  },
];
