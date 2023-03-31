import { Routes } from '@angular/router';
import { AddCustomerComponent } from './components/add-customer.component';
import { CustomersContainerComponent } from './components/customers-container.component';
import { EditCustomerComponent } from './components/edit-customer.component';
import { DataGuard } from './services/data.guard';
import { CustomersRootComponent } from './components/customers-root/customers-root.component';
import { provideCustomers } from '../data';

export const customersRoutes: Routes = [
  {
    path: '',
    canActivate: [DataGuard],
    component: CustomersRootComponent,
    providers: [provideCustomers],
    children: [
      {
        path: '',
        component: CustomersContainerComponent,
      },
      {
        path: 'new',
        component: AddCustomerComponent,
        data: { mode: 'new' },
      },
      {
        path: ':id',
        component: EditCustomerComponent,
        data: { mode: 'edit' },
      },
    ],
  },
];
