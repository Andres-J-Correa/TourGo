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
