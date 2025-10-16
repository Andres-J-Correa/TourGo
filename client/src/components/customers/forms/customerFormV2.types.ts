import type { Customer } from "types/customer.types";

export interface CustomerFormV2Props {
  hotelId?: string;
  customer?: Partial<Customer> | null;
  isUpdate?: boolean;
  goToNextStep: () => void;
  handleCustomerChange: (customer: Partial<Customer> | null) => void;
}
