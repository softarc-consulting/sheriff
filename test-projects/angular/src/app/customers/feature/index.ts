import { fromCustomers } from './+state/customers.selectors';

export const selectSelectedCustomer = fromCustomers.selectSelectedCustomer;
export { customersRoutes } from './customers.routes';
