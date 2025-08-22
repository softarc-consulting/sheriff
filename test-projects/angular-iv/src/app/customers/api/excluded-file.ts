// This file should be excluded from all Sheriff checks
// It intentionally violates dependency rules to test exclusion

// This import violates the dependency rules but should be ignored
import { CustomerService } from '../../shared/services/customer.service';

export class ExcludedCustomerComponent {
  constructor(private customerService: CustomerService) {}
}
