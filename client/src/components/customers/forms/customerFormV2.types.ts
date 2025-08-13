import type { Customer } from "types/customer.types";
import type { Booking } from "types/entities/booking.types";

export interface CustomerFormV2Props {
  hotelId: string;
  customer?: Customer | null;
  booking?: Booking;
  goToNextStep: () => void;
  handleCustomerChange: (customer: Partial<Customer> | null) => void;
}
