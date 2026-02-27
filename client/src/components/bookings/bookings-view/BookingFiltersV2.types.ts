import type { PaginationData } from "components/bookings/bookings-view/BookingsViewV2.types";

export interface BookingFiltersProps {
  paginationData: PaginationData;
  loading: boolean;
  rooms?: any[];
  loadingRooms?: boolean;
  handleDateChange: (
    field: "startDate" | "endDate",
  ) => (date: Date | null) => void;
  handleFilterByCustomerName: (values: {
    firstName: string;
    lastName: string;
  }) => void;
  handleFilterByExternalBookingId: (value: string) => void;
  handleClearCustomerNameFilter: () => void;
  handleClearExternalBookingIdFilter: () => void;
  toggleDateType: (isArrivalDate: boolean) => void;
  handleFilterByStatusIds: (statusIds: number[]) => void;
  onPageSizeChange: (pageSize: number) => void;
  handleFilterByBookingId: (value: string) => void;
  handleClearBookingIdFilter: () => void;
  toggleSortDirection: () => void;
  onSortColumnChange: (column: PaginationData["sortColumn"]) => void;
  handleFilterByRoomIds: (roomIds: number[]) => void;
}
