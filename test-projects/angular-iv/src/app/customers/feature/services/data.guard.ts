import { inject, Injectable } from '@angular/core';

import { CustomersRepository } from '../../data';

@Injectable({
  providedIn: 'root',
})
export class DataGuard  {
  #customersRepository = inject(CustomersRepository);

  canActivate(): boolean {
    this.#customersRepository.load(1);
    return true;
  }
}
