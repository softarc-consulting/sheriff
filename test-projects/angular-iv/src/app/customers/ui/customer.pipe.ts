import { Pipe, PipeTransform } from '@angular/core';
import { Customer } from '@eternal/customers/model';

@Pipe({
  name: 'customer',
  standalone: true,
})
export class CustomerPipe implements PipeTransform {
  transform(customer: Customer): string {
    if (!customer.name && !customer.firstname) {
      return '-';
    }
    return `${customer.name}, ${customer.firstname}`;
  }
}
