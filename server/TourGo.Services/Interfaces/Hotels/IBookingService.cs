using TourGo.Models;
using TourGo.Models.Domain;
using TourGo.Models.Domain.Bookings;
using TourGo.Models.Domain.Hotels;
using TourGo.Models.Enums.Bookings;
using TourGo.Models.Requests.Bookings;
using TourGo.Models.Responses;

namespace TourGo.Services.Interfaces
{
    public interface IBookingService
    {
        BookingAddResponse? Add(BookingAddUpdateRequest model, int userId, int hotelId);
        void Update(BookingAddUpdateRequest model, int userId);
        Booking? GetById(int id);
        Paged<BookingMinimal>? GetPaginatedByDateRange(int hotelId, int pageIndex, int pageSize, bool? isArrivalDate,
                                                        string sortColumn, string sortDirection, DateOnly? startDate, DateOnly? endDate,
                                                        string? firstName, string? lastName, string? bookingExternalId);
        BookingMinimal? GetBookingMinimal(int bookingId);
        List<ExtraCharge>? GetExtraChargesByBookingId(int bookingId);
        List<RoomBooking>? GetRoomBookingsByBookingId(int bookingId);
        List<RoomBooking>? GetRoomBookingsByDateRange(DateOnly startDate, DateOnly endDate, int hotelId);
        bool IsValidSortDirection(string? direction);
        bool IsValidSortColumn(string? column);
        void UpdateStatus(int bookingId, int userId, BookingStatusEnum status);
    }
}