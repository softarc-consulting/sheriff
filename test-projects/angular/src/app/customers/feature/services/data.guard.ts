import { inject, Injectable } from '@angular/core';
import { CanActivate } from '@angular/router';
import { Store } from '@ngrx/store';
import { customersActions } from '../+state/customers.actions';

@Injectable({
  providedIn: 'root',
})
export class DataGuard implements CanActivate {
  #store = inject(Store);

  canActivate(): boolean {
    this.#store.dispatch(customersActions.load({ page: 1 }));
    return true;
  }
}
