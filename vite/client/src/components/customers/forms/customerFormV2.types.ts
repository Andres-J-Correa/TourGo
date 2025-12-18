import type { Customer } from "types/customer.types";

export interface CustomerFormV2Props {
  hotelId?: string;
  customer?: Partial<Customer> | null;
  isUpdate?: boolean;
  onChangeSuccessful?: () => void;
  handleCustomerChange: (customer: Partial<Customer> | null) => void;
  canUpdate?: boolean;
  disableButtons?: boolean;
}
