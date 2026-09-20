// This is a generated file that should be excluded from Sheriff checks
// It intentionally violates dependency rules to test regex exclusion

// This import violates the dependency rules but should be ignored
import { CustomerService } from '../services/customer.service';

export class GeneratedCustomerService {
  constructor(private customerService: CustomerService) {}
}


