import type { PaginationData } from "components/bookings/bookings-view/BookingsViewV2.types";

export interface BookingFiltersProps {
  paginationData: PaginationData;
  loading: boolean;
  handleDateChange: (
    field: "startDate" | "endDate"
  ) => (date: Date | null) => void;
  handleFilterByCustomerName: (values: {
    firstName: string;
    lastName: string;
  }) => void;
  handleFilterByExternalBookingId: (value: string) => void;
  handleClearCustomerNameFilter: () => void;
  handleClearExternalBookingIdFilter: () => void;
  toggleDateType: () => void;
  handleFilterByStatusId: (statusId: string) => void;
  onPageSizeChange: (pageSize: number) => void;
  handleFilterByBookingId: (value: string) => void;
  handleClearBookingIdFilter: () => void;
  toggleSortDirection: () => void;
  onSortColumnChange: (column: PaginationData["sortColumn"]) => void;
}
