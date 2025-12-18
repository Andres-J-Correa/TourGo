import type { AuditableEntity } from "./entity.types";

export interface BookingProvider extends AuditableEntity {
  id: number;
  name: string;
  isActive: boolean;
}

export type BookingProviderMinimal = Pick<BookingProvider, "id" | "name">;
