export interface Customer {
  id: number;
  firstname: string;
  name: string;
  country: string;
  birthdate: string;
}

let id = 1;

export function createCustomer(customer: Partial<Customer> = {}): Customer {
  return {
    ...{
      id: id++,
      firstname: 'Jessica',
      name: 'Trabner',
      country: 'AT',
      birthdate: '2001-09-02',
    },
    ...customer,
  };
}

export function createCustomers(...customers: Partial<Customer>[]) {
  return customers.map(createCustomer);
}
