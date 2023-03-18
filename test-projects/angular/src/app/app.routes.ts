import { Routes } from '@angular/router';
import { UserLoaderGuard } from './shell/services/user-loader.guard';
import { HomeComponent } from './shell/home.component';

export const appRoutes: Routes = [
  {
    path: '',
    canActivate: [UserLoaderGuard],
    children: [
      {
        path: '',
        component: HomeComponent,
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('@eternal/customers/feature').then((m) => m.customersRoutes),
      },
      {
        path: 'bookings',
        loadChildren: () =>
          import('@eternal/bookings').then((m) => m.bookingsRoutes),
      },
      {
        path: 'holidays',
        loadChildren: () =>
          import('@eternal/holidays/feature').then((m) => m.holidaysRoutes),
      },
    ],
  },
];
