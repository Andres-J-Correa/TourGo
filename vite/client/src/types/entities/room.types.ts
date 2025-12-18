import type { AuditableEntity } from "./entity.types";

export interface Room extends AuditableEntity {
  id: number;
  name: string;
  capacity: number;
  description: string;
  isActive: boolean;
}
