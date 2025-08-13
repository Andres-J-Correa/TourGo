import type { AuditableEntity } from "./entities/entity.types";

export interface Customer extends AuditableEntity {
  id: number;
  documentNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isActive: boolean;
}

export interface CustomerPayload
  extends Omit<Customer, keyof AuditableEntity | "id" | "isActive"> {}
