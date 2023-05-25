import { provideState } from '@ngrx/store';
import { customersFeature } from './customers.reducer';
import { provideEffects } from '@ngrx/effects';
import { CustomersEffects } from './customers.effects';

export const provideCustomers = [
  provideState(customersFeature),
  provideEffects([CustomersEffects]),
];
