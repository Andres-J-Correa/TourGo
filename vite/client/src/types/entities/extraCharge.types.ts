import type { AuditableEntity } from "./entity.types";
import type { Lookup } from "../common.types";

export interface ExtraCharge extends AuditableEntity {
  id: number;
  name: string;
  amount: number;
  type: Lookup;
  isActive: boolean;
}
