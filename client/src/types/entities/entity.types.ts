import type { User } from "../user.types";
import type { Transaction } from "../transaction.types";
import type { Customer } from "../customer.types";

export interface AuditableEntity {
  dateCreated: Date;
  dateModified: Date;
  createdBy: User;
  modifiedBy: User;
}

export interface EntityBase extends AuditableEntity {
  id: string;
  subtotal: number;
  charges: number;
  total: number;
  invoiceId: string;
  transactions?: Partial<Transaction>[] | null;
  customer?: Partial<Customer> | null;
}
