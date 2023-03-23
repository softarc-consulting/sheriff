import { Routes } from '@angular/router';
import { provideEffects } from '@ngrx/effects';
import { provideState } from '@ngrx/store';
import { CustomersEffects } from '../data/customers.effects';
import { customersFeature } from '../data/customers.reducer';
import { AddCustomerComponent } from './components/add-customer.component';
import { CustomersContainerComponent } from './components/customers-container.component';
import { EditCustomerComponent } from './components/edit-customer.component';
import { DataGuard } from './services/data.guard';
import { CustomersRootComponent } from './components/customers-root/customers-root.component';

export const customersRoutes: Routes = [
  {
    path: '',
    canActivate: [DataGuard],
    component: CustomersRootComponent,
    providers: [
      provideState(customersFeature),
      provideEffects([CustomersEffects]),
    ],
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
