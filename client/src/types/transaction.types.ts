import type { User } from "./user.types";
import type { Lookup } from "./common.types";

export interface Transaction {
  id: string;
  parentId?: string | null;
  amount: number;
  transactionDate: Date;
  dateCreated: Date;
  createdBy: User;
  paymentMethod: Lookup;
  categoryId: number;
  subcategory?: Lookup | null;
  referenceNumber?: string | null;
  statusId: number;
  description?: string | null;
  approvedBy: User;
  currencyCode: string;
  financePartner?: Lookup | null;
  entityId?: string | null;
  hasDocumentUrl: boolean;
  total: number;
  modifiedBy: User;
  dateModified: Date;
}
