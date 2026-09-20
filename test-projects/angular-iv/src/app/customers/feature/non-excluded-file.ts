// This file should NOT be excluded from Sheriff checks
// It should still be checked for dependency rule violations

// This import should trigger a violation since it's not excluded
import { CustomerService } from '../../shared/services/customer.service';

export class NonExcludedCustomerComponent {
  constructor(private customerService: CustomerService) {}
}


